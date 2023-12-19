module.exports = function(db,callback){
	// 用户模型
	db.define("ManagerModel",{
		mg_id : {type: 'serial', key: true},
		mg_name : String,
		mg_pwd : String,
		mg_time : Number,
		role_id : Number,
		mg_mobile : String,
		mg_email : String,
		mg_state : Number
	},{
		table : "sp_manager"
	});
	return callback();
}