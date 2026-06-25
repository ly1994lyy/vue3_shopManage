<script setup lang="ts">
import { ArrowForwardOutline, FingerPrintOutline, SparklesOutline } from '@vicons/ionicons5'
import { NButton, NCard, NForm, NFormItem, NIcon, NInput, useMessage } from 'naive-ui'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { resolveErrorMessage } from '@/utils/error-message'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()
const loading = ref(false)
const { t } = useI18n()

const form = reactive({
  account: 'admin',
  password: '123456'
})

async function handleLogin() {
  if (loading.value) return

  loading.value = true

  try {
    await authStore.login(form)
    router.push(String(route.query.redirect || '/dashboard'))
  } catch (error) {
    message.error(resolveErrorMessage(error, 'errors.unknown'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div class="absolute left-[-8rem] top-[-8rem] h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
    <div class="absolute bottom-[-10rem] right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/25 blur-3xl" />
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,.9),rgba(2,6,23,.96))]" />

    <section class="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-8 py-12 lg:grid-cols-[1.08fr_.92fr]">
      <div>
        <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-indigo-100 backdrop-blur">
          <NIcon :component="SparklesOutline" />
          {{ t('auth.badge') }}
        </div>
        <h1 class="max-w-3xl text-6xl font-black leading-[1.02] tracking-tight md:text-7xl">
          {{ t('auth.title') }}
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          {{ t('auth.description') }}
        </p>

        <div class="mt-10 grid max-w-2xl grid-cols-3 gap-4">
          <div class="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p class="text-3xl font-bold">Multi</p>
            <p class="mt-1 text-sm text-slate-300">{{ t('auth.stats.tenant') }}</p>
          </div>
          <div class="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p class="text-3xl font-bold">RBAC</p>
            <p class="mt-1 text-sm text-slate-300">{{ t('auth.stats.rbac') }}</p>
          </div>
          <div class="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p class="text-3xl font-bold">SaaS</p>
            <p class="mt-1 text-sm text-slate-300">{{ t('auth.stats.saas') }}</p>
          </div>
        </div>
      </div>

      <NCard class="!rounded-[2rem] !border-white/20 !bg-white/90 !shadow-glow dark:!bg-slate-900/90" :bordered="false">
        <div class="mb-8 flex items-center gap-4">
          <div class="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <NIcon size="26" :component="FingerPrintOutline" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-950 dark:text-white">{{ t('auth.welcome') }}</h2>
            <p class="text-sm text-slate-500">{{ t('auth.loginTip') }}</p>
          </div>
        </div>

        <NForm size="large" :model="form">
          <NFormItem :label="t('auth.account')">
            <NInput v-model:value="form.account" :placeholder="t('auth.accountPlaceholder')" />
          </NFormItem>
          <NFormItem :label="t('auth.password')">
            <NInput v-model:value="form.password" type="password" show-password-on="click" :placeholder="t('auth.passwordPlaceholder')" />
          </NFormItem>
          <NButton type="primary" size="large" block strong class="!mt-2 !h-12" :loading="loading" @click="handleLogin">
            {{ t('auth.submit') }}
            <template #icon>
              <NIcon :component="ArrowForwardOutline" />
            </template>
          </NButton>
        </NForm>

        <p class="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {{ t('auth.demoTip') }}
        </p>
      </NCard>
    </section>
  </main>
</template>
