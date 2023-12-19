var _ = require('lodash');
var path = require("path");
// 设置测试环境
process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require(path.join(process.cwd(),"app"));
chai.use(chaiHttp);

var common = require("../common/common.js");
var config = require(path.join(process.cwd(),"test/configs/config"));
var loginURL = config.baseURL + "login";

var url = config.baseURL + "users";

describe(url+" the manager API testing",function() {
	// manager's token
	var token;

	// The new manager's id 
	var mgrId = -1;

	// test data
	var testManager = {
		"username": "__test_manager",
		"password":"__test_pwd",
		"mobile":"123456",
		"email":"123@123.123"
	}

	before(function(done) {
		common.login(config.username,config.password,function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			token = res.body.data.token;
			done();
		});
	});
	
	after(function(done) {
		// clear test data
		if(mgrId > 0) {
			var deleteURL = url + "/" + mgrId;
			chai
			.request(app)
			.del(deleteURL)
			.set({"Authorization": token})
			.end(function(err,res){
				chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
				done();
			});
		} else {
			done();
		}
	});
	
	it("test to create manager => The username is empty",function(done) {
		chai
		.request(app)
		.post(url)
		.set({"Authorization": token})
		.send(_.omit(testManager,"username"))
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,400,res.body.meta.msg);
			done();
		});
	});

	it("test to create manager => The password is empty",function(done) {
		chai
		.request(app)
		.post(url)
		.set({"Authorization": token})
		.send(_.omit(testManager,"password"))
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,400,res.body.meta.msg);
			done();
		});
	});
	
	it("test to create manager",function(done) {
		chai
		.request(app)
		.post(url)
		.set({"Authorization": token})
		.send(testManager)
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,201,res.body.meta.msg);
			mgrId = res.body.data.id;
			done();
		});
	});

	it("test to create manager => The manager had be created",function(done) {
		chai
		.request(app)
		.post(url)
		.set({"Authorization": token})
		.send(testManager)
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,400,res.body.meta.msg);
			done();
		});
	});

	it("test to in front of the Set role to login",function(done) {
		common.login(testManager.username,testManager.password,function(err,res){
			chai.assert.equal(res.body.meta.status,400,res.body.meta.msg);
			done();
		});
	});

	it("test to role set to manager",function(done) {
		var setRoleURL = url + "/" + mgrId + "/role";
		var rid = 0;
		chai
		.request(app)
		.put(setRoleURL)
		.set({"Authorization": token})
		.type("form")
		.send({"rid":rid})
		.end(function(err,res){
			chai.assert.isOk(parseInt(res.body.data.rid)==rid,"update role's failure");
			chai.assert.strictEqual(res.body.meta.status,200,res.body.meta.msg);
			done();
		});
	});

	it("test to the manager login after ",function(done) {
		common.login(testManager.username,testManager.password,function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			done();
		});
	});

	it("test to get all managers",function(done){
		chai
		.request(app)
		.get(url)
		.query({"pagenum":1,"pagesize":1,"query":testManager.username})
		.set({"Authorization": token})
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			chai.assert.isOk(res.body.data.users.length > 0,"The data is empty");
			done();
		});
	});

	
	it("test to Get Manager's Info",function(done){
		var getURL = url + "/" + mgrId;
		var newMobile = "123123";
		var newEmail = "123@321.123";
		chai
		.request(app)
		.get(getURL)
		.set({"Authorization": token})
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			done();
		});
	});

	it("test to Update Manager's Info",function(done) {
		var updateURL = url + "/" + mgrId;
		var newMobile = "123123";
		var newEmail = "123@321.123";
		chai
		.request(app)
		.put(updateURL)
		.set({"Authorization": token})
		.send({"mobile":newMobile,"email":newEmail})
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			chai.assert.equal(res.body.data.mobile,newMobile,"mobile be not updated");
			chai.assert.equal(res.body.data.email,newEmail,"email be not updated");
			done();
		});
	});
	
	
	it("test to Delete Manager",function(done){
		var deleteURL = url + "/" + mgrId;
		chai
		.request(app)
		.del(deleteURL)
		.set({"Authorization": token})
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			done();
		});
	})

	it("test to login after the manager did be deleted",function(done) {
		common.login(testManager.username,testManager.password,function(err,res){
			chai.assert.equal(res.body.meta.status,400,res.body.meta.msg);
			done();
		});
	});
	
});