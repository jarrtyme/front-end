<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
      </div>
    </template>
    <div class="content">
      <h1>{{ appInfo }}</h1>
      <p>{{ description }}</p>
      <el-button type="primary" @click="handleClick">{{ buttonText }}</el-button>
    </div>
  </el-card>
</template>

<script setup>
defineOptions({
  name: 'WelcomeCard'
})

const props = defineProps({
  title: {
    type: String,
    default: '欢迎'
  },
  appInfo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: '这是一个使用 Vue3 + Pinia + Element Plus + Vite + Sass 搭建的官网项目'
  },
  buttonText: {
    type: String,
    default: '点击测试'
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.content {
  text-align: center;
  padding: 20px;

  h1 {
    color: $primary-color;
    margin-bottom: 20px;
  }

  p {
    color: $text-color;
    margin-bottom: 20px;
  }
}
</style>
