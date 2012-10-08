/*
var darkness = require('./lib/darknessmap-server');
darkness.awesome();
*/
var express = require('express');
var app = express();
app.configure(function(){
    console.log('configure');
    app.use(express.bodyParser());
    app.use(express.static(__dirname+'/public'));
});
app.get('/', function(req, res){
    console.log('hello world');
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end('Hello <b>World</b>');
});

var http = require('http');
var server = http.createServer(app);

var transports = ['flashsocket', 'websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'];
var io = require('socket.io').listen(server);
io.set('transports', transports);

io.sockets.on('connection', function(socket){
    console.log('==== connection here!');
    socket.emit('sing', 'Hello fucking world!');
    socket.emit('event',{user:'pepe'});

    socket.on('hello',function(message){
        socket.emit('event','I say: '+message);
    });

    socket.on('darkness',function(query){
        console.log('this is darkness');
        Data.find({},function(err,docs){
            if(err) {throw err;}
            socket.emit('objects',docs);
        });
    });
});

server.listen(8080);

////////
// Mongo
////////
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Payload = new Schema();
Payload.add({
    uid : { type: String },
    sid : { type:String},
    loc : { type: Array },
    payload : { type: Number },
    time    : { type: Number }
});

// var db = mongoose.connect('mongodb://178.79.145.84/darknessmap');
var db = mongoose.createConnection('localhost', 'darknessmap');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // yay!
  console.log('mongoose yay');
});

var Payload = mongoose.model('data', Payload);
var Data = mongoose.model('data');
// List products
app.get('/api/darkness', function (req, res) {
    res.send('hello from here.....');
    Data.findOne({ name: 'pepe' }, function (err, doc) {
      if(err) return console.log('findone error');
      doc.name = 'jason borne';
      doc.save(callback);
    });
    Data.count(function (err, count) {
        if (err) return console.log(err);
        res.send(count);
    });
    res.send('<p>Unsure of what is going on</p>');
});
////////
// flash
////////
var pf = require('policyfile').createServer();

pf.listen(843, function(){
  console.log('FlashPolicyServer...');
});