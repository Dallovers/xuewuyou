"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MineruClient = void 0;
const config_js_1 = require("./config.js");
/** MinerU 4.x V1 upload -> job -> output API. Credentials stay on same origin. */
class MineruClient {
    config;
    constructor(config) {
        this.config = config;
    }
    get configured() { return !!this.config.baseUrl; }
    async request(path, init, deadline) {
        if (!this.configured)
            throw (0, config_js_1.integrationError)(503, 'MINERU_NOT_CONFIGURED', '文档解析服务尚未配置，可先上传 TXT 或 Markdown 资料');
        const remaining = deadline - Date.now();
        if (remaining <= 0)
            throw (0, config_js_1.integrationError)(504, 'MINERU_TIMEOUT', '解析超时，请稍后重试');
        const response = await fetch(`${this.config.baseUrl}${path}`, { ...init, redirect: 'error', signal: AbortSignal.timeout(Math.min(remaining, 30000)),
            headers: { ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}), ...init.headers } });
        if (!response.ok)
            throw new Error('MinerU request failed');
        return response;
    }
    json(path, body, deadline) {
        return this.request(path, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }, deadline);
    }
    async parse(filename, bytes) {
        const deadline = Date.now() + this.config.timeoutMs;
        try {
            const mime = filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
            const upload = await (await this.json('/v1/uploads', { filename, bytes: bytes.length, purpose: 'parse', mime_type: mime }, deadline)).json();
            let fileId = upload.file?.id;
            if (upload.status !== 'completed') {
                if (typeof upload.id !== 'string' || typeof upload.upload_url !== 'string')
                    throw new Error('invalid upload');
                const url = new URL(upload.upload_url, this.config.baseUrl + '/');
                // This integration targets self-hosted MinerU; disallow third-party upload destinations.
                if (url.origin !== new URL(this.config.baseUrl).origin)
                    throw new Error('cross-origin upload');
                await this.request(url.pathname + url.search, { method: upload.upload_method ?? 'PUT', headers: upload.upload_headers ?? {}, body: new Uint8Array(bytes) }, deadline);
                const done = await (await this.json(`/v1/uploads/${encodeURIComponent(upload.id)}/complete`, {}, deadline)).json();
                fileId = done.file?.id;
            }
            if (typeof fileId !== 'string')
                throw new Error('invalid file');
            const job = await (await this.json('/v1/parse/jobs', {
                files: [{ source: { type: 'file_id', file_id: fileId } }], tier: /\.(docx|pptx)$/i.test(filename) ? 'flash' : this.config.tier, output_formats: ['markdown'], ocr_mode: 'auto'
            }, deadline)).json();
            if (typeof job.job_id !== 'string')
                throw new Error('invalid job');
            while (Date.now() < deadline) {
                const result = await (await this.request(`/v1/parse/jobs/${encodeURIComponent(job.job_id)}`, {}, deadline)).json();
                if (['failed', 'canceled', 'partial'].includes(result.status))
                    throw new Error('parse failed');
                if (result.status === 'completed') {
                    const outputs = result.files?.[0]?.output_files;
                    const outputId = outputs?.markdown?.file_id;
                    if (typeof outputId !== 'string')
                        throw new Error('missing markdown');
                    const markdown = await (await this.request(`/v1/files/${encodeURIComponent(outputId)}/content`, {}, deadline)).text();
                    if (!markdown.trim() || markdown.length > 300000)
                        throw new Error('invalid output size');
                    return markdown;
                }
                await new Promise(resolve => setTimeout(resolve, Math.min(this.config.pollMs, Math.max(0, deadline - Date.now()))));
            }
            throw (0, config_js_1.integrationError)(504, 'MINERU_TIMEOUT', '解析超时，请稍后重试');
        }
        catch (e) {
            if (e.code)
                throw e;
            throw (0, config_js_1.integrationError)(502, 'MINERU_UNAVAILABLE', '文档解析失败，请检查解析服务和文件后重试');
        }
    }
}
exports.MineruClient = MineruClient;
