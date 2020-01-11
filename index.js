var express = require ('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function(requset, respons) {
  respons.sendFile(__dirname + '/index.html');
});

msgs = [];
connections = [];

io.sockets.on('connection', function(socket) {
    console.log("Successful connection");
    connections.push(socket);

    socket.on('disconnect', function(data) {
      connections.splice(connections.indexOf(socket), 1);
      console.log("Successful disconnection");
    });

    socket.on('sendMsg', function(data) {
      console.log(data);
      msgs.push(data);
      io.sockets.emit('addMsg', {msg:data.msg, name:data.name, color:data.color});
    });

    socket.on('pushFiveMsgs', function(data) {
      socket.emit('PFM', msgs)
    });
});
