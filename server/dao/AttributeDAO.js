var path = require("path");
daoModule = require("./DAO");
databaseModule = require(path.join(process.cwd(),"modules/database"));

/**
 * 获取参数列表数据
 * 
 * @param  {[type]}   cat_id 分类ID
 * @param  {[type]}   sel    类型
 * @param  {Function} cb     回调函数
 */
module.exports.list = function(cat_id,sel,cb) {
	db = databaseModule.getDatabase();
	sql = "SELECT * FROM sp_attribute WHERE cat_id = ? AND attr_sel = ? AND delete_time is NULL";
	database.driver.execQuery(
			sql
		,[cat_id,sel],function(err,attributes){
			if(err) return cb("查询执行出错");
			cb(null,attributes);
		});
}