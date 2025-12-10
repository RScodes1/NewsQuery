const axios = require('axios');
const logger = require('../utils/logger');
let CHROMA_URL = null;


async function initVectorStore(url) {
    if (!url) throw new Error('CHROMA_URL not set');
    CHROMA_URL = url.replace(/\/$/, '');
    // simple health check (may vary depending on your Chroma deployment)
    try {
        await axios.get(`${CHROMA_URL}/health`);
    } catch (e) {
        logger.warn('Chroma health check failed — ensure Chromadb server is running or adjust URL');
    }
    logger.info('Vector store (Chroma) initialized at ' + CHROMA_URL);
}


async function upsertEmbeddings(collectionName, docs /* [{id, embedding, metadata, text}] */) {
    // POST /collections/{name}/items OR adjust to your Chroma REST API
    const endpoint = `${CHROMA_URL}/collections/${collectionName}/items`;
    try {
        await axios.post(endpoint, { items: docs });
    } catch (e) {
        logger.error('Chroma upsert failed', e?.response?.data || e.message);
        throw e;
    }
}


async function query(collectionName, embedding, topK = 5) {
    const endpoint = `${CHROMA_URL}/collections/${collectionName}/query`;
    try {
        const res = await axios.post(endpoint, { query: embedding, n_results: topK });
        return res.data;
    } catch (e) {
        logger.error('Chroma query failed', e?.response?.data || e.message);
        throw e;
    }
}

module.exports = {
    initVectorStore, upsertEmbeddings, query
}