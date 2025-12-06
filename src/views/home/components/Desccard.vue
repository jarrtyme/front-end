<template>
  <div class="desc-card">
    <div
      v-for="(item, index) in items"
      :key="item.id || item.url || index"
      class="default-item"
      :class="{ clickable: isClickable(item) }"
      @click="handleItemClick(item)"
    >
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
import { useRouter } from 'vue-router'
import MediaItem from '@/components/MediaItem.vue'
import { handleItemClick as handleItemClickUtil } from '@/utils/linkHandler'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  // 组件级别的链接
  link: {
    type: String,
    default: ''
  }
})

const router = useRouter()

// 判断是否可点击
const isClickable = item => {
  return !!(item?.clothingId || item?.link || props.link)
}

// 处理点击事件
const handleItemClick = item => {
  handleItemClickUtil(item, props.link, router)
}
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

  &.clickable {
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
