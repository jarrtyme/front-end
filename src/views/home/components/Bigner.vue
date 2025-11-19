<template>
  <div class="bigner-wrapper">
    <div v-for="(item, index) in items" :key="item.id || item.url || index" class="bigner-item">
      <img :src="item.url" :alt="item.originalName || `Image ${index + 1}`" />
    </div>
  </div>
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
.bigner-wrapper {
  margin: var(--mgm-gap) auto;
}
.bigner-item {
  height: var(--content-height);
  width: 100%;
  margin-bottom: var(--gutter-width);
  overflow: hidden;
  position: relative;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
}
</style>
