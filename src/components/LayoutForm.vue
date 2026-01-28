<template>
  <view class="layout-card" @click="handleCardClickOutside">
  <!-- STEP 1: 布局意图 -->
    <view v-show="step === 1">
      <view class="input-row">
        <text class="label">布局意图</text>
        <view class="input-col">
          <!-- 自定义下拉框 -->
          <view class="custom-dropdown">
            <view class="dropdown-header" @click="toggleDropdown">
              <text>{{ selectedOptionText }}</text>
              <text class="arrow">{{ showDropdown ? '▲' : '▼' }}</text>
            </view>
            <view v-if="showDropdown" class="dropdown-list">
              <view
                class="dropdown-item"
                v-for="(item, index) in layoutIntentOptions"
                :key="index"
                @click="selectItem(item.value)"
              >
                {{ item.text }}
              </view>
            </view>
          </view>
          <text v-if="errors.layoutIntent" class="error-text">× {{ errors.layoutIntent }}</text>
        </view>
      </view>

      <view class="input-row" v-if="form.layoutIntent === 'REDESIGN'" style="margin-top: 20rpx;">
        <text class="label" style="padding-top: 20rpx;">设计需求</text>
        <view class="input-col" style="padding-top: 20rpx;">
          <textarea
            v-model="form.redesignNotes"
            placeholder="简单描述你的设计需求（可选）"
            :maxlength="200"
            class="textarea"
          />
        </view>
      </view>
    </view>

    <!-- STEP 2: 上传图片 -->
    <view v-show="step === 2">
      <text class="step-title">上传图片</text>
      <view class="upload-section">
        <button @click="chooseImages" class="upload-btn">选择图片</button>
        <view class="preview">
          <view
            v-for="(img, index) in form.images"
            :key="img.key"
            class="preview-item"
          >
            <image :src="img.url" mode="aspectFill" class="preview-img" />
            <button
                class="remove-btn"
                @click="removeImage(index)"
                type="button"
            >
              ×
            </button>

          </view>
        </view>
      </view>
    </view>

    <!-- STEP 3: 选择设计师 -->
    <view v-show="step === 3 && form.layoutIntent === 'REDESIGN'">
      <text class="step-title">选择设计师</text>
      <view class="designer-list">
        <view
          v-for="designer in designers"
          :key="designer.userId"
          :class="['designer-item', {'selected': form.designerId === designer.userId}]"
          @click="selectDesigner(designer)"
        >
          <image :src="designer.avatar" class="avatar" />
          <view class="designer-info">
            <text class="name">{{ designer.name }}</text>
            <text class="style">风格: {{ designer.style }}</text>
            <text class="experience">经验: {{ designer.experienceYears }}年</text>
          </view>
        </view>
      </view>
      <text v-if="errors.designerId" class="error-text">× {{ errors.designerId }}</text>
    </view>

    <!-- 底部导航 -->
    <view class="form-footer">
      <button v-if="!isLastStep" @click="nextStep" class="btn-primary">下一步</button>
      <button v-else @click="submitForm" :disabled="isSubmitting" class="btn-primary" :loading="isSubmitting">
        {{ isSubmitting ? '提交中...' : '提交' }}
      </button>
    </view>

    <!-- 步骤指示 -->
    <view class="dots">
      <view
        v-for="n in totalSteps"
        :key="n"
        :class="['dot', {'active': step === n}]"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDesignerList } from '../api/designer'
import { useLayoutFormStore } from '../store/layoutFormStore'
import { createLayout, createLayoutDraft } from "../api/layout"
import { uploadLayoutImage } from "../api/layoutImage"
import {BASE_URL} from "../config/apiConfig";

// 定义props和emit
const props = defineProps({
  houseId: {
    type: Number,
    required: true
  }
})
const emit = defineEmits(['success'])

// Pinia 管理 form 和 errors
const store = useLayoutFormStore()
const form = store.form
const errors = store.errors

const isSubmitting = ref(false)
const step = ref(1)
const designers = ref([])
const showDropdown = ref(false)

const layoutIntentOptions = [
  { text: '保留现有户型', value: 'KEEP_ORIGINAL' },
  { text: '需要重新设计', value: 'REDESIGN' }
]

