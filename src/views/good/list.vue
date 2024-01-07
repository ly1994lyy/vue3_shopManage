<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
              placeholder="请输入内容"
              clearable
              v-model="queryInfo.query"
              @clear="getGoodsList"
          >
            <template #append>
              <el-button
                  :icon="Search"
                  @click="handleCurrentChange(1);getGoodsList;"
              ></el-button>
            </template>

          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table :data="tableData" v-loading="loading" border style="width: 100%">
        <el-table-column align="center" type="index" label="序号" width="60"> </el-table-column>
        <el-table-column align="center" prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column
            align="center"
            prop="goods_price"
            label="商品价格（元）"
            width="95px"
        ></el-table-column>
        <el-table-column
            align="center"
            prop="goods_weight"
            label="商品重量"
            width="70px"
        ></el-table-column>
        <el-table-column prop="add_time" label="创建时间" align="center" width="170px">
          <template v-slot="scope">
            {{ scope.row.add_time }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="130px">
          <template v-slot="scope">
            <el-button
                size="small"
                type="primary"
                :icon="Edit"
            ></el-button>
            <el-button
                size="small"
                type="warning"
                :icon="Delete"
                @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[10, 20, 50]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script setup>
import useHttp from '@/hooks/useHttp.js'
import { deleteGood, getGoods } from '@/apis/good.js'
import { ref } from 'vue'
import { Edit, Delete, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const { loading, tableData, queryData, total } = useHttp(getGoods)
const router = useRouter()

const queryInfo = ref({
  query: '',
  pagenum: 1,
  pagesize: 2
})

const goAddPage = () => {
  router.push({ name: 'addGood' })
}

const removeById = (id) => {
  ElMessageBox.confirm('此操作将永久删除该商品, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    const res = await deleteGood(id)
    ElMessage({
      type: 'success',
      showClose: true,
      message: res.meta.msg
    })
    await getGoodsList()
  }).catch(() => {
    ElMessage({
      type: 'info',
      showClose: true,
      message: '您已取消删除'
    })
  })
}

const getGoodsList = async () => {
  await queryData(queryInfo.value, 'goods')
}

const handleSizeChange = (newSize) => {
  queryInfo.value.pagesize = newSize
  getGoodsList()
}
const handleCurrentChange = (newPage) => {
  queryInfo.value.pagenum = newPage
  getGoodsList()
}

getGoodsList()
</script>

<style lang="scss" scoped>

</style>
