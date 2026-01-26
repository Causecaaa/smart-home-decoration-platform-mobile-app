<script setup>
import {onMounted, ref} from 'vue'
import {getChatPartners} from '../../api/message'
import {BASE_URL} from "../../config/apiConfig";
import { onLoad, onShow } from '@dcloudio/uni-app'


// 页面状态
const chatPartners = ref([])
const isLoading = ref(false)

// 获取聊天伙伴列表
const loadChatPartners = async () => {
  isLoading.value = true
  try {
    // 处理新的API响应结构
    chatPartners.value = await getChatPartners()
  } catch (error) {
    console.error('获取聊天伙伴失败:', error)
    // 显示错误提示
    uni.showToast({
      title: '获取联系人列表失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 点击联系人进入聊天
const goToChat = (partner) => {
  console.log('点击了联系人:', partner)
  uni.navigateTo({
    url: `/src/pages/contact/contactDetail?targetUserId=${partner.partnerId}&targetUserName=${partner.partnerName}&targetAvatarUrl=${partner.partnerAvatar}`
  })
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)

  // 获取今天的日期，用于比较
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // 比较日期
  const isToday = date.toDateString() === today.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  // 统一使用数字格式获取时间
  const year = date.getFullYear()
  const month = date.getMonth() + 1  // 月份从0开始，需要+1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  if (isToday) {
    // 今天：显示时间 HH:MM
    return `${hours}:${minutes}`
  } else if (isYesterday) {
    // 昨天：显示"昨天 HH:MM"
    return `昨天 ${hours}:${minutes}`
  } else {
    // 更早：显示日期 + 时间格式，如 2026/1/20 14:30
    return `${year}/${month}/${day} ${hours}:${minutes}`
  }
}



onShow(() => {
  loadChatPartners()
})


</script>


<template>
  <view class="contact-container">
    <view class="header">
      <text class="title">联系人</text>
    </view>

    <view class="partners-list">
      <view v-if="isLoading" class="loading-partners">
        <text>加载中...</text>
      </view>

      <view
        v-else
        class="partner-item"
        v-for="partner in chatPartners"
        :key="partner.partnerId"
        @click="goToChat(partner)"
      >
        <view class="partner-avatar">
          <image
              v-if="partner.partnerAvatar"
              :src="BASE_URL + partner.partnerAvatar"
              class="avatar-img"
          />
          <view v-else class="default-avatar">
            {{ partner.partnerName.charAt(0) }}
          </view>

          <!-- 🔴 未读红点 -->
          <view
              v-if="partner.unread"
              class="unread-dot"
          />
        </view>

        <view class="partner-info">
          <view class="top-row">
            <view class="partner-name">{{ partner.partnerName }}</view>
            <view class="partner-time">
              {{ formatTime(partner.lastMessageTime) }}
            </view>
          </view>

          <view
              class="partner-message"
              v-if="partner.lastMessageContent"
          >
            {{ partner.lastMessageContent }}
          </view>
        </view>

      </view>

      <!-- 当联系人列表为空时 -->
      <view v-if="chatPartners.length === 0" class="empty-partners">
        <text>暂无联系人</text>
      </view>
    </view>
  </view>
</template>


<style>
.contact-container {
  padding: 20rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  background: #fff;
  margin-bottom: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.partners-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.loading-partners {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  color: #999;
}

.partner-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #eee;
  cursor: pointer;
}

.partner-item:last-child {
  border-bottom: none;
}

.partner-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.default-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: white;
}

.partner-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.partner-name {
  font-weight: 500;
  margin-bottom: 8rpx;
  font-size: 32rpx;
  color: #333;
}

.partner-role {
  font-size: 24rpx;
  color: #999;
}

.empty-partners {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx;
  color: #999;
}

.partner-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 24rpx;
  flex-shrink: 0;
  position: relative; /* 🔥关键 */
}

.unread-dot {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  width: 18rpx;
  height: 18rpx;
  background-color: #ff3b30; /* 微信红 */
  border-radius: 50%;
  border: 2rpx solid #fff; /* 白边，更像微信 */
}

.partner-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.partner-name {
  font-weight: 500;
  font-size: 32rpx;
  color: #333;
}

.partner-time {
  font-size: 22rpx;
  color: #999;
  white-space: nowrap;
}

.partner-message {
  font-size: 26rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


</style>
