<template>
  <el-footer>
    <slot>
      <div class="footer-content">
        <h3>风格，是最后的避难所。</h3>
        <h3>记录属于你的审美轨迹。</h3>
        <h3>为每一个平凡的日子，披上战袍。</h3>
        <h3>你的日常，值得被郑重对待。</h3>
        <br>
        <!-- <h4>再次探索 | 灵感集 | 我们的故事 | 保持联系 | 隐私承诺 | 服务约定</h4> -->
        <h5>© 2024 OOTD Diary. 所有未表达的自我，终将在风格中找到归宿。</h5>
      </div>
    </slot>
  </el-footer>
</template>

<script setup></script>

<style lang="scss" scoped>
.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.footer-content h3 {
  font-weight: 600;
  color: #333;
}

.footer-content h5 {
  color: #666;
}
</style>
