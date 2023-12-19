var express = require('express');
var router = express.Router();
var path = require("path");

// 获取验证模块
var authorization = require(path.join(process.cwd(),"/modules/authorization"));

// 通过验证模块获取分类管理
var orderServ = authorization.getService("OrderService");

// 订单列表
router.get("/",
	// 参数验证
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

		if(req.query.user_id) {
			conditions["user_id"] = req.query.user_id;
		}
		if(req.query.pay_status) {
			conditions["pay_status"] = req.query.pay_status;
		}
		if(req.query.is_send) {
			conditions["is_send"] = req.query.is_send;
		}
		if(req.query.order_fapiao_title) {
			conditions["order_fapiao_title"] = req.query.order_fapiao_title;
		}
		if(req.query.order_fapiao_company) {
			conditions["order_fapiao_company"] = req.query.order_fapiao_company;
		}
		if(req.query.order_fapiao_content) {
			conditions["order_fapiao_content"] = req.query.order_fapiao_content;
		}
		if(req.query.consignee_addr) {
			conditions["consignee_addr"] = req.query.consignee_addr;
		}

		orderServ.getAllOrders(
			conditions,
			function(err,result){
				if(err) return res.sendResult(null,400,err);
				res.sendResult(result,200,"获取成功");
			}
		)(req,res,next);
	}
);

// 添加订单
router.post("/",
	// 参数验证
	function(req,res,next) {
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		var params = req.body;
		orderServ.createOrder(params,function(err,newOrder){
			if(err) return res.sendResult(null,400,err);
			return res.sendResult(newOrder,201,"创建订单成功");
		})(req,res,next);
		
	}
);

// 更新订单发送状态
router.put("/:id",
	// 参数验证
	function(req,res,next) {
		next();
	},
	// 业务逻辑
	function(req,res,next) {
		var params = req.body;
		orderServ.updateOrder(req.params.id,params,function(err,newOrder){
			if(err) return res.sendResult(null,400,err);
			return res.sendResult(newOrder,201,"更新订单成功");
		})(req,res,next);
	}
);

router.get("/:id",function(req,res,next){
	orderServ.getOrder(req.params.id,function(err,result){
		if(err) return res.sendResult(null,400,err);
		return res.sendResult(result,200,"获取成功");
	})(req,res,next);
});



module.exports = router;
