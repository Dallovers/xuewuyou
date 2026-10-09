'use strict';
const { AsyncLocalStorage } = require('node:async_hooks');
const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

// Preserve the existing synchronous domain operations inside a durable request
// transaction. A database lock also prevents lost updates across deploy overlaps.
const names = ['users','userData','studyDaily','studySetup','aiConfig','presence','integrations','learning','community'];
const context = new AsyncLocalStorage();
const url = new URL(process.env.DATABASE_URL);
const local = ['localhost','127.0.0.1','::1','[::1]'].includes(url.hostname);
for (const key of ['sslmode','sslcert','sslkey','sslrootcert','channel_binding']) url.searchParams.delete(key);
const pool = new Pool({ connectionString:url.href, max:3, idleTimeoutMillis:10000,
  connectionTimeoutMillis:15000, ssl:local ? false : {rejectUnauthorized:true}, enableChannelBinding:true });
pool.on('error', () => console.error('数据库连接中断，下一次请求将重新连接'));
let initialized;
function init() {
  if (!initialized) initialized = (async () => {
    await pool.query(fs.readFileSync(path.join(__dirname,'../migrations/001-state.sql'),'utf8'));
    await pool.query('INSERT INTO xwy_state(name,payload) SELECT unnest($1::text[]), \'{}\'::jsonb ON CONFLICT DO NOTHING',[names]);
  })().catch(e => { initialized=null; throw e; });
  return initialized;
}
function current() {
  const state=context.getStore();
  if (!state || !state.active) throw new Error('数据库操作必须在活动事务内执行');
  return state;
}
function read(name) {
  if (!names.includes(name)) throw new Error('未知数据表');
  return current().data[name];
}
function write(name) {
  read(name); const state=current();
  if (state.readOnly) throw new Error('只读事务不能保存数据');
  state.dirty.add(name);
}
function get(name,key,def) {
  const data=read(name); if (arguments.length===1) return data;
  return Object.hasOwn(data,key) ? data[key] : def;
}
function set(name,key,value) {
  read(name); const state=current();
  if (state.readOnly) throw new Error('只读事务不能保存数据');
  if (arguments.length===2) state.data[name]=key;
  else Object.defineProperty(state.data[name],key,{value,writable:true,enumerable:true,configurable:true});
  write(name); return arguments.length===2 ? key : value;
}
function del(name,key) { const data=read(name); if (Object.hasOwn(data,key)) { write(name); delete data[key]; } }
function afterCommit(fn) { current().callbacks.push(fn); }
async function run(fn, {readOnly=false, commit=()=>true}={}) {
  const existing=context.getStore();
  if (existing?.active) return fn();
  await init(); const client=await pool.connect();
  const state={client,data:Object.create(null),dirty:new Set(),callbacks:[],readOnly,active:true};
  let result, committed=false, released=false;
  try {
    if (!readOnly) {
      await client.query('BEGIN');
      await client.query("SET LOCAL lock_timeout = '20s'");
      await client.query('SELECT pg_advisory_xact_lock(20261009,1)');
    }
    const rows=await client.query('SELECT name,payload FROM xwy_state');
    for (const row of rows.rows) state.data[row.name]=row.payload;
    // Read-only AI and socket authentication do not hold a connection during work.
    if (readOnly) { client.release(); released=true; }
    result=await context.run(state,fn);
    if (!readOnly && commit()) {
      for (const name of state.dirty) await client.query('UPDATE xwy_state SET payload=$2::jsonb,updated_at=now() WHERE name=$1',[name,JSON.stringify(state.data[name])]);
      await client.query('COMMIT'); committed=true;
    } else if (!readOnly) await client.query('ROLLBACK');
  } catch(e) {
    if (!readOnly) await client.query('ROLLBACK').catch(()=>{});
    throw e;
  } finally {
    state.active=false;
    if (!released) client.release();
  }
  if (committed) for (const fn of state.callbacks) {
    try { const task=context.run(null,fn); if (task?.catch) task.catch(()=>console.error('后台任务失败')); }
    catch { console.error('提交后通知失败'); }
  }
  return result;
}
async function putFile(uid,id,bytes) {
  const state=current(); if (state.readOnly) throw new Error('只读事务不能上传文件');
  await state.client.query('INSERT INTO xwy_uploads(uid,id,bytes) VALUES($1,$2,$3)',[uid,id,bytes]);
}
async function getFile(uid,id) {
  const state=current(); if (state.readOnly) throw new Error('文件操作需要写事务');
  const result=await state.client.query('SELECT bytes FROM xwy_uploads WHERE uid=$1 AND id=$2',[uid,id]);
  if (!result.rows.length) throw new Error('资料原文件不存在'); return result.rows[0].bytes;
}
async function deleteFile(uid,id) { const state=current(); if (state.readOnly) throw new Error('只读事务不能删除文件'); await state.client.query('DELETE FROM xwy_uploads WHERE uid=$1 AND id=$2',[uid,id]); }
module.exports={get,set,del,read,write,run,init,afterCommit,putFile,getFile,deleteFile,database:true,close:()=>pool.end()};
