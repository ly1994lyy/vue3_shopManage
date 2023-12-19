var express = require('express');
var router = express.Router();
var path = require("path");


// 获取验证模块
var authorization = require(path.join(process.cwd(),"/modules/authorization"));

// 通过验证模块获取用户管理服务
var reportsServ = authorization.getService("ReportsService");

router.get("/type/:typeid",
	// 参数验证
	function(req,res,next){
		if(!req.params.typeid) {
			return res.sendResult(null,400,"报表类型不能为空");
		}
		if(isNaN(parseInt(req.params.typeid))) return res.sendResult(null,400,"报表类型必须是数字");
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		reportsServ.reports(req.params.typeid,function(err,result){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(result,200,"获取报表成功");
		})(req,res,next);
	}
);

module.exports = router;