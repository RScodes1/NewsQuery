const axios = require('axios');
const logger = require('../utils/logger');
require('dotenv').config()

async function embedText(message) {
    const JINA_API_KEY = process.env.JINA_API_KEY;
    if (!JINA_API_KEY) throw new Error('JINA_API_KEY not set');
            try {
            const res = await axios.post(
                'https://api.jina.ai/v1/embeddings',
                {
                    model: "jina-embeddings-v2-base-en",
                    input: [message]
            },
            {
                headers: { 
                'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                }
            }
            );

        const embedding =
            res?.data?.embeddings?.[0] ||
            res?.data?.data?.[0]?.embedding;

        if (!embedding) {
            throw new Error("Invalid Jina embedding response");
        }

        return embedding;
    } catch (e) {
        logger.error('Embedding failed', e?.response?.data || e.message);
        throw e;
    }
}

module.exports = { embedText };
