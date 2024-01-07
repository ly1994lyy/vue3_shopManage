<template>
  <!-- 添加分类对话框 -->
  <el-dialog
      title="添加分类"
      :model-value="modelValue"
      :before-close="close"
      width="50%"
  >
    <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
    >
      <el-form-item label="分类名称：" prop="cat_name">
        <el-input v-model="addCateForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类：">
        <el-cascader
            :options="parentCateList"
            :props="cascadarProps"
            clearable
            v-model="selectKeys"
            @change="parentCateChanged"
        >
        </el-cascader>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { getCategories, addCategoryApi } from '@/apis/category.js'
import useHttp from '@/hooks/useHttp.js'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:modelValue', 'getCategoryList'])

const addCateForm = ref({
  cat_name: '',
  cat_pid: 0,
  cat_level: 0
})
const selectKeys = ref([])
const addCateFormRef = ref()

const { tableData: parentCateList, queryData } = useHttp(getCategories)

const addCateFormRules = {
  cat_name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

const cascadarProps = {
  expandTrigger: 'hover',
  value: 'cat_id',
  label: 'cat_name',
  children: 'children',
  checkStrictly: true
}

const close = () => {
  emits('update:modelValue', false)
}

const getParentCateList = async () => {
  await queryData({ type: 2 })
}

const parentCateChanged = () => {
  if (selectKeys.value.length > 0) {
    if (selectKeys.value.length > 0) {
      addCateForm.value.cat_pid = selectKeys.value[selectKeys.value.length - 1]
      addCateForm.value.cat_level = selectKeys.value.length
    } else {
      addCateForm.value.cat_pid = 0
      addCateForm.value.cat_level = 0
    }
  }
}
const addCate = () => {
  addCateFormRef.value.validate(async valid => {
    if (valid) {
      await addCategoryApi(addCateForm.value)
      close()
      emits('getCategoryList')
      ElMessage.success('添加分类成功')
    }
  })
}

getParentCateList()
</script>

<style lang="scss" scoped>

</style>
