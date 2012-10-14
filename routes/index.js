var mongo;

exports.setDb = function(db){
    mongo = db;
};
/*
 * GET home page.
 */
exports.index = function(req, res){
    res.writeHead(200,{'Content-Type':'text/html'});
    res.sendfile('public/index.html');
    // res.render('index', { title: 'Express' });
};

exports.api = function(req, res){
    console.log('API');
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end('<b>API: v0.0.1</b>');
};

/**
 * API method that returns all geo data.
 * It will group by session id.
 */
 //Filters for api mongo calls.
var filters = {};
filters.find = {loc:{$exists:true},payload:{$exists:true}};
filters.keys = {loc:1,payload:1,time:1,_id:0};
exports.api.getDarkness = function(req,res){
    console.log('API: Darkness');
    mongo.data.find(filters.find,filters.keys).toArray(function(error, data){
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
exports.api.postDarkness = function(req, res){
    // console.log("POST: ");
    // console.log(req.body);
    mongo.data.insert(req.body, function(err, payload){
        // console.log('Inserted our content');
        //Should we ensure data integrity?!
        res.send(payload);
    });
};

/**
 * MIDDLEWARE: Ensure that we trigger
 * a 404 since the route won't be matched
 * and we handle it on handle404.
 */
exports.e404 = function(req, res, next){
    next( );
};

/**
 * MIDDLEWARE: Trigger- next- a generic
 * 505 error. Handled by handle505.
 */
exports.e505 = function(req, res, next){
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
exports.handle404 = function(req, res, next){
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

exports.handle505 = function(err, req, res, next){
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    res.status(err.status || 500);
    res.sendfile('public/505.html');
    // res.render('500', { error: err });
};