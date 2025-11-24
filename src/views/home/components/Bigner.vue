<template>
  <div class="bigner-wrapper">
    <div v-for="(item, index) in items" :key="item.id || item.url || index" class="bigner-item">
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
.bigner-wrapper {
  margin: var(--mgm-gap) auto;
}
.bigner-item {
  height: var(--content-height);
  width: 100%;
  margin-bottom: var(--gutter-width);
  overflow: hidden;
  position: relative;
}
</style>