// 初始化
form.houseId = props.houseId

// 计算属性
const selectedOptionText = computed(() => {
  if (form.layoutIntent) {
    const option = layoutIntentOptions.find(opt => opt.value === form.layoutIntent)
    return option ? option.text : '请选择布局意图'
  }
  return '请选择布局意图'
})

const totalSteps = computed(() => (form.layoutIntent === 'REDESIGN' ? 3 : 2))
const isLastStep = computed(() => step.value === totalSteps.value)

// 切换下拉框显示/隐藏
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 选择选项
const selectItem = (value) => {
  form.layoutIntent = value
  showDropdown.value = false
  validateStep()
}

const handleCardClick = (event) => {
  // 在点击layout-card时检查是否需要关闭下拉框
  // 通过延迟执行来确保selectItem事件已经处理
  setTimeout(() => {
    // 如果点击不在下拉框区域内且下拉框是打开的，则关闭它
    if (showDropdown.value) {
      // 这里不主动关闭，而是依赖toggleDropdown和selectItem的逻辑
    }
  }, 0)
}

// 替换原来的handleClickOutside函数
const handleCardClickOutside = (e) => {
  // 使用setTimeout确保当前DOM更新完成
  setTimeout(() => {
    // 不立即关闭，而是通过事件传播机制来处理
    if (showDropdown.value) {
      // 使用uni-app的节点查询API
      uni.createSelectorQuery()
          .select('.custom-dropdown')
          .boundingClientRect((rect) => {
            // 如果存在下拉框区域，这里可以做点击位置判断
            // 但现在我们简化处理，仅依赖toggleDropdown机制
          })
          .exec()
    }
  }, 50)
}



// 验证步骤
const validateStep = () => {
  if (step.value === 1 && !form.layoutIntent) {
    errors.layoutIntent = '请选择布局意图'
    return false
  }
  errors.layoutIntent = ''

  if (step.value === 3 && !form.designerId) {
    errors.designerId = '请选择设计师'
    return false
  }
  errors.designerId = ''
  return true
}

// 下一步
const nextStep = async () => {
  if (!validateStep()) return
  if (step.value === 2 && form.layoutIntent === 'REDESIGN' && designers.value.length === 0) {
    await loadDesigners()
  }
  step.value++
}

// 选择图片
const chooseImages = () => {
  uni.chooseImage({
    count: 9 - (form.images?.length || 0), // 剩余可选张数
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (!res.tempFilePaths || res.tempFilePaths.length === 0) return

      form.images = form.images || []

      res.tempFilePaths.forEach(filePath => {
        const key = Date.now() + '_' + filePath.split('/').pop()
        form.images.push({
          key,
          url: filePath,
          file: { path: filePath } // 保存原始文件对象，方便之后上传
        })
      })
    },
    fail: (err) => {
      console.error('选择图片失败', err)
    }
  })
}

// 删除图片
const removeImage = (index) => {
  form.images.splice(index, 1)
}


// 选择设计师
const selectDesigner = (designer) => {
  form.designerId = designer.userId
  console.log('选择设计师:', designer)
}

// 提交
const submitForm = async () => {
  if (!validateStep()) return

  uni.showLoading({
    title: '提交中...'
  })

  try {
    let response
    let layoutId

    if (store.form.layoutIntent === 'KEEP_ORIGINAL') {
      // 提交 KEEP_ORIGINAL layout
      const layoutData = {
        houseId: store.form.houseId,
        layoutIntent: store.form.layoutIntent,
        redesignNotes: store.form.redesignNotes || null
      }

      response = await createLayout(layoutData)

      // 添加数据验证
      if (!response || typeof response !== 'object') {
        throw new Error('API响应格式错误')
      }

      // 尝试获取layoutId，支持多种可能的字段名
      layoutId = response.layoutId || response.id || response.data?.layoutId

      if (!layoutId) {
        throw new Error('未能获取到layoutId')
      }

      for (const img of store.form.images) {
        await uploadLayoutImage(layoutId, img.file.path)
      }
    } else if (store.form.layoutIntent === 'REDESIGN') {
      // 提交 REDESIGN layout
      const layoutData = {
        houseId: store.form.houseId,
        layoutIntent: store.form.layoutIntent,
        redesignNotes: store.form.redesignNotes || null,
        designerId: store.form.designerId
      }

      response = await createLayoutDraft(layoutData)

      // 添加数据验证
      if (!response || typeof response !== 'object') {
        throw new Error('API响应格式错误')
      }

      // 尝试获取layoutId
      layoutId = response.layoutId || response.id || response.data?.layoutId

      if (!layoutId) {
        throw new Error('未能获取到layoutId')
      }

      for (const img of store.form.images) {
        await uploadLayoutImage(layoutId, img.file.path)
      }
    }

    uni.hideLoading()
    uni.showToast({
      title: '提交成功',
      icon: 'success'
    })
    emit('success', { layoutId })
  } catch (err) {
    uni.hideLoading()
    console.error('提交失败', err)

    // 显示更具体的错误信息
    let errorMessage = '提交出错'
    if (err.message) {
      errorMessage = err.message
    } else if (typeof err === 'string') {
      errorMessage = err
    }

    uni.showToast({
      title: errorMessage,
      icon: 'error'
    })
  }
}


