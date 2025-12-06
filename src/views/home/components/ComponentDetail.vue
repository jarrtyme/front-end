<template>
  <section class="component-detail">
    <article
      v-for="(item, index) in items"
      :key="item.id || item.media?.url || item.url || index"
      class="detail-card"
      :class="{ clickable: isClickable(item) }"
      @click="handleItemClick(item)"
    >
      <div v-if="hasMedia(item)" class="media-wrapper">
        <MediaItem
          :item="formatMediaItem(item)"
          :alt-text="`detail-media-${index + 1}`"
          :video-muted="true"
          :video-loop="true"
          :video-autoplay="true"
          :video-show-controls="false"
        />
      </div>
      <div class="detail-content">
        <slot name="header" :item="item" :index="index">
          <p v-if="getPrimaryText(item)" class="primary-text">
            {{ getPrimaryText(item) }}
          </p>
        </slot>
        <slot name="descriptions" :item="item" :index="index">
          <ul v-if="getDescriptionList(item).length" class="desc-list">
            <li v-for="(desc, descIndex) in getDescriptionList(item)" :key="descIndex">
              {{ desc }}
            </li>
          </ul>
        </slot>
        <slot name="extra" :item="item" :index="index" />
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MediaItem from '@/components/MediaItem.vue'
import { handleItemClick as handleItemClickUtil } from '@/utils/linkHandler'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  link: {
    type: String,
    default: ''
  },
  linkText: {
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

const hasMedia = item => {
  return Boolean(item?.media?.url || item?.url)
}

const formatMediaItem = item => {
  if (!item) return {}
  return {
    url: item.media?.url || item.url || '',
    type: item.media?.type || item.type || 'image',
    filename: item.media?.filename || item.name || ''
  }
}

const normalizeDescriptions = item => {
  if (!item) return []
  const descriptions = item.descriptions || item.des || []
  if (!Array.isArray(descriptions)) return []
  return descriptions
    .map(desc => {
      if (typeof desc === 'string') return desc.trim()
      if (desc && typeof desc.text === 'string') return desc.text.trim()
      return ''
    })
    .filter(Boolean)
}

const getPrimaryText = item => {
  return normalizeDescriptions(item)[0] || item.name || item.media?.filename || ''
}

const getDescriptionList = item => {
  const list = normalizeDescriptions(item)
  if (list.length <= 1) return []
  return list.slice(1)
}

const items = computed(() => props.items || [])
const link = computed(() => props.link || '')
const linkText = computed(() => props.linkText || '')
</script>

<style lang="scss" scoped>
.component-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: min(1200px, 100%);
  margin: 40px auto;
  padding: 0 16px;
}

.detail-card {
  display: flex;
  gap: 24px;
  padding: 24px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(4px);
  flex-wrap: wrap;

  &.clickable {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
    }
  }
}

.media-wrapper {
  flex: 1 1 320px;
  min-width: 280px;
  max-width: 480px;
  border-radius: 12px;
  overflow: hidden;
}

.detail-content {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  color: #f5f5f5;
}

.primary-text {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.5;
  margin: 0;
}

.desc-list {
  padding-left: 20px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #dcdcdc;
}

.detail-link {
  text-align: right;
  padding: 0 24px;
}

@media (max-width: 768px) {
  .detail-card {
    padding: 16px;
  }

  .media-wrapper,
  .detail-content {
    flex: 1 1 100%;
  }
}
</style>
