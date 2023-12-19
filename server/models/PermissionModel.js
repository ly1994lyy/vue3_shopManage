module.exports = function(db,callback){
	// 用户模型
	db.define("PermissionModel",{
		ps_id : {type: 'serial', key: true},
		ps_name : String,
		ps_pid : Number,
		ps_c : String,
		ps_a : String,
		ps_level : String
	},{
		table : "sp_permission"
	});
	return callback();
}