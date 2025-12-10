const { query } = require('../config/vectorStore');
const logger = require('../utils/logger');


async function retrieve(collectionName, embedding, topK = 5) {
    try {
        const res = await query(collectionName, embedding, topK);
        // adapt based on Chroma response shape
        // Expected: res.documents or res.matches; return an array of passage objects {id, text, score, metadata}
        return res?.results || res;
    } catch (e) {
        logger.error('Retrieve failed', e);
        return [];
    }
}


module.exports = { retrieve };