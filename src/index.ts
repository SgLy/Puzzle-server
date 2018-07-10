import * as express from 'express';
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${(new Date()).toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.method === 'GET')
    req.body = { data: req.query };
  else
    req.body = { data: req.body };
  next();
});

import * as http from 'http';
const server = new http.Server(app);
import * as socketio from 'socket.io';
const io = socketio(server, { httpCompression: true });

import { makeRoomClient } from './room';
io.sockets.on('connection', socket => {
  console.log('socket connected');
  socket.emit('connected');
  socket.on('auth', async token => {
    const user = await db.collection('user').findOne({ token });
    if (user !== null)
      makeRoomClient(socket, user.username, io);
    else
      socket.emit('authFailed');
  })
});

app.get('/', (req, res) => {
  res.send('Puzzle app API');
});

import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { userApis } from './user';
let db: Db;
(async () => {
  const DATABASE = 'puzzle';
  const PROTO = 'mongodb';
  const USERNAME = 'puzzle';
  const PASSWORD = 'puzzlePassword123456!';
  const IP = '39.108.99.67';
  const DB_PORT = 27017;
  const URL = `${PROTO}://${USERNAME}:${PASSWORD}@${IP}:${DB_PORT}/puzzle`;
  try {
    let client = await MongoClient.connect(URL);
    console.log('Connected to MongoDB');
    db = client.db(DATABASE);
    userApis(app, db);
  } catch (err) {
    console.log(err.stack);
  }
  
  const PORT = 5000;
  server.listen(PORT, () => {
    console.log(`Listening ${PORT}`);
  });
})();
