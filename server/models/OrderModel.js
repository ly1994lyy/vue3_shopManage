module.exports = function(db,callback){
	// 用户模型
	db.define("OrderModel",{
		order_id : {type: 'serial', key: true},
		user_id : Number,
		order_number : String,
		order_price : Number,
		order_pay : [1,2,3],
		is_send : ["是","否"],
		trade_no : String,
		order_fapiao_title : ["个人","公司"],
		order_fapiao_company : String,
		order_fapiao_content : String,
		consignee_addr : String,
		pay_status : ['0','1'],
		create_time : Number,
		update_time : Number
	},{
		table : "sp_order"
	});
	return callback();
}