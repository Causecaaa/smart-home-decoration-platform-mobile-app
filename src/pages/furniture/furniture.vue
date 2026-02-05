<template>
  <view class="container">
    <!-- 模板部分保持不变 -->
    <view class="furniture-design-container">
      <view class="furniture-design-content">
        <view class="header">
          <text class="title">家具设计</text>
        </view>

        <view class="layout-and-rooms-container">
          <!-- 用户家具布局卡片 -->
          <view v-if="layoutDetail" class="layout-item user-layout">
            <view class="layout-header">
              <text class="subtitle">家具设计方案</text>
            </view>

            <view class="images" v-if="layoutImages.length > 0">
              <view
                  v-for="(img, index) in layoutImages"
                  :key="img.id ?? img.key ?? index"
                  class="image-wrapper"
              >
                <image :src="img.url" class="image" @tap="previewImage(img)" />
              </view>
            </view>

            <!-- 显示设计师信息或提示 -->
            <view v-if="layoutDetail.furnitureDesignerId" class="designer-info">
              <view v-if="layoutDetail.furnitureDesignerId" class="designer-info">
                <view class="designer-info-content">
                  <text class="designer-text">设计师：{{ layoutDetail.designerUsername }}（{{ layoutDetail.designerEmail }}）</text>
                </view>
                <button
                    class="chat-btn"
                    @tap="openChatWithDesigner"
                    v-if="layoutDetail.furnitureDesignerId"
                >
                  💬 联系设计师
                </button>
              </view>

              <text class="status">状态：设计师正在为您准备家具设计方案</text>

              <!-- 💰 订单状态区 -->
              <view class="bill-box">
                <text class="bill-title">💰 家具设计方案费用</text>
                <view v-if="layoutDetail.payStatus === 'UNPAID'">
                  <text class="bill-text">总价：¥{{ layoutDetail.billAmount }}</text>
                  <text class="bill-text">定金：¥{{ layoutDetail.depositAmount }}</text>
                  <text class="bill-hint">支付定金后，设计师将开始家具方案设计</text>
                  <button class="btn" @tap="payDeposit(layoutDetail.billId)">支付定金</button>
                </view>
                <view v-else-if="layoutDetail.payStatus === 'DEPOSIT_PAID'">
                  <text class="bill-text">已支付定金：¥{{ layoutDetail.depositAmount }}</text>
                  <view v-if="layoutDetail.canPayFinal">
                    <text class="bill-hint">✅ 所有方案已确认，可支付尾款</text>
                    <button class="btn btn-primary" @tap="payFinalAmount(layoutDetail.billId)">支付尾款</button>
                  </view>
                  <view v-else>
                    <text class="bill-hint">设计师正在出方案，确认所有方案后需支付尾款</text>
                  </view>
                </view>
                <view v-else-if="layoutDetail.payStatus === 'PAID'">
                  <text class="bill-text">总价：¥{{ layoutDetail.billAmount }}</text>
                  <text class="bill-hint success">
                    ✅ 费用已全部结清
                    已完成家具方案设计
                  </text>
                </view>
              </view>
            </view>
            <view v-else class="no-designer-info">
              <text class="warning-text">⚠️ 尚未选择家具设计师</text>
              <button class="select-designer-btn" @tap="openDesignerDialog">
                选择设计师
              </button>
            </view>
          </view>

          <!-- 房间信息展示区域 -->
          <view v-if="rooms.length > 0" class="rooms-container">
            <text class="subtitle">房间信息</text>
            <view class="room-list">
              <view v-for="room in rooms" :key="room.roomId" class="room-item">
                <view class="room-header">
                  <text class="room-name">{{ room.roomName }} ({{ room.roomType }})</text>
                  <text class="room-status" :class="getRoomStatus(room).class">
                    {{ getRoomStatus(room).text }}
                  </text>
                </view>
                <view class="room-details">
                  <text class="room-detail">面积：{{ room.area }}㎡</text>
                  <text class="room-detail">楼层：{{ room.floorNo }}</text>
                  <text class="room-detail">窗户：{{ room.hasWindow ? '有' : '无' }}</text>
                  <text class="room-detail">阳台：{{ room.hasBalcony ? '有' : '无' }}</text>
                  <view class="detail-row">
                    <button v-if="room.hasFurnitureScheme" class="view-scheme-btn" @tap="viewSchemes(room)">查看方案</button>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <text v-if="!layoutDetail" class="no-layout">
            还没有家具设计信息
          </text>
        </view>

        <!-- 设计师选择弹窗 -->
        <view v-if="showDesignerDialog" class="overlay" @tap="closeDesignerDialog">
          <view class="modal" @tap.stop>
            <view class="modal-header">
              <text>选择家具设计师</text>
              <text class="close" @tap="closeDesignerDialog">×</text>
            </view>
            <view class="modal-body">
              <DesignerSelector
                  :designers="designers"
                  v-model="selectedDesignerId"
                  @select="handleSelectDesigner"
              />
            </view>
          </view>
        </view>

        <!-- 图片预览弹窗使用更高的层级 -->
        <view v-if="showImagePreview" class="overlay image-preview-overlay" @tap="closeImagePreview">
          <view class="modal" @tap.stop>
            <image :src="previewImageUrl" class="preview-image" />
          </view>
        </view>

        <!-- 布局图片预览弹窗 -->
        <view v-if="showPreview" class="overlay" @tap="closePreview">
          <view class="modal" @tap.stop>
            <image :src="previewUrl" class="preview-image" />
          </view>
        </view>

        <!-- 查看方案悬浮窗 -->
        <view v-if="showSchemeModal" class="overlay" @tap="closeSchemeModal">
          <view class="modal scheme-modal" @tap.stop>
            <view class="modal-header">
              <text>{{ currentRoom?.roomName }} - 方案列表</text>
              <text class="close" @tap="closeSchemeModal">×</text>
            </view>
            <view class="modal-body scheme-modal-body">
              <view v-if="currentRoomSchemes.length > 0" class="scheme-list">
                <view v-for="scheme in currentRoomSchemes" :key="scheme.schemeId" class="scheme-item">
                  <view class="scheme-header">
                    <view class="scheme-info">
                      <text class="scheme-info-text">版本: V{{ scheme.schemeVersion }}</text>
                      <text class="scheme-info-text">状态: {{ scheme.schemeStatus === 'SUBMITTED' ? '已提交' : scheme.schemeStatus }}</text>
                      <text class="scheme-info-text">创建时间: {{ formatDate(scheme.createdAt) }}</text>
                    </view>
                    <view class="scheme-actions" v-if="scheme.schemeStatus === 'SUBMITTED'">
                      <button class="confirm-btn" @tap="confirmScheme(scheme.schemeId)">确认方案</button>
                    </view>
                  </view>

                  <!-- 材料信息展示 -->
                  <view class="scheme-materials">
                    <view class="material-item">
                      <text class="material-label">地面材料:</text>
                      <text class="material-value">{{ scheme.floorMaterial || '未设置' }}
                        <text v-if="scheme.floorArea">({{ scheme.floorArea }}㎡)</text>
                      </text>
                    </view>
                    <view class="material-item">
                      <text class="material-label">墙面材料:</text>
                      <text class="material-value">{{ scheme.wallMaterial || '未设置' }}
                        <text v-if="scheme.wallArea">({{ scheme.wallArea }}㎡)</text>
                      </text>
                    </view>
                    <view class="material-item">
                      <text class="material-label">天花板材料:</text>
                      <text class="material-value">{{ scheme.ceilingMaterial || '未设置' }}
                        <text v-if="scheme.ceilingArea">({{ scheme.ceilingArea }}㎡)</text>
                      </text>
                    </view>
                    <view class="material-item">
                      <text class="material-label">柜体材料:</text>
                      <text class="material-value">{{ scheme.cabinetMaterial || '未设置' }}
                        <text v-if="scheme.cabinetArea">({{ scheme.cabinetArea }}㎡)</text>
                      </text>
                    </view>
                    <view class="material-item">
                      <text class="material-label">备注:</text>
                      <text class="material-value">{{ scheme.remark || '无' }}</text>
                    </view>
                  </view>


                  <!-- 图片区域 -->
                  <view v-if="scheme.imageUrl" class="scheme-image">
                    <image
                        :src="BASE_URL + scheme.imageUrl"
                        class="scheme-image-img"
                        @tap="previewImageFromCache(scheme)"
                    />
                  </view>

                  <view v-else class="no-image">
                    <text>暂无图片</text>
                  </view>
                </view>
              </view>
              <view v-else class="no-schemes">
                <text>暂无方案</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DesignerSelector from '../../components/DesignerSelector.vue'
