var path = require("path");
// set development environment
process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require(path.join(process.cwd(),"app"));
chai.use(chaiHttp);

var common = require("../common/common.js");

var config = require(path.join(process.cwd(),"test/configs/config"));
var url = config.baseURL + "login";

describe(url+" login api testing",function(){
	it("test to login",function(done){
		common.login(config.username,config.password,function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			done();
		});
	});
	it("test to login => username is null",function(done){
		common.login(null,config.password,function(err,res){
			chai.assert.equal(res.body.meta.status,400,res.body.meta.msg);
			done();
		});
	});
	it("test to login => password is null",function(done){
		common.login(config.username,null,function(err,res){
			chai.assert.equal(res.body.meta.status,400,res.body.meta.msg);
			done();
		});
	});
});