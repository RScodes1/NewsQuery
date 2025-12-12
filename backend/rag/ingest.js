const axios = require('axios');
const cheerio = require('cheerio');
const { chunkText } = require('../utils/chunkText');
const { embedText } = require('./embed');
const { upsertEmbeddings } = require('../config/vectorStore');
const logger = require('../utils/logger');
const { randomUUID } = require("crypto");

async function ingestArticles(articleUrls = [], collectionName = 'news_articles') {
    const docsToUpsert = [];

    // Fetch all articles in parallel
    const articlePromises = articleUrls.map(async (url) => {
        try {
            const res = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Accept": "text/html,application/xhtml+xml"
                }
            });

            const $ = cheerio.load(res.data);

            const text = $("p").text().replace(/\s+/g, " ").trim();

            if (!text || text.length < 200) {
                logger.warn(`Extracted too little text from: ${url}`);
                return;
            }

            const chunks = chunkText(text, 1000);

            // Embed chunks in parallel
            const embeddings = await Promise.all(
                chunks.map(async (chunk) => {
                    const embedding = await embedText(chunk);
                    return {
                        id: randomUUID(),
                        embedding,
                        text: chunk,
                        metadata: { source: url }
                    };
                })
            );

            docsToUpsert.push(...embeddings);
        } catch (err) {
            logger.warn(`Failed to fetch ${url}: ${err.message}`);
        }
    });

    await Promise.all(articlePromises);

    if (docsToUpsert.length > 0) {
        await upsertEmbeddings(collectionName, docsToUpsert);
        logger.info(`Ingested ${docsToUpsert.length} chunks into ${collectionName}`);
    } else {
        logger.warn("No documents to ingest");
    }
}

module.exports = { ingestArticles };
