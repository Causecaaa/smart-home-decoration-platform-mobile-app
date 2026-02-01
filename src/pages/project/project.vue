<template>
  <view class="houses-container">
    <view class="header">
      <text class="title">我的房屋</text>
    </view>

    <view class="house-list">
      <view class="house-item" v-for="house in houses" :key="house.houseId">
        <!-- 房屋信息头部 - 包含右上角菜单 -->
        <view class="house-header-relative">
          <text class="house-title">{{ house.city }} * {{ house.communityName }}</text>
          <button class="menu-btn-absolute" @click="showHouseMenu(house)">⋮</button>
        </view>

        <text class="house-info"> {{ house.layoutType }} | {{ house.area }}㎡</text>
        <text class="house-info">{{ house.buildingNo }}栋 · {{ house.unitNo }}单元 · {{ house.roomNo }}</text>
        <text class="house-info">
          装修类型：{{ DECORATION_MAP[house.decorationType] || house.decorationType }}
          <text class="info-separator"></text>
          楼层：{{ house.floorCount }}
        </text>

        <!-- 主行动：跳转布局页面 -->
        <view class="design-buttons">
          <button class="design-btn" @click="goLayoutPage(house.houseId)">布局设计</button>
          <button class="design-btn furniture-btn" @click="goFurniturePage(house)">家具设计</button>
        </view>

        <!-- 报价和施工按钮 -->
        <view class="construction-buttons" v-if="house.canStartQuotation || house.canStartConstruction">
          <button
            class="construction-btn quotation-btn"
            v-if="house.canStartQuotation"
            @click="startQuotation(house)"
          >
            报价
          </button>
          <button
            class="construction-btn construction-btn-only"
            v-if="house.canStartConstruction"
            @click="startConstruction(house)"
          >
            进入施工
          </button>
        </view>
      </view>

      <!-- 房屋列表为空时显示 -->
      <view v-if="houses.length === 0" class="no-house">
        <text>还没有房屋信息，快去新增吧～</text>
      </view>
    </view>

    <!-- 房屋操作菜单弹窗 -->
    <uni-popup ref="houseMenuPopup" type="share">
      <view class="menu-content">
        <button @click="handleEdit(selectedHouse)">编辑</button>
        <button @click="handleDelete(selectedHouse.houseId)">删除</button>
      </view>
    </uni-popup>

    <!-- 原始弹窗 -->
    <uni-popup ref="popup" type="center">
      <view class="modal">
        <view class="modal-header">
          <text>{{ dialogMode === 'edit' ? '编辑房屋' : '新增房屋' }}</text>
          <text class="close" @click="closeDialog">×</text>
        </view>
        <view class="modal-body">
          <homeForm
              :house="currentHouse"
              @success="onFormSuccess"
          />
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onNavigationBarButtonTap, onShow } from '@dcloudio/uni-app'

import homeForm from '../../components/homeForm.vue'
import { getHousesByUser, deleteHouse } from '../../api/house'

/* ---------------- 状态 ---------------- */
const DECORATION_MAP = {
  FULL: '全包',
  HALF: '半包',
  LOOSE: '散装'
}

const houses = ref([])
const dialogMode = ref('add')
const currentHouse = ref(null)
const popup = ref(null)
// 新增状态
const houseMenuPopup = ref(null)
const selectedHouse = ref(null)

/* ---------------- 生命周期 ---------------- */
onLoad(() => {
  console.log('加载房屋列表')
  loadHouses()
})

/* ⭐ App 原生导航栏按钮 */
onNavigationBarButtonTap((event) => {
  console.log('导航栏按钮被点击', event)
  uni.showActionSheet({
    itemList: ['新增房屋', '其他功能1', '其他功能2'],
    success(res) {
      if (res.tapIndex === 0) {
        openDialog('add')
      }
    }
  })
})

/* ⭐ 页面显示时重新加载数据 */
onShow(() => {
  console.log('页面显示，重新加载房屋列表')
  loadHouses()
})

/* ---------------- 方法 ---------------- */

// 显示房屋操作菜单
function showHouseMenu(house) {
  selectedHouse.value = house
  houseMenuPopup.value?.open()
}

// 处理编辑操作
function handleEdit(house) {
  houseMenuPopup.value?.close()
  openDialog('edit', house)
}

// 处理删除操作
function handleDelete(houseId) {
  houseMenuPopup.value?.close()
  confirmDelete(houseId)
}

// 跳转布局页面
function goLayoutPage(houseId) {
  uni.navigateTo({
    url: `/src/pages/layout/layout?houseId=${houseId}`
  })
}

