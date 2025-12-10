const axios = require('axios');
const { chunkText } = require('../utils/chunkText');
const { embedText } = require('./embed');
const { upsertEmbeddings } = require('../config/vectorStore');
const logger = require('../utils/logger');


async function ingestArticles(articleUrls = [], collectionName = 'news_collection') {
    const docsToUpsert = [];
    for (const url of articleUrls) {
        try {
            const res = await axios.get(url);
            const text = (res.data || '').toString();
            // naive: chunk by characters
            const chunks = chunkText(text, 1000);
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const emb = await embedText(chunk);
                docsToUpsert.push({ id: `${encodeURIComponent(url)}::${i}`, embedding: emb, metadata: { source: url }, text: chunk });
            }
        } catch (e) {
            logger.warn('Failed to fetch ' + url + ' - ' + e.message);
        }
    }
    if (docsToUpsert.length) {
        await upsertEmbeddings(collectionName, docsToUpsert);
        logger.info('Ingested ' + docsToUpsert.length + ' chunks');
    }
}


module.exports = { ingestArticles };