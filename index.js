const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('data/db.json');
var fs = require('fs');
var rules;
try {
  rules = fs.readFileSync('data/rules.json') || [];
  rules = JSON.parse(rules);
}
catch (error) {
  throw " Error in reading rules.\n Please check with rules.json";
}
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

const middlewares = jsonServer.defaults();
// console.log(process.env);
const port = process.env.PORT || 3000;

server.use(middlewares);
// server.use(jsonServer.rewriter({
//   "/api/v1/*": "/$1",
//   "/:resource/:id/show": "/:resource/:id"
// }));

server.use(jsonServer.rewriter({
  "/:resource/:id/show": "/:resource/:id"
}));

//set up cors
server.use(function (req, res, next) {
  /*
  console.log("*****************************************");
  console.log("Request headers : "+new Date());
  console.log(req.headers);
  console.log("Request URL : "+new Date());
  console.log(req.url);
  console.log("*****************************************");
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
      console.log(`req.method : ${req.method} ||  req.url : ${req.url}`);
      if (reqURL.indexOf(rules[i].route) > -1) {
        if (methods.indexOf(req.method) > -1) {
          try {
            const status = rules[i].rules.methods[req.method].status;
            const message = rules[i].rules.methods[req.method].message;
            if (!status && !message) {
              next();
            }
            if (status)
              res.status(status);
            if (message)
              res.send(message);
            else
              next();
          } catch (error) {
            next();
          }
        }
        break;
      }
    }

  // Pass to next layer of middleware
  //next();
});

server.use("/api/v1", router);

//server.use(router);
server.listen(port, () => {
  console.log('Mock Server is running on port ' + port);
});