<template>
  <div class="desc-card">
    <div v-for="(item, index) in items" :key="item.id || item.url || index" class="default-item">
      <MediaItem
        :item="item"
        :alt-text="`Image ${index + 1}`"
        video-height="var(--content-height)"
        :video-muted="true"
        :video-loop="true"
        :video-autoplay="true"
        :video-show-controls="false"
      />
    </div>
  </div>
</template>

<script setup>
import MediaItem from '@/components/MediaItem.vue'

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
  margin: var(--mgm-gap) auto;
}

.default-item {
  height: var(--content-height);
  width: 100%;
  overflow: hidden;
  position: relative;
}
</style>
