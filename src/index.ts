const app = require('express')();
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 204
}));

const express = require('express');

app.use((req, res, next) => {
  console.log(`[${(new Date()).toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const server = require('http').Server(app);
const io = require('socket.io')(server);
app.io = io;
io.sockets.on('connection', (socket) => {
  console.log('socket connected');
  socket.emit('connected');
});

app.get('/', (req, res) => {
    res.send('Puzzle app API');
});

const mongo = require('mongodb').MongoClient;
let db;
(async () => {
  const dbName = 'puzzle';
  const url = 'mongodb://localhost:27017';
  try {
    let client = await mongo.connect(url);
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  } catch (err) {
    console.log(err.stack);
  }

  const PORT = 5000;
  server.listen(PORT, () => {
    console.log(`Listening ${PORT}`);
  });
})();
