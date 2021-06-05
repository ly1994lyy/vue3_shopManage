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

      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bd-bottom','vcenter',index1==0?'bd-top':'']" v-for="(item1,index1) in scope.row.children" :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)" >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row :class="[index2==0?'':'bd-top','vcenter']" v-for="(item2,index2) in item1.children" :key="item2.id">
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
        <el-table-column align="center" type="index"></el-table-column>
        <el-table-column align="center" prop="roleName" label="角色名称"></el-table-column>
        <el-table-column align="center" prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column align="center" label="操作" width="450px">
          <template #default="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <set-role
      :id="id"
      :rowData="rowData"
      :setRightDialogVisible="setRightDialogVisible"
      @getRoleList="getRoleList"
      @closeSetRightDialog="closeSetRightDialog"
    >
    </set-role>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { getRoles, deleteRole } from '@/api/permission'
import { ElMessage, ElMessageBox } from 'element-plus'
import SetRole from './SetRole.vue'

export default defineComponent({
  name: 'RoleList',
  components: {
    SetRole
  },
  setup () {
    const roleList = ref([])
    const setRightDialogVisible = ref(false)
    const id = ref('')
    const rowData = ref({})

    const roleId = ref('')

    const getRoleList = async () => {
      const { data } = await getRoles()
      if (data.meta.status === 200) {
        roleList.value = data.data
      }
    }

    const removeRightById = (row:any, rightId:string) => {
      ElMessageBox.confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async () => {
        const { data } = await deleteRole(row.id, rightId)
        if (data.meta.status === 200) {
          ElMessage({
            type: 'success',
            message: data.meta.msg,
            showClose: true
          })
          row.children = data.data
        }
      }).catch(() => {
        ElMessage({
          type: 'info',
          showClose: true,
          message: '您已取消删除'
        })
      })
    }

    const showSetRightDialog = (row:any) => {
      rowData.value = row
      id.value = row.id
      setRightDialogVisible.value = true
    }

    const closeSetRightDialog = () => {
      setRightDialogVisible.value = false
    }
    getRoleList()

    return {
      roleList,
      id,
      rowData,
      setRightDialogVisible,
      roleId,
      removeRightById,
      showSetRightDialog,
      closeSetRightDialog,
      getRoleList
    }
  }
})

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
