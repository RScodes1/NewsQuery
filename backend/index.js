const express = require('express');
const http = require('http');
const cors = require('cors');
const { initDb } = require('./config/db');
const { initRedis } = require('./config/redis');
const { initVectorStore } = require('./config/vectorStore');
const sessionRoutes = require('./routes/session.routes');
const chatRoutes = require('./routes/chat.routes');
const { initSocket } = require('./socket/chatSocket');
const logger = require('./utils/logger');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/session', sessionRoutes);
app.use('/api/chat', chatRoutes);


const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });


async function start() {
try {
await initDb(process.env.MONGODB_URI);
await initRedis(process.env.REDIS_URL);
await initVectorStore(process.env.CHROMA_URL);


initSocket(io);


const port = process.env.PORT || 4000;
server.listen(port, () => logger.info(`Server listening on ${port}`));
} catch (err) {
logger.error('Failed to start server', err);
process.exit(1);
}
}


start();