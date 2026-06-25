<script setup lang="ts">
import { darkTheme, dateZhCN, lightTheme, NConfigProvider, NMessageProvider, zhCN } from 'naive-ui'
import { useAppStore } from './stores/app.store'

const appStore = useAppStore()
</script>

<template>
  <NConfigProvider
    :theme="appStore.isDark ? darkTheme : lightTheme"
    :locale="zhCN"
    :date-locale="dateZhCN"
    class="min-h-screen"
  >
    <NMessageProvider>
      <RouterView />
    </NMessageProvider>
  </NConfigProvider>
</template>
