<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert
          title="添加商品信息"
          :closable="false"
          center
          show-icon
          type="info"
      >
      </el-alert>
      <el-steps
          :space="200"
          :active="activeIndex - 0"
          finish-status="success"
          align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品信息"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          label-width="80px"
          label-position="top"
      >
        <el-tabs
            v-model="activeIndex"
            :before-leave="beforeTabLeave"
            :tab-position="'left'"
            @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类：" prop="goods_cat">
              <el-cascader
                  :options="cateList"
                  :props="cateProps"
                  clearable
                  v-model="addForm.goods_cat"
                  @change="CateChanged"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
                :label="item.attr_name"
                v-for="item in manyTableData"
                :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                    v-for="(cb, i) in item.attr_vals"
                    :label="cb"
                    border
                    :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
                :label="item.attr_name"
                v-for="item in onlyTableData"
                :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
                action="http://127.0.0.1:8888/api/private/v1/upload"
                :headers="headerObj"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <el-input type="textarea" v-model="addForm.goods_introduce" />
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog
        title="图片预览"
        v-model:visible="previewVisible"
        width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getCategories, getCategoryParams } from '@/apis/category.js'
import _ from 'lodash'
import { addGoodApi } from '@/apis/good.js'
import { useRouter } from 'vue-router'

const addFormRules = {
  goods_name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  goods_price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }
  ],
  goods_wight: [
    { required: true, message: '请输入商品重量', trigger: 'blur' }
  ],
  goods_number: [
    { required: true, message: '请输入商品数量', trigger: 'blur' }
  ],
  goods_cat: [
    { required: true, message: '请选择商品分类', trigger: 'blur' }
  ]
}

const cateProps = {
  expandTrigger: 'hover',
  value: 'cat_id',
  label: 'cat_name',
  children: 'children'
}

const headerObj = {
  Authorization: window.sessionStorage.getItem('token')
}

const addForm = ref({
  goods_name: '',
  goods_price: 0,
  goods_weight: 0,
  goods_number: 0,
  goods_cat: [],
  pics: [],
  goods_introduce: '',
  attrs: []
})
const manyTableData = ref([])
const onlyTableData = ref([])
const cateList = ref([])
const previewPath = ref('')
const previewVisible = ref(false)
const activeIndex = ref('0')
const addFormRef = ref()
const router = useRouter()

const cateId = computed(() => {
  return addForm.value.goods_cat.length === 3 ? addForm.value.goods_cat[2] : null
})

const add = () => {
  addFormRef.value.validate(async valid => {
    if (!valid) {
      ElMessage.error('请先填写必填项！')
      return
    }
    const form = _.cloneDeep(addForm.value)
    form.goods_cat = form.goods_cat.join(',')
    manyTableData.value.forEach(item => {
      const newInfo = {
        attr_id: item.attr_id,
        attr_value: item.attr_vals.join(' ')
      }
      addForm.value.attrs.push(newInfo)
    })
    onlyTableData.value.forEach(item => {
      const newInfo = {
        attr_id: item.attr_id,
        attr_value: item.attr_vals
      }
      addForm.value.attrs.push(newInfo)
    })
    form.attrs = addForm.value.attrs
    await addGoodApi(form)
    ElMessage.success('添加商品成功！')
    await router.push('/goods')
  })
}

const tabClicked = async () => {
  if (activeIndex.value === '1') {
    const res = await getCategoryParams(cateId.value, { sel: 'many' })
    res.data.forEach(item => {
      item.attr_vals =
          item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
    })
    manyTableData.value = res.data
  } else {
    const res = await getCategoryParams(cateId.value, { sel: 'only' })
    onlyTableData.value = res.data
  }
}

const beforeTabLeave = (activeName, oldActiveName) => {
  if (oldActiveName === '0' && addForm.value.goods_cat.length !== 3) {
    ElMessage.error('请先选择分类！')
    return false
  }
}

const CateChanged = () => {
  if (addForm.value.goods_cat.length !== 3) {
    addForm.value.goods_cat = []
    ElMessage.error('请选择三级分类')
  }
}

const handlePreview = (file) => {
  previewPath.value = file.response.data.url
  previewVisible.value = true
}
const handleRemove = (fire) => {
  const picPath = fire.response.data.tmp_path
  const i = addForm.value.pics.findIndex(x => x.pic === picPath)
  addForm.value.pics.splice(i, 1)
}
const handleSuccess = (response) => {
  const picInfo = { pic: response.data.tmp_path }
  addForm.value.pics.push(picInfo)
}

const getCateList = async () => {
  const res = await getCategories()
  cateList.value = res.data
}

getCateList()
</script>

<style lang="scss" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg{
  width: 100%;
}

.btnAdd{
  margin-top: 15px;
}
</style>
