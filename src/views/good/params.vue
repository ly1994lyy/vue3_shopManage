<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert
          title="注意：只允许为第三级分类设置相关参数！"
          :closable="false"
          show-icon
          type="warning"
      >
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
              :options="tableData"
              :props="cateProps"
              clearable
              v-model="selectCateKeys"
              @change="getParamsData"
          >
          </el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
              :disabled="isBtnDisabled"
              type="primary"
              size="small"
              @click="showAddDialog"
          >添加参数</el-button
          >
          <el-table :data="manyTableData" stripe border>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                    type="success"
                    v-for="(item, i) in scope.row.attr_vals"
                    @close="handleClosed(i, scope.row)"
                    :key="i"
                    closable
                >
                  {{ item }}
                </el-tag>
                <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称" width="width">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                    type="primary"
                    size="small"
                    :icon="Edit"
                    @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button
                >
                <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    @click="removeParams(scope.row.attr_id)"
                >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
              :disabled="isBtnDisabled"
              type="primary"
              size="small"
              @click="showAddDialog"
          >添加属性</el-button
          >
          <el-table :data="onlyTableData" stripe border>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                    type="success"
                    v-for="(item, i) in scope.row.attr_vals"
                    @close="handleClosed(i, scope.row)"
                    :key="i"
                    closable
                >
                  {{ item }}
                </el-tag>
                <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"> </el-table-column>
            <el-table-column prop="attr_name" label="属性名称" width="width">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                    type="primary"
                    size="small"
                    :icon="Edit"
                    @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button
                >
                <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    @click="removeParams(scope.row.attr_id)"
                >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数和添加属性对话框 -->
<!--    <el-dialog-->
<!--        :title="'添加' + textTitle"-->
<!--        v-model:visible="addDialogVisible"-->
<!--        @close="addDialogClosed"-->
<!--        width="50%"-->
<!--    >-->
<!--      <el-form-->
<!--          ref="addFormRef"-->
<!--          :model="addForm"-->
<!--          :rules="addFormRules"-->
<!--          label-width="100px"-->
<!--      >-->
<!--        <el-form-item :label="textTitle" prop="attr_name">-->
<!--          <el-input v-model="addForm.attr_name"></el-input>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      <div slot="footer">-->
<!--        <el-button @click="addDialogVisible = false">取 消</el-button>-->
<!--        <el-button type="primary" @click="addParams">确 定</el-button>-->
<!--      </div>-->
<!--    </el-dialog>-->

    <!-- 编辑对话框 -->
<!--    <el-dialog-->
<!--        :title="'修改' + textTitle"-->
<!--        v-model:visible="editDialogVisible"-->
<!--        @close="editDialogClosed"-->
<!--        width="50%"-->
<!--    >-->
<!--      <el-form-->
<!--          ref="editFormRef"-->
<!--          :model="editForm"-->
<!--          :rules="editFormRules"-->
<!--          label-width="100px"-->
<!--      >-->
<!--        <el-form-item :label="textTitle" prop="attr_name">-->
<!--          <el-input v-model="editForm.attr_name"></el-input>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      <div slot="footer">-->
<!--        <el-button @click="editDialogVisible = false">取 消</el-button>-->
<!--        <el-button type="primary" @click="editParams">确 定</el-button>-->
<!--      </div>-->
<!--    </el-dialog>-->
  </div>
</template>

<script setup>
import useHttp from '@/hooks/useHttp.js'
import { getCategories, getCategoryParams } from '@/apis/category.js'
import { ref, computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'

const { tableData, queryData } = useHttp(getCategories)

const cateProps = ref({
  expandTrigger: 'hover',
  value: 'cat_id',
  label: 'cat_name',
  children: 'children'
})
const selectCateKeys = ref([])
const activeName = ref('many')
const manyTableData = ref([])
const onlyTableData = ref([])
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

const cateId = computed(() => selectCateKeys.value.length === 3 ? selectCateKeys.value[2] : null)
const isBtnDisabled = computed(() => selectCateKeys.value.length !== 3)

const getParamsData = async () => {
  if (selectCateKeys.value.length !== 3) {
    selectCateKeys.value = []
    manyTableData.value = []
    onlyTableData.value = []
    ElMessage.error('此选项不是三级分类')
    return
  }
  const res = await getCategoryParams(cateId.value, { sel: activeName.value })
  if (res.meta.status !== 200) {
    ElMessage.error(res.meta.msg)
    return
  }
  console.log(res)
  res.data.forEach(item => {
    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
    // 每一行控制是否按钮和文本框输入
    item.inputVisible = false
    item.inputValue = ''
  })
  if (activeName.value === 'many') {
    manyTableData.value = res.data
  } else {
    onlyTableData.value = res.data
  }
}

const handleTabClick = (tab) => {
  activeName.value = tab.props.name
  getParamsData()
}

const showAddDialog = () => {
  addDialogVisible.value = true
}
const getCategoryList = async () => {
  await queryData()
}

getCategoryList()

</script>

<style lang="scss" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
