<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
              placeholder="请输入内容"
              clearable
              v-model="queryInfo.query"
              @clear="getOrderList"
          >
            <template #append>
              <el-button
                  :icon="Search"
                  @click="
                handleCurrentChange(1);
                getOrderList;
              "
              ></el-button>
            </template>

          </el-input>
        </el-col>
      </el-row>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column type="index" label="序号" align="center" width="60"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号" align="center"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" align="center"></el-table-column>
        <el-table-column label="是否付款" align="center">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
            >已付款</el-tag
            >
            <el-tag type="warning" v-if="scope.row.pay_status === '0'"
            >未付款</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" align="center"></el-table-column>
        <el-table-column label="下单时间" align="center">
          <template v-slot="scope">
            {{ scope.row.create_time }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center">
          <template v-slot="scope">
            <el-button
                size="small"
                type="primary"
                :icon="Edit"
                @click="showBox"
            ></el-button>
            <el-button
                size="small"
                type="warning"
                :icon="Location"
                @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
      >
      </el-pagination>
    </el-card>

    <ChangeAddress
        v-if="visible"
        v-model="visible"
    />

    <StreamProgress v-if="progressVisible" v-model="progressVisible" />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import useHttp from '@/hooks/useHttp.js'
import { getOrders } from '@/apis/order.js'
import { Search, Edit, Location } from '@element-plus/icons-vue'
import ChangeAddress from '@/components/order/ChangeAddress.vue'
import StreamProgress from '@/components/order/StreamProgress.vue'

const queryInfo = ref({
  query: '',
  pagenum: 1,
  pagesize: 10
})

const visible = ref(false)
const progressVisible = ref(false)

const { tableData, queryData, loading, total } = useHttp(getOrders)

const handleSizeChange = (newSize) => {
  queryInfo.value.pagesize = newSize
  getOrderList()
}
const handleCurrentChange = (newPage) => {
  queryInfo.value.pagenum = newPage
  getOrderList()
}

const getOrderList = async () => {
  await queryData(queryInfo.value, 'goods')
}

const showBox = () => {
  visible.value = true
}

const showProgressBox = () => {
  progressVisible.value = true
}

getOrderList()
</script>

<style lang="scss" scoped>

</style>