import {getLayoutImages} from "../../api/layoutImage";
import {getDesignerList} from "../../api/designer";
import {payDepositRequest, payFinalRequest} from '../../api/bill'
import {BASE_URL} from "../../config/apiConfig";
import { onLoad } from '@dcloudio/uni-app'
import {
  assignFurnitureDesigner,
  confirmFurnitureScheme,
  getUserFurnitureLayoutById,
  getRoomsByLayout,
  getSchemesByRoom
} from '../../api/furniture'

// 添加响应式数据
const showChatModal = ref(false)
const chatTargetUserId = ref(null)

const layoutId = ref(null)
// 处理页面加载参数
onLoad((query) => {
  if (query.layoutId) {
    layoutId.value = Number(query.layoutId)
  }
})

// 页面状态
const layoutDetail = ref(null)
const layoutImages = ref([]) // 直接存储布局图片，不使用 store
const designers = ref([])
const selectedDesignerId = ref(null)
const showDesignerDialog = ref(false)
const rooms = ref([])  // 添加房间数组

const designer = ref(null)

// 图片预览状态
const showImagePreview = ref(false)
const previewImageUrl = ref('')

const showPreview = ref(false)
const previewUrl = ref(null)

// 添加悬浮窗状态
const showSchemeModal = ref(false)
const currentRoomSchemes = ref([])
const currentRoom = ref(null)

