const express = require('express');
const router = express.Router();
const { createSession } = require('../models/session.model');
const { getRedis } = require('../config/redis');


// create new session
router.post('/create', async (req, res) => {
    try {
        const sessionId = await createSession();
        // initialize empty chat history in Redis
        const redis = getRedis();
        await redis.del(`chat:${sessionId}`);
        res.json({ sessionId });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// get session history
router.get('/:id/history', async (req, res) => {
    try {
        const redis = getRedis();
        const key = `chat:${req.params.id}`;
        const messages = await redis.lrange(key, 0, -1);
        res.json({ history: messages.map(m => JSON.parse(m)) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// clear session history
router.delete('/:id/clear', async (req, res) => {
    try {
        const redis = getRedis();
        await redis.del(`chat:${req.params.id}`);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


module.exports = router;