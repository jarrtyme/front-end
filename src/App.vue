<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="keepAliveRoutes">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { useSrcean } from '@/hooks/useSrcean'
const { scale } = useSrcean()

watch(
  scale,
  value => {
    if (document?.body) {
      document.body.style.zoom = value
    }
  },
  { immediate: true }
)

// 自动导入：computed, useRoute, useRouter 等 API 已自动导入，无需手动 import

const route = useRoute()
const router = useRouter()

const activeIndex = computed(() => route.path)

// 需要缓存的路由组件名称列表
const keepAliveRoutes = computed(() => {
  return router
    .getRoutes()
    .filter(r => r.meta?.keepAlive)
    .map(r => r.name)
    .filter(Boolean)
})
</script>

<style lang="scss"></style>