// 加载布局详情
const loadLayoutDetail = async () => {
  try {
    const res = await getUserFurnitureLayoutById(layoutId.value)
    layoutDetail.value = res
    if(layoutDetail.value){
      console.log(res)
    } else {
      console.log("没有数据")
    }

    // 如果没有指定家具设计师，则加载设计师列表
    if (!res.furnitureDesignerId) {
      await loadDesigners()
    } else {
      selectedDesignerId.value = res.furnitureDesignerId
    }

    // 加载房间信息
    if (res.furnitureDesignerId) {
      await loadRooms()
    }
    if (res.furnitureDesignerId) {
      designer.value = {
        id: res.furnitureDesignerId,
        username: res.designerUsername,
        email: res.designerEmail,
        avatar: res.designerAvatar
      }
    }

    // 加载布局图片
    await loadAllLayoutImages()
  } catch (error) {
    uni.showToast({
      title: '加载布局详情失败',
      icon: 'none'
    })
    console.error(error)
  }
}

// 加载房间信息
const loadRooms = async () => {
  try {
    const res = await getRoomsByLayout(layoutId.value)
    rooms.value = res
  } catch (error) {
    uni.showToast({
      title: '加载房间信息失败',
      icon: 'none'
    })
    console.error(error)
  }
}

// 添加时间格式化函数
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};


const loadDesigners = async () => {
  try {
    const res = await getDesignerList()
    designers.value = res.map(d => ({
      userId: d.userId,
      name: d.name,
      avatar: d.avatar,
      rating: d.rating,
      orderCount: d.orderCount,
      style: d.style,
      experienceYears: d.experienceYears,
      shortBio: d.shortBio
    }))
  } catch (error) {
    uni.showToast({
      title: '加载设计师列表失败',
      icon: 'none'
    })
    console.error(error)
  }
}

// 打开与设计师的聊天窗口
const openChatWithDesigner = () => {
  console.log('openChatWithDesigner')
  uni.navigateTo({
    url: `/src/pages/contact/contactDetail?targetUserId=${designer.value.id}
    &targetUserName=${designer.value.username}&targetAvatarUrl=${designer.value.avatar}`
  })
}

// 关闭聊天窗口
const closeChatModal = () => {
  showChatModal.value = false
}

// 加载布局图片
const loadLayoutImages = async (layoutId) => {
  try {
    const imgList = await getLayoutImages(layoutId)

    const formatted = imgList.map(img => ({
      id: img.imageId,
      url: BASE_URL + img.imageUrl
    }))

    layoutImages.value = formatted
  } catch (error) {
    console.error('加载布局图片失败:', error)
  }
}

