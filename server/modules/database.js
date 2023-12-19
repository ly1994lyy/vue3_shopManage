require('mysql');
var fs = require("fs");
var orm = require("orm");
var Promise = require("bluebird");
var path = require("path");

/*
	app: 应用程序环境
	config: 数据库配置
	callback: 回调
*/
function initialize(app,callback) {

	// 加载配置文件
	var config = require('config').get("db_config");
	
	// 从配置中获取数据库配置
	var opts = {
		protocol : config.get("protocol"),
		host : config.get("host"),
		database : config.get("database"),
		port : config.get("port"),
		user : config.get("user"),
		password : config.get("password"),
		query : {pool: true,debug: true}
	};

	
	console.log("数据库连接参数 %s",JSON.stringify(opts));

	// 初始化ORM模型
	app.use(orm.express(opts, {
		define: function (db, models, next) {

			app.db = db;
			global.database = db;

			// 获取映射文件路径
			var modelsPath = path.join(process.cwd(),"/models");
			
			// 读取所有模型文件
			fs.readdir(modelsPath,function(err, files) {
				// 存放所有的加载模型函数
				var loadModelAsynFns = new Array();
				// console.log("开始加载 ORM 模型层文件 ");
				for (var i = 0; i < files.length; i++) {
					var modelPath = modelsPath + "/" +files[i];
					// console.log("加载模型 %s",modelPath);
					loadModelAsynFns[i] = db.loadAsync(modelPath);
				}
				
				Promise.all(loadModelAsynFns)
				.then(function(){
					// console.log("ORM 模型加载完成");
					// 挂载模型集合

					for(var modelName in db.models){
						models[modelName] = db.models[modelName];
					}
					app.models = models;
					callback(null);
					next();
				})
				.catch(function(error){
					console.error('加载模块出错 error: ' + err);
					callback(error);
					next();
				});
			});
		}
	}));	
}

module.exports.initialize = initialize;
module.exports.getDatabase = function() {
	return  global.database;
}