function goFurniturePage(house) {
  if (!house.confirmedLayoutId) {
    uni.showToast({
      title: '此房屋尚不存在已完成的布局设计',
      icon: 'none'
    })
    return
  }
  uni.navigateTo({
    url: `/src/pages/furniture/furniture?layoutId=${house.confirmedLayoutId}`
  })
}

// 开始报价功能
function startQuotation(house) {
  uni.navigateTo({
    url: `/src/pages/quotation/quotation?houseId=${house.houseId}`
  })
}

// 开始施工功能
function startConstruction(house) {
  uni.navigateTo({
    url: `/src/pages/construction/construction?houseId=${house.houseId}`
  })
}

// 加载房屋列表
async function loadHouses() {
  try {
    const res = await getHousesByUser()
    houses.value = res
  } catch (err) {
    houses.value = []
    uni.showToast({
      title: '加载房屋失败，请重试',
      icon: 'none'
    })
  }
}

// 打开弹窗
function openDialog(mode, house = null) {
  dialogMode.value = mode
  currentHouse.value = house
  popup.value?.open()
}

// 关闭弹窗
function closeDialog() {
  popup.value?.close()
  currentHouse.value = null
}

// 删除房屋
function confirmDelete(houseId) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该房屋吗？',
    success(res) {
      if (res.confirm) {
        performDelete(houseId)
      }
    }
  })
}

async function performDelete(houseId) {
  try {
    await deleteHouse(houseId)
    houses.value = houses.value.filter(h => h.houseId !== houseId)
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })
  } catch (err) {
    const msg = err?.response?.data?.message || '删除失败，请重试'
    uni.showToast({
      title: msg,
      icon: 'none'
    })
  }
}

// 表单提交成功回调
function onFormSuccess() {
  loadHouses()
  closeDialog()
  uni.showToast({
    title: '操作成功',
    icon: 'success'
  })
}
</script>


<style>
.houses-container {
  padding: 30rpx;
  background: #f5f5f5;
  min-height: 100vh;
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
  background: #1296db;
  color: #fff;
  padding: 15rpx 30rpx;
  border-radius: 10rpx;
  border: none;
  font-size: 28rpx;
}

.house-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.house-item {
  background: #fff;
  border: 1rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.house-title {
  font-size: 32rpx;
  color: #1e1e2f;
  font-weight: bold;
}

.house-info {
  font-size: 28rpx;
  color: #666;
}

.design-buttons {
  display: flex;
  gap: 20rpx;
  margin: 20rpx 0;
}

.design-btn {
  flex: 1;
  margin-top: 20rpx;
  padding: 15rpx 20rpx;
  border-radius: 12rpx;
  border: none;
  background: #1296db;
  color: #fff;
  font-weight: 500;
  font-size: 28rpx;
}

.design-btn.furniture-btn {
  background: #52c41a;
}

.construction-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 15rpx;
}

.construction-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  border: none;
  color: #fff;
  font-weight: 500;
  font-size: 28rpx;
}

.quotation-btn {
  background: #ff9500; /* 橙色背景表示报价 */
}

.construction-btn-only {
  background: #007aff; /* 蓝色背景表示施工 */
}

.actions {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.info-separator {
  margin: 0 20rpx;  /* 控制间距 */
}

/* 或者使用伪元素 */
.house-info::after {
  content: " ";
  letter-spacing: 20rpx;  /* 控制空隙大小 */
}


.actions button {
  flex: 1;
  padding: 15rpx 20rpx;
  border-radius: 12rpx;
  border: 1rpx solid #dcdfe6;
  background: #fff;
  font-size: 26rpx;
}

.actions .danger {
  border-color: #f56c6c;
  color: #f56c6c;
}

.no-house {
  text-align: center;
  color: #888;
  margin-top: 80rpx;
}

/* 弹窗样式 */
.modal {
  background: #fff;
  border-radius: 24rpx;
  width: 80vw;
  max-height: 80vh;
  padding: 30rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-header .close {
  cursor: pointer;
  font-size: 40rpx;
}

.house-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10rpx;
}

.menu-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  border: none;
}

.menu-content {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.menu-content button {
  width: 100%;
  padding: 20rpx;
  margin: 10rpx 0;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  background: #fff;
  font-size: 28rpx;
}

.house-header-relative {
  position: relative;
  margin-bottom: 10rpx;
}

.menu-btn-absolute {
  position: absolute;
  top: 0;
  right: 0;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  border: none;
  z-index: 1; /* 确保在最顶层 */
}
</style>