const loadAllLayoutImages = async () => {
  if (layoutDetail.value) {
    await loadLayoutImages(layoutDetail.value.layoutId)
  }
}

// 图片预览
const previewImage = (imgObj) => {
  uni.previewImage({
    urls: [imgObj.url]
  })
}



const onImageError = (e) => {
  console.error('Image load error:', e)
}

const onImageLoad = (e) => {
  console.log('Image loaded successfully:', e)
}

// 查看方案方法
const viewSchemes = async (room) => {
  try {
    // 调用API获取房间的所有方案
    const schemes = await getSchemesByRoom(room.roomId)
    currentRoomSchemes.value = schemes
    currentRoom.value = room
    showSchemeModal.value = true
  } catch (error) {
    uni.showToast({
      title: '加载方案失败',
      icon: 'none'
    })
    console.error(error)
  }
}

// 关闭方案悬浮窗
const closeSchemeModal = () => {
  showSchemeModal.value = false
  currentRoomSchemes.value = []
  currentRoom.value = null
}

// 预览方案图片
const previewImageFromCache = (scheme) => {
  const imageUrl = BASE_URL + scheme.imageUrl
  uni.previewImage({
    urls: [imageUrl]
  })
}

// 辅助函数：获取房间状态
const getRoomStatus = (room) => {
  if (room.hasConfirmedScheme) {
    return { text: '已确定', class: 'confirmed' }
  } else if (room.hasFurnitureScheme) {
    return { text: '有方案', class: 'has-scheme' }
  } else {
    return { text: '无方案', class: 'no-scheme' }
  }
}

// 选择设计师
const handleSelectDesigner = async (designer) => {
  try {
    // 调用后端接口分配家具设计师
    await assignFurnitureDesigner(layoutId.value, designer.userId)

    // 更新本地状态
    selectedDesignerId.value = designer.userId
    layoutDetail.value.furnitureDesignerId = designer.userId

    // 显示成功提示
    uni.showToast({
      title: `已成功选择${designer.name}`,
      icon: 'success'
    })

    // 关闭弹窗
    closeDesignerDialog()

    // 重新加载布局详情以获取最新数据
    await loadLayoutDetail()
  } catch (error) {
    uni.showToast({
      title: '分配设计师失败',
      icon: 'none'
    })
    console.error(error)
  }
}

// 支付定金
const payDeposit = async (billId) => {
  uni.showModal({
    title: '确认支付',
    content: '确认支付定金吗？支付后将进入家具设计阶段',
    success: (res) => {
      if (res.confirm) {
        performPayDeposit(billId);
      }
    }
  })
}

const performPayDeposit = async (billId) => {
  try {
    await payDepositRequest(billId)
    uni.showToast({
      title: '定金支付成功',
      icon: 'success'
    })
    await loadLayoutDetail()  // 重新加载数据
  } catch (e) {
    uni.showToast({
      title: '支付失败，请稍后重试',
      icon: 'none'
    })
  }
}

// 支付尾款
const payFinalAmount = async (billId) => {
  uni.showModal({
    title: '确认支付',
    content: '确认支付尾款吗？支付后家具设计环节将完成',
    success: (res) => {
      if (res.confirm) {
        performPayFinalAmount(billId);
      }
    }
  })
}

const performPayFinalAmount = async (billId) => {
  try {
    await payFinalRequest(billId)  // 使用现有的支付API（假设它能处理尾款）
    uni.showToast({
      title: '尾款支付成功',
      icon: 'success'
    })
    await loadLayoutDetail()  // 重新加载数据
  } catch (e) {
    uni.showToast({
      title: '支付失败，请稍后重试',
      icon: 'none'
    })
  }
}

// 打开设计师选择弹窗
const openDesignerDialog = () => {
  showDesignerDialog.value = true
}

// 关闭设计师选择弹窗
const closeDesignerDialog = () => {
  showDesignerDialog.value = false
}

// 确认方案方法
const confirmScheme = async (schemeId) => {
  uni.showModal({
    title: '确认方案',
    content: '确认此方案吗？确认后将不能再修改',
    success: (res) => {
      if (res.confirm) {
        performConfirmScheme(schemeId);
      }
    }
  })
}

