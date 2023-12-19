var path = require("path");
var managersDAO = require(path.join(process.cwd(),"dao/ManagerDAO"));
var Password = require("node-php-password");
var logger = require('../modules/logger').logger();


/**
 * 获取所有管理员
 * @param  {[type]}   conditions 查询条件
 * 查询条件统一规范
 * conditions
	{
		"query" : 关键词查询,
		"pagenum" : 页数,
		"pagesize" : 每页长度
	}
 * @param  {Function} cb         回调函数
 */
module.exports.getAllManagers = function(conditions,cb) {

	
	if(!conditions.pagenum) return cb("pagenum 参数不合法");
	if(!conditions.pagesize) return cb("pagesize 参数不合法");


	// 通过关键词获取管理员数量
	managersDAO.countByKey(conditions["query"],function(err,count) {
		key = conditions["query"];
		pagenum = parseInt(conditions["pagenum"]);
		pagesize = parseInt(conditions["pagesize"]);

		pageCount = Math.ceil(count / pagesize);
		offset = (pagenum - 1) * pagesize;
		if(offset >= count) {
			offset = count;
		}
		limit = pagesize;

		managersDAO.findByKey(key,offset,limit,function(err,managers){
			var retManagers = [];
			for(idx in managers) {
				var manager = managers[idx];
				var role_name = manager.role_name;
				if(!manager.role_id) {
					role_name = "超级管理员"
				}
				retManagers.push({
					"id": manager.mg_id,
					"role_name":role_name,
					"username":manager.mg_name,
					"create_time":manager.mg_time,
					"mobile":manager.mg_mobile,
					"email":manager.mg_email,
					"mg_state":manager.mg_state == 1
				});
			}
			var resultDta = {};
			resultDta["total"] = count;
			resultDta["pagenum"] = pagenum;
			resultDta["users"] = retManagers;
			cb(err,resultDta);
		});
	});
}

/**
 * 创建管理员
 * 
 * @param  {[type]}   user 用户数据集
 * @param  {Function} cb   回调函数
 */
module.exports.createManager = function(params,cb) {

	managersDAO.exists(params.username,function(err,isExists){
		if(err) return cb(err);

		if(isExists) {
			return cb("用户名已存在");
		}

		managersDAO.create({
			"mg_name":params.username,
			"mg_pwd":Password.hash(params.password),
			"mg_mobile":params.mobile,
			"mg_email":params.email,
			"mg_time":(Date.parse(new Date())/1000),
			"role_id":params.rid
		},function(err,manager){
			if(err) return cb("创建失败");
			result = {
				"id" : manager.mg_id,
				"username" : manager.mg_name,
				"mobile" : manager.mg_mobile,
				"email" : manager.mg_email,
				"role_id" : manager.role_id,
				"create_time":manager.mg_time
			};
			cb(null,result);
		});
	});
}

/**
 * 更新管理员信息
 * 
 * @param  {[type]}   params 管理员信息
 * @param  {Function} cb     回调函数
 */
module.exports.updateManager = function(params,cb) {
	managersDAO.update(
		{
			"mg_id":params.id,
			"mg_mobile":params.mobile,
			"mg_email":params.email
		},
		function(err,manager) {
			if(err) return cb(err);
			cb(null,{
					"id":manager.mg_id,
					"username":manager.mg_name,
					"role_id":manager.role_id,
					"mobile":manager.mg_mobile,
					"email":manager.mg_email
				});
		}
	)
}

/**
 * 通过管理员 ID 获取管理员信息
 * 
 * @param  {[type]}   id 管理员 ID
 * @param  {Function} cb 回调函数
 */
module.exports.getManager = function(id,cb) {
	managersDAO.show(id,function(err,manager){
		if(err) return cb(err);
		if(!manager) return cb("该管理员不存在");
		cb(
			null,
			{
				"id":manager.mg_id,
				"rid":manager.role_id,
				"username":manager.mg_name,
				"mobile":manager.mg_mobile,
				"email":manager.mg_email
			}
		);
	});
}

/**
 * 通过管理员 ID 进行删除操作
 * 
 * @param  {[type]}   id 管理员ID
 * @param  {Function} cb 回调函数
 */
module.exports.deleteManager = function(id,cb) {
	managersDAO.destroy(id,function(err){
		if(err) return cb("删除失败");
		cb(null);
	});
}

/**
 * 为管理员设置角色
 * 
 * @param {[type]}   id  管理员ID
 * @param {[type]}   rid 角色ID
 * @param {Function} cb  回调函数
 */
module.exports.setRole = function(id,rid,cb) {
	managersDAO.show(id,function(err,manager){
		if(err || !manager) cb("管理员ID不存在");
		
		managersDAO.update({"mg_id":manager.mg_id,"role_id":rid},function(err,manager){
			if(err) return cb("设置失败");
			cb(null,{
				"id":manager.mg_id,
				"rid":manager.role_id,
				"username":manager.mg_name,
				"mobile":manager.mg_mobile,
				"email":manager.mg_email,
			});
		});

	})
}

module.exports.updateMgrState = function(id,state,cb) {
	managersDAO.show(id,function(err,manager){
		if(err || !manager) cb("管理员ID不存在");
		
		managersDAO.update({"mg_id":manager.mg_id,"mg_state":state},function(err,manager){
			if(err) return cb("设置失败");
			cb(null,{
				"id":manager.mg_id,
				"rid":manager.role_id,
				"username":manager.mg_name,
				"mobile":manager.mg_mobile,
				"email":manager.mg_email,
				"mg_state":manager.mg_state ? 1 : 0
			});
		});

	})
}

/**
 * 管理员登录
 * @param  {[type]}   username 用户名
 * @param  {[type]}   password 密码
 * @param  {Function} cb       回调
 */
module.exports.login = function(username,password,cb) {
	logger.debug('login => username:%s,password:%s',username,password);
	logger.debug(username);
	managersDAO.findOne({"mg_name":username},function(err,manager) {
		logger.debug(err);	
		if(err || !manager) return cb("用户名不存在");
		if(manager.role_id < 0) {
			return cb("该用户没有权限登录");
		}

		if(manager.role_id != 0 && manager.mg_state != 1) {
			return cb("该用户已经被禁用");
		}

		if(Password.verify(password, manager.mg_pwd)){
			cb(
				null,
				{
					"id":manager.mg_id,
					"rid":manager.role_id,
					"username":manager.mg_name,
					"mobile":manager.mg_mobile,
					"email":manager.mg_email,
				}
			);
		} else {
			return cb("密码错误");
		}
	});
}