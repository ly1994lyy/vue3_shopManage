var express = require('express');
var router = express.Router();
var path = require("path");

// 获取验证模块
var authorization = require(path.join(process.cwd(),"/modules/authorization"));

// 角色管理模块
var roleServ = authorization.getService("RoleService");

// 获取角色列表
router.get("/",
	// 参数验证
	function(req,res,next){
		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		roleServ.getAllRoles(function(err,result) {
			if(err) return res.sendResult(null,400,err);
			res.sendResult(result,200,"获取成功");
		})(req,res,next);
	}
);

// 创建角色
router.post("/",
	// 参数验证
	function(req,res,next) {
		if(!req.body.roleName) return res.sendResult(null,400,"角色名称不能为空");
		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		roleServ.createRole({
			"roleName":req.body.roleName,
			"roleDesc":req.body.roleDesc
		},function(err,role){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(role,201,"创建成功");
		})(req,res,next);
	}
);

// 获取角色详情
router.get("/:id",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) return res.sendResult(null,400,"角色ID不能为空");
		if(isNaN(parseInt(req.params.id))) res.sendResult(null,400,"角色ID必须为数字");
		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		roleServ.getRoleById(
			req.params.id,
			function(err,result){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(result,200,"获取成功");
		})(req,res,next);
	}
);

// 更新角色信息
router.put("/:id",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) return res.sendResult(null,400,"角色ID不能为空");
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"角色ID必须为数字");
		if(!req.body.roleName) return res.sendResult(null,400,"角色名称不能为空");
		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		roleServ.updateRole(
			{
				"id":req.params.id,
				"roleName":req.body.roleName,
				"roleDesc":req.body.roleDesc
			},
			function(err,result){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(result,200,"获取成功");
		})(req,res,next);
	}
);

// 删除角色
router.delete("/:id",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) return res.sendResult(null,400,"角色ID不能为空");
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"角色ID必须为数字");
		next();
	},
	// 处理业务逻辑
	function(req,res,next) {
		roleServ.deleteRole(
			req.params.id,
			function(err,success){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(null,200,"删除成功");
		})(req,res,next);
	}
);

// 为角色授权
router.post("/:id/rights",
	// 参数校验
	function(req,res,next) {
		if(!req.params.id) return res.sendResult(null,400,"角色ID不能为空");
		if(isNaN(parseInt(req.params.id))) res.sendResult(null,400,"角色ID必须为数字");
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		roleServ.updateRoleRight(req.params.id,req.body.rids,function(err,newRole){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(null,200,"更新成功");
		})(req,res,next);
	}
);

// 删除角色权限
router.delete("/:id/rights/:rightId",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) return res.sendResult(null,400,"角色ID不能为空");
		if(isNaN(parseInt(req.params.id))) res.sendResult(null,400,"角色ID必须为数字");
		if(isNaN(parseInt(req.params.rightId))) res.sendResult(null,400,"权限ID必须为数字");
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		roleServ.deleteRoleRight(req.params.id,req.params.rightId,function(err,result){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(result,200,"取消权限成功");
		})(req,res,next);
	}
);

module.exports = router;