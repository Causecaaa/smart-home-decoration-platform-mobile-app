你直接告诉我把缓存去掉要改哪些内容
<template>
  <view class="layouts-container">

    <view class="layouts-content">
      <view class="header">
        <text class="title">房屋布局</text>
        <button @click="openLayoutDialog" class="add-btn">新增布局</button>
      </view>

      <view class="layout-and-rooms-container">
        <!-- 用户布局 -->
        <view
            v-if="draftLayout"
            class="layout-item user-layout"
        >
          <view class="layout-header">
            <text class="layout-title">
              布局意图：{{ LAYOUT_INTENT_MAP[draftLayout.layoutIntent] }}
              <text v-if="draftLayout.version !== undefined">
                - V{{ draftLayout.version }}
              </text>
            </text>

            <view class="actions-wrapper" @tap="toggleDropdown(draftLayout.layoutId)">
              <text class="dot-btn">⋮</text>
              <view v-if="activeDropdownId === draftLayout.layoutId" class="dropdown">
                <button @tap="confirmDelete(draftLayout.layoutId)">删除布局</button>
              </view>
            </view>
          </view>

          <view v-if="draftLayout.designerUsername" class="designer-info">
            <text class="info-text">设计师：{{ draftLayout.designerUsername }}（{{ draftLayout.designerEmail }}）</text>
            <text class="info-text">设计需求：{{ draftLayout.redesignNotes }}</text>
            <button
                class="chat-btn"
                @tap="openChatWithDesigner"
                v-if="draftLayout.designerId"
            >
              💬 联系设计师
            </button>
          </view>

          <view class="images">
            <view
                v-for="(img, index) in imageStore.images[draftLayout.layoutId] || []"
                :key="img.id || img.key || index"
                class="image-wrapper"
            >
              <image :src="img.url" class="image" @tap="previewImage(img.url)" />

              <button
                  class="delete-btn"
                  @tap.stop="removeImage(draftLayout, img.id || img.key)"
              >×</button>
            </view>
          </view>

          <!-- 上传图片 -->
          <button @tap="chooseImage(draftLayout)" class="file-btn">新增图片</button>

          <!-- 💰 订单状态区 -->
          <view class="bill-box">
            <text class="bill-title">💰 设计方案费用</text>
            <view v-if="draftLayout._billMeta?.payStatus === 'UNPAID'">
              <text class="bill-text">总价：¥{{ draftLayout._billMeta?.amount }}</text>
              <text class="bill-text">定金：¥{{ draftLayout._billMeta?.depositAmount }}</text>
              <text class="bill-hint">支付定金后，设计师将开始方案设计</text>
              <button class="btn" @tap="payDeposit(draftLayout._billMeta?.billId)">支付定金</button>
            </view>
            <view v-else-if="draftLayout._billMeta?.payStatus === 'DEPOSIT_PAID' && draftLayout.layoutStatus !== 'ARCHIVED'">
              <text class="bill-text">已支付定金：¥{{ draftLayout._billMeta?.depositAmount }}</text>
              <text class="bill-hint">设计师正在出方案，确认方案后需支付尾款</text>
            </view>
            <view v-else-if="draftLayout._billMeta?.payStatus === 'DEPOSIT_PAID' && draftLayout.layoutStatus === 'ARCHIVED'">
              <text class="bill-text">总价：¥{{ draftLayout._billMeta?.amount }}</text>
              <text class="bill-text">已付定金：¥{{ draftLayout._billMeta?.depositAmount }}</text>
              <text class="bill-text">需支付尾款：¥{{ draftLayout._billMeta?.amount - draftLayout._billMeta?.depositAmount }}</text>
              <text class="bill-hint">方案已确认，请支付尾款</text>
              <button class="btn" @tap="payFinal(draftLayout._billMeta?.billId)">支付尾款</button>
            </view>
            <view v-else-if="draftLayout._billMeta.payStatus === 'PAID'">
              <text class="bill-text">总价：¥{{ draftLayout._billMeta.amount }}</text>
              <text class="bill-hint success">
                ✅ 费用已全部结清\n已完成房屋结构设计
              </text>
              <button class="btn" @tap="goToFurnitureDesign(draftLayout)">前往家具设计</button>
            </view>
          </view>
        </view>

        <!-- 设计师方案布局 -->
        <view class="designer-layouts-wrapper" v-if="designerLayouts.length > 0">
          <text class="section-title">设计师方案</text>
          <view class="designer-layouts-grid">
            <view
                v-for="layout in designerLayouts"
                :key="layout.layoutId"
                class="layout-item designer-layout"
            >
              <view class="layout-header">
                <text class="layout-title">
                  布局意图：{{ LAYOUT_INTENT_MAP[layout.layoutIntent] }}
                  <text v-if="layout.version !== undefined">
                    - V{{ layout.version }}
                  </text>
                </text>
              </view>

              <text v-if="layout.redesignNotes" class="info-text">设计需求：{{ layout.redesignNotes }}</text>
              <text class="info-text">状态：{{ LAYOUT_STATUS_MAP[layout.layoutStatus] }}</text>

              <view class="images">
                <view
                    v-for="(img, index) in imageStore.images[layout.layoutId] || []"
                    :key="img.id || img.key || index"
                    class="image-wrapper"
                >
                  <image :src="img.url" @error="onImageError" class="image" @tap="previewImage(img.url)" />


                </view>
              </view>

              <button @tap="confirmLayout(layout)" class="btn">确认布局</button>
            </view>
          </view>
        </view>

        <!-- 保留原布局 -->
        <view v-if="keepOriginalLayout" class="layout-item user-layout">
          <view class="layout-header">
            <text class="layout-title">
              布局意图：{{ LAYOUT_INTENT_MAP[keepOriginalLayout.layoutIntent] }}
              <text v-if="keepOriginalLayout.version !== undefined">
                - V{{ keepOriginalLayout.version }}
              </text>
            </text>

            <view class="actions-wrapper" @tap="toggleDropdown(keepOriginalLayout.layoutId)">
              <text class="dot-btn">⋮</text>
              <view v-if="activeDropdownId === keepOriginalLayout.layoutId" class="dropdown">
                <button @tap="confirmDelete(keepOriginalLayout.layoutId)">删除布局</button>
              </view>
            </view>
          </view>

          <text class="info-text">状态：{{ LAYOUT_STATUS_MAP[keepOriginalLayout.layoutStatus] }}</text>

          <view class="images">
            <view
                v-for="(img, index) in imageStore.images[keepOriginalLayout.layoutId] || []"
                :key="img.id || img.key || index"
                class="image-wrapper"
            >
              <image
                  :src="img.url"
                  class="image"
                  @tap="previewImage(img.url)"
                  mode="aspectFill"
              />
              <button
                  class="delete-btn"
                  @tap.stop="removeImage(keepOriginalLayout, img.id || img.key)"
              >×</button>
            </view>
          </view>

          <!-- 上传图片 -->
          <button @tap="chooseImage(keepOriginalLayout)" class="file-btn">新增图片</button>

          <button @tap="confirmLayout(keepOriginalLayout)" class="btn">确认布局</button>
        </view>

        <!-- 空状态 -->
        <text
            v-if="!draftLayout && designerLayouts.length === 0 && !keepOriginalLayout"
            class="no-layout"
        >
          还没有布局信息，快去新增吧～
        </text>
      </view>
    </view>

    <!-- 新增布局弹窗 -->
    <view class="overlay" v-if="showLayoutDialog" @tap="closeLayoutDialog">
      <view class="modal" @tap.stop>  <!-- 阻止冒泡 -->
        <view class="modal-header">
          <text>布局设计</text>
          <text class="close" @tap="closeLayoutDialog">×</text>
        </view>
        <view class="modal-body">
          <LayoutForm :houseId="currentHouseId" @success="onLayoutCreated" />
        </view>
      </view>
    </view>


    <!-- 图片预览 -->
    <view v-if="showPreview" class="overlay" @tap="closePreview">
      <view class="modal">
        <image :src="previewUrl" style="width: 90%; height: 80vh;" mode="aspectFit" />
      </view>
    </view>


  </view>
