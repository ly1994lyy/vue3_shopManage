var express = require('express');
var router = express.Router();
var path = require("path");

// 获取验证模块
var authorization = require(path.join(process.cwd(),"/modules/authorization"));

// 通过验证模块获取菜单服务模块
var menuService = require(path.join(process.cwd(),"/services/MenuService"));

router.get("/",
	function(req,res,next) {
		menuService.getLeftMenus(req.userInfo,function(err,result) {
			if(err) return res.sendResult(null,400,err);
			res.sendResult(result,200,"获取菜单列表成功");
		});
	}
);

module.exports = router;