// 加载设计师列表
const loadDesigners = async () => {
  try {
    const data = await getDesignerList()
    designers.value = data.map(d => ({
      userId: d.userId,
      name: d.name,
      avatar: BASE_URL + d.avatar,
      style: d.style,
      experienceYears: d.experienceYears,
      shortBio: d.shortBio,
      rating: d.rating,
      orderCount: d.orderCount
    }))
  } catch (err) {
    console.error(err)
    uni.showToast({
      title: '加载设计师失败',
      icon: 'error'
    })
  }
}

// 修改组件挂载时加载数据
onMounted(() => {
  // 如果是重新设计流程，提前加载设计师
  if (form.layoutIntent === 'REDESIGN') {
    loadDesigners()
  }
})

</script>

<style lang="scss">
page {
  background-color: #f5f5f5;
  padding: 20rpx;
}

.layout-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.input-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.label {
  font-weight: bold;
  width: 180rpx;
  padding-top: 10rpx;
  flex-shrink: 0;
  color: #333;
}

.input-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-header {
  width: 100%;
  padding: 15rpx 20rpx;
  border: 1px solid #ddd;
  border-radius: 10rpx;
  background-color: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.arrow {
  font-size: 24rpx;
  color: #999;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 10rpx 10rpx;
  max-height: 300rpx;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  padding: 20rpx;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #f5f5f5;
  }
}

.textarea {
  width: 100%;
  padding: 20rpx;
  border: 1px solid #ddd;
  border-radius: 10rpx;
  min-height: 150rpx;
  background-color: #f9f9f9;
}

.step-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  display: block;
  color: #333;
}

.upload-section {
  .upload-btn {
    background-color: #409eff;
    color: white;
    border-radius: 10rpx;
    padding: 20rpx;
    margin-bottom: 30rpx;
  }
}

.preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.preview-item {
  position: relative;
  width: 150rpx;
  height: 150rpx;

  .preview-img {
    width: 100%;
    height: 100%;
    border-radius: 10rpx;
  }

  .remove-btn {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    background-color: rgba(255, 0, 0, 0.7);
    color: white;
    border-radius: 10rpx;
    font-size: 20rpx;
    padding: 5rpx 10rpx;
  }
}

.designer-list {
  .designer-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    border: 1px solid #eee;
    border-radius: 10rpx;
    margin-bottom: 20rpx;
    background-color: #f9f9f9;

    &.selected {
      border-color: #409eff;
      background-color: #ecf5ff;
    }

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }

    .designer-info {
      flex: 1;

      .name {
        display: block;
        font-weight: bold;
        font-size: 30rpx;
        color: #333;
      }

      .style, .experience {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-top: 10rpx;
      }
    }
  }
}

.form-footer {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;

  .btn-primary {
    width: 100%;
    background-color: #409eff;
    color: white;
    border-radius: 10rpx;
    padding: 25rpx;
    font-size: 32rpx;
  }
}

.dots {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
  gap: 15rpx;

  .dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #ccc;

    &.active {
      background: #409eff;
    }
  }
}

.error-text {
  color: #ff4d4f;
  font-size: 24rpx;
  margin-top: 10rpx;
  display: block;
}
</style>
