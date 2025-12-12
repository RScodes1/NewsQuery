// backend/socket/chatSocket.js
const logger = require('../utils/logger');
const { getRedis } = require('../config/redis');
const { embedText } = require('../rag/embed');
const { retrieve } = require('../rag/retrieve');
 const {callLLM,  callLLMStream } = require('../rag/llm')
// Try to require RAG modules; if missing, use safe fallbacks so sockets remain testable.

// let embedText, retrieve, callLLMStream, callLLM;
// try {
//   ({ embedText } = require('../rag/embed'));
// } catch (e) {
//   logger.warn('rag/embed not found; using fallback embedText.');
//   embedText = async (text) => Array(768).fill(0).map((_, i) => Math.sin(i + text.length));
// }

// try {
//   ({ retrieve } = require('../rag/retrieve'));
// } catch (e) {
//   logger.warn('rag/retrieve not found; using fallback retrieve.');
//   retrieve = async (collectionName, embedding, topK = 5) => [];
// }

// try {
//   ({ callLLMStream, callLLM } = require('../rag/llm'));
// } catch (e) {
//   logger.warn('rag/llm not found; using fallback callLLM/callLLMStream.');
//   callLLM = async (question, hits) => `<<placeholder answer for "${question}" — implement callLLM to use Gemini/OpenAI>>`;
//   callLLMStream = async (question, hits, onToken) => {
//     const answer = await callLLM(question, hits);
//     const tokens = answer.split(/\s+/);
//     for (const t of tokens) {
//       await new Promise((r) => setTimeout(r, 25));
//       onToken(t + ' ');
//     }
//   };
// }

/**
 * Socket.IO handler (chat only).
 *
 * Important: session lifecycle (create / clear / history) handled via REST endpoints.
 * Socket responsibilities: join session, accept user_message (with sessionId), stream tokens, emit final response.
 */
function initSocket(io) {
  io.on('connection', (socket) => {
    logger.info('Socket connected: ' + socket.id);

    // Client explicitly joins a session created via REST
    // Example payload: { sessionId: '8ae174af-3d18-4237-b4e2-f98d02f0eab9' }
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

    // Primary chat event — client must provide sessionId either by joining first or inside payload
    // Payload: { sessionId?: string, message: string }
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

        
        // Store user message into Redis history
        await redis.rpush(`chat:${sessionId}`, JSON.stringify({ role: 'user', text: message, ts: Date.now() }));

        // RAG flow
        logger.info('Embedding message for session %s', sessionId);
        const qEmbedding = await embedText(message);
        logger.info('Retrieving top-k for session %s', sessionId);
        const hits = await retrieve('news_articles', qEmbedding, 5);

        logger.info('Calling LLM stream for session %s', sessionId);


        // Stream tokens to client as they arrive
        await callLLMStream(message, hits, (token) => {
          try {
            socket.emit('bot_token', { token });
          } catch (e) {
            logger.warn('Failed to emit bot_token', e);
          }
        });

        // Get final answer (some LLMs may return full text separately)
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

    // Optional: listen for disconnect
    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected: ' + socket.id + ' reason=' + reason);
    });
  });
}

module.exports = { initSocket };
