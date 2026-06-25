<script setup lang="ts">
defineProps<{
  title: string
  value: string
  trend: string
  tone?: 'indigo' | 'emerald' | 'amber' | 'rose'
}>()

const toneClass = {
  indigo: 'from-indigo-500 to-violet-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500'
}
</script>

<template>
  <div class="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-glow dark:border-slate-700/70 dark:bg-slate-900/70">
    <div class="absolute right-5 top-5 h-20 w-20 rounded-full bg-gradient-to-br opacity-10 blur-xl" :class="toneClass[tone || 'indigo']" />
    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ title }}</p>
    <div class="mt-4 flex items-end justify-between gap-4">
      <strong class="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{{ value }}</strong>
      <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">{{ trend }}</span>
    </div>
  </div>
</template>
