<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
          >添加分类
          </el-button
          >
        </el-col>
      </el-row>

      <el-table
          v-loading="loading"
          :data="tableData"
          class="TreeTable"
          row-key="cat_id"
          :selection-type="false"
          :expand-type="false"
      >
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column align="center" label="是否有效">
          <!-- 是否有效插槽 -->
          <template v-slot="scope">
            <CircleCheckFilled
                v-if="!scope.row.cat_deleted"
                style="color:lightgreen;width: 15px"
            ></CircleCheckFilled>
            <CircleCloseFilled class="el-icon-error" v-else style="color:red;;width: 15px"></CircleCloseFilled>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序">
          <!-- 排序插槽 -->
          <template v-slot="scope">
            <el-tag size="small" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="small" v-if="scope.row.cat_level === 1" type="success"
            >二级
            </el-tag
            >
            <el-tag size="small" v-if="scope.row.cat_level === 2" type="warning"
            >三级
            </el-tag
            >
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <!-- 操作插槽 -->
          <template v-slot="scope">
            <el-button size="small" type="primary" :icon="Edit"
            >编辑
            </el-button
            >
            <el-button size="small" type="warning" :icon="Delete"
            >删除
            </el-button
            >
          </template>
        </el-table-column>

      </el-table>
      <!-- 分页 -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
      >
      </el-pagination>
    </el-card>

    <AddCate
        v-if="visible"
        v-model="visible"
        @getCategoryList="getCategoryList"
    />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import useHttp from '@/hooks/useHttp.js'
import { getCategories } from '@/apis/category.js'
import { Edit, Delete, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import AddCate from '@/components/good/AddCate.vue'

const { total, queryData, loading, tableData } = useHttp(getCategories)

const queryInfo = ref({
  type: 3,
  pagenum: 1,
  pagesize: 5
})
const visible = ref(false)

const getCategoryList = async () => {
  await queryData(queryInfo.value, 'result')
}

const handleSizeChange = (newSize) => {
  queryInfo.value.pagesize = newSize
  getCategoryList()
}
const handleCurrentChange = (newPage) => {
  queryInfo.value.pagenum = newPage
  getCategoryList()
}

const showAddCateDialog = () => {
  visible.value = true
}

getCategoryList()
</script>

<style lang="scss" scoped>

</style>
