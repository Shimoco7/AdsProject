const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const http = require('http');
const { Server } = require('socket.io');
const url = 'mongodb://127.0.0.1:27017';
const port = 8082;
const app = express();
const server = http.createServer(app);
let db;

//Mongo connection and DB creation
server.listen(port,()=>{
  MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if (err) {
      return console.log(err);
    }
    db = client.db('DB');
    console.log(`MongoDB Connected:  http://localhost:27017`);
    db.collection("Ads").drop(function (err, result) {});
    db.collection("ActiveUsers").drop(function (err, result) {});
    db.collection("InActiveUsers").drop(function (err, result) {});
    db.collection("Templates").drop(function (err, result) {});
    db.collection("AdminUser").drop(function (err, result) {});
    fs.readFile('./public/data.json', 'utf8', function (err, data) {
      if (err) throw err;
      var json = JSON.parse(data);
      db.collection('Ads').insertMany(json, function (err, doc) {
        if (err) throw err;
      });
    });
    var admin = { username:"admin",password:"123456!"};
    db.collection("AdminUser").insertOne(admin);
    db.collection('Templates').insertMany([
      {templateID : 0, templateURL: '/public/index0.html'},
      {templateID : 1, templateURL: '/public/index1.html'},
      {templateID : 2, templateURL: '/public/index2.html'}
    ],(err,doc)=>{
      if(err) throw err;
    });
  });
});

//Configuration
const io = new Server(server);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'legendarySshSecret'
}));
console.log('Server started at http://localhost:' + port);

//Admin Paths
 app.get('/Admin',function(req,res){
  db.collection('AdminUser').findOne({session:req.sessionID},(err,result)=>{
    if(result){
      res.sendFile(path.join(__dirname, '/public/adminPanel.html'));
    }
    else{
      res.sendFile(path.join(__dirname, '/public/home.html'));
    }
  });
 });

 app.post('/Admin',function(req,res){
  var query = {username:req.body.username,password:req.body.password};
  db.collection('AdminUser').findOne(query,(err,result)=>{
    if(err) throw err;
    if(result){
      db.collection('AdminUser').updateOne(query,{
        $set:{
          session:req.sessionID
        }
      })
      res.sendFile(path.join(__dirname,'/public/adminPanel.html'));
    }
    else{
      res.send("Username or Password are incorrect");
    }
  });
});

app.get('/AdminDetails',function(req,res){
  db.collection('AdminUser').findOne({session:req.sessionID},(err,result)=>{
    if(result){
      res.send(JSON.stringify(result));
    }
    else{
      res.status(401).send("401-(Unauthorized)");
    }
  });
});

app.post('/AdminDetails',function(req,res){
  db.collection('AdminUser').findOne({session:req.sessionID},(err,result)=>{
    if(err) throw err;
    if(result){
      if(result.username===req.body.username&&result.password===req.body.password){
        res.send("No Data Changed");
        return;
      }
      db.collection('AdminUser').updateOne({session:req.sessionID},{
        $set:{
          username:req.body.username,
          password:req.body.password,
          session:req.sessionID
        }
      }).then((result)=>{
        if(result.modifiedCount>0){
          res.send("Password Updated Successfully");
        }
      });
    }
    else{
      res.sendFile(path.join(__dirname, '/public/home.html'));
    }
  });
});

app.get('/AdminPanel', function (req, res){
  db.collection('AdminUser').findOne({session:req.sessionID},(err,result)=>{
    if(result){
      if(req.query.name){
          db.collection(req.query.name).find().toArray((err,result)=>{
            var list = [];
            list.push(req.query.name);
            list.push(result);
            if(err) throw err;
            res.send(JSON.stringify(list));
        });
      }
      else{
        res.status(404).send("An error has occured");
      }
    }
    else{
      res.sendFile(path.join(__dirname,'/public/home.html'));
    }
  });
});

app.get('/getActiveUsers',function(req,res){	
  db.collection('AdminUser').findOne({session:req.sessionID},(err,result)=>{	
    if(result){	
      db.collection("ActiveUsers").find({}).sort({_id:-1}).toArray((err,r)=>{	
        res.send(r);	
      });	
    }	
    else{	
      res.sendFile(path.join(__dirname, '/public/home.html'));	
    }	
  });	
 });	
 app.get('/getInActiveUsers',function(req,res){	
  db.collection('AdminUser').findOne({session:req.sessionID},(err,result)=>{	
    if(result){	
      db.collection("InActiveUsers").find({}).sort({_id:-1}).toArray((err,r)=>{	
        res.send(r);	
      });	
    }	
    else{	
      res.sendFile(path.join(__dirname, '/public/home.html'));	
    }	
  });	
 });	


