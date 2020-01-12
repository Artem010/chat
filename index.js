var express = require ('express');
var app = express();
var mysql = require('mysql2');

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var connection = mysql.createConnection({
  host: "remotemysql.com",
  user: "hmnwklXmKo",
  password: "C5DYSNcZIL",
  database: "hmnwklXmKo"
});
var msgs=[];
var connections = [];

function connectBD() {

  connection.connect(function(err){
    if (err) return console.error("Ошибка: " + err.message);
    console.log("Подключение к серверу MySQL успешно установлено");
  });
}
function disconnectBD() {
  connection.end(function(err) {
    if (err) {
      return console.log("Ошибка: " + err.message);
    }
    console.log("Подключение закрыто");
  });
}

server.listen(3000);
connectBD();


function addMsgDB(name, msg) {

  var id ='F';
  var color ='';
  let sqlSELECT = "SELECT * FROM users WHERE name=?";
  connection.query(sqlSELECT, name, function (err, result) {
    if (err) return console.log('ОШИБККА: ',err);
    console.log('res=',result);
    id = result[0].id;
    color = result[0].color;

    let sqlINSERT = "INSERT INTO Messeges(id_name,name,messege,color) VALUES(?,?,?,?)";
    connection.query(sqlINSERT, [id,name,msg,color], function (err, result) {
      if (err) return console.log('ОШИБККА: ',err);
      console.log("Added msg");
    });

  });

}

function regUserDB(name, color) {
  let sqlINSERT = "INSERT INTO users(name, password, color) VALUES (?, ?, ?)";
  connection.query(sqlINSERT, [name, '0', color], function (err, result) {
    if (err) return console.log('ОШИБККА: ',err);
    console.log("User registered");
  });
}

function loginUserDB() {
  let sqlSELECT = "SELECT * FROM users WHERE name=? AND password=?";
  connection.query(sqlSELECT, [name,password], function (err, result) {
    if (err) return console.log('ОШИБККА: ',err);
    console.log('res=',result);
    let pass = result[0].password;
    // if pass =
  });
}

function allMsgDB() {
  let sqlSELECT = "SELECT * FROM messeges";
  connection.query(sqlSELECT, function (err, result) {
    if (err) return console.log('ОШИБККА: ',err);
    console.log(result);

    for (var i = 0; i <= 5; i++) {
      // console.log(result[i].messege);
      msgs.push({msg:result[i].messege, name:result[i].name});
    }
    console.log(msgs);
    return msgs;
  });
}

app.get('/', function(requset, respons) {
  respons.sendFile(__dirname + '/index.html');
});
app.get('/main.css', function(requset, respons) {
  respons.sendFile(__dirname + '/main.css');
});



io.sockets.on('connection', function(socket) {
  console.log("Successful connection");
  io.sockets.emit('cnctMsg');


  socket.on('disconnect', function(data) {
    connections.splice(connections.indexOf(socket), 1);
    console.log("Successful disconnection");
  });

  socket.on('sendMsg', function(data) {
    console.log(data);
    addMsgDB(data.name, data.msg);
    io.sockets.emit('addMsg', {msg:data.msg, name:data.name, color:data.color});
  });

  socket.on('pushFiveMsgs', function(data) {
    let m = [];
    let sqlSELECT = "SELECT * FROM messeges ORDER BY id DESC LIMIT 15";
    connection.query(sqlSELECT, function (err, result) {
      if (err) return console.log('ОШИБККА: ',err);
      // console.log(result);

      for (let i = 0; i < result.length; i++) {
         m.unshift({
          msg: result[i].messege,
          name: result[i].name,
          color: result[i].color
        })
      }

      console.log( m);
      socket.emit('PFM',  m);
    });

  });

  socket.on('reg', function(data) {
      console.log(data);
      regUserDB(data.name, data.color);
  });
});
