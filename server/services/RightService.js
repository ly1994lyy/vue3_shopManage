var _ = require('lodash');
var path = require("path");
var dao = require(path.join(process.cwd(),"dao/PermissionAPIDAO"));


// 获取所有权限
module.exports.getAllRights = function(type,cb) {
	if(!type || (type != "list" && type != "tree")) {
		cb("参数类型错误");
	}

	
	dao.list(function(err,permissions){
		if(err) return cb("获取权限数据失败");

		if(type == "list") {
			var result = [];
			for(idx in permissions) {
				permission = permissions[idx];
				result.push({
					"id" : permission.ps_id,
					"authName" : permission.ps_name,
					"level" : permission.ps_level,
					"pid" : permission.ps_pid,
					"path": permission.ps_api_path
				});
			}
			cb(null,result);
		} else {
			var keyCategories = _.keyBy(permissions,'ps_id');

			// 显示一级
			var permissionsResult = {};

			// 处理一级菜单
			for(idx in permissions) {
				permission = permissions[idx];
				if(permission && permission.ps_level == 0) {
					permissionsResult[permission.ps_id] = {
						"id":permission.ps_id,
						"authName":permission.ps_name,
						"path":permission.ps_api_path,
						"pid" : permission.ps_pid,
						"children":[]
					};
				}
			}

			// 临时存储二级返回结果
			tmpResult = {};
			// 处理二级菜单
			for(idx in permissions) {
				permission = permissions[idx];
				if(permission && permission.ps_level == 1) {

					parentPermissionResult = permissionsResult[permission.ps_pid];
					if(parentPermissionResult) {
						tmpResult[permission.ps_id] = {
							"id":permission.ps_id,
							"authName":permission.ps_name,
							"path":permission.ps_api_path,
							"pid" : permission.ps_pid,
							"children":[]
						}
						parentPermissionResult.children.push(tmpResult[permission.ps_id]);
					}
				}
			}

			// 处理三级菜单
			for(idx in permissions) {
				permission = permissions[idx];
				if(permission && permission.ps_level == 2) {

					parentPermissionResult = tmpResult[permission.ps_pid];

					if(parentPermissionResult) {
						
						parentPermissionResult.children.push({
							"id":permission.ps_id,
							"authName":permission.ps_name,
							"path":permission.ps_api_path,
							"pid" : permission.ps_pid + "," + keyCategories[permission.ps_pid].ps_pid
						});
					}
				}
			}

			cb(null,_.values(permissionsResult));

		}
	});
	
}