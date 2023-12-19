var express = require('express');
var router = express.Router();
var path = require("path");

// 获取验证模块
var authorization = require(path.join(process.cwd(),"/modules/authorization"));

// 通过验证模块获取分类管理
var goodServ = authorization.getService("GoodService");

// 商品列表
router.get("/",
	// 验证参数
	function(req,res,next) {
		// 参数验证
		if(!req.query.pagenum || req.query.pagenum <= 0) return res.sendResult(null,400,"pagenum 参数错误");
		if(!req.query.pagesize || req.query.pagesize <= 0) return res.sendResult(null,400,"pagesize 参数错误"); 
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		var conditions = {
			"pagenum" : req.query.pagenum,
			"pagesize" : req.query.pagesize
		};

		if(req.query.query) {
			conditions["query"] = req.query.query;
		}
		goodServ.getAllGoods(
			conditions,
			function(err,result){
				if(err) return res.sendResult(null,400,err);
				res.sendResult(result,200,"获取成功");
			}
		)(req,res,next);
	}
);

// 添加商品
router.post("/",
	// 参数验证
	function(req,res,next) {
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		var params = req.body;
		goodServ.createGood(params,function(err,newGood){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(newGood,201,"创建商品成功");
		})(req,res,next);
	}
);

// 更新商品
router.put("/:id",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"商品ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"商品ID必须是数字");
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		var params = req.body;
		goodServ.updateGood(req.params.id,params,function(err,newGood){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(newGood,200,"创建商品成功");
		})(req,res,next);
	}
);

// 获取商品详情
router.get("/:id",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"商品ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"商品ID必须是数字");
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		goodServ.getGoodById(req.params.id,function(err,good){
			if(err) return res.sendResult(null,400,err);
			return res.sendResult(good,200,"获取成功");
		})(req,res,next);
	}
);



// 删除商品
router.delete("/:id",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"商品ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"商品ID必须是数字");
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		goodServ.deleteGood(req.params.id,function(err){
			if(err)
				return res.sendResult(null,400,"删除失败");
			else
				return res.sendResult(null,200,"删除成功");
		})(req,res,next);
	}
);

// 更新商品的图片
router.put("/:id/pics",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"商品ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"商品ID必须是数字");
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		
		goodServ.updateGoodPics(
			req.params.id,
			req.body,
			function(err,good){
				if(err) return res.sendResult(null,400,err);
				res.sendResult(good,200,"更新成功");
			}
		)(req,res,next);
	}
);

// 更新商品的属性
router.put("/:id/attributes",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"商品ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"商品ID必须是数字");
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		
		goodServ.updateGoodAttributes (
			req.params.id,
			req.body,
			function(err,good){
				if(err) return res.sendResult(null,400,err);
				res.sendResult(good,200,"更新成功");
			}
		)(req,res,next);
	}
);

// 更新商品状态
router.put("/:id/state/:state",
	// 参数验证
	function(req,res,next) {
		if(!req.params.id) {
			return res.sendResult(null,400,"商品ID不能为空");
		}
		if(isNaN(parseInt(req.params.id))) return res.sendResult(null,400,"商品ID必须是数字");
		if(!req.params.state) {
			return res.sendResult(null,400,"状态值不能为空");
		}
		if(req.params.state != 0 && req.params.state != 1 && req.params.state != 2) {
			return res.sendResult(null,400,"状态值只能为 0 ，1 或 2");
		}
		next();
	},
	function(req,res,next) {
		goodServ.updateGoodsState(req.params.id,req.params.state,function(err,good){
			if(err) return res.sendResult(null,400,err);
			res.sendResult(good,200,"更新成功");
		})(req,res,next);
}
);

module.exports = router;
