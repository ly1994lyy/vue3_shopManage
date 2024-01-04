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

    <SetRight
        :rights-list="rowRights"
        :role-id="roleId"
        :defKeys="defKeys"
        @clearDefKeys="clearDefKeys"
        @getRightsList="getRightsList"
        v-model="visible"
        v-if="visible"
    />

  </div>
</template>

<script setup>
import { getRoles, getRights, deleteRole } from '@/apis/permission.js'
import useHttp from '@/hooks/useHttp.js'
import { Edit, Setting, Delete } from '@element-plus/icons-vue'
import SetRight from '@/components/permission/SetRight.vue'
import { ref } from 'vue'

const { loading, tableData, queryData } = useHttp(getRoles)

const visible = ref(false)
const rowRights = ref([])
const defKeys = ref([])
const roleId = ref(0)
const getRightsList = async () => {
  await queryData()
}

const showSetRightDialog = async (row) => {
  roleId.value = row.id
  const res = await getRights()
  rowRights.value = res.data
  getLeafKeys(row, defKeys.value)
  visible.value = true
}

const clearDefKeys = () => {
  defKeys.value = []
}
const getLeafKeys = (node, arr) => {
  if (!node.children) {
    return arr.push(node.id)
  }
  node.children.forEach(item => getLeafKeys(item, arr))
}
const removeRightById = (row, id) => {
  ElMessageBox.confirm('此操作将永久删除该权限, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await deleteRole(row.id, id)
    ElMessage.success('删除成功')
    await getRightsList()
  }).catch(() => {
    ElMessage.info('取消删除')
  })
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
