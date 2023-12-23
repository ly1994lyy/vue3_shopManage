<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
              placeholder="请输入内容"
              clearable
              @clear="getUserList"
              v-model="queryInfo.query"
          >
            <template #append>
              <el-button
                  :icon="Search"
                  @click="getUserList"
              ></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialog"
          >添加用户</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column align="center" type="index" label="序号" width="60"></el-table-column>
        <el-table-column align="center" prop="username" label="姓名"></el-table-column>
        <el-table-column align="center" prop="email" label="邮箱"></el-table-column>
        <el-table-column align="center" prop="mobile" label="电话"></el-table-column>
        <el-table-column align="center" prop="role_name" label="角色"></el-table-column>
        <el-table-column align="center" label="状态">
          <template #default="scope">
            <el-switch
                v-model="scope.row.mg_state"
                @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <!-- 编辑用户 -->
          <template #default="scope">
            <el-button
                type="primary"
                :icon="Edit"
                @click="showEditDialog(scope.row.id)"
                size="small"
            ></el-button>
            <!-- 删除用户 -->
            <el-button
                type="danger"
                @click="delUser(scope.row.id)"
                :icon="Delete"
                size="small"
            ></el-button>
            <!-- 分配角色 -->
            <el-tooltip
                :enterable="false"
                effect="dark"
                content="分配角色"
                placement="top-start"
            >
              <el-button
                  type="warning"
                  :icon="Setting"
                  size="small"
                  @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
      ></el-pagination>
    </el-card>

    <AddUser
        :id="id"
        v-if="addDialogVisible"
        v-model="addDialogVisible"
        @getUserList="getUserList"
    />

    <set-role
        :id="id"
        :userInfo="userInfo"
        :setRoleDialogVisible="setRoleDialogVisible"
        @closeRoleDialog="closeRoleDialog"
    >
    </set-role>
  </div>
</template>

<script setup>
import { deleteUser, getUsers, updateUserState } from '@/apis/user.js'
import { ref } from 'vue'
import useHttp from '@/hooks/useHttp.js'
import { Delete, Edit, Setting, Search } from '@element-plus/icons-vue'
import AddUser from '@/components/user/AddUser.vue'

const queryInfo = ref({
  query: '',
  pagenum: 1,
  pagesize: 2
})
const addDialogVisible = ref(false)
const setRoleDialogVisible = ref(false)
const id = ref('')
const userInfo = ref({})
const { loading, queryData, tableData, total } = useHttp(getUsers)

const getUserList = async () => {
  await queryData(queryInfo.value, 'users')
}

const handleSizeChange = (newSize) => {
  queryInfo.value.pagesize = newSize
  getUserList()
}
const handleCurrentChange = (newPage) => {
  queryInfo.value.pagenum = newPage
  getUserList()
}

const userStateChanged = async (userinfo) => {
  const { data } = await updateUserState(userinfo.id, userinfo.mg_state)
  if (data.meta.status === 200) {
    ElMessage({
      type: 'success',
      showClose: true,
      message: data.meta.msg
    })
  }
}

const delUser = (id) => {
  ElMessageBox.confirm('此操作将永久删除该用户, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    const res = await deleteUser(id)
    if (res.meta.status === 200) {
      ElMessage({
        type: 'success',
        showClose: true,
        message: res.meta.msg
      })
      await getUserList()
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      showClose: true,
      message: '您已取消删除'
    })
  })
}

const addDialog = () => {
  id.value = ''
  addDialogVisible.value = true
}

const showEditDialog = (rowId) => {
  addDialog()
  id.value = rowId
}

const setRole = (row) => {
  setRoleDialogVisible.value = true
  userInfo.value = row
  id.value = row.id
}

const closeRoleDialog = () => {
  setRoleDialogVisible.value = false
  userInfo.value = {}
}
getUserList()
</script>

<style lang="scss" scoped>

</style>
