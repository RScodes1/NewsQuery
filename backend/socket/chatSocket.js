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
          socket.emit('error', { message: 'join_session raja requires a sessionId created via REST' });
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
          socket.emit('error', { message: 'No sessionId. Call REST /api/session/create then send join_session or include sessionId in payload.' });
          return;
        }

        const message = data.message;
        if (!message || typeof message !== 'string') {
          socket.emit('error', { message: 'Invalid message payload' });
          return;
        }

        const redis = getRedis();

        await redis.rpush(`chat:${sessionId}`, JSON.stringify({ role: 'user', text: message, ts: Date.now() }));
      
        logger.info('Embedding message for session %s', sessionId);
        const qEmbedding = await embedText(message);
        logger.info('Retrieving top-k for session %s', sessionId);
        const hits = await retrieve('news_articles', qEmbedding, 5);

        logger.info('Calling LLM stream for session %s', sessionId);
        await callLLMStream(message, hits, (token) => {
          try {
            socket.emit('bot_token', { token });
          } catch (e) {
            logger.warn('Failed to emit bot_token', e);
          }
        });

    
        const finalAnswer = await callLLM(message, hits);
        // Store bot message into Redis history
        await redis.rpush(`chat:${sessionId}`, JSON.stringify({ role: 'bot', text: finalAnswer, ts: Date.now() }));

        // Emit final response
        socket.emit('bot_response', { text: finalAnswer });
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
