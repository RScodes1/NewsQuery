const axios = require('axios');
const logger = require('../utils/logger');


async function embedText(text) {
    const JINA_API_KEY = process.env.JINA_API_KEY;
    if (!JINA_API_KEY) throw new Error('JINA_API_KEY not set');
    try {
        const res = await axios.post('https://api.jina.ai/embeddings', { data: [text] }, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JINA_API_KEY}` }
        });
        return res.data.embeddings[0];
    } catch (e) {
        logger.error('Embedding failed', e?.response?.data || e.message);
        throw e;
    }
}


module.exports = { embedText };