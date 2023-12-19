var path = require("path");

// 获取数据库模型
databaseModule = require(path.join(process.cwd(),"modules/database")); 
var logger = require('../modules/logger').logger();

/**
 * 创建对象数据
 * 
 * @param  {[type]}   modelName 模型名称
 * @param  {[type]}   obj       模型对象
 * @param  {Function} cb        回调函数
 */
module.exports.create = function(modelName,obj,cb) {
	var db = databaseModule.getDatabase();
	var Model = db.models[modelName];
	Model.create(obj,cb);
}

/**
 * 获取所有数据
 * 
 * @param  {[type]}   conditions 查询条件
 * 查询条件统一规范
 * conditions
	{
		"columns" : {
			字段条件
			"字段名" : "条件值"
		},
		"offset" : "偏移",
		"omit" : ["字段"],
		"only" : ["需要字段"],
		"limit" : "",
		"order" :[ 
			"字段" , A | Z,
			...
		]
	}
 * @param  {Function} cb         回调函数
 */
module.exports.list = function(modelName,conditions,cb) {
	var db = databaseModule.getDatabase();

	var model = db.models[modelName];

	if(!model) return cb("模型不存在",null);



	if(conditions) {
		if(conditions["columns"]) {
			model = model.find(conditions["columns"]);
		} else {
			model = model.find();
		}

		if(conditions["offset"]) {
			model = model.offset(parseInt(conditions["offset"]));
		}

		if(conditions["limit"]) {
			model = model.limit(parseInt(conditions["limit"]));
		}

		if(conditions["only"]) {
			model = model.only(conditions["only"]);
		}

		if(conditions["omit"]) {
			model = model.omit(conditions["omit"]);
		}

		if(conditions["order"]) {
			model = model.order(conditions["order"]);
		}

	} else {
		model = model.find();
	}

	model.run(function(err,models) {
		
		if(err) {
			console.log(err);
			return cb("查询失败",null);
		}
		cb(null,models);
	});
};

module.exports.countByConditions = function(modelName,conditions,cb) {
	var db = databaseModule.getDatabase();

	var model = db.models[modelName];

	if(!model) return cb("模型不存在",null);

	var resultCB = function(err,count){
		if(err) {
			return cb("查询失败",null);
		}
		cb(null,count);
	}

	if(conditions) {
		if(conditions["columns"]) {
			model = model.count(conditions["columns"],resultCB);
		} else {
			model = model.count(resultCB);
		}

	} else {
		model = model.count(resultCB);
	}

};

/**
 * 获取一条数据
 * @param  {[type]}   modelName  模型名称
 * @param  {[数组]}   conditions  条件集合
 * @param  {Function} cb         回调函数
 */
module.exports.findOne = function(modelName,conditions,cb) {
	var db = databaseModule.getDatabase();

	var Model = db.models[modelName];

	if(!Model) return cb("模型不存在",null);

	if(!conditions) return  cb("条件为空",null);

	Model.one(conditions,function(err,obj){
		logger.debug(err);
		if(err) {
			return cb("查询失败",null);
		}
		return cb(null,obj);
	});
}

/**
 * 更新对象数据
 * 
 * @param  {[type]}   modelName 模型名称
 * @param  {[type]}   id        数据关键ID
 * @param  {[type]}   updateObj 更新对象数据
 * @param  {Function} cb        回调函数
 */
module.exports.update = function(modelName,id,updateObj,cb) {
	var db = databaseModule.getDatabase();
	var Model = db.models[modelName];
	Model.get(id,function(err,obj){
		if(err) return cb("更新失败",null);
		obj.save(updateObj,cb);
	});
}

/**
 * 通过主键ID获取对象
 * @param  {[type]}   modelName 模型名称
 * @param  {[type]}   id        主键ID
 * @param  {Function} cb        回调函数
 */
module.exports.show = function(modelName,id,cb) {
	var db = databaseModule.getDatabase();
	var Model = db.models[modelName];
	Model.get(id,function(err,obj){
		cb(err,obj);
	});
}

/**
 * 通过主键ID删除对象
 * 
 * @param  {[type]}   modelName 模型名称
 * @param  {[type]}   id        主键ID
 * @param  {Function} cb        回调函数
 */
module.exports.destroy = function(modelName,id,cb) {
	var db = databaseModule.getDatabase();
	var Model = db.models[modelName];
	Model.get(id,function(err,obj){
		if(err) return cb("无模型ID");
		obj.remove(function(err) {
			if(err) return cb("删除失败");
			return cb(null);
		});
	});
}

/**
 * 通过模型名称获取数据库数量
 * 
 * @param  {[type]}   modelName 模型名称
 * @param  {Function} cb        回调函数
 */
module.exports.count = function(modelName,cb) {
	var db = databaseModule.getDatabase();
	var Model = db.models[modelName];
	Model.count(cb);
}

/**
 * 通过条件判断数据是否存在
 * 
 * @param  {[type]}   modelName  模块名
 * @param  {[type]}   conditions 条件
 * @param  {Function} cb         回调函数
 */
module.exports.exists = function(modelName,conditions,cb) {
	var db = databaseModule.getDatabase();
	var Model = db.models[modelName];
	Model.exists(conditions,function(err,isExists){
		if(err) return cb("查询失败");
		 cb(null,isExists);
	});
}

module.exports.getModel = function(modelName) {
	var db = databaseModule.getDatabase();
	return db.models[modelName];
}