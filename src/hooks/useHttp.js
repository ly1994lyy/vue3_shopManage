import { ref } from 'vue'

const useHttp = (http, isResObj) => {
  const tableData = ref([])
  const loading = ref(false)
  const resInfo = ref({})
  const total = ref(0)

  const queryData = async (params, keyName) => {
    try {
      loading.value = true
      let res
      if (params) {
        res = await http(params)
      } else {
        res = await http()
      }
      if (isResObj) {
        resInfo.value = res.data
      } else {
        tableData.value = res.data.data[keyName]
        total.value = Number(res.data.data.total)
      }
    } catch (e) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  return {
    tableData,
    loading,
    resInfo,
    total,
    queryData
  }
}

export default useHttp
