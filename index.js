const jsonServer = require('json-server');
const util = require('./util');
var bodyParser = require('body-parser')
const server = jsonServer.create();
const router = jsonServer.router('data/db.json');
const fs = require('fs');
const responsePath = 'data/responses/';
var dbData;
try {
  dbData = JSON.parse(fs.readFileSync('data/db.json', 'utf-8'));
} catch (e) {
  if (e instanceof SyntaxError) {
    util.error('Error in reading db');
    e.mesage = 'Error in reading db';
  }
  throw e;
}
var rules;
try {
  rules = fs.readFileSync('data/rules.json') || [];
  rules = JSON.parse(rules);
}
catch (e) {
  if (e instanceof SyntaxError) {
    util.error('Error in reading rules');
    e.message = `Malformed JSON in file: 'data/rules.json' \n${e.message}`;
  }
  throw e;
}
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

const middlewares = jsonServer.defaults();
//util.log('process.env',util.log());
const port = process.env.PORT || 3000;
server.use(bodyParser.json());         // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
server.use(middlewares);
// server.use(jsonServer.rewriter({
//   "/api/v1/*": "/$1",
//   "/:resource/:id/show": "/:resource/:id"
// }));

server.use(jsonServer.rewriter({
  "/:resource/:id/show": "/:resource/:id",
  "/:resource?id=:id": "/:resource/:id",
  "/:resource?firstname=:firstname&id=:id": "/:resource/:firstname/:id",
}));

//set up cors and custom responses
server.use(function (req, res, next) {
  /*
  util.log("*****************************************");
  util.log("Request headers : ");
  util.log(req.headers);
  util.log("Request URL : ");
  util.log(req.url);
  util.log("*****************************************");
  */
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (typeof rules != undefined)
    for (var i = 0; i < rules.length; i++) {
      var reqURL = req.url.split("/api/v1/")[1];
      util.log(`req.method : ${req.method} ||  req.url : ${req.url}`);
      // if route defined in db.json
      if (util.isRouteDefinedInDB(reqURL, dbData)) {
        if (rules[i].route && reqURL.indexOf(rules[i].route) > -1) {
          if (methods.indexOf(req.method) > -1) {
            try {
              const status = rules[i].rules.methods[req.method].status;
              const message = rules[i].rules.methods[req.method].message;
              const filepath = rules[i].rules.methods[req.method].responseFile;
              if (typeof filepath !== 'undefined') {
                try {
                  let fileData;
                  if (filepath.indexOf('json') > -1) {
                    fileData = JSON.parse(fs.readFileSync(responsePath + filepath, 'utf-8'));
                  } else {
                    fileData = fs.readFileSync(responsePath + filepath, 'utf-8');
                  }
                  util.log('reading from external response file : '+filepath);
                  res.send(fileData);
                } catch (file_error) {
                  res.status(500);
                  res.send(util.formatError('error in reading custom responses', 'file name : ' + filepath, 500));
                }
              } else {
                if (!status && !message) {
                  next();
                }
                if (status && message) {
                  util.log('reading from rule.json config');
                  res.status(status);
                  res.send(message);
                }
                else{
                  util.log('no configuration found for route');
                  util.warn('forwarding request : --> ');
                  next();
                }
              }
            } catch (error) {
              util.warn(`method configuration missing`);
              util.warn('forwarding request : --> ');
              next();
              break;
            }
          } else {
            res.status(405);
            res.send(util.formatError('requested method not supported'));
            //break;
          }
          break;
        } else {
          // if rule configuration missing forward request...                    
          //util.warn('rule configuration missing for route ' + reqURL);
          //util.warn('forwarding request : --> ');
          //next();
          continue;
        }


      } else {
        // if route not defined in db.json
        util.warn('api url does not exist');
        util.warn('forwarding request : --> ');
        next();
        //res.status(500);
        //res.send(util.formatError('api url does not exist', 'requested route not found', 500));
        break;
      }
    }
  // Pass to next layer of middleware
  //next();
});

server.use("/api/v1", router);

//server.use(router);
server.listen(port, () => {
  util.log('Mock Server is running on port ' + port);
});