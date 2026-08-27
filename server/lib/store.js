/* ============ 学无忧后端 · 存储层（JSON 文件，原子写） ============
 * 零依赖实现。数据结构：
 *   data/users.json        { "<uid>": {id, username, passHash, nick, createdAt} }
 *   data/user_data.json    { "<uid>": {payload, updatedAt} }
 *   data/study_daily.json  { "<uid>": { "2026-08-27": {focusMinutes, completed}, ... } }
 *   data/study_setup.json  { "<uid>": {payload, updatedAt} }
 *   data/ai_config.json    { provider, apiKey, base, model }
 * 原子写：先写 tmp 再 rename，避免进程崩溃导致文件损坏。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const FILES = {
  users: 'users.json',
  userData: 'user_data.json',
  studyDaily: 'study_daily.json',
  studySetup: 'study_setup.json',
  aiConfig: 'ai_config.json',
  presence: 'presence.json'
};

const cache = {};

function filePath(name) {
  return path.join(DATA_DIR, name);
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function read(name) {
  if (cache[name] !== undefined) return cache[name];
  ensureDir();
  const p = filePath(FILES[name]);
  try {
    cache[name] = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    cache[name] = {};
  }
  return cache[name];
}

function write(name) {
  ensureDir();
  const p = filePath(FILES[name]);
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(cache[name], null, 0), 'utf8');
  fs.renameSync(tmp, p);
}

function get(name, key, def) {
  const obj = read(name);
  if (arguments.length === 1) return obj;
  const v = obj[key];
  return v === undefined ? def : v;
}

function set(name, key, value) {
  if (arguments.length === 2) { // set(name, obj) 整体覆盖整个表
    cache[name] = key;
    write(name);
    return key;
  }
  const obj = read(name);
  obj[key] = value;
  write(name);
  return value;
}

function del(name, key) {
  const obj = read(name);
  if (key in obj) {
    delete obj[key];
    write(name);
  }
}

module.exports = { get, set, del, read, write };