</template>

<script setup>
import {ref, onMounted, getCurrentInstance} from 'vue'
import LayoutForm from '../../components/LayoutForm.vue'

import {
  getLayoutsByHouse,
  deleteLayout,
  confirmLayoutRequest
} from '../../api/layout'

import {
  getLayoutImages,
  uploadLayoutImage,
  deleteLayoutImage
} from '../../api/layoutImage'

import { useLayoutImageStore } from '../../store/layoutImageStore'
import { payDepositRequest, payFinalRequest } from "../../api/bill"
import {BASE_URL} from "../../config/apiConfig";
import { onLoad } from '@dcloudio/uni-app'



/* -------------------- 常量 -------------------- */
const LAYOUT_INTENT_MAP = {
  KEEP_ORIGINAL: '保留现有户型',
  REDESIGN: '需要重新设计'
}
const LAYOUT_STATUS_MAP = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  ARCHIVED: '已封存'
}


const houseId = ref(null)
onLoad((query) => {
  if (query.houseId) {
    houseId.value = Number(query.houseId)
  }
})
const imageStore = useLayoutImageStore()

/* -------------------- 页面状态 -------------------- */
const draftLayout = ref(null)
const designerLayouts = ref([])
const keepOriginalLayout = ref(null)

const showLayoutDialog = ref(false)
const currentHouseId = ref(houseId)
const activeDropdownId = ref(null)
const showChatModal = ref(false)
const chatTargetUserId = ref(null)
const previewUrl = ref(null)
const showPreview = ref(false)

