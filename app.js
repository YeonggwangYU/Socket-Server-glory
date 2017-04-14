var http = require('http');
var express = require('express');
var fs = require('fs');
var socketio = require('socket.io');

var app = express();

app.all('/', function (req, res, next){
    fs.readFile('socket.chat.html', function(error, result){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(result);
    });
});

var port = process.env.PORT || 1337;
var server = http.createServer(app).listen(port, function () {
    console.log('createServer_1337');
})

var io = socketio.listen(server);
io.sockets.on('connection', function (socket){
    socket.on('join', function (data) {
        console.log(data.user + ' : ' + data.roomname);

        socket.leave(socket.room);
        socket.join(data.roomname);
        socket.room = data.roomname;
        io.sockets.in(socket.room).emit('join', data);
    });

    socket.on('msg', function (data) {
        console.log(data.user + ' : ' + data.msg + ' : ' + data.date);
        io.sockets.in(socket.room).emit('msg', data);
    });

    socket.on('disconnect', function () {
        console.log('disconnect');
    });
});