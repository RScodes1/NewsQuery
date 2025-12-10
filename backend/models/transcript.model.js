const { getDb } = require('../config/db');


async function saveTranscript(sessionId, transcript) {
    const col = getDb().collection('transcripts');
    await col.insertOne({ sessionId, transcript, createdAt: new Date() });
}


module.exports = { saveTranscript };