/* -------------------- 工具函数 -------------------- */

const toggleDropdown = (layoutId) => {
  activeDropdownId.value = activeDropdownId.value === layoutId ? null : layoutId
}

function resolveBillMeta(layout) {
  if (!layout.billId) {
    console.error('No bill meta data available');
    layout._billMeta = { visible: false };
    return;
  }

  const payStatus = layout.payStatus;
  console.log(payStatus);

  layout._billMeta = {
    billId: layout.billId,
    payStatus,
    amount: layout.billAmount,
    depositAmount: layout.depositAmount,
    canPayDeposit: payStatus === 'UNPAID',
    depositPaid: payStatus === 'DEPOSIT_PAID'
  };
}

const payDeposit = async (billId) => {
  const res = await uni.showModal({
    title: '确认支付',
    content: '确认支付定金吗？支付后将进入设计阶段',
    confirmText: '确认支付',
    cancelText: '取消'
  })

  if (!res.confirm) return

  try {
    await payDepositRequest(billId)
    uni.showToast({
      title: '定金支付成功',
      icon: 'success'
    })
    await loadLayouts()
  } catch (e) {
    uni.showToast({
      title: '支付失败，请稍后重试',
      icon: 'none'
    })
  }
}

const payFinal = async (billId) => {
  const res = await uni.showModal({
    title: '确认支付',
    content: '确认支付尾款吗？',
    confirmText: '确认支付',
    cancelText: '取消'
  })

  if (!res.confirm) return

  try {
    await payFinalRequest(billId)
    uni.showToast({
      title: '尾款支付成功',
      icon: 'success'
    })
    await loadLayouts()
  } catch (e) {
    uni.showToast({
      title: '支付失败，请稍后重试',
      icon: 'none'
    })
  }
}

// 打开与设计师的聊天窗口
const openChatWithDesigner = () => {
  console.log('openChatWithDesigner')
    uni.navigateTo({
      url: `/src/pages/contact/contactDetail?targetUserId=${draftLayout.value.designerId}&targetUserName=${draftLayout.value.designerUsername}&targetAvatarUrl=${draftLayout.value.avatarUrl}`
    })
}

// 关闭聊天窗口
const closeChatModal = () => {
  showChatModal.value = false
}

/* -------------------- 加载布局 -------------------- */
const loadLayouts = async () => {
  try {
    console.log(houseId.value)
    const res = await getLayoutsByHouse(houseId.value)

    draftLayout.value = res.draftLayout
        ? {
          ...res.draftLayout,
          layoutVersion: res.draftLayout.version ?? 0
        }
        : null

    if (draftLayout.value) {
      resolveBillMeta(draftLayout.value);
    }

    designerLayouts.value = (res.designerLayouts || []).map(l => ({
      ...l,
      layoutVersion: l.version ?? 0
    }))

    keepOriginalLayout.value = res.keepOriginalLayout
        ? {
          ...res.keepOriginalLayout,
          layoutVersion: res.keepOriginalLayout.version ?? 0
        }
        : null

    await loadAllLayoutImages()
  } catch (err) {
    draftLayout.value = null
    designerLayouts.value = []
    uni.showToast({
      title: '加载布局失败',
      icon: 'none'
    })
  }
}