const performConfirmScheme = async (schemeId) => {
  try {
    await confirmFurnitureScheme(schemeId)
    uni.showToast({
      title: '方案确认成功',
      icon: 'success'
    })
    closeSchemeModal()  // 关闭模态框
    await loadLayoutDetail()  // 重新加载数据以更新状态
  } catch (error) {
    uni.showToast({
      title: '确认失败',
      icon: 'none'
    })
    console.error(error)
  }
}

// 关闭图片预览
const closeImagePreview = () => {
  showImagePreview.value = false
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = ''
  }
}

// 关闭预览
const closePreview = () => {
  showPreview.value = false
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

onMounted(() => {
  loadLayoutDetail()
})

// 注册组件
import { defineAsyncComponent } from 'vue'
const components = {
  DesignerSelector: defineAsyncComponent(() => import('../../components/DesignerSelector.vue'))
}
</script>

<style lang="scss">
/* 样式部分保持不变 */
.furniture-design-container {
  padding: 48rpx;
  margin: 0 auto;
}

.furniture-design-content {
  background: #fff;
  border-radius: 16rpx;
  padding: 48rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  min-height: 1200rpx;
}

.title {
  margin: 0 0 16rpx 0;
  font-size: 40rpx;
  font-weight: bold;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  padding-bottom: 32rpx;
  border-bottom: 2rpx solid #eee;
}

.layout-and-rooms-container {
  display: flex;
  gap: 32rpx;
  flex-wrap: wrap;
}

.layout-item {
  width: 560rpx;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  height: auto;
  transition: all 0.3s ease;
}

.layout-item:hover {
  border-color: #409eff;
  box-shadow: 0 8rpx 24rpx rgba(64, 158, 255, 0.1);
}

.subtitle {
  font-weight: bold;
  margin: 0 0 16rpx 0;
  color: #1e1e2f;
  font-size: 32rpx;
}

.user-layout {
  border: 2rpx solid #409eff;
  background-color: #f0f9ff;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.designer-text,
.warning-text {
  margin: 8rpx 0;
  color: #666;
  font-size: 26rpx;
}

.status {
  color: #67c23a;
  font-weight: 500;
}

.no-designer-info {
  color: #e6a23c;
}

.select-designer-btn {
  margin-top: 16rpx;
  padding: 12rpx 24rpx;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  cursor: pointer;
  font-size: 26rpx;
}

.select-designer-btn:hover {
  background: #66b1ff;
}

.rooms-container {
  flex: 1;
  padding: 32rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
  border: 2rpx solid #e0e0e0;
}

.room-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-top: 24rpx;
}

.room-item {
  flex: 1 1 100%; /* 默认占满整行 */
  padding: 24rpx;
  border-radius: 16rpx;
  background-color: #fafafa;
  border: 2rpx solid #ccf0fd;
  transition: all 0.3s ease;
  margin-bottom: 12rpx;
}

.room-item:hover {
  border-color: #409eff;
  box-shadow: 0 4rpx 16rpx rgba(64, 158, 255, 0.1);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.room-name {
  margin: 0;
  font-size: 28rpx;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1e1e2f;
}

.room-status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 24rpx;
}

.room-status.has-scheme {
  background-color: #e6f7ff;
  color: #fa6616;
}

.room-status.no-scheme {
  background-color: #fff7e6;
  color: #a318ff;
}

.room-status.confirmed {
  background-color: #f0f9eb;
  color: #66ccff;
}

.room-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.room-detail {
  flex: 0 0 calc(50% - 6rpx);
  margin: 0;
  color: #666;
  font-size: 24rpx;
  word-break: break-all;
}

.detail-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  align-self: stretch;
  margin-top: 8rpx;
  width: 100%;
}

.overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #fff;
  border-radius: 24rpx;
  width: 1000rpx;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 2rpx solid #eee;
}

.modal-header .close {
  cursor: pointer;
  font-size: 40rpx;
}

.modal-body {
  max-height: 1200rpx;
  overflow-y: auto;
}

.no-layout {
  width: 100%;
  text-align: center;
  color: #888;
  margin-top: 80rpx;
}

.bill-box {
  margin-top: 24rpx;
  padding: 24rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  border-left: 6rpx solid #409eff;
}

.bill-title {
  font-weight: bold;
  margin-bottom: 16rpx;
  color: #333;
}

.bill-text {
  display: block;
  font-size: 24rpx;
  margin: 8rpx 0;
  color: #666;
}

