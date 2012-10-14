///////////
//NCONF
///////////
var nconf = require('nconf');

// First consider commandline arguments and environment variables, respectively.
nconf.argv().env();

// Then load configuration from a designated file.
nconf.file({ file: './config.json' });

// Provide default values for settings not provided above.
nconf.defaults({
    'http': {
        'port': 8080
    },
    'sio':{
        'transports':['flashsocket', 'websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']
    },
    'mongo':{
        'ip':'178.79.145.84',
        'port':27017,
        'db':'darknessmap',
        'collection':'data'
    }
});


//Expose the config obj.
exports.config = nconf;

