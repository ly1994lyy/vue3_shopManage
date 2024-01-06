<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import _ from 'lodash'
import { ref, onMounted } from 'vue'
import { getReport } from '@/apis/order.js'

const option = ref({
  title: {
    text: '用户来源'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#E9EEF3'
      }
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      boundaryGap: false
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ]
})

onMounted(async () => {
  // 基于准备好的dom，初始化echarts实例
  const myChart = echarts.init(document.getElementById('main'))

  const { data } = await getReport()
  // 指定图表的配置项和数据
  // 使用刚指定的配置项和数据显示图表。
  const result = _.merge(data, option.value)
  myChart.setOption(result)
})
</script>

<style lang="scss" scoped>

</style>
