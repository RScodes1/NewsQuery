const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');
let dbClient;


async function initDb(uri) {
    if (!uri) throw new Error('MONGODB_URI not set');
    const client = new MongoClient(uri);
    await client.connect();
    dbClient = client;
    logger.info('MongoDB connected');
}


function getDb() {
    if (!dbClient) throw new Error('DB not initialized');
    return dbClient.db();
}


module.exports = { initDb, getDb };