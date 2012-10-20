//https://github.com/nodejitsu/forever

/*
var darkness = require('./lib/darknessmap-server');
darkness.awesome();
*/

/**
 * Load our config. It uses default values
 * set on config.js and/or config.json
 * which can be overriden if suplied by CLI.
 */
var config = require('./lib/config').config;
// console.log('Config item ',config.get('ip'));

/**
 * We use express to power up the app.
 * All routes reside @ routes/index.js
 */
var express = require('express');
var app = express();
app.configure(function(){
    console.log('App: configure');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname+'/public'));
    app.use(app.router);
});


/**
 * We set up our routes
 * for the general website.
 */
var routes = require('./routes').router;

////////
// WEB.
////////
app.get('/', routes.index);
//error pages.
app.get('/404', routes.e404);
app.get('/500', routes.e505);

////////
// API.
////////
app.get('/api', routes.api.index);
app.get('/api/darkness',routes.api.getDarkness);
app.post('/api/darkness', routes.api.postDarkness);
app.get('/api/v/android',routes.api.android);

//Handle 404.
app.use(routes.handle404);

//Handle 505.
app.use(routes.handle505);

////////
// SIO.
////////

//User hash.
var users = {};

//Filters for api mongo calls.
var filters  = {};
filters.find = {loc:{$exists:true},payload:{$exists:true}};
filters.keys = {loc:1,payload:1,time:1};

var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
io.set('transports', config.get('sio:transports'));

io.sockets.on('connection', function(socket){
    console.log('==== connection here!');

    /**
     * Notify any loged in user of DB updates
     * in real time, so we can render positions
     * as they come in.
     */
    routes.on('darknessPosted', function(data){
        console.log('ON DARKNESS INSIDE THE SOCKET');
        socket.emit('darknessUpdate',data);
    });


    /**
     * Hanlde new users. Store a ref on socket.
     *
     */
    socket.on('adduser', function(user){
        console.log('==== on add user, with id: ',user);

        if(users[user] === user){
            console.log('==== user is user, error');
            socket.emit('sign', {state: 0});
        } else {
            console.log('==== adding user');
            socket.user = user;
            users[user] = user;
            socket.emit('sign', {state: 1});

            //find where loc & payload are there,
            //just get loc, payload & time
            //TODO: Remove from here, we dont need it! :)
            db.data.find(filters.find, filters.keys).toArray(function(error, data){
                // Send objects to new client
                socket.emit('darkness',data);
            });

            //Notify that we have a new user.
            io.sockets.emit('userUpdate', users);
        }
    });

    /**
     * Handle full data request. We might not need this, since
     * we are already sending all on connect.
     */
    socket.on('darkness',function(query){
        console.log('darkness request');
        db.data.find(filters.find, filters.keys).toArray(function(error, data){
            console.log('we have data ',data);
            socket.emit('darkness',data);
        });
    });

    /**
     *
     *
     */
    /*socket.on('handle', function (data) {
        Data.findById(data.obj[0], function(err, p) {
            p.x=data.obj[1];
            p.y=data.obj[2];
            p.save();
        });

        //We send to all clients, except source
        socket.broadcast.emit('handle', data);
    });*/

    /**
     * Remove user from collection.
     */
    socket.on('disconnect', function(){
        delete users[socket.user];
        io.sockets.emit('userUpdate', users);
    });
});

server.listen(config.get('http:port'));

////////
//Mongo
////////
var mgcf  = config.get('mongo');
var mongo = require('mongodb-wrapper');
// var db = mongo.db('178.79.145.84', 27017, 'darknessmap');
var db = mongo.db(mgcf.ip, mgcf.port, mgcf.db);

db.collection(mgcf.collection);

//handle the db connection?
routes.setDb(db);

////////
//Flash
////////
var pf = require('policyfile').createServer( );

pf.listen(843, function(){
  console.log('FlashPolicyServer: up and running...');
});