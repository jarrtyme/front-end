<template>
  <div class="clothing-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>服装管理</span>
          <div>
            <el-button type="primary" @click="handleCreate" :icon="Plus"> 新增服装 </el-button>
            <el-button type="info" @click="loadStats" :loading="statsLoading" :icon="DataAnalysis">
              统计信息
            </el-button>
            <el-button @click="loadClothingList" :loading="loading" :icon="Refresh">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入货号进行搜索"
          clearable
          @input="handleSearch"
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 服装表格 -->
      <el-table
        v-loading="loading"
        :data="filteredClothingList"
        stripe
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无服装数据'"
      >
        <el-table-column prop="itemNumber" label="货号" width="120" fixed="left"> </el-table-column>

        <el-table-column label="图片" width="120" align="center">
          <template #default="{ row }">
            <div v-if="getImageListFromRow(row).length > 0" class="table-images">
              <el-image
                :src="getImageUrl(getImageListFromRow(row)[0])"
                :preview-src-list="getImageListFromRow(row).map(img => getImageUrl(img))"
                fit="cover"
                style="width: 60px; height: 60px; border-radius: 4px"
                :lazy="true"
                :preview-teleported="true"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div v-if="getImageListFromRow(row).length > 1" class="image-count">
                共{{ getImageListFromRow(row).length }}张
              </div>
            </div>
            <span v-else class="no-image">无图片</span>
          </template>
        </el-table-column>

        <el-table-column label="价格信息" width="150">
          <template #default="{ row }">
            <div>进价: ¥{{ row.purchasePrice }}</div>
            <div>售价: ¥{{ row.sellingPrice }}</div>
          </template>
        </el-table-column>

        <el-table-column label="尺寸信息" width="120">
          <template #default="{ row }">
            <div v-if="row.lengthOrWaist || row.bustOrInseam">
              <div v-if="row.lengthOrWaist">长/腰: {{ row.lengthOrWaist }}</div>
              <div v-if="row.bustOrInseam">胸/内: {{ row.bustOrInseam }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="库存信息" width="150">
          <template #default="{ row }">
            <div>进货: {{ row.purchaseQuantity }}</div>
            <div>补货: {{ row.restockQuantity || 0 }}</div>
            <div>
              剩余:
              <span :style="{ color: row.remainingQuantity <= 5 ? 'red' : 'inherit' }">{{
                row.remainingQuantity
              }}</span>
            </div>
            <div>已售: {{ row.soldQuantity || 0 }}</div>
          </template>
        </el-table-column>

        <el-table-column label="成本信息" width="120">
          <template #default="{ row }">
            <div>运费: ¥{{ row.shippingCost || 0 }}</div>
            <div>退运费: ¥{{ row.returnCost || 0 }}</div>
          </template>
        </el-table-column>

        <el-table-column label="利润" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.profit >= 0 ? 'green' : 'red', fontWeight: 'bold' }">
              ¥{{ formatNumber(row.profit || 0) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="绑定页面" width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.pageId" type="success" size="small">
              {{ getBoundPageName(row) }}
            </el-tag>
            <span v-else style="color: #909399">未绑定</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="380" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" size="small" :icon="Plus" @click="handleRestock(row)">
              补货
            </el-button>
            <el-button type="warning" size="small" :icon="Link" @click="handleBindPages(row)">
              绑定页面
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDelete(row)"
              :loading="deletingRow === row._id"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination" v-if="filteredClothingList.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="getPageSizeOptions('standard')"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <ModernDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :close-on-click-modal="false"
      confirm-text="确定"
      :confirm-loading="submitting"
      @confirm="handleSubmit"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="货号" prop="itemNumber">
              <el-input v-model="formData.itemNumber" placeholder="请输入货号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="商品图片" prop="imageUrl">
              <div class="image-upload-container">
                <FileUpload
                  ref="uploadRef"
                  file-type="image"
                  :max-size="100"
                  :max-count="10"
                  :multiple="true"
                  :drag="false"
                  list-type="picture-card"
                  :file-list="imageFileList"
                  :show-file-list="false"
                  upload-text="点击上传图片<br />最多10张，单张最大100MB"
                  @success="handleImageUploadSuccess"
                  @error="handleImageUploadError"
                  @remove="handleRemoveImage"
                />
              </div>
              <div class="image-preview-list" v-if="uploadedImages.length > 0">
                <div
                  v-for="(img, index) in uploadedImages"
                  :key="`uploaded-img-${index}-${img}`"
                  class="image-preview-item"
                >
                  <el-image
                    :src="getImageUrl(img)"
                    :preview-src-list="uploadedImages.map(i => getImageUrl(i))"
                    fit="cover"
                    style="width: 100px; height: 100px; border-radius: 4px"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="image-actions">
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                      circle
                      @click="removeUploadedImage(index)"
                    />
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="进货价" prop="purchasePrice">
              <el-input-number
                v-model="formData.purchasePrice"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入进货价"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="售卖价" prop="sellingPrice">
              <el-input-number
                v-model="formData.sellingPrice"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入售卖价"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="衣长/腰围" prop="lengthOrWaist">
              <el-input-number
                v-model="formData.lengthOrWaist"
                :min="0"
                style="width: 100%"
                placeholder="衣长或腰围"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="胸围/内长" prop="bustOrInseam">
              <el-input-number
                v-model="formData.bustOrInseam"
                :min="0"
                style="width: 100%"
                placeholder="胸围或内长"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="进货件数" prop="purchaseQuantity">
              <el-input-number
                v-model="formData.purchaseQuantity"
                :min="0"
                :precision="0"
                style="width: 100%"
                placeholder="请输入进货件数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="剩余件数" prop="remainingQuantity">
              <el-input-number
                v-model="formData.remainingQuantity"
                :min="0"
                :precision="0"
                style="width: 100%"
                placeholder="请输入剩余件数"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="运费" prop="shippingCost">
              <el-input-number
                v-model="formData.shippingCost"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入运费"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退货运费" prop="returnCost">
              <el-input-number
                v-model="formData.returnCost"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入退货运费"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="绑定页面">
              <el-select
                v-model="formData.pageId"
                filterable
                clearable
                placeholder="请选择页面（只能绑定一个）"
                style="width: 100%"
                :loading="pageListLoading"
                @focus="loadPageListForSelect"
              >
                <el-option
                  v-for="page in availablePages"
                  :key="page._id"
                  :label="page.name"
                  :value="page._id"
                  :disabled="!page.isActive"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center">
                    <span>{{ page.name }}</span>
                    <div style="display: flex; gap: 8px; align-items: center">
                      <el-tag :type="page.isActive ? 'success' : 'danger'" size="small">
                        {{ page.isActive ? '启用' : '禁用' }}
                      </el-tag>
                      <el-tag :type="page.isPublished ? 'primary' : 'info'" size="small">
                        {{ page.isPublished ? '已发布' : '未发布' }}
                      </el-tag>
                    </div>
                  </div>
                </el-option>
              </el-select>
              <div style="font-size: 12px; color: #909399; margin-top: 5px">
                绑定的页面将用于展示该服装（只能绑定一个页面）
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </ModernDialog>

    <!-- 补货对话框 -->
    <ModernDialog
      v-model="restockDialogVisible"
      title="补货"
      width="400px"
      :close-on-click-modal="false"
      confirm-text="确定"
      :confirm-loading="restocking"
      @confirm="handleRestockSubmit"
    >
      <el-form
        ref="restockFormRef"
        :model="restockFormData"
        :rules="restockFormRules"
        label-width="100px"
      >
        <el-form-item label="货号">
          <el-input v-model="restockFormData.itemNumber" disabled />
        </el-form-item>
        <el-form-item label="补货数量" prop="quantity">
          <el-input-number
            v-model="restockFormData.quantity"
            :min="1"
            :precision="0"
            style="width: 100%"
            placeholder="请输入补货数量"
          />
        </el-form-item>
      </el-form>
    </ModernDialog>

    <!-- 统计信息对话框 -->
    <ModernDialog v-model="statsDialogVisible" title="库存统计">
      <template #footer>
        <div></div>
      </template>
      <el-descriptions :column="2" border v-if="statsData">
        <el-descriptions-item label="总商品数">
          {{ statsData.totalItems }}
        </el-descriptions-item>
        <el-descriptions-item label="总进货量">
          {{ statsData.totalPurchaseQuantity }}
        </el-descriptions-item>
        <el-descriptions-item label="总剩余量">
          <span :style="{ color: statsData.totalRemainingQuantity <= 10 ? 'red' : 'inherit' }">
            {{ statsData.totalRemainingQuantity }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="总已售量">
          {{ statsData.totalSoldQuantity }}
        </el-descriptions-item>
        <el-descriptions-item label="总成本" :span="2">
          ¥{{ formatNumber(statsData.totalCost || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="总收入" :span="2">
          ¥{{ formatNumber(statsData.totalRevenue || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="总利润" :span="2">
          <span
            :style="{
              color: statsData.totalProfit >= 0 ? 'green' : 'red',
              fontWeight: 'bold',
              fontSize: '18px'
            }"
          >
            ¥{{ formatNumber(statsData.totalProfit || 0) }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </ModernDialog>

    <!-- 绑定页面对话框 -->
    <ModernDialog
      v-model="bindPageDialogVisible"
      title="绑定页面"
      width="600px"
      :close-on-click-modal="false"
      confirm-text="确定"
      :confirm-loading="bindingPage"
      @confirm="handleBindPageSubmit"
    >
      <div v-loading="loadingBoundPage">
        <div style="margin-bottom: 20px">
          <el-input
            v-model="pageSearchKeyword"
            placeholder="搜索页面名称"
            clearable
            style="width: 100%"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select
          v-model="selectedPageId"
          filterable
          clearable
          placeholder="请选择页面（只能绑定一个）"
          style="width: 100%"
          :loading="pageListLoading"
        >
          <el-option
            v-for="page in filteredAvailablePages"
            :key="page._id"
            :label="page.name"
            :value="page._id"
            :disabled="!page.isActive"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ page.name }}</span>
              <div style="display: flex; gap: 8px; align-items: center">
                <el-tag :type="page.isActive ? 'success' : 'danger'" size="small">
                  {{ page.isActive ? '启用' : '禁用' }}
                </el-tag>
                <el-tag :type="page.isPublished ? 'primary' : 'info'" size="small">
                  {{ page.isPublished ? '已发布' : '未发布' }}
                </el-tag>
              </div>
            </div>
          </el-option>
        </el-select>
        <div v-if="currentBoundPage" style="margin-top: 20px">
          <div style="font-weight: 600; margin-bottom: 10px">当前已绑定的页面：</div>
          <el-tag style="margin-bottom: 8px" closable @close="removeBoundPage">
            {{ currentBoundPage.name }}
          </el-tag>
        </div>
      </div>
    </ModernDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  createClothing,
  findClothing,
  updateClothing,
  removeClothing,
  restockClothing,
  getClothingStats,
  bindPage,
  getBoundPage
} from '@/api/clothing'
import { getPageList } from '@/api/page'
import FileUpload from '@/components/FileUpload.vue'
import { getFullPageUrl } from '@/utils/pageUtils'

const router = useRouter()
import {
  Search,
  Refresh,
  Delete,
  Edit,
  Plus,
  Picture,
  DataAnalysis,
  Link
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ModernDialog from '@/components/ModernDialog.vue'
import {
  extractImageUrls,
  extractImageUrlFromFile,
  isValidUploadResponse
} from '@/utils/uploadHelper'
import { getPageSizeOptions } from '@/config/pagination'

// 响应式数据
const clothingList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const deletingRow = ref(null)
const submitting = ref(false)
const restocking = ref(false)
const statsLoading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增服装')
const isEdit = ref(false)
const currentEditId = ref(null) // 当前编辑的服装ID
const formRef = ref(null)
const uploadRef = ref(null)
const formData = ref({
  itemNumber: '',
  imageUrl: '',
  purchasePrice: 0,
  sellingPrice: 0,
  lengthOrWaist: 0,
  bustOrInseam: 0,
  purchaseQuantity: 0,
  remainingQuantity: 0,
  shippingCost: 0,
  returnCost: 0,
  pageId: null
})

// 图片上传相关
const imageFileList = ref([])
const uploadedImages = ref([]) // 已上传的图片路径数组

// 图片上传成功
const handleImageUploadSuccess = async (response, file) => {
  try {
    if (!isValidUploadResponse(response)) {
      return
    }

    // 提取所有图片URL（支持单文件和多文件上传）
    const imageUrls = extractImageUrls(response)

    if (imageUrls.length === 0) {
      ElMessage.warning('未获取到上传的图片URL')
      return
    }

    // 添加到已上传列表（去重）
    const newUrls = [...uploadedImages.value]
    imageUrls.forEach(url => {
      if (url && !newUrls.includes(url)) {
        newUrls.push(url)
      }
    })

    // 检查是否超过最大数量限制
    if (newUrls.length > 10) {
      ElMessage.warning('图片数量不能超过10张，已自动截取前10张')
      newUrls.splice(10)
    }

    // 使用新数组触发响应式更新
    uploadedImages.value = newUrls

    // 显示成功消息
    const fileCount = Array.isArray(file) ? file.length : 1
    const message =
      response.message || (fileCount > 1 ? `成功上传 ${fileCount} 张图片` : '图片上传成功')
    ElMessage.success(message)

    // 更新 file-list（从上传组件获取）
    if (uploadRef.value && uploadRef.value.uploadRef) {
      imageFileList.value = uploadRef.value.uploadRef.fileList || []
    }
  } catch (error) {
    console.error('处理上传结果失败:', error)
    ElMessage.error('处理上传结果失败: ' + (error.message || '未知错误'))
  }
}

// 图片上传失败
const handleImageUploadError = () => {
  ElMessage.error('图片上传失败')
}

// 补货对话框
const restockDialogVisible = ref(false)
const restockFormRef = ref(null)
const restockFormData = ref({
  id: '',
  itemNumber: '',
  quantity: 1
})

// 统计信息对话框
const statsDialogVisible = ref(false)
const statsData = ref(null)

// 绑定页面对话框相关
const bindPageDialogVisible = ref(false)
const bindingPage = ref(false)
const loadingBoundPage = ref(false)
const currentBindClothingId = ref(null)
const currentBoundPage = ref(null)
const availablePages = ref([])
const pageListLoading = ref(false)
const pageSearchKeyword = ref('')
const selectedPageId = ref(null)

// 表单验证规则
const formRules = {
  itemNumber: [{ required: true, message: '请输入货号', trigger: 'blur' }],
  purchasePrice: [
    { required: true, message: '请输入进货价', trigger: 'blur' },
    { type: 'number', min: 0, message: '进货价必须大于等于0', trigger: 'blur' }
  ],
  sellingPrice: [
    { required: true, message: '请输入售卖价', trigger: 'blur' },
    { type: 'number', min: 0, message: '售卖价必须大于等于0', trigger: 'blur' }
  ],
  purchaseQuantity: [
    { required: true, message: '请输入进货件数', trigger: 'blur' },
    { type: 'number', min: 0, message: '进货件数必须大于等于0', trigger: 'blur' }
  ],
  remainingQuantity: [
    { required: true, message: '请输入剩余件数', trigger: 'blur' },
    { type: 'number', min: 0, message: '剩余件数必须大于等于0', trigger: 'blur' }
  ]
}

const restockFormRules = {
  quantity: [
    { required: true, message: '请输入补货数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '补货数量必须大于0', trigger: 'blur' }
  ]
}

// 计算属性：过滤后的服装列表
const filteredClothingList = computed(() => {
  let filtered = clothingList.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item => item.itemNumber?.toLowerCase().includes(keyword))
  }

  return filtered
})

// 从行数据中获取图片列表（支持逗号分隔）
const getImageListFromRow = row => {
  if (!row.imageUrl) return []
  return row.imageUrl
    .split(',')
    .map(path => path.trim())
    .filter(path => path)
}

// 获取图片完整 URL
const getImageUrl = url => {
  if (!url) return ''
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url
  }
  if (typeof url === 'object') {
    return url.url || url.path || ''
  }
  return url
}

// 格式化数字（保留两位小数）
const formatNumber = num => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(2)
}

// 格式化日期
const formatDate = dateString => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取绑定的页面名称
const getBoundPageName = row => {
  if (!row.pageId) return ''
  if (typeof row.pageId === 'object' && row.pageId.name) {
    return row.pageId.name
  }
  return '已绑定'
}

// 加载服装列表
const loadClothingList = async () => {
  loading.value = true
  try {
    const response = await findClothing({
      page: currentPage.value,
      limit: pageSize.value
    })
    if (response.code === 200 && response.data) {
      clothingList.value = response.data.list || response.data || []
      total.value = response.data.pagination?.total || response.data.length || 0
    } else {
      ElMessage.error(response.message || '获取服装列表失败')
      clothingList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载服装列表失败:', error)
    ElMessage.error(error.message || '加载服装列表失败')
    clothingList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 创建服装
const handleCreate = () => {
  isEdit.value = false
  currentEditId.value = null
  dialogTitle.value = '新增服装'
  formData.value = {
    itemNumber: '',
    imageUrl: '',
    purchasePrice: 0,
    sellingPrice: 0,
    lengthOrWaist: 0,
    bustOrInseam: 0,
    purchaseQuantity: 0,
    remainingQuantity: 0,
    shippingCost: 0,
    returnCost: 0,
    pageId: null
  }
  uploadedImages.value = []
  imageFileList.value = []
  dialogVisible.value = true
  resetUploadComponent()
}

// 查看详情（跳转到详情页）
const handleViewDetail = async row => {
  if (!row._id) {
    ElMessage.error('服装ID不存在')
    return
  }

  // 获取服装绑定的页面ID
  let pageId = null
  if (row.pageId) {
    // 如果已经有 pageId，直接使用
    pageId = typeof row.pageId === 'object' ? row.pageId._id || row.pageId : row.pageId
  } else {
    // 如果没有 pageId，尝试获取
    try {
      const response = await getBoundPage(row._id)
      if (response && response.code === 200 && response.data) {
        pageId =
          typeof response.data === 'object' ? response.data._id || response.data : response.data
      }
    } catch (error) {
      console.error('获取绑定页面失败:', error)
    }
  }

  if (!pageId) {
    ElMessage.warning('该服装未绑定页面，无法查看详情')
    return
  }

  // 在新标签页打开页面详情
  // 使用页面工具函数生成URL
  const fullUrl = getFullPageUrl({ _id: pageId })
  if (fullUrl) {
    window.open(fullUrl, '_blank')
  } else {
    // 降级方案：使用路由解析
    const detailUrl = router.resolve({ name: 'PageDetail', params: { id: pageId } }).href
    window.open(detailUrl, '_blank')
  }
}

// 编辑服装
const handleEdit = row => {
  isEdit.value = true
  currentEditId.value = row._id
  dialogTitle.value = '编辑服装'
  formData.value = {
    itemNumber: row.itemNumber,
    imageUrl: row.imageUrl || '',
    purchasePrice: row.purchasePrice,
    sellingPrice: row.sellingPrice,
    lengthOrWaist: row.lengthOrWaist || 0,
    bustOrInseam: row.bustOrInseam || 0,
    purchaseQuantity: row.purchaseQuantity,
    remainingQuantity: row.remainingQuantity,
    shippingCost: row.shippingCost || 0,
    returnCost: row.returnCost || 0,
    pageId: row.pageId ? (typeof row.pageId === 'object' ? row.pageId._id : row.pageId) : null
  }
  // 初始化已上传的图片列表（支持逗号分隔的多个路径）
  uploadedImages.value = row.imageUrl
    ? row.imageUrl
        .split(',')
        .map(path => path.trim())
        .filter(path => path)
    : []
  imageFileList.value = []
  dialogVisible.value = true
  resetUploadComponent()
}

// 重置上传组件状态
const resetUploadComponent = () => {
  nextTick(() => {
    if (uploadRef.value?.clearFiles) {
      uploadRef.value.clearFiles()
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return

    submitting.value = true
    try {
      // 将图片数组转换为逗号分隔的字符串
      const submitData = {
        ...formData.value,
        imageUrl: uploadedImages.value.length > 0 ? uploadedImages.value.join(',') : ''
      }

      let response
      if (isEdit.value) {
        if (!currentEditId.value) {
          ElMessage.error('未找到要编辑的服装ID')
          return
        }
        response = await updateClothing(currentEditId.value, submitData)
      } else {
        response = await createClothing(submitData)
      }

      if (response.code === 200) {
        ElMessage.success(isEdit.value ? '服装更新成功' : '服装创建成功')
        dialogVisible.value = false
        await loadClothingList()
      } else {
        ElMessage.error(response.message || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 移除上传组件中的图片
const handleRemoveImage = (file, fileList) => {
  if (file?.response) {
    const fileIndex = file.uid ? fileList.findIndex(f => f.uid === file.uid) : null
    const imageUrl = extractImageUrlFromFile(file, fileIndex)

    if (imageUrl) {
      const index = uploadedImages.value.indexOf(imageUrl)
      if (index > -1) {
        uploadedImages.value.splice(index, 1)
        ElMessage.success('图片已移除')
      }
    }
  }
  imageFileList.value = fileList || []
}

// 移除已上传的图片
const removeUploadedImage = index => {
  uploadedImages.value.splice(index, 1)
}

// 删除服装
const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(
      `确定要删除货号为 "${row.itemNumber}" 的服装吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    deletingRow.value = row._id
    try {
      const response = await removeClothing(row._id)
      if (response.code === 200) {
        ElMessage.success('服装删除成功')
        await loadClothingList()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除服装失败:', error)
      ElMessage.error(error.message || '删除服装失败')
    } finally {
      deletingRow.value = null
    }
  } catch {
    // 用户取消删除
  }
}

// 补货
const handleRestock = row => {
  restockFormData.value = {
    id: row._id,
    itemNumber: row.itemNumber,
    quantity: 1
  }
  restockDialogVisible.value = true
}

// 提交补货
const handleRestockSubmit = async () => {
  if (!restockFormRef.value) return

  await restockFormRef.value.validate(async valid => {
    if (!valid) return

    restocking.value = true
    try {
      const response = await restockClothing(
        restockFormData.value.id,
        restockFormData.value.quantity
      )
      if (response.code === 200) {
        ElMessage.success('补货成功')
        restockDialogVisible.value = false
        await loadClothingList()
      } else {
        ElMessage.error(response.message || '补货失败')
      }
    } catch (error) {
      console.error('补货失败:', error)
      ElMessage.error(error.message || '补货失败')
    } finally {
      restocking.value = false
    }
  })
}

// 加载统计信息
const loadStats = async () => {
  statsLoading.value = true
  try {
    const response = await getClothingStats()
    if (response.code === 200 && response.data) {
      statsData.value = response.data
      statsDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取统计信息失败')
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
    ElMessage.error(error.message || '获取统计信息失败')
  } finally {
    statsLoading.value = false
  }
}

// 分页处理
const handleSizeChange = val => {
  pageSize.value = val
  currentPage.value = 1
  loadClothingList()
}

const handleCurrentChange = val => {
  currentPage.value = val
  loadClothingList()
}

// 加载页面列表（用于选择器）
const loadPageListForSelect = async () => {
  if (availablePages.value.length > 0) {
    return // 已经加载过，不需要重复加载
  }
  pageListLoading.value = true
  try {
    const response = await getPageList({
      page: 1,
      limit: 1000 // 加载所有页面
    })
    if (response.code === 200 && response.data) {
      availablePages.value = response.data.list || []
    }
  } catch (error) {
    console.error('加载页面列表失败:', error)
  } finally {
    pageListLoading.value = false
  }
}

// 过滤可用页面（用于绑定对话框）
const filteredAvailablePages = computed(() => {
  let filtered = availablePages.value
  if (pageSearchKeyword.value) {
    const keyword = pageSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(page => page.name?.toLowerCase().includes(keyword))
  }
  return filtered
})

// 打开绑定页面对话框
const handleBindPages = async row => {
  currentBindClothingId.value = row._id
  selectedPageId.value = null
  pageSearchKeyword.value = ''
  bindPageDialogVisible.value = true

  // 加载已绑定的页面
  loadingBoundPage.value = true
  try {
    const response = await getBoundPage(row._id)
    if (response.code === 200 && response.data) {
      currentBoundPage.value = response.data
      selectedPageId.value = response.data ? response.data._id || response.data : null
    }
  } catch (error) {
    console.error('加载已绑定页面失败:', error)
    ElMessage.error('加载已绑定页面失败')
  } finally {
    loadingBoundPage.value = false
  }

  // 加载可用页面列表
  await loadPageListForSelect()
}

// 移除已绑定的页面
const removeBoundPage = () => {
  selectedPageId.value = null
  currentBoundPage.value = null
}

// 提交绑定页面
const handleBindPageSubmit = async () => {
  if (!currentBindClothingId.value) {
    ElMessage.error('未找到服装ID')
    return
  }

  bindingPage.value = true
  try {
    const response = await bindPage(currentBindClothingId.value, selectedPageId.value)
    if (response.code === 200) {
      ElMessage.success(selectedPageId.value ? '页面绑定成功' : '页面解绑成功')
      bindPageDialogVisible.value = false
      await loadClothingList()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('绑定页面失败:', error)
    ElMessage.error(error.message || '绑定页面失败')
  } finally {
    bindingPage.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadClothingList()
})
</script>

<style lang="scss" scoped>
.clothing-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }

  .search-bar {
    margin-bottom: 20px;
  }

  .image-error {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    color: #909399;
    border-radius: 4px;
  }

  .no-image {
    color: #909399;
    font-size: 12px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .image-upload-container {
    margin-bottom: 20px;
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    text-align: center;
  }

  .image-preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
    width: 100%;
    min-height: 120px;
    padding: 10px;
    background-color: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
  }

  .image-preview-item {
    position: relative;
    width: 100px;
    height: 100px;
    border: 2px solid #409eff;
    border-radius: 4px;
    overflow: visible;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;

    .image-actions {
      position: absolute;
      top: -8px;
      right: -8px;
      opacity: 1;
      z-index: 10;
      transition: opacity 0.3s;
      background-color: #fff;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    &:hover .image-actions {
      opacity: 1;
    }

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .table-images {
    position: relative;
    display: inline-block;

    .image-count {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 10px;
      text-align: center;
      padding: 2px;
    }
  }
}
</style>
