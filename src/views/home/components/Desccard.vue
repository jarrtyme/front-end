<template>
  <div class="desc-card">
    <template v-for="item in items">
      <div class="default-item" :style="{ backgroundImage: `url(${item.url})` }"></div>
    </template>
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
.desc-card {
  display: grid;
  grid-gap: var(--gutter-width);
  grid-template-columns: repeat(var(--columns), 1fr);
  width: calc(
    100% - var(--double-edge-border-width) - var(--safe-area-inset-lt) - var(--safe-area-inset-rt)
  );
  left: calc(var(--edge-border-width) + var(--safe-area-inset-lt));
  margin: 0 auto;
  margin-bottom: var(--gutter-width);
}

.default-item {
  height: var(--content-height);
  width: 100%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
