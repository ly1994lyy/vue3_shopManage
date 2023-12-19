module.exports = function(db,callback){
	// 用户模型
	db.define("GoodPicModel",{
		pics_id : {type: 'serial', key: true},
		goods_id : Number,
		pics_big : String,
		pics_mid : String,
		pics_sma : String
	},{
		table : "sp_goods_pics"
	});
	return callback();
}