/* -------------------- 加载图片 -------------------- */
const loadAllLayoutImages = async () => {
  const ids = []

  if (draftLayout.value) {
    ids.push(draftLayout.value.layoutId)
  }
  designerLayouts.value.forEach(l => ids.push(l.layoutId))

  if (keepOriginalLayout.value) {
    ids.push(keepOriginalLayout.value.layoutId)
  }

  await Promise.all(ids.map(loadLayoutImages))
}

const loadLayoutImages = async (layoutId) => {
  const imgList = await getLayoutImages(layoutId)

  const formatted = await Promise.all(
      imgList.map(img => {
        const fullUrl = BASE_URL + img.imageUrl
        return { id: img.imageId, url: fullUrl }
      })
  )

  imageStore.setImages(layoutId, formatted)
}

/* -------------------- 图片预览 -------------------- */
const previewImage = (url) => {
  previewUrl.value = url
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
}

/* -------------------- 新增布局 -------------------- */
const openLayoutDialog = () => {
  if (draftLayout.value) {
    uni.showToast({
      title: '当前房屋已存在布局',
      icon: 'none'
    })
    return
  }
  showLayoutDialog.value = true
}

const closeLayoutDialog = () => {
  showLayoutDialog.value = false
}

const onLayoutCreated = async () => {
  showLayoutDialog.value = false
  await loadLayouts()
}

/* -------------------- 删除布局 -------------------- */
const confirmDelete = async (layoutId) => {
  const res = await uni.showModal({
    title: '确认删除',
    content: '确定删除该布局？',
    confirmText: '确认删除',
    cancelText: '取消'
  })

  if (!res.confirm) return

  await deleteLayout(layoutId)
  await loadLayouts()
  uni.showToast({
    title: '删除成功',
    icon: 'success'
  })
}

const chooseImage = (layout, event) => {
  if (event) event.stopPropagation()

  if (layout.layoutStatus === 'CONFIRMED' || layout.layoutStatus === 'ARCHIVED') {
    uni.showToast({
      title: '当前布局不可编辑',
      icon: 'none'
    })
    return
  }
  console.log('chooseImage', layout)

  uni.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    success: async (res) => {
      if (!res.tempFilePaths || res.tempFilePaths.length === 0) return

      const filePath = res.tempFilePaths[0]
      const layoutId = layout.layoutId

      try {
        const uploadRes = await uploadLayoutImage(layoutId, filePath)

        // 上传成功后再更新 store
        const formatted = { id: uploadRes.imageId, url: BASE_URL + uploadRes.imageUrl }
        imageStore.addImage(layoutId, formatted)

        uni.showToast({
          title: '上传成功',
          icon: 'success'
        })

        console.log('上传成功', uploadRes)
      } catch (error) {
        console.error('上传失败:', error)
        uni.showToast({
          title: typeof error === 'string' ? error : (error?.message || '上传失败'),
          icon: 'none'
        })
      }
    }
  })
}



const removeImage = async (layout, keyOrId) => {
  if (layout.layoutStatus === 'CONFIRMED' || layout.layoutStatus === 'ARCHIVED') {
    uni.showToast({
      title: '当前布局不可编辑',
      icon: 'none'
    })
    return
  }

  // 添加确认对话框
  const res = await uni.showModal({
    title: '确认删除',
    content: '确定要删除这张图片吗？',
    confirmText: '确认删除',
    cancelText: '取消'
  })

  if (!res.confirm) return

  const layoutId = layout.layoutId
  const target = imageStore.images[layoutId]?.find(
      i => i.id === keyOrId || i.key === keyOrId
  )
  if (!target) return

  try {
    if (target.id) {
      await deleteLayoutImage(target.id)
    }

    // 强制重新加载布局数据以确保界面更新
    await loadLayouts()

    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('删除图片失败:', error)
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    })
  }
}

const goToFurnitureDesign = (layout) => {
  uni.navigateTo({
    url: `/src/pages/furniture/furniture?layoutId=${layout.confirmedLayoutId}`
  })
}

/* -------------------- 确认布局 -------------------- */
const confirmLayout = async (layout) => {
  if(layout.layoutStatus === 'CONFIRMED' || layout.layoutStatus === 'ARCHIVED'){
    uni.showToast({
      title: '不可再次确认',
      icon: 'none'
    })
    return
  }

  const res = await uni.showModal({
    title: '确认布局',
    content: '确认要使用此布局吗？',
    confirmText: '确认',
    cancelText: '取消'
  })

  if (!res.confirm) return

  await confirmLayoutRequest(layout.layoutId)
  uni.showToast({
    title: '布局已确认',
    icon: 'success'
  })
  await loadLayouts()
}

