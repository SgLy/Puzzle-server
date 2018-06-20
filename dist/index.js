var app = require('express')();
var cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 204
}));
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.io = io;
io.sockets.on('connection', function (socket) {
    console.log('socket connected');
    socket.emit('connected');
});
app.get('/', function (req, res) {
    res.send('Puzzle app API');
});
var PORT = 5000;
server.listen(PORT, function () {
    console.log("Listening " + PORT);
});
