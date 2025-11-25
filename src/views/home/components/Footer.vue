<template>
  <el-footer>
    <div class="footer-content">
      <component
        v-for="(line, index) in footerLines"
        :is="index !== footerLines.length - 1 ? 'h3' : 'p'"
        :key="index"
      >
        {{ line }}
      </component>
    </div>
    <div>
      <p>
        1.于2025年春季系列中使用试生产的80支双股长绒棉牛津纺面料（经纬向密度均为120根/英寸）进行了此项评估。该面料均配置天然母贝纽扣与强化袖口衬里。抗皱性能依据在模拟8小时办公场景下（包括伏案打字、手臂屈伸及通勤乘坐等系列动作）的折痕恢复率进行评估。实际抗皱表现依具体穿着习惯和坐姿的不同可能有所差异。
      </p>
      <p>
        2.版型稳定性测试，在经过30次标准工业水洗后，通过测量肩宽、胸围及衣长等关键尺寸的缩水率得出。所有评估样品在制成前均经过预缩水处理。测试结果表明，该80支双股面料各关键部位缩水率均稳定在1.2%以内。版型持久度依洗涤频率、水温及护理方式的不同可能有所差异。
      </p>
      <p>
        3.领部挺括度测试，使用内置0.3厘米厚可弯曲定型衬，在25°C、相对湿度50%的环境下，评估其经历8小时穿着后的形态保持能力。领尖采用0.4厘米厚度的加强设计，以确保立体感。实际挺括效果可能因个人颈部活动频率及习惯而有所不同。
      </p>
      <p>
        4.缝纫工艺说明，肩线与袖笼连接处采用双线链式缝法，其线迹密度为每3厘米10-12针。门襟处采用2.5厘米宽度的暗线压缝工艺，缝份为1厘米。工艺耐久性依使用强度与护理情况的不同可能有所差异。
      </p>
      <p>
        5.与使用标准40支纯棉面衬衫相比，在同等测试条件下，80支双股长绒棉面料在触感细腻度与表面光泽度的主观盲测中，偏好度分别高出65%与58%。
      </p>
      <p>
        6.所有展示产品在拍摄时均经过专业熨烫，光照条件为5600K色温恒光灯，相机设置为f/8光圈，1/125秒快门速度。产品最终颜色与质感可能因显示设备的不同而有所差异，请以实物为准。
      </p>
      <p>
        7.关于尺码选择，请参考我们提供的厘米制详细尺码表。建议对比您现有的、穿着感受最合身的同类衣物进行测量比对。合身度依个人体型与穿着偏好不同可能有所差异，详情请参阅品牌官方网站的尺码指南与试穿报告。
      </p>
      <p>© 2024 OOTD Rebellion. Your Style, Your Echo.</p>
    </div>
  </el-footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  link: {
    type: String,
    default: ''
  }
})

const DEFAULT_LINES = [
  '风格，是最后的避难所',
  '记录属于你的审美轨迹',
  '为每一个平凡的日子，披上战袍',
  '你的日常，值得被郑重对待'
]
const DEFAULT_SIGNATURE = '© 2024 OOTD Rebellion. Your Style, Your Echo.'

const extractDescriptions = item => {
  if (!item) return []
  const list = Array.isArray(item.descriptions) ? item.descriptions : item.des || []
  return list.map(desc => (typeof desc === 'string' ? desc : desc?.text)).filter(Boolean)
}

const footerLines = computed(() => {
  const firstItem = props.items?.[0]
  const descriptions = extractDescriptions(firstItem)
  if (descriptions.length > 0) {
    return descriptions
  }
  const fallbackName = firstItem?.name || firstItem?.media?.filename
  return fallbackName ? [fallbackName] : DEFAULT_LINES
})

const footerSignature = computed(() => props.items?.[0]?.media?.filename || DEFAULT_SIGNATURE)
const displayLink = computed(() => props.link || props.items?.[0]?.media?.url || '')
const displayLinkText = computed(() => props.items?.[0]?.media?.filename || '了解更多')
</script>

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

.footer-link {
  margin-top: 8px;
}
</style>
