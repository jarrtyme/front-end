<template>
  <template v-for="(item, index) in list" :key="index">
    <el-descriptions
      :title="item.title"
      :column="item.column || 4"
      :size="item.size || 'default'"
      :direction="item.direction || 'vertical'"
      :style="item.style"
    >
      <el-descriptions-item
        v-for="(descItem, descIndex) in item.items"
        :key="descIndex"
        :label="descItem.label"
        :span="descItem.span"
      >
        <el-tag v-if="descItem.component === 'el-tag'" :size="descItem.props?.size || 'default'">
          {{ descItem.content }}
        </el-tag>
        <template v-else>{{ descItem.content }}</template>
      </el-descriptions-item>
    </el-descriptions>
  </template>
</template>

<script setup>
defineOptions({
  name: 'DescriptionsList'
})

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
})
</script>

<style lang="scss" scoped>
// DescriptionsList 样式可以在这里添加
</style>
