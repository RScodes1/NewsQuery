const {v4 : uuidv4} = require('uuid');

const { getDb } = require('../config/db');


async function createSession() {
    const sessions = getDb().collection('sessions');
    const session = { sessionId: uuidv4(), createdAt: new Date() };
    await sessions.insertOne(session);
    return session.sessionId;
}


async function getSession(sessionId) {
    const sessions = getDb().collection('sessions');
    return sessions.findOne({ sessionId });
}


module.exports = { createSession, getSession };