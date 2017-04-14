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
    console.log('1337');
})



var io = socketio.listen(server);
io.sockets.on('connection', function (socket){
    socket.on('join', function (result) {
        console.log('join: ' + socket.room);
        socket.leave(socket.room);
        socket.join(result);
        socket.room = result;
        //io.sockets.in(socket.room).emit('join', data);
    });

    socket.on('message', function (result) {
        console.log(result.inpUserName + ' : ' + result.inpUserMessage + ' : ' + result.date);
        io.sockets.in(socket.room).emit('message', result);
    });

    socket.on('disconnect', function () {
        console.log('disconnect');
    });
});