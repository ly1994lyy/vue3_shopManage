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
                icon="el-icon-search"
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
      <el-table :data="userList" border stripe style="width: 100%">
        <el-table-column align="center" type="index"></el-table-column>
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
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              size="mini"
            ></el-button>
            <!-- 删除用户 -->
            <el-button
              type="danger"
              @click="delUser(scope.row.id)"
              icon="el-icon-delete"
              size="mini"
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
                icon="el-icon-setting"
                size="mini"
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

    <add-user
      :addDialogVisible="addDialogVisible"
      @closeAddDialog="closeAddDialog">
    </add-user>
<!--    &lt;!&ndash; 修改用户对话框 &ndash;&gt;-->
<!--    <el-dialog-->
<!--      title="修改用户"-->
<!--      v-model:visible="editDialogVisible"-->
<!--      width="50%"-->
<!--      @close="editDialogClosed"-->
<!--    >-->
<!--      <el-form-->
<!--        :model="editUserForm"-->
<!--        :rules="editUserFormRules"-->
<!--        ref="editUserFormRef"-->
<!--        label-width="70px"-->
<!--        class="demo-ruleForm"-->
<!--      >-->
<!--        <el-form-item label="用户名">-->
<!--          <el-input v-model="editUserForm.username" disabled></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="邮箱" prop="email">-->
<!--          <el-input v-model="editUserForm.email"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="手机" prop="mobile">-->
<!--          <el-input v-model="editUserForm.mobile"></el-input>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      <template #footer>-->
<!--        <span class="dialog-footer">-->
<!--          <el-button @click="editDialogVisible = false">取 消</el-button>-->
<!--        <el-button type="primary" @click="editUser">确 定</el-button>-->
<!--        </span>-->

<!--      </template>-->
<!--    </el-dialog>-->

<!--    &lt;!&ndash; 分配角色对话框 &ndash;&gt;-->
<!--    <el-dialog-->
<!--      title="分配角色"-->
<!--      v-model:visible="setRoleDialogVisible"-->
<!--      @close="setRoleDialogClosed"-->
<!--      width="50%"-->
<!--    >-->
<!--      <div>-->
<!--        <p>当前的用户:{{ userInfo.username }}</p>-->
<!--        <p>当前的角色:{{ userInfo.role_name }}</p>-->
<!--        <p>分配新角色:-->
<!--          <el-select v-model="selectRoleId" placeholder="请选择新角色">-->
<!--            <el-option-->
<!--              v-for="item in rolesList"-->
<!--              :key="item.id"-->
<!--              :label="item.roleName"-->
<!--              :value="item.id">-->
<!--            </el-option>-->
<!--          </el-select>-->
<!--        </p>-->
<!--      </div>-->
<!--      <template #footer>-->
<!--        <el-button @click="setRoleDialogVisible = false">取 消</el-button>-->
<!--        <el-button type="primary" @click="saveRoleInfo"-->
<!--        >确 定</el-button-->
<!--        >-->
<!--      </template>-->
<!--    </el-dialog>-->
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { getUsers, updateUserState, deleteUser } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import AddUser from '@/views/User/AddUser.vue'

