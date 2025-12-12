const { QdrantClient } = require("@qdrant/js-client-rest");
const logger = require("../utils/logger");

let qdrant = null;

/**
 * Initialize Qdrant client
 */
async function initVectorStore(url, apiKey) {
    if (!url) throw new Error("QDRANT_URL is required");
  
     
    qdrant = new QdrantClient({
        url,
        apiKey,
    });

    logger.info("Vector store (Qdrant) initialized at " + url);
}




/**
 * Create collection if not exists
 */
async function ensureCollection(collectionName, vectorSize = 768) {
    try {

        const collections = await qdrant.getCollections();
        const exists = collections.collections.some(c => c.name === collectionName);


        if (!exists) {
            await qdrant.createCollection(collectionName, {
                vectors: {
                    size: vectorSize,
                    distance: "Cosine",
                },
            });

            logger.info(`Created Qdrant collection: ${collectionName}`);
        } else {
            logger.info(`Qdrant collection already exists: ${collectionName}`);
        }
    } catch (err) {
        logger.error("Error ensuring Qdrant collection", err);
        throw err;
    }
}

/**
 * Upsert embeddings into Qdrant
 */
async function upsertEmbeddings(collectionName, docs) {
    try {
        const points = docs.map(doc => ({
            id: doc.id,
            vector: doc.embedding,
            payload: {
                ...doc.metadata,
                text: doc.text,
            },
        }));

        await qdrant.upsert(collectionName, { points });


        logger.info(`Upserted ${docs.length} embeddings to ${collectionName}`);
    } catch (e) {
        logger.error("Qdrant upsert failed", e);
        throw e;
    }
}

/**
 * Query top-K similar embeddings
 */
async function query(collectionName, embedding, topK = 5) {
    try {

        const result = await qdrant.search(collectionName, {
            vector: embedding,
            limit: topK,
              vector_name: "vector"
        });

        return result;
    } catch (e) {
        logger.error("Qdrant query failed", e);
        throw e;
    }
}

module.exports = {
    initVectorStore,
    ensureCollection,
    upsertEmbeddings,
    query,
};
