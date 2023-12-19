var _ = require('lodash');
var path = require("path");
var orm = require("orm");
var dao = require(path.join(process.cwd(),"dao/DAO"));

var Promise = require("bluebird");
var uniqid = require('uniqid');

function doCheckOrderParams(params) {
	return new Promise(function(resolve,reject) {
		var info = {};
		if(params.order_id) info.order_id = params.order_id;

		if(!params.order_id) {
			if(!params.user_id) return reject("用户ID不能为空");
			if(isNaN(parseInt(params.user_id))) return reject("用户ID必须是数字");
			info.user_id = params.user_id;
		}
		

		if(!params.order_id) info.order_number = "itcast-" + uniqid();

		if(!params.order_price) return reject("订单价格不能为空");
		if(isNaN(parseFloat(params.order_price))) return reject("订单价格必须为数字");
		info.order_price = params.order_price;

		if(params.order_pay){
			info.order_pay = params.order_pay;
		} else {
			info.order_pay = '0';
		}
		if(params.is_send) {
			if(params.is_send == 1) {
				info.is_send = '是';
			} else {
				info.is_send = '否';
			}
		} else {
			info.is_send = '否';
		}

		if(params.trade_no) {
			info.trade_no = '否';
		} else {
			info.trade_no = '';
		}
		
		
		if(params.order_fapiao_title) {
			if(params.order_fapiao_title != '个人' && params.order_fapiao_title != '公司')
				return reject("发票抬头必须是 个人 或 公司");
			info.order_fapiao_title = params.order_fapiao_title;

		} else {
			info.order_fapiao_title = "个人";
		}

		if(params.order_fapiao_company) {
			info.order_fapiao_company = params.order_fapiao_company;
		} else {
			info.order_fapiao_company = "";
		}

		if(params.order_fapiao_content) {
			info.order_fapiao_content= params.order_fapiao_content;
		} else {
			info.order_fapiao_content= "";
		}

		if(params.consignee_addr) {
			info.consignee_addr = params.consignee_addr;
		} else {
			info.consignee_addr = "";
		}

		if(params.goods) {
			info.goods = params.goods;
		}

		info.pay_status = '0';
		if(params.order_id) info.create_time = (Date.parse(new Date())/1000);
		info.update_time = (Date.parse(new Date())/1000);

		resolve(info);
	});
}

function doCreateOrder(info) {
	return new Promise(function(resolve,reject) {
		dao.create("OrderModel",_.clone(info),function(err,newOrder){
			if(err) return reject("创建订单失败");
			info.order = newOrder;
			resolve(info);
		});
	});
}

function doCreateOrderGood(orderGood) {
	return new Promise(function(resolve,reject) {
		dao.create("OrderGoodModel",orderGood,function(err,newOrderGood){
			if(err) return reject("创建订单商品失败");
			resolve(newOrderGood);
		});
	});
} 

function doAddOrderGoods(info) {

	return new Promise(function(resolve,reject) {
		
		if(!info.order) return reject("订单对象未创建");

		var orderGoods = info.goods;

		if(orderGoods && orderGoods.length > 0) {
			var fns = [];
			var goods_total_price = _.sum(_.map(orderGoods,"goods_price"));

			_(orderGoods).forEach(function(orderGood){
				orderGood.order_id = info.order.order_id;
				orderGood.goods_total_price = goods_total_price;
				fns.push(doCreateOrderGood(orderGood));
			});
			Promise.all(fns)
			.then(function(results){
				info.order.goods = results;
				resolve(info);
			})
			.catch(function(error){
				if(error) return reject(error);
			});

		} else {
			resolve(info);
		}
	});
}

function doGetAllOrderGoods(info) {
	return new Promise(function(resolve,reject) {
		if(!info.order) return reject("订单对象未创建");
		
		dao.list("OrderGoodModel",{"columns":{"order_id":info.order.order_id}},function(err,orderGoods){
			
			
			if(err) return reject("获取订单商品列表失败");

			info.order.goods = orderGoods;
			resolve(info);
		})
	});
}

