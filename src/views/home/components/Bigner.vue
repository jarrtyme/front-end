<template>
  <template v-for="item in items">
    <div class="bigner-item" :style="{ backgroundImage: `url(${item.url})` }"></div>
  </template>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>

<style lang="scss" scoped>
.bigner-item {
  height: var(--content-height);
  width: 100%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  margin-bottom: var(--gutter-width);
}
</style>
