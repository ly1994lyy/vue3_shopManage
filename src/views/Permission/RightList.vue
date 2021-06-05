<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-table :data="rightsList" border stripe style="width: 100%">
        <el-table-column align="center" type="index"></el-table-column>
        <el-table-column align="center" prop="authName" label="权限名称"></el-table-column>
        <el-table-column align="center" prop="path" label="路径"></el-table-column>
        <el-table-column align="center" label="权限等级">
          <template #default="scope">
            <el-tag v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag v-if="scope.row.level==='1'" type="success">二级</el-tag>
            <el-tag v-if="scope.row.level==='2'" type="info">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { getRightsApi } from '@/api/permission'

export default defineComponent({
  name: 'RightList',
  setup () {
    const rightsList = ref([])

    const getRightsList = async () => {
      const { data } = await getRightsApi()
      if (data.meta.status === 200) {
        rightsList.value = data.data
      }
    }

    getRightsList()

    return {
      rightsList,
      getRightsList
    }
  }
})
</script>