.bill-hint {
  font-size: 24rpx;
  color: #666;
  margin: 16rpx 0;
}

.bill-hint.success {
  color: #67c23a;
}

.btn {
  margin-top: 16rpx;
  padding: 12rpx 20rpx;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  cursor: pointer;
  font-size: 24rpx;
  text-align: center;
}

.btn:hover {
  background: #66b1ff;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.detail-row text {
  flex: 1;
  color: #666;
  font-size: 24rpx;
}

.view-scheme-btn {
  padding: 8rpx 16rpx;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  cursor: pointer;
  font-size: 24rpx;
  white-space: nowrap;
  height: 52rpx;
  transition: background 0.3s;
}

.view-scheme-btn:hover {
  background: #66b1ff;
}

.scheme-modal {
  width: 1200rpx;
  max-height: 1600rpx;
  z-index: 1000;
}

.scheme-modal-body {
  max-height: 1200rpx;
  overflow-y: auto;
  padding: 32rpx;
}

.scheme-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.scheme-item {
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  transition: all 0.3s ease;
}

.scheme-item:hover {
  border-color: #409eff;
  box-shadow: 0 4rpx 16rpx rgba(64, 158, 255, 0.1);
}

.scheme-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
}

.scheme-info {
  flex: 1;
  display: flex;
  gap: 32rpx;
  flex-wrap: wrap;
}

.scheme-info-text {
  margin: 0;
  font-size: 24rpx;
  color: #666;
}

.scheme-actions {
  flex-shrink: 0;
}

.image-preview-overlay {
  z-index: 1001;
}

.scheme-image {
  text-align: center;
  margin: 16rpx 0;
  min-height: 200rpx;  // 确保有足够的显示空间
}

.scheme-image-img {
  width: 200rpx;      /* 改小一点 */
  max-height: 200rpx;
}




.scheme-image-img:hover {
  opacity: 0.9;
}

.no-image {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  padding: 40rpx 0;
}

.no-schemes {
  text-align: center;
  color: #999;
  font-size: 32rpx;
  padding: 80rpx 0;
}

.confirm-btn {
  padding: 8rpx 16rpx;
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  cursor: pointer;
  font-size: 24rpx;
  transition: background 0.3s;
}

.confirm-btn:hover {
  background: #73d13d;
}

.chat-btn {
  margin-left: 20rpx;
  padding: 8rpx 16rpx;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 8rpx;
  cursor: pointer;
  font-size: 24rpx;
  transition: background 0.3s;
}

.chat-btn:hover {
  background: #66b1ff;
}

.chat-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.chat-modal {
  background: #fff;
  border-radius: 24rpx;
  width: 1000rpx;
  height: 1200rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8rpx 40rpx rgba(0,0,0,0.2);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #eee;
  font-weight: bold;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.designer-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  object-fit: cover;
  border: 4rpx solid #409eff;
}

.close-chat {
  cursor: pointer;
  font-size: 48rpx;
  color: #999;
}

.close-chat:hover {
  color: #333;
}

.chat-body {
  flex: 1;
  overflow: hidden;
  padding: 32rpx;
}

.images {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin: 24rpx 0;
  justify-content: flex-start;
}

.image-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12rpx;
  cursor: pointer;
  border: 2rpx solid #ddd;
}

.image:hover {
  opacity: 0.8;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
}

@media (max-width: 1536rpx) {
  .room-item {
    flex-basis: calc(33.333% - 24rpx);
  }
}

@media (max-width: 1800rpx) {
  .room-item {
    flex-basis: calc(33.333% - 24rpx);
  }
}

@media (max-width: 1800rpx) {
  .room-item {
    flex-basis: calc(50% - 24rpx);
  }
}

@media (max-width: 1200rpx) {
  .room-item {
    flex-basis: 100%;
  }
}

@media (max-width: 1536rpx) {
  .furniture-design-container {
    padding: 32rpx;
  }

  .layout-and-rooms-container {
    flex-direction: column;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.scheme-materials {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250rpx, 1fr));
  gap: 16rpx;
  margin: 16rpx 0;
  padding: 16rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.material-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.material-label {
  font-size: 22rpx;
  color: #888;
  font-weight: normal;
}

.material-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}
</style>