function doGetOrder(info) {
	return new Promise(function(resolve,reject) {
		dao.show("OrderModel",info.order_id,function(err,newOrder){

			if(err) return reject("获取订单详情失败");
			if(!newOrder) return reject("订单ID不能存在");
			info.order = newOrder;
			resolve(info);
		})
	});
}

function doUpdateOrder(info) {
	return new Promise(function(resolve,reject) {
		dao.update("OrderModel",info.order_id,_.clone(info),function(err,newOrder){
			if(err) return reject("更新失败");
			info.order = newOrder;
			resolve(info);
		});
		
	});
} 


module.exports.createOrder = function(params,cb) {
	doCheckOrderParams(params)
	.then(doCreateOrder)
	.then(doAddOrderGoods)
	.then(function(info) {
		cb(null,info.order);
	})
	.catch(function(err) {
		cb(err);
	});
}


module.exports.getAllOrders = function(params,cb){
	var conditions = {};
	if(!params.pagenum || params.pagenum <= 0) return cb("pagenum 参数错误");
	if(!params.pagesize || params.pagesize <= 0) return cb("pagesize 参数错误"); 
	conditions["columns"] = {};
	if(params.user_id) {
		conditions["columns"]["user_id"] = params.user_id;
	}

	if(params.pay_status) {
		conditions["columns"]["pay_status"] = params.pay_status;
	}

	if(params.is_send) {
		if(params.is_send == 1) {
			conditions["columns"]["is_send"] = '是';
		} else {
			conditions["columns"]["is_send"] = '否';
		}
	}

	if(params.order_fapiao_title) {
		if(params.order_fapiao_title == 1) {
			conditions["columns"]["order_fapiao_title"] = '个人';
		} else {
			conditions["columns"]["order_fapiao_title"] = '公司';
		}
	}

	if(params.order_fapiao_company) {
		conditions["columns"]["order_fapiao_company"] = orm.like("%" + params.order_fapiao_company + "%");
	}

	if(params.order_fapiao_content) {
		conditions["columns"]["order_fapiao_content"] = orm.like("%" + params.order_fapiao_content + "%");
	}

	if(params.consignee_addr) {
		conditions["columns"]["consignee_addr"] = orm.like("%" + params.consignee_addr + "%");
	}

	dao.countByConditions("OrderModel",conditions,function(err,count){
		if(err) return cb(err);
		pagesize = params.pagesize;
		pagenum = params.pagenum;
		pageCount = Math.ceil(count / pagesize);
		offset = (pagenum - 1) * pagesize;
		if(offset >= count) {
			offset = count;
		}
		limit = pagesize;

		// 构建条件
		conditions["offset"] = offset;
		conditions["limit"] = limit;
		// conditions["only"] = 
		conditions["order"] = "-create_time";


		dao.list("OrderModel",conditions,function(err,orders){
			if(err) return cb(err);
			var resultDta = {};
			resultDta["total"] = count;
			resultDta["pagenum"] = pagenum;
			resultDta["goods"] = _.map(orders,function(order){
				return order;//_.omit(order,);
			});
			cb(err,resultDta);
		})
	});
}

module.exports.getOrder = function(orderId,cb) {
	if(!orderId) return cb("用户ID不能为空");
	if(isNaN(parseInt(orderId))) return cb("用户ID必须是数字");
	
	doGetOrder({"order_id":orderId})
	.then(doGetAllOrderGoods)
	.then(function(info){
		cb(null,info.order);
	})
	.catch(function(err) {
		cb(err);
	});

}

module.exports.updateOrder = function(orderId,params,cb) {
	if(!orderId) return cb("用户ID不能为空");
	if(isNaN(parseInt(orderId))) return cb("用户ID必须是数字");
	params["order_id"] = orderId;
	doCheckOrderParams(params)
	.then(doUpdateOrder)
	.then(doGetAllOrderGoods)
	.then(function(info){
		cb(null,info.order);
	})
	.catch(function(err) {
		cb(err);
	});
	
}