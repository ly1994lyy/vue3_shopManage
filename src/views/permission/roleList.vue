<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bd-bottom','vcenter',index1===0?'bd-top':'']" v-for="(item1,index1) in scope.row.children" :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)" >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row :class="[index2===0?'':'bd-top','vcenter']" v-for="(item2,index2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning" v-for="(item3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="450px">
          <template v-slot="scope">
            <el-button type="primary" :icon="Edit">编辑</el-button>
            <el-button type="danger" :icon="Delete">删除</el-button>
            <el-button type="warning" :icon="Setting" @click="showSetRightDialog(scope.row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
        title="分配权限"
        v-model:visible="setRightDialogVisible"
        @close="setRightDialogClosed"
        width="50%"
    >
      <el-tree
          :data="rightslist"
          :default-checked-keys="defKeys"
          node-key="id"
          ref="treeRef"
          default-expand-all
          show-checkbox
          :props="treeProps">
      </el-tree>
      <div slot="footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { getRoles } from '@/apis/permission.js'
import useHttp from '@/hooks/useHttp.js'
import { Edit, Setting, Delete } from '@element-plus/icons-vue'

const { loading, tableData, queryData } = useHttp(getRoles)

const getRightsList = async () => {
  await queryData()
}

const removeRightById = (row, id) => {

}
getRightsList()
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 7px;
}

.bd-top {
  border-top: 1px solid #eee;
}

.bd-bottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
