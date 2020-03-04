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
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="
                handleCurrentChange(1);
                getOrderList;
              "
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="orderlist" stripe border style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="warning" v-if="scope.row.pay_status === '0'"
              >未付款</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showBox"
            ></el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-location"
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

    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%">
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressFormRules"
        @close="addressDialogClosed"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityDate" v-model="addressForm.address1">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2" placeholder=""></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false"
          >确 定</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <div slot="footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import cityDate from "./citydata.js";

export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      orderlist: [],
      total: 0,
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ""
      },
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ]
      },
      cityDate,
      progressVisible:false,
      progressInfo:[]
    };
  },
  methods: {
    async getOrderList() {
      const { data } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg);
      }
      this.orderlist = data.data.goods;
      this.total = data.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    showBox() {
      this.addressVisible = true;
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    async showProgressBox() {
      const {data} = await this.$http.get('/kuaidi/804909574412544580')
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg);
      }
      this.progressInfo = data.data
      this.progressVisible = true
      console.log(data);
    }
  },
  created() {
    this.getOrderList();
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
