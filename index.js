var express = require ('express');
var session = require('express-session');

var crypto = require('crypto');

var app = express();
var mysql = require('mysql2');
const promise = require('promise');


var random = require("random");



var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var connection = mysql.createPool({
  host: "remotemysql.com",
  user: "hmnwklXmKo",
  password: "C5DYSNcZIL",
  database: "hmnwklXmKo"
});
var msgs=[];
var connections = [];


server.listen(3000);


app.use(session({resave: true, saveUninitialized: true, secret: 'XCR3rsasa%RDHHH', cookie: { maxAge: 60000 }}));


var sessionData
// app.get('/',function(req,res){
//   sessionData = req.session;
//   sessionData.user = {};
//   sessionData.user.username = 'Artem';
//   sessionData.user.salary = random.int(55, 956);
//    console.log("Setting session data:username=%s and salary=%s", sessionData.user.username, sessionData.user.salary)
//
//  // res.end('Saved session and salary : ' + sessionData.username);
//  // res.json(sessionData.user)
// });

// app.get('/set_session',function(req,res){
//   sessionData = req.session;
//   sessionData.user = {};
//   let username = "adam";
//   sessionData.user.username = username;
//   sessionData.user.salary = random.int(55, 956);
//    console.log("Setting session data:username=%s and salary=%s", username, sessionData.user.salary)
//
//  // res.end('Saved session and salary : ' + sessionData.username);
//  res.json(sessionData.user)
// });








function addMsgDB(name, msg) {
  var id ='F';
  var color ='';
  let sqlSELECT = "SELECT * FROM users WHERE name=?";
  connection.query(sqlSELECT, name, function (err, result) {
    if (err) return console.log('ОШИБККА: ',err);
    console.log('res=',result);
    id = result[0].id;
    color = result[0].color;

    let sqlINSERT = "INSERT INTO messeges(id_name,name,messege,color) VALUES(?,?,?,?)";
    connection.query(sqlINSERT, [id,name,msg,color], function (err, result) {
      if (err) return console.log('ОШИБККА: ',err);
      console.log("Added msg");
    });
  });


}

function regUserDB(name, password, color) {

  let sqlINSERT = "INSERT INTO users(name, password, color) VALUES (?, ?, ?)";
  connection.query(sqlINSERT, [name, hash(password), color], function (err, result) {
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


async function regDB (name, pass) {

  try {
    let sqlSELECT = "SELECT * FROM users WHERE name=? AND password=?";

    let res = 'lox';
    res = await connection.execute(sqlSELECT, [name, pass], async (err, result) => {
      console.log('result=', result);
      return await result;
    });
    console.log('res=',res);

    // if(res == 0){
    //   // regUserDB(name, '0000')
    //   // return console.log('Ok');
    // }
    // else{
    //   return console.log('Not empty');
    // }


  } catch (e) {
    return console.log('EROOOOOR',e);;
  }


}

app.get('/', function(requset, respons) {
  respons.sendFile(__dirname + '/index.html');

  console.log('START session = ',requset.session);
  if (requset.session.user) {
    console.log("LOGIN session data:username=%s and password=%s and color=%s", sessionData.user.username, sessionData.user.password, sessionData.user.color );
    return respons.redirect('/chatMain.html');
  }
  else{
    sessionData = requset.session;
  }

});



app.get('/main.css', function(requset, respons) {
  respons.sendFile(__dirname + '/main.css');
});

app.get('/logout', function(requset, respons) {
  console.log('logout');
  // if (requset.session.user) {
   delete requset.session.user;
   return respons.redirect('/');
  // }
});

app.get('/chatMain.html', function(requset, respons) {
  console.log(requset.session.user);
  if(requset.session.user){
    respons.sendFile(__dirname + '/chatMain.html');
  }
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

      for (let i = 0; i < result.length; i++) {
         m.unshift({
          msg: result[i].messege,
          name: result[i].name,
          color: result[i].color
        })
      }

      // console.log( m);
      socket.emit('PFM',  m);
    });

  });


  socket.on('regCheck', async function(data) {

    try {
      let sqlSELECT = "SELECT * FROM users WHERE name=? ";
      connection.query(sqlSELECT, data.name, (err, result) => {

      if(result == ''){
        regUserDB(data.name, data.password, data.color);
        sessionData.user = {};
        sessionData.user.username = data.name;
        sessionData.user.password = data.password;
        sessionData.user.color = data.color;
        console.log('Ok');
        return socket.emit('successfulReg');
      }
      else return socket.emit('errorReg');
      });

    }catch (e) {
      return console.log('EROOOOOR-REG',e);;
    }

  });

  socket.on('login', async function (data) {
    try {
      let sqlSELECT = "SELECT * FROM users WHERE name=? AND password=?";
      connection.query(sqlSELECT, [data.name, hash(data.password)], (err, result) => {
      console.log(result);
      if(result != ''){
        if (result[0].name == data.name && result[0].password == hash(data.password)){
          console.log('User is Login!');
          // console.log(sessionData);
          sessionData.user = {};
          sessionData.user.username = data.name;
          sessionData.user.password = data.password;
          sessionData.user.color = result[0].color;
          console.log(sessionData);
          console.log("Setting session data:username=%s and password=%s and color=%s", sessionData.user.username, sessionData.user.password, sessionData.user.color );


          return socket.emit('successfulLogin', {name:result[0].name,color:result[0].color});
        }else{
          console.log("ERRRROOR0000000000");
        }
      }
      else return socket.emit('errorLogin');
      });

    }catch (e) {
      return console.log('EROOOOOR-LOGIN',e);;
    }
  });

  socket.on('settings', function () {
    socket.emit('settingsGET', {name:sessionData.user.username, color:sessionData.user.color });
  })
});

function hash(text) {
	return crypto.createHash('sha1')
	.update(text).digest('base64')
}