/* -------------------- 错误处理 -------------------- */
const onAvatarError = (e) => {
  console.log('头像加载失败', e)
}

/* -------------------- 生命周期 -------------------- */
onMounted(loadLayouts)
</script>

<style lang="scss">
page {
  background-color: #f5f5f5;
}

.layouts-container {
  padding: 20rpx;
  min-height: 100vh;
}

.layouts-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 20rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  background: #409eff;
  color: #fff;
  padding: 15rpx 30rpx;
  border-radius: 10rpx;
  border: none;
  font-size: 28rpx;
  white-space: nowrap;
}

.layout-and-rooms-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.layout-item {
  background: #fff;
  border: 1rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  min-height: auto;
  transition: all 0.3s ease;
}

.layout-item:hover {
  border-color: #409eff;
  box-shadow: 0 4rpx 12rpx rgba(64, 158, 255, 0.1);
}

.layout-item h3 {
  font-weight: bold;
  margin: 0 0 15rpx 0;
  color: #1e1e2f;
  font-size: 32rpx;
}

.user-layout {
  border: 1rpx solid #409eff;
  background-color: #f0f9ff;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 20rpx;
  display: block;
}

.designer-layouts-wrapper {
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
  border: 1rpx solid #e0e0e0;
}

.designer-layouts-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  align-items: stretch;
}

.designer-layout {
  border: 1rpx solid #ccf0fd;
  background-color: #e6f7ff;
}

.images {
  display: flex;
  gap: 15rpx;
  flex-wrap: wrap;
}

.image-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
}


.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
}



.delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  line-height: 1;
}

.overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #fff;
  border-radius: 24rpx;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-header .close {
  cursor: pointer;
  font-size: 40rpx;
}

.actions {
  display: flex;
  gap: 15rpx;
  margin-top: 15rpx;
  padding-top: 15rpx;
  border-top: 1rpx solid #eee;
}

.actions button {
  padding: 10rpx 20rpx;
  border-radius: 12rpx;
  border: 1rpx solid #dcdfe6;
  background: #fff;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.no-layout {
  width: 100%;
  text-align: center;
  color: #888;
  margin-top: 80rpx;
  display: block;
}

.btn {
  margin-top: 15rpx;
  padding: 15rpx 25rpx;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
}

.file-btn {
  display: inline-block;
  padding: 15rpx 25rpx;
  background-color: #409eff;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-top: 15rpx;
  text-align: center;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 15rpx;
}

.actions-wrapper {
  position: relative;
  cursor: pointer;
}

.dot-btn {
  font-size: 32rpx;
  padding: 10rpx;
}

.dropdown {
  position: absolute;
  top: 50rpx;
  right: 0;
  background: #fff;
  border: 1rpx solid #ccc;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  z-index: 10;
  min-width: 200rpx;
}

.dropdown button {
  background: none;
  border: none;
  padding: 20rpx;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dropdown button:last-child {
  border-bottom: none;
}

.dropdown button:hover {
  background: #f5f5f5;
}

.bill-box {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  border-left: 6rpx solid #66ccff;
}

.bill-title {
  font-weight: bold;
  margin-bottom: 15rpx;
  color: #333;
  display: block;
}

.bill-text {
  display: block;
  margin: 10rpx 0;
  font-size: 28rpx;
}

.bill-hint {
  font-size: 24rpx;
  color: #666;
  margin: 15rpx 0;
  display: block;
}

.bill-hint.success {
  color: #67c23a;
}

.chat-btn {
  margin-left: 20rpx;
  padding: 10rpx 20rpx;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
  white-space: nowrap;
}

.chat-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.chat-modal {
  background: #fff;
  border-radius: 24rpx;
  width: 90%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8rpx 40rpx rgba(0,0,0,0.2);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  font-weight: bold;
}

.close-chat {
  cursor: pointer;
  font-size: 48rpx;
  color: #999;
}

.chat-body {
  flex: 1;
  overflow: hidden;
  padding: 30rpx;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.designer-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 4rpx solid #409eff;
}

.info-text {
  display: block;
  margin: 8rpx 0;
  font-size: 28rpx;
  color: #666;
}

.layout-title {
  font-weight: bold;
  font-size: 32rpx;
  color: #1e1e2f;
}
</style>
