<script setup lang="ts">
import { NButton } from 'naive-ui'
import type { ButtonProps } from 'naive-ui'
import type { PermissionCode } from '@/router/menus'
import { usePermissionStore } from '@/stores/permission.store'

const props = defineProps<{
  permission: PermissionCode
  type?: ButtonProps['type']
  size?: ButtonProps['size']
  strong?: boolean
}>()

const permissionStore = usePermissionStore()
</script>

<template>
  <NButton v-if="permissionStore.hasPermission(permission)" :type="props.type" :size="props.size" :strong="props.strong">
    <slot />
  </NButton>
</template>
