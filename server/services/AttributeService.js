var _ = require('lodash');
var path = require("path");
var dao = require(path.join(process.cwd(),"dao/DAO"));
var attributeDao = require(path.join(process.cwd(),"dao/AttributeDAO"));

/**
 * 获取属性列表
 * 
 * @param  {[type]}   cat_id 分类ID
 * @param  {[type]}   sel    类型 // only:输入框(唯一)  many:后台下拉列表/前台单选框
 * @param  {Function} cb     回调函数
 */
module.exports.getAttributes = function(cat_id,sel,cb) {
	attributeDao.list(cat_id,sel,function(err,attributes) {
		if(err) return cb("获取失败");
		cb(null,attributes);
	});
}

/**
 * 创建参数
 * 
 * @param  {[type]}   info 参数信息
 * @param  {Function} cb   回调函数
 */
module.exports.createAttribute = function(info,cb) {
	dao.create("AttributeModel",info,function(err,attribute) {
		if(err) return cb("创建失败");
		cb(null,attribute);
	});
}

/**
 * 更新参数
 * 
 * @param  {[type]}   catId  分类ID
 * @param  {[type]}   attrId 属性ID
 * @param  {[type]}   info   更新内容
 * @param  {Function} cb     回调函数
 */
module.exports.updateAttribute = function(attrId,info,cb) {
	dao.update("AttributeModel",attrId,info,function(err,newAttr) {
		if(err) return cb(err);
		cb(null,_.omit(newAttr,"delete_time"));
	});
}

/**
 * 删除参数
 * 
 * @param  {[type]}   attrId 参数ID
 * @param  {Function} cb     回调函数
 */
module.exports.deleteAttribute = function(attrId,cb) {
	dao.update("AttributeModel",attrId,{"delete_time":parseInt((Date.now()/1000))},function(err,newAttr){
		console.log(newAttr);
		if(err) return cb("删除失败");
		cb(null,newAttr);
	});
}

module.exports.attributeById = function(attrId,cb) {
	dao.show("AttributeModel",attrId,function(err,attr) {
		if(err) return cb(err);
		cb(null,_.omit(attr,"delete_time"));
	});
}
