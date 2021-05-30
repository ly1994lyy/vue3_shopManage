<template>
  <el-container style="height:100vh">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>Vue3.0商城后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          router
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="$route.path"
        >
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template v-slot:title>
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template v-slot:title>
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { ref, defineComponent, getCurrentInstance, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMenu } from '@/api/home'

export default defineComponent({
  name: 'Home',
  setup () {
    const { ctx } = getCurrentInstance()
    const menuList = ref([])
    const iconObj = ref({
      125: 'iconfont icon-icon_user',
      103: 'iconfont icon-tijikongjian',
      101: 'iconfont icon-shangpin',
      102: 'iconfont icon-danju',
      145: 'iconfont icon-baobiao'
    })
    const isCollapse = ref(false)
    const router = useRouter()

    const logout = () => {
      window.sessionStorage.clear()
      router.push('/login')
    }
    const getMenuList = async () => {
      const { data } = await getMenu()
      if (data.meta.status === 200) {
        menuList.value = data.data
      }
    }
    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value
    }

    onMounted(() => {
      getMenuList()
    })
    return {
      menuList,
      iconObj,
      isCollapse,
      logout,
      toggleCollapse,
      getMenuList
    }
  }
})
</script>

<style lang="scss" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
  img {
    width: 50px;
    height: 50px;
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
