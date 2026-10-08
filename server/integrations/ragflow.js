"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagflowClient = void 0;
const config_js_1 = require("./config.js");
/** Uses RAGFlow's dataset APIs, supported by both 0.24 and 1.0. No shared chat session. */
class RagflowClient {
    config;
    constructor(config) {
        this.config = config;
    }
    get configured() { return !!(this.config.baseUrl && this.config.apiKey); }
    async request(path, init = {}) {
        if (!this.configured)
            throw (0, config_js_1.integrationError)(503, 'RAGFLOW_NOT_CONFIGURED', '课程资料服务尚未配置，请联系管理员');
        try {
            const response = await fetch(`${this.config.baseUrl}${path}`, {
                ...init, redirect: 'error', signal: AbortSignal.timeout(this.config.timeoutMs),
                headers: { Authorization: `Bearer ${this.config.apiKey}`, ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...init.headers }
            });
            if (!response.ok)
                throw new Error('upstream HTTP');
            const body = await response.json();
            if (body.code !== 0)
                throw new Error('upstream code');
            return body.data;
        }
        catch {
            throw (0, config_js_1.integrationError)(502, 'RAGFLOW_UNAVAILABLE', '课程资料服务请求失败，请检查服务配置后重试');
        }
    }
    async createDataset(uid) {
        const name = `xuewuyou-${uid}`;
        // Reuse a previously created dataset after interruption without exposing others.
        const existing = await this.request(`/api/v1/datasets?name=${encodeURIComponent(name)}`);
        const found = Array.isArray(existing) ? existing.find((x) => x.name === name) : undefined;
        if (found?.id)
            return found.id;
        const data = await this.request('/api/v1/datasets', { method: 'POST', body: JSON.stringify({ name, permission: 'me', chunk_method: 'naive' }) });
        if (typeof data?.id !== 'string')
            throw (0, config_js_1.integrationError)(502, 'RAGFLOW_PROTOCOL', '资料服务没有返回有效的知识库编号');
        return data.id;
    }
    async upload(datasetId, filename, markdown) {
        const form = new FormData();
        form.append('file', new Blob([markdown], { type: 'text/markdown' }), filename.replace(/\.[^.]+$/, '') + '.md');
        const data = await this.request(`/api/v1/datasets/${encodeURIComponent(datasetId)}/documents`, { method: 'POST', body: form });
        if (!Array.isArray(data) || typeof data[0]?.id !== 'string')
            throw (0, config_js_1.integrationError)(502, 'RAGFLOW_PROTOCOL', '资料服务没有返回有效的文档编号');
        return data[0].id;
    }
    async startIndex(datasetId, documentId) {
        await this.request(`/api/v1/datasets/${encodeURIComponent(datasetId)}/chunks`, { method: 'POST', body: JSON.stringify({ document_ids: [documentId] }) });
    }
    async deleteDocument(datasetId, documentId) {
        await this.request(`/api/v1/datasets/${encodeURIComponent(datasetId)}/documents`, { method: 'DELETE', body: JSON.stringify({ ids: [documentId] }) });
    }
    async status(datasetId, documentId) {
        const data = await this.request(`/api/v1/datasets/${encodeURIComponent(datasetId)}/documents?id=${encodeURIComponent(documentId)}`);
        const documents = Array.isArray(data) ? data : data?.docs;
        const doc = Array.isArray(documents) ? documents.find((d) => d.id === documentId) : undefined;
        if (!doc)
            throw (0, config_js_1.integrationError)(502, 'RAGFLOW_PROTOCOL', '资料服务中找不到此文档');
        if (doc.run === 'DONE' || doc.run === '3' || Number(doc.progress) >= 1)
            return 'ready';
        if (doc.run === 'FAIL' || doc.run === '4' || Number(doc.progress) < 0)
            return 'failed';
        return 'indexing';
    }
    async retrieve(datasetId, documentIds, question) {
        if (!documentIds.length)
            return [];
        const data = await this.request('/api/v1/retrieval', { method: 'POST', body: JSON.stringify({
                dataset_ids: [datasetId], document_ids: documentIds, question, page: 1, page_size: 5, similarity_threshold: 0.2
            }) });
        const chunks = data?.chunks;
        if (!Array.isArray(chunks))
            throw (0, config_js_1.integrationError)(502, 'RAGFLOW_PROTOCOL', '资料服务检索响应格式不正确');
        // Fail closed: upstream must honor the document allowlist.
        return chunks.filter((c) => documentIds.includes(c.document_id)).slice(0, 5).map((c, i) => ({
            id: String(i + 1), documentId: c.document_id, documentName: String(c.document_name ?? c.docnm_kwd ?? '课程资料'),
            content: String(c.content ?? c.content_with_weight ?? '').slice(0, 5000),
            pages: Array.isArray(c.positions) ? [...new Set(c.positions.map((p) => Number(p[0])).filter(Number.isFinite))] : []
        }));
    }
}
exports.RagflowClient = RagflowClient;
