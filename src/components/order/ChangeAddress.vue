<template>
  <el-dialog title="修改地址" :model-value="modelValue" width="50%" before-close="close">
    <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressFormRules"
        label-width="100px"
    >
      <el-form-item label="省市区/县" prop="address1">
        <el-cascader :options="cityData" v-model="addressForm.address1">
        </el-cascader>
      </el-form-item>
      <el-form-item label="详细地址" prop="address2">
        <el-input v-model="addressForm.address2" placeholder=""></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="close"
      >确 定
      </el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import cityData from './citydata'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:modelValue'])

const addressForm = ref({
  address1: [],
  address2: ''
})

const addressFormRules = {
  address1: [
    { required: true, message: '请选择省市区/县', trigger: 'blur' }
  ],
  address2: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

const close = () => {
  emits('update:modelValue', false)
}
</script>

<style lang="scss" scoped>

</style>
