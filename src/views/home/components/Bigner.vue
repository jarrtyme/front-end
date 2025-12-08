<template>
  <div class="bigner-wrapper">
    <div
      v-for="(item, index) in items"
      :key="item.id || item.url || index"
      class="bigner-item"
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
  return !!(item?.link || props.link)
}

// 处理点击事件
const handleItemClick = item => {
  handleItemClickUtil(item, props.link, router)
}
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

  &.clickable {
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
