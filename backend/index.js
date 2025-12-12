const express = require('express');
const http = require('http');
const cors = require('cors');
const { initDb } = require('./config/db');
const { initRedis } = require('./config/redis');
const { initVectorStore, ensureCollection } = require('./config/vectorStore'); // <-- FIX HERE
const sessionRoutes = require('./routes/session.routes');
const { initSocket } = require('./socket/chatSocket');
const logger = require('./utils/logger');
const { ingestArticles } = require('./rag/ingest');
const articles = require("./utils/news.json");

require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());


// Routes
app.get('/', (req, res) => {
     res.send({msg : "hello"})
})

app.use('/api/session', sessionRoutes);

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
  allowEIO3: true,
  transports: ["websocket"],
  upgradeTimeout: 30000
});


async function start() {

    try {
        await initDb(process.env.MONGODB_URI);
        await initRedis(process.env.REDIS_URL);
        await initVectorStore(process.env.QDRANT_URL, process.env.QDRANT_API_KEY);
        await  ingestArticles(articles.urls, "news_articles");
   
        await ensureCollection("news_articles", 768); // 768 → Jina embedding size

        initSocket(io);

        const port = process.env.PORT || 4000;
        server.listen(port, () => logger.info(`Server listening on ${port}`));
    } catch (err) {
        logger.error('Failed to start server', err);
        process.exit(1);
    }
}


start();