/* ============ 学无忧后端 · 认证层（零依赖） ============
 * 密码哈希：Node 内置 crypto.scrypt（加盐，抗暴力破解）
 * Token：手写 JWT（HMAC-SHA256），7 天有效期
 * 密钥：优先环境变量 JWT_SECRET，否则用启动时随机生成并持久化到 data/.jwt_secret
 */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SECRET_FILE = path.join(__dirname, '..', 'data', '.jwt_secret');
const TOKEN_TTL = 7 * 24 * 3600 * 1000; // 7 天

function getSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    if (fs.existsSync(SECRET_FILE)) {
      return fs.readFileSync(SECRET_FILE, 'utf8').trim();
    }
    const s = crypto.randomBytes(32).toString('hex');
    fs.mkdirSync(path.dirname(SECRET_FILE), { recursive: true });
    fs.writeFileSync(SECRET_FILE, s, 'utf8');
    return s;
  } catch (e) {
    return 'xwy-dev-fallback-secret';
  }
}

const SECRET = getSecret();

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

/* 密码哈希 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 32).toString('hex');
  return salt + ':' + hash;
}

function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored).split(':');
    const calc = crypto.scryptSync(String(password), salt, 32).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(calc, 'hex'), Buffer.from(hash, 'hex'));
  } catch (e) {
    return false;
  }
}

/* JWT */
function sign(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = Object.assign({}, payload, { iat: Date.now(), exp: Date.now() + TOKEN_TTL });
  const head = base64url(JSON.stringify(header));
  const pay = base64url(JSON.stringify(body));
  const sig = crypto.createHmac('sha256', SECRET).update(head + '.' + pay).digest();
  return head + '.' + pay + '.' + base64url(sig);
}

function verify(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return null;
    const [head, pay, sig] = parts;
    const expect = crypto.createHmac('sha256', SECRET).update(head + '.' + pay).digest();
    const got = b64urlDecode(sig);
    if (got.length !== expect.length || !crypto.timingSafeEqual(got, expect)) return null;
    const payload = JSON.parse(b64urlDecode(pay).toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, sign, verify };
