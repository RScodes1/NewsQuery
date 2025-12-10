const express = require('express');
const router = express.Router();
const { getRedis } = require('../config/redis');
const { retrieve } = require('../rag/retrieve');
const { callLLM } = require('../rag/llm');
const { embedText } = require('../rag/embed');


// POST /api/chat/message
// body: { sessionId, message }
router.post('/message', async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        const redis = getRedis();
        // 1) embed query
        const qEmbedding = await embedText(message);
        // 2) retrieve top-k
        const hits = await retrieve('news_collection', qEmbedding, 5);
        // 3) call LLM with context
        const answer = await callLLM(message, hits);
        // 4) store to redis history
        const entry = { role: 'user', text: message, ts: Date.now() };
        await redis.rpush(`chat:${sessionId}`, JSON.stringify(entry));
        await redis.rpush(`chat:${sessionId}`, JSON.stringify({ role: 'bot', text: answer, ts: Date.now() }));
        res.json({ answer });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


module.exports = router;