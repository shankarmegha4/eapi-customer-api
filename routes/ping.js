var express = require('express');
var pingRouter = express.Router();


pingRouter.get('/', function(req, res) {  
  var jsonData = { "status": "ok", "apiname": req.app.locals.serviceName, "apiversion": req.app.locals.version };
  res.status(200);
  res.type('json'); 
  res.send(jsonData);
  });
module.exports = pingRouter;
