<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column align="center" type="index" label="序号" width="60"></el-table-column>
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

<script setup>
import { getRightsApi } from '@/apis/permission.js'
import useHttp from '@/hooks/useHttp.js'

const { loading, tableData, queryData } = useHttp(getRightsApi)

const getRightsList = async () => {
  await queryData()
}

getRightsList()
</script>

<style lang="scss" scoped>

</style>
