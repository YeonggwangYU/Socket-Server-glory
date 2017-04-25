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
    console.log('createServer_8212');
})

var UserRooms = [];
var io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
    var ID;
    var MatchID;
    var RoomID;

    function UserRoom(ID, MatchID, Lock){
        this.ID = ID;
        this.MatchID = MatchID;
        this.Lock = Lock;
    }

    function GenerateRandom(min, max){
    	var ranNum = Math.floor(Math.random()*(max-min+1))+min;
    	return ranNum;
    }

    socket.on('Update', function (data) {
        for (item in UserRooms) {
            if (UserRooms[item].Lock == true && UserRooms[item].MatchID == data.ID) {
                delete (UserRooms[item]);
                RoomID = data.ID;

                socket.leave(data.MatchID);
                socket.join(data.ID);

                //io.sockets.in(data.ID).emit('MatchStop', data);
                io.to(socket.id).emit('MatchStop', data);
                console.log('Join Room ID : ' + data.ID);
                console.log('Match Success!');
            }
        }
    });

    socket.on('MatchChannelJoin', function (data) {
        console.log('Join Match :' + data.ID);
        ID = data.ID;
    	MatchID = data.MatchID;

    	var rooms = io.sockets.adapter.rooms;
	    if(rooms){
		    for(item1 in rooms){
		    	var roomexist = false;
		    	for(item2 in UserRooms){
		    	    if (UserRooms[item2].Lock == false && UserRooms[item2].MatchID == item1) {
		    	        UserRooms[item2].Lock = true;
		    	        UserRooms[item2].MatchID = UserRooms[item2].ID;

		    	        socket.leave(item1);
		    	        socket.join(UserRooms[item2].MatchID);
		    	        RoomID = UserRooms[item2].MatchID;

		    	        console.log('Host Creater : ' + data.ID + ' Room : ' + UserRooms[item2].MatchID);
		    	        //io.sockets.in(UserRooms[item2].MatchID).emit('MatchStart', data);
		    	        io.to(socket.id).emit('MatchStart', data);
		    	        console.log('Match Start! Room Name : ' + UserRooms[item2].MatchID);    
	    				return;
		    		}
		    	}
		    }
	    }

		var _UserRoom = new UserRoom(data.ID, data.MatchID, false);
		UserRooms.push(_UserRoom);

		socket.leave(MatchID);
        socket.join(MatchID);
        
        //io.sockets.in(MatchID).emit('MatchChannelJoin', data);
        io.to(socket.id).emit('MatchChannelJoin', data);
        console.log('Create Room : ' + data.ID + ' ' + data.MatchID);
    });

    socket.on('msg', function (data) {
        console.log(data.user + ' : ' + data.msg + ' : ' + data.date);
        io.sockets.in(RoomID).emit('msg', data);
    });

    socket.on('SendRand', function (data) {
        console.log('GetRand');
        io.sockets.in(RoomID).emit('SendRand', data);
    });

    socket.on('CharSel', function (data) {
        console.log('nCharSel ' + data.nCharSel);
        socket.broadcast.to(RoomID).emit('CharSel', data);
    });

    socket.on('MyConnect', function (data) {
        io.to(socket.id).emit('MyConnect', data);
        console.log('MyConnect :' + data.ID);
    });

    socket.on('EnemyConnect', function (data) {
        socket.broadcast.to(RoomID).emit('EnemyConnect', data);
        console.log('EnemyConnect :' + data.ID);
    });

    socket.on('CardList', function (data) {
        socket.broadcast.to(RoomID).emit('CardList', data);
        console.log('Send CardList');
    });

    socket.on('ActionColorMap', function (data) {
        socket.broadcast.to(RoomID).emit('ActionColorMap', data);
        console.log('Send ActionColorMap');
    });

    socket.on('ColorAddMap', function (data) {
        io.sockets.in(RoomID).emit('ColorAddMap', data);
        console.log('Send ColorAddMap');
    });

    socket.on('ShowUserRoomList', function (data) {
        for (var item in UserRooms) {
            console.log(UserRooms[item]);
        }
    });

    socket.on('CancelMatchChannelJoin', function (data) {
        for (item in UserRooms) {
            if (UserRooms[item].ID == data.ID) {
                delete (UserRooms[item]);
                break;
            }
        }

        socket.leave(data.MatchID);
        socket.leave(RoomID);

        console.log('Cancel Match');
    });

    socket.on('WaitPlayer', function (data) {
        io.sockets.in(RoomID).emit('WaitPlayer', data);
    });

    socket.on('StartGame', function (data) {
        console.log('Start Game');
        io.sockets.in(RoomID).emit('StartGame', data);
    });

    socket.on('disconnect', function () {
        console.log('disconnect : ' + ID);
        //socket.broadcast.to(RoomID).emit('disconnect', ID);
    });
});