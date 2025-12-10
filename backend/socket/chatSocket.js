const { v4: uuidv4 } = require('uuid');
function initSocket(io) {
    io.on('connection', (socket) => {
        logger.info('Socket connected: ' + socket.id);


        // assign a session id if client didn't send one
        socket.on('start_session', async (payload) => {
            const sessionId = payload?.sessionId || uuidv4();
            socket.data.sessionId = sessionId;
            socket.emit('session_started', { sessionId });
        });


        socket.on('user_message', async (data) => {
            try {
                const sessionId = socket.data.sessionId || data.sessionId;
                const message = data.message;
                const redis = getRedis();


                // push user message to history
                await redis.rpush(`chat:${sessionId}`, JSON.stringify({ role: 'user', text: message, ts: Date.now() }));


                // RAG flow
                const qEmbedding = await embedText(message);
                const hits = await retrieve('news_collection', qEmbedding, 5);


                // Call LLM streaming function which accepts a callback to send tokens
                await callLLMStream(message, hits, (token) => {
                    socket.emit('bot_token', { token });
                });


                // After streaming complete, fetch final text (or have callLLMStream return final answer)
                const finalAnswer = await callLLM(message, hits);
                await redis.rpush(`chat:${sessionId}`, JSON.stringify({ role: 'bot', text: finalAnswer, ts: Date.now() }));
                socket.emit('bot_response', { text: finalAnswer });


            } catch (e) {
                logger.error('socket user_message failed', e);
                socket.emit('error', { message: e.message });
            }
        });


        socket.on('clear_session', async () => {
            try {
                const sessionId = socket.data.sessionId;
                const redis = getRedis();
                await redis.del(`chat:${sessionId}`);
                socket.emit('session_cleared');
            } catch (e) {
                socket.emit('error', { message: e.message });
            }
        });


        socket.on('disconnect', () => {
            logger.info('Socket disconnected: ' + socket.id);
        });
    });
}


module.exports = { initSocket };