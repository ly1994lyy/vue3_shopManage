var express = require('express');
var router = express.Router();
var path = require("path");

// 获取验证模块
var authorization = require(path.join(process.cwd(),"/modules/authorization"));

// 通过验证模块获取用户管理服务
var mgrServ = authorization.getService("ManagerService");


// 查询用户列表
router.get("/",
	// 验证参数
	function(req,res,next) {
		// 参数验证
		if(!req.query.pagenum || req.query.pagenum <= 0) return res.sendResult(null,400,"pagenum 参数错误");
		if(!req.query.pagesize || req.query.pagesize <= 0) return res.sendResult(null,400,"pagesize 参数错误"); 
		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		mgrServ.getAllManagers(
			{
				"query":req.query.query,
				"pagenum":req.query.pagenum,
				"pagesize":req.query.pagesize
			},
			function(err,result){
				if(err) return res.sendResult(null,400,err);
				res.sendResult(result,200,"获取管理员列表成功");
			}
		)(req,res,next);
		
	}
);

// 获取用户信息
router.get("/:id",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"用户ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"用户ID必须是数字");
		next();
	},
	function(req,res,next) {
		mgrServ.getManager(req.params.id,function(err,manager){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(manager,200,"获取成功");
		})(req,res,next);
	}
);

// 创建用户
router.post("/",
	// 验证参数
	function(req,res,next) {
		if(!req.body.username){
			return res.sendResult(null,400,"用户名不能为空");
		}
		if(!req.body.password) {
			return res.sendResult(null,400,"密码不能为空");
		}
		if(!req.body.rid) {
			req.body.rid = -1;
			//return res.sendResult(null,200,"角色ID不能为空");
		}
		if(isNaN(parseInt(req.body.rid))) req.body.rid = -1;//return res.sendResult(null,200,"角色ID必须是数字");
		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		params = {
			"username":req.body.username,
			"password":req.body.password,
			"mobile":req.body.mobile,
			"email":req.body.email,
			"rid":req.body.rid
		}
		mgrServ.createManager(params,function(err,manager){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(manager,201,"创建成功");
		})(req,res,next);
	}
);


// 修改用户信息
router.put("/:id",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"用户ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"用户ID必须是数字");
		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		mgrServ.updateManager(
			{
				"id":req.params.id,
				"mobile":req.body.mobile,
				"email":req.body.email
			},
			function(err,manager) {
				if(err) return res.sendResult(null,400,err);
				res.sendResult(manager,200,"更新成功");
			}
		)(req,res,next);
	}
);

// 删除用户信息
router.delete("/:id",
	// 验证参数
	function(req,res,next){
		if(!req.params.id) return res.sendResult(null,400,"用户ID不能为空");
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"ID必须是数字");
		if(req.params.id == 500) return res.sendResult(null,400,"不允许删除admin账户");
		next();
	},
	// 处理业务逻辑
	function(req,res,next){
		mgrServ.deleteManager(req.params.id,function(err){
			if(err) return res.sendResult(null,400,err);
			return res.sendResult(null,200,"删除成功");
		})(req,res,next);
	}
);

// 分配用户角色
router.put("/:id/role",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"用户ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"用户ID必须是数字");

		if(req.params.id == 500) return res.sendResult(null,400,"不允许修改admin账户");

		if(!req.body.rid) res.sendResult(null,400,"权限ID不能为空"); 
		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		mgrServ.setRole(req.params.id,req.body.rid,function(err,manager){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(manager,200,"设置角色成功");
		})(req,res,next);
	}
);


router.put("/:id/state/:state",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"用户ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"用户ID必须是数字");

		// // // if(!req.params.state) {
		// // // 	return res.sendResult(null,400,"状态不能为空");
		// // // }
		// // if(isNaN(parseInt(req.params.state))) return res.sendResult(null,400,"状态必须是数字");
		// if(parseInt(req.params.state) != 0 && parseInt(req.params.state) != 1) return res.sendResult(null,400,"管理状态只能为0或1");

		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		state = 0
		if(req.params.state && req.params.state == "true") state = 1
		mgrServ.updateMgrState(req.params.id,state,function(err,manager){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(manager,200,"设置状态成功");
		})(req,res,next);
	}
	)

module.exports = router;