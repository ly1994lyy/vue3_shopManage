var path = require("path");
// set development environment
process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require(path.join(process.cwd(),"app"));
chai.use(chaiHttp);

var config = require(path.join(process.cwd(),"test/configs/config"));
var loginURL = config.baseURL + "login";

module.exports.login = function(username,password,cb) {
	// admin login	
	chai
	.request(app)
	.post(loginURL)
	.send({"username":username,"password":password})
	.end(cb);
}

