const logger = require('../utils/logger');
const { getRedis } = require('../config/redis');
const { embedText } = require('../rag/embed');
const { retrieve } = require('../rag/retrieve');
 const {callLLM,  callLLMStream } = require('../rag/llm')

function initSocket(io) {
  io.on('connection', (socket) => {
    logger.info('Socket connected: ' + socket.id);

    socket.on('join_session', async (payload = {}) => {
      try {
        const sessionId = payload?.sessionId;
        if (!sessionId) {
          socket.emit('error', { message: 'join_session requires a sessionId created via REST' });
          return;
        }
        socket.data.sessionId = sessionId;
        socket.emit('session_joined', { sessionId });
      } catch (err) {
        logger.error('join_session failed', err);
        socket.emit('error', { message: err.message || String(err) });
      }
    });

socket.on('user_message', async (data = {}) => {
  try {
    const sessionId = socket.data.sessionId || data.sessionId;
    if (!sessionId) {
      socket.emit('error', { message: 'No sessionId' });
      return;
    }

    const message = data.message;
    if (!message || typeof message !== 'string') {
      socket.emit('error', { message: 'Invalid message payload' });
      return;
    }

    const redis = getRedis();

    // 1️⃣ Store user message
    await redis.rpush(
      `chat:${sessionId}`,
      JSON.stringify({ role: 'user', text: message, ts: Date.now() })
    );

    // 2️⃣ Embed + retrieve
    const qEmbedding = await embedText(message);
    const hits = await retrieve('news_articles', qEmbedding, 5);

    const finalAnswer = await callLLMStream(message, hits, token => {
      socket.emit('bot_token', { token });
    });

    await redis.rpush(
      `chat:${sessionId}`,
      JSON.stringify({ role: 'bot', text: finalAnswer, ts: Date.now() })
    );

    socket.emit('bot_done');

  } catch (err) {
    logger.error('socket user_message failed', err.message);
    socket.emit('error', { message: err.message || String(err) });
  }
});

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected: ' + socket.id + ' reason=' + reason);
    });
  });
}

module.exports = { initSocket };