export default defineComponent({
  name: 'UserList',
  components: {
    AddUser
  },
  setup () {
    const queryInfo = ref({
      query: '',
      pagenum: 1,
      pagesize: 2
    })
    const userList = ref([])
    const total = ref(0)
    const addDialogVisible = ref(false)

    const getUserList = async () => {
      const { data: res } = await getUsers(queryInfo.value)
      if (res.meta.status === 200) {
        userList.value = res.data.users
        total.value = res.data.total
      }
    }

    const handleSizeChange = (newSize:number) => {
      queryInfo.value.pagesize = newSize
      getUserList()
    }
    const handleCurrentChange = (newPage:number) => {
      queryInfo.value.pagenum = newPage
      getUserList()
    }

    const userStateChanged = async (userinfo:any) => {
      const { data } = await updateUserState(userinfo.id, userinfo.mg_state)
      if (data.meta.status === 200) {
        ElMessage({
          type: 'success',
          showClose: true,
          message: data.meta.msg
        })
      }
    }

    const delUser = (id:string) => {
      ElMessageBox.confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async () => {
        const { data } = await deleteUser(id)
        if (data.meta.status === 200) {
          ElMessage({
            type: 'success',
            showClose: true,
            message: data.meta.msg
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
      addDialogVisible.value = true
    }

    const closeAddDialog = () => {
      addDialogVisible.value = false
    }
    getUserList()

    return {
      queryInfo,
      userList,
      total,
      addDialogVisible,
      getUserList,
      handleSizeChange,
      handleCurrentChange,
      userStateChanged,
      delUser,
      addDialog,
      closeAddDialog
    }
  }
})
</script>

<!--<script>-->
<!--export default {-->
<!--  data () {-->

<!--    return {-->
<!--      editDialogVisible: false,-->

<!--      setRoleDialogVisible: false,-->

<!--      editUserForm: {},-->
<!--      editUserFormRules: {-->
<!--        email: [-->
<!--          { required: true, message: '请输入邮箱', trigger: 'blur' },-->
<!--          { validator: checkEmail, trigger: 'blur' }-->
<!--        ],-->
<!--        mobile: [-->
<!--          { required: true, message: '请输入手机', trigger: 'blur' },-->
<!--          { validator: checkMobile, trigger: 'blur' }-->
<!--        ]-->
<!--      },-->
<!--      userInfo: '',-->
<!--      rolesList: [],-->
<!--      selectRoleId: ''-->
<!--    }-->
<!--  },-->
<!--  methods: {-->

<!--    addDialogClosed () {-->
<!--      this.$refs.addUserFormRef.resetFields()-->
<!--    },-->
<!--    addUser () {-->
<!--      this.$refs.addUserFormRef.validate(async valid => {-->
<!--        if (!valid) return-->
<!--        const { data } = await this.$http.post('users', this.addUserForm)-->
<!--        if (data.meta.status !== 201) {-->
<!--          this.$message.error('添加用户失败！')-->
<!--        }-->
<!--        this.$message.success('添加用户成功！')-->
<!--        this.dialogVisible = false-->
<!--        this.getUserList()-->
<!--      })-->
<!--    },-->
<!--    async showEditDialog (id) {-->
<!--      const { data } = await this.$http.get(`users/${id}`)-->
<!--      if (data.meta.status !== 200) {-->
<!--        this.$message.error('查询用户失败！')-->
<!--      }-->
<!--      this.editUserForm = data.data-->
<!--      this.editDialogVisible = true-->
<!--    },-->
<!--    editDialogClosed () {-->
<!--      this.$refs.editUserFormRef.resetFields()-->
<!--    },-->
<!--    editUser () {-->
<!--      this.$refs.editUserFormRef.validate(async valid => {-->
<!--        if (!valid) return-->
<!--        const { data } = await this.$http.put(`users/${this.editUserForm.id}`, {-->
<!--          email: this.editUserForm.email,-->
<!--          mobile: this.editUserForm.mobile-->
<!--        })-->
<!--        if (data.meta.status !== 200) {-->
<!--          this.$message.error('修改用户信息失败！')-->
<!--        }-->
<!--        this.$message.success('修改成功！')-->
<!--        this.editDialogVisible = false-->
<!--        this.getUserList()-->
<!--      })-->
<!--    },-->
<!--    async setRole (userInfo) {-->
<!--      const { data } = await this.$http.get('roles')-->
<!--      if (data.meta.status !== 200) {-->
<!--        return this.$message.error(data.meta.msg)-->
<!--      }-->
<!--      this.rolesList = data.data-->
<!--      this.userInfo = userInfo-->
<!--      this.setRoleDialogVisible = true-->
<!--    },-->
<!--    async saveRoleInfo () {-->
<!--      if (!this.selectRoleId) {-->
<!--        return this.$message.error('请选择要分配的角色！')-->
<!--      }-->
<!--      const { data } = await this.$http.put(`users/${this.userInfo.id}/role`, {-->
<!--        rid: this.selectRoleId-->
<!--      })-->
<!--      if (data.meta.status !== 200) {-->
<!--        return this.$message.error(data.meta.msg)-->
<!--      }-->
<!--      this.$message.success('分配角色成功！')-->
<!--      this.getUserList()-->
<!--      this.setRoleDialogVisible = false-->
<!--    },-->
<!--    setRoleDialogClosed () {-->
<!--      this.selectRoleId = '',-->
<!--      this.userInfo = {}-->
<!--    }-->
<!--  },-->
<!--  created () {-->
<!--    this.getUserList()-->
<!--  }-->
<!--}-->
<!--</script>-->

<style lang="scss" scoped></style>