app.post('/DeleteAd',function(req,res){
  db.collection('AdminUser').findOne({session:req.sessionID},(err,result)=>{
    if(result){
      var types;
      var query = { name: RegExp(req.body.name, 'i')};
      db.collection('Ads').findOne(query,(err,r)=>{
        if(r){
          types = r.types;;
        }
      });
      db.collection('Ads').deleteOne(query,(err,result)=>{
          if(result.deletedCount==0)
            res.send("No advertisment has been deleted");
          else{
            res.send(types);
          }
        });
    }
    else{
      res.send("Not Connected");
    }
  });
});


app.post('/AddAd',function(req,res){
  db.collection('AdminUser').findOne({session:req.sessionID},(err,result)=>{
    if(result){
      db.collection('Ads').insertOne(req.body,(err,result)=>{
        if(result!=undefined)
        res.send(JSON.stringify(result));
        });
    }
    else{
      res.send("Not Connected");
    }
  });
  });

  app.post('/EditAd',function(req,res){
    db.collection('AdminUser').findOne({session:req.sessionID},(err,result)=>{
      if(result){
        db.collection('Ads').updateOne({ name: RegExp(req.body.name, 'i')}, {$set: req.body}, function(err, result){
          res.send(JSON.stringify(req.body));
        });
      }
      else{
        res.send("Not Connected");
      }
    });

   });

 //Client Paths
app.get('/', function (req, res) {
  clientId =parseInt(req.query.screen);
  screenId = clientId % 3;

  if(isNaN(screenId)){
    res.send('Please go to: http://localhost:'+port+'/?screen=id');
    return;
  }
  else{
      db.collection('ActiveUsers').findOne({client : clientId}, (err,result) => {
        if(err) throw err;
        if(result){
          res.send('This client is already connected to the service');
          return;
        }
      });
      var templateQuery = {templateID : screenId};
      db.collection("Templates").findOne(templateQuery,(err,result)=>{
        if(err) throw err;
        urlPath = result.templateURL;
        res.sendFile(path.join(__dirname, urlPath));
      });
  }
});

 //Client Paths
app.get('/', function (req, res) {
  clientId =parseInt(req.query.screen);
  screenId = clientId % 3;

  if(isNaN(screenId)){
    res.send('Please go to: http://localhost:'+port+'/?screen=id');
    return;
  }
  else{
      db.collection('ActiveUsers').findOne({client : clientId}, (err,result) => {
        if(err) throw err;
        if(result){
          res.send('This client is already connected to the service');
          return;
        }
      });
      var templateQuery = {templateID : screenId};
      db.collection("Templates").findOne(templateQuery,(err,result)=>{
        if(err) throw err;
        urlPath = result.templateURL;
        res.sendFile(path.join(__dirname, urlPath));
      });
  }
});

app.get('/getAdsByType', function (req, res){
  var query = {types : {$in: [parseInt(req.query.id)]}};
  db.collection("Ads").find(query).toArray((err,result)=>{
    if(err) throw err;
    res.send(result);
  });
});

//Users and Admin Management
io.on('connection', (socket) => {
  var str = String(socket.handshake.headers.referer);
  str = str.toLowerCase();
  if(str.includes('admin')){
    console.log("An admin has been connected");
    socket.on('disconnect',function(res){
      console.log("An admin has been disconnected");
    });
    socket.on('adsChanged0',(s)=>{
      io.emit('refresh0');
    });
    socket.on('adsChanged1',(s)=>{
      io.emit('refresh1');
    });
    socket.on('adsChanged2',(s)=>{
      io.emit('refresh2');
    });
  }
  else{
    str = str.split('screen=')[1];
    var clientId = parseInt(str);
    var screenId = clientId % 3;
    var query = {client : clientId};
    db.collection("InActiveUsers").deleteOne(query);

    var d=new Date(Date.now());
    var user = { uid:socket.id,client: clientId, screen: screenId,time:d.toString()};
    db.collection("ActiveUsers").insertOne(user, function(err, res) {
    if (err) throw err;
      console.log("A new client has connected and been added to 'ActiveUsers' collection");
      socket.broadcast.emit('UpdateOnDatabaseActive',user.client);
    });
    socket.on('disconnect',function(r){
      db.collection('ActiveUsers').findOne({uid:socket.id}, (err,res) => {
        if(err) throw err;
        var d=new Date(Date.now());
        var disconnectedUser = {uid:socket.id,client:res.client,screen:res.screen,disconnectionTime:d.toString()};
        db.collection('InActiveUsers').insertOne(disconnectedUser,(err,result)=>{
          if(result){
            socket.broadcast.emit('UpdateOnDatabaseInActive',disconnectedUser.client);
          }
        });
        db.collection("ActiveUsers").deleteOne({uid:socket.id});
        console.log("A client has disconnected and been removed from 'ActiveUsers' collection");
      });
    });
  }
});

