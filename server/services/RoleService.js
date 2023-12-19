var _ = require('lodash');
var path = require("path");
var dao = require(path.join(process.cwd(),"dao/DAO"));
var permissionAPIDAO = require(path.join(process.cwd(),"dao/PermissionAPIDAO"));

function getPermissionsResult(permissionKeys,permissionIds) {
	var permissionsResult = {};

	// 处理一级菜单
	for(idx in permissionIds) {
		if(!permissionIds[idx] || permissionIds[idx] == "") continue;
		permissionId = parseInt(permissionIds[idx]);
		permission = permissionKeys[permissionId];
		if(permission && permission.ps_level == 0) {
			permissionsResult[permission.ps_id] = {
				"id":permission.ps_id,
				"authName":permission.ps_name,
				"path":permission.ps_api_path,
				"children":[]
			};
		}
	}

	// 临时存储二级返回结果
	tmpResult = {};
	// 处理二级菜单
	for(idx in permissionIds) {
		if(!permissionIds[idx] || permissionIds[idx] == "") continue;
		permissionId = parseInt(permissionIds[idx]);
		permission = permissionKeys[permissionId];
		if(permission && permission.ps_level == 1) {
			parentPermissionResult = permissionsResult[permission.ps_pid];
			if(parentPermissionResult) {
				tmpResult[permission.ps_id] = {
					"id":permission.ps_id,
					"authName":permission.ps_name,
					"path":permission.ps_api_path,
					"children":[]
				}
				parentPermissionResult.children.push(tmpResult[permission.ps_id]);
			}
		}
	}

	// 处理三级菜单
	for(idx in permissionIds) {
		if(!permissionIds[idx] || permissionIds[idx] == "") continue;
		permissionId = parseInt(permissionIds[idx]);
		permission = permissionKeys[permissionId];
		if(permission && permission.ps_level == 2) {

			parentPermissionResult = tmpResult[permission.ps_pid];

			if(parentPermissionResult) {
				
				parentPermissionResult.children.push({
					"id":permission.ps_id,
					"authName":permission.ps_name,
					"path":permission.ps_api_path
				});
			}
		}
	}
	return permissionsResult;
}

/**
 * 获取所有用户的角色 & 权限
 * 
 * @param  {Function} cb 回调函数
 */
module.exports.getAllRoles = function(cb) {
	dao.list("RoleModel",null,function(err,roles) {
		if(err) return cb("获取角色数据失败");
		permissionAPIDAO.list(function(err,permissions){
			if(err) return cb("获取权限数据失败");
			var permissionKeys = _.keyBy(permissions,'ps_id');
			var rolesResult = [];
			for(idx in roles) {
				role = roles[idx];
				permissionIds = role.ps_ids.split(",");
				roleResult = {
					"id" : role.role_id,
					"roleName" : role.role_name,
					"roleDesc" : role.role_desc,
					"children" : []
				};

				
				roleResult.children = _.values(getPermissionsResult(permissionKeys,permissionIds));

				rolesResult.push(roleResult);
			}

			cb(null,rolesResult);

		});
		
	});
}

/**
 * 添加角色
 * 
 * @param  {[type]}   params [description]
 * @param  {Function} cb     [description]
 */
module.exports.createRole = function(params,cb) {
	if(!params.roleName) return cb("角色名称不能为空");
	if(!params.roleDesc) params.roleDesc = "";

	dao.create("RoleModel",{"role_name":params.roleName,"role_desc":params.roleDesc,"ps_ids":""},function(err,role){
		if(err) return cb("创建角色失败");
		cb(null,{
			"roleId" : role.role_id,
			"roleName" : role.role_name,
			"roleDesc" : role.role_desc
		});
	})
}

/**
 * 通过角色 ID 获取角色详情
 * 
 * @param  {[type]}   id 角色ID
 * @param  {Function} cb 回调函数
 */
