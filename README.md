# darknessmap-server

Darknessmap node server.

## Getting Started
Install the module with: `npm install darknessmap-server`

Start `mongod`:
```
mongod --fork --logpath /var/log/mongodb/mongodb.log --dbpath /srv/db/mongodb
```

Cd to directory with darknessmap-server code, ie:
```
cd /srv/node/darknessmap-server
```

Start server using `forever`:
```
forever start -l forever.log -o out.log -e err.log index.js 
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 goliatone  
Licensed under the MIT license.
