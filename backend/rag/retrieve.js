const { query } = require('../config/vectorStore');
const logger = require('../utils/logger');

async function retrieve(collectionName, embedding, topK = 5) {
    try {
        const res = await query(collectionName, embedding, topK);
        const points = res || [];

        if (!Array.isArray(points)) return [];

        const hits = points.map(hit => ({
            id: hit.id,
            score: hit.score,
            text: hit.payload?.text || '',
            metadata: hit.payload || {}
        }));

        return hits;
    } catch (e) {
        logger.error('Retrieve failed', e);
        return [];
    }
}

module.exports = { retrieve };