module.exports.getRoleById = function(id,cb){
	if(!id) return cb("角色ID不能为空");
	if(isNaN(parseInt(id))) return cb("角色ID必须为数字");
	dao.show("RoleModel",id,function(err,role){
		if(err) return cb("获取角色详情失败");
		cb(null,{
			"roleId" : role.role_id,
			"roleName" : role.role_name,
			"roleDesc" : role.role_desc,
			"rolePermissionDesc" : role.ps_ca
		});
	});
}

/**
 * 更新角色信息
 * 
 * @param  {[type]}   role 角色对象
 * @param  {Function} cb   回调函数
 */
module.exports.updateRole = function(params,cb){
	if(!params) return cb("参数不能为空");
	if(!params.id) return cb("角色ID不能为空");
	if(isNaN(parseInt(params.id))) return cb("角色ID必须为数字");

	updateInfo = {};
	if(params.roleName) {
		updateInfo["role_name"] = params.roleName;
	}
	if(params.roleDesc) {
		updateInfo["role_desc"] = params.roleDesc;
	}

	dao.update("RoleModel",params.id,updateInfo,function(err,newRole) {
		if(err) return cb("更新角色信息失败");
		cb(null,{
			"roleId":newRole.role_id,
			"roleName":newRole.role_name,
			"roleDesc":newRole.role_desc,
			"rolePermissionDesc" : newRole.ps_ca
		});
	});
}

/**
 * 对角色进行授权
 * 
 * @param  {[type]}   rights 以 "," 分割的权限列表
 * @param  {Function} cb     回调函数
 */
module.exports.updateRoleRight = function(rid,rights,cb) {
	if(!rid) return cb("角色ID不能为空");
	if(isNaN(parseInt(rid))) return cb("角色ID必须为数字");

	// 注意这里需要更新权限描述信息字段
	// 暂时实现
	// 
	dao.update("RoleModel",rid,{"ps_ids":rights},function(err,newRole) {
		if(err) return cb("更新权限失败");
		cb(null,{
			"roleId":newRole.role_id,
			"roleName":newRole.role_name
		});
	});
}

/**
 * 删除权限
 * 
 * @param  {[type]}   rid            权限ID
 * @param  {[type]}   deletedRightId 删除的权限ID
 * @param  {Function} cb             回调函数
 */
module.exports.deleteRoleRight = function(rid,deletedRightId,cb) {
	daoModule.findOne("RoleModel",{"role_id":rid},function(err,role){
		if(err || !role) return cb("获取角色信息失败",false);
		ps_ids = role.ps_ids.split(",");
		new_ps_ids = [];
		for(idx in ps_ids) {
			ps_id = ps_ids[idx];
			if(parseInt(deletedRightId) == parseInt(ps_id)) {
				continue;
			}
			new_ps_ids.push(ps_id);
		}
		new_ps_ids_string = new_ps_ids.join(",");
		role.ps_ids = new_ps_ids_string;
		role.save(function(err,newRole) {
			if(err) return cb("删除权限失败");
			permissionAPIDAO.list(function(err,permissions){
				if(err) return cb("获取权限数据失败");
				permissionIds = newRole.ps_ids.split(",");
				var permissionKeys = _.keyBy(permissions,'ps_id');
				return cb(null,_.values(getPermissionsResult(permissionKeys,permissionIds)));
			});

		});
		
	});
}


/**
 * 删除角色
 * 
 * @param  {[type]}   id 角色ID
 * @param  {Function} cb 回调函数
 */
module.exports.deleteRole = function(id,cb){
	if(!id) return cb("角色ID不能为空");
	if(isNaN(parseInt(id))) return cb("角色ID必须为数字");
	dao.destroy("RoleModel",id,function(err){
		if(err) return cb("删除失败");
		cb(null,true);
	})
}

/**
 * 权限验证函数
 * 
 * @param  {[type]}   rid         角色ID
 * @param  {[type]}   serviceName 服务名
 * @param  {[type]}   actionName  动作名（方法）
 * @param  {Function} cb          回调函数
 */
module.exports.authRight = function(rid,serviceName,actionName,cb) {
	permissionAPIDAO.authRight(rid,serviceName,actionName,function(err,pass) {
		cb(err,pass);
	});
}