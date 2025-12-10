const express = require('express');
const { connection } = require('./config/db');
const { taskRouter } = require('./routes/task.routes');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT;
 const app = express();

 app.use(
  cors({
    origin: ["https://speak-task.vercel.app", "http://localhost:4500", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(express.json({limit : '10mb'}));

 app.get('/', async(req, res) => {
     res.send("hello");
 })
app.use('/api', taskRouter);


app.listen(port, async() => {
      try {
        await connection
        console.log("hi this is mongodb");
        console.log(`The server is running on port http://localhost:${process.env.PORT}`);
    } catch (error) {
        console.log(error);
    }
})