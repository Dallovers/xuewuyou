"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationError = void 0;
exports.integrationConfig = integrationConfig;
function integrationConfig() {
    const url = (name) => {
        const value = (process.env[name] ?? '').trim().replace(/\/$/, '');
        if (value && !['http:', 'https:'].includes(new URL(value).protocol))
            throw new Error(`${name} 必须为 HTTP(S) 地址`);
        return value;
    };
    return {
        ragflow: { baseUrl: url('RAGFLOW_BASE_URL'), apiKey: process.env.RAGFLOW_API_KEY ?? '', timeoutMs: 45000 },
        mineru: { baseUrl: url('MINERU_BASE_URL'), apiKey: process.env.MINERU_API_KEY ?? '', tier: process.env.MINERU_TIER ?? 'basic', timeoutMs: 180000, pollMs: 1000 }
    };
}
const integrationError = (statusCode, code, message) => Object.assign(new Error(message), { statusCode, code });
exports.integrationError = integrationError;
