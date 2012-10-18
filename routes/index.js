var util = require('util');
var events = require('events');

/**
 * Create an API object. 
 * Expose methods, and inherit from events.
 * Emit db updates, catch those in socket, and push to client.
 * http://nodejs.org/api/events.html
 * http://elegantcode.com/2011/02/21/taking-baby-steps-with-node-js-implementing-events/
 * http://www.mshiltonj.com/blog/2011/10/04/nodejs-eventemitter-example-with-custom-events/
 * http://venodesigns.net/2011/04/16/emitting-custom-events-in-node-js/
 */
var Darknessmap = function(){
    events.EventEmitter.call(this);
};
Darknessmap.prototype = new events.EventEmitter;

var router = new Darknessmap();

//util.inherits(api, events.EventEmitter);

//TMP:
exports.router = router;

Darknessmap.prototype.setDb = function(db){
    this.mongo = db;
};
/*
 * GET home page.
 */
Darknessmap.prototype.index = function(req, res){
    res.writeHead(200,{'Content-Type':'text/html'});
    res.sendfile('public/index.html');
    // res.render('index', { title: 'Express' });
};

var Api = function(emitter){
    this.emitter = emitter;
};

Api.prototype.index = function(req, res){
    console.log('API');
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end('<b>API: v0.0.1</b>');    
};

Darknessmap.prototype.api = new Api();

/**
 *
 *
 */
Api.prototype.android = function(req, res)
{
    //TODO: We want to pass a config value here.
    //actually, serve a public/versions/android.json
    res.sendfile('public/versions/android.txt');
};

/**
 * API method that returns all geo data.
 * It will group by session id.
 */
 //Filters for api mongo calls.
var filters = {};
filters.find = {loc:{$exists:true},payload:{$exists:true}};
filters.keys = {loc:1,payload:1,time:1,_id:0};
Api.prototype.getDarkness = function(req,res){
    console.log('API: Darkness');
    router.mongo.data.find(filters.find,filters.keys).toArray(function(error, data){
        if(error){
            //handle error!
            throw error;
        }

        //send data.
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(data);
    });
};

/**
 * API method to store sample data from device.
 * After storing in mongodb, it will dispatch
 * event to notify clients.
 */
Api.prototype.postDarkness = function(req, res){
    // console.log("POST: ");
    // console.log(req.body.data);
    var posted = JSON.parse( req.body.data );
    router.data.insert(posted, function(err, payload){
        // console.log('Inserted our content');
        //Should we ensure data integrity?!
        res.send(payload);
        router.emit('darknessPosted',posted);
    });
};

/**
 * MIDDLEWARE: Ensure that we trigger
 * a 404 since the route won't be matched
 * and we handle it on handle404.
 */
Darknessmap.prototype.e404 = function(req, res, next){
    next( );
};

/**
 * MIDDLEWARE: Trigger- next- a generic
 * 505 error. Handled by handle505.
 */
Darknessmap.prototype.e505 = function(req, res, next){
    next(new Error('keyboard cat!'));
};

/**
 * 404 error handler.
 * We set header status and serve content
 * based on request headers.
 * $ curl http://localhost:3000/notfound
 * $ curl http://localhost:3000/notfound -H "Accept: application/json"
 * $ curl http://localhost:3000/notfound -H "Accept: text/plain"
 */
Darknessmap.prototype.handle404 = function(req, res, next){
    res.status(404);
    
    if(req.accepts('html')){
        res.sendfile('public/404.html');
        return;
    }

    if(req.accepts('json')){
        res.send({error:'Not Found.'});
        return;
    }

    res.type('text').send('Not Found.');
};

Darknessmap.prototype.handle505 = function(err, req, res, next){
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    res.status(err.status || 500);
    res.sendfile('public/505.html');
    // res.render('500', { error: err });
};