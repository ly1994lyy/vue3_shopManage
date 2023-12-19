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

var url = config.baseURL + "roles";

describe(url + " role api testing",function() {
	// manager's token
	var token;

	// new role data
	var testRole = {
		roleName:"__test_role_name",
		roleDesc:"__test_role_desc"
	};

	var roleId = -1;

	before(function(done) {
		// The api access must be logged in
		common.login(config.username,config.password,function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			token = res.body.data.token;
			done();
		});
	});

	after(function(done) {
		done();
	});

	it("test to add a new role",function(done){
		chai
		.request(app)
		.post(url)
		.set({"Authorization": token})
		.send(testRole)
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,201,res.body.meta.msg);
			chai.assert.isNotNull(res.body.data,"The result is empty");
			if(res.body.data) {
				roleId = res.body.data.roleId;
			}
			done();
		});
	});
	
	it("test to get role's destail",function(done){
		var getURL = url + "/" + roleId;
		chai
		.request(app)
		.get(getURL)
		.set({"Authorization": token})
		.end(function(err,res) {
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			chai.assert.isNotNull(res.body.data,"The result is empty");
			done();
		});
	});

	it("test to get role's list",function(done){
		chai
		.request(app)
		.get(url)
		.set({"Authorization": token})
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			chai.assert.isOk(res.body.data.length > 0,"获取角色列表失败");
			done();
		});
	});

	it("test to update role's info",function(done){
		var newRoleName = "__test_new_role_name";
		var newRoleDesc = "__test_new_role_desc";
		var updateURL = url + "/" + roleId;
		chai
		.request(app)
		.put(updateURL)
		.set({"Authorization": token})
		.send({
			"roleName" : newRoleName,
			"roleDesc" : newRoleDesc
		})
		.end(function(err,res){
			chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
			chai.assert.equal(res.body.data.roleName,newRoleName,"The role's name is not updated");
			chai.assert.equal(res.body.data.roleDesc,newRoleDesc,"The role's desc is not updated");
			done();
		});
	});

	// /:id/rights
	it("test to authorize for role",function(done) {
		// done();
	});

	// /:id/rights/:rightId
	it("test to revoke authorization for role",function(done){
		// done();
	});

	it("test to delete role",function(done) {
		chai.assert.isOk(roleId > 0,"delete failure");
		if(roleId > 0) {
			var delURL = url + "/" + roleId;
			chai
			.request(app)
			.del(delURL)
			.set({"Authorization": token})
			.end(function(err,res){
				chai.assert.equal(res.body.meta.status,200,res.body.meta.msg);
				done();
			});
		}
	});
});