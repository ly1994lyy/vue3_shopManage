module.exports = function(db,callback){
	// 用户模型
	db.define("GoodAttributeModel",{
		id : {type: 'serial', key: true},
		goods_id : Number,
		attr_id : Number,
		attr_value : String,
		add_price : Number
	},{
		table : "sp_goods_attr"
	});
	return callback();
}