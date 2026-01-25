<script setup>
import {onMounted, ref} from 'vue'
import {getChatPartners} from '../../api/message'
import {BASE_URL} from "../../config/apiConfig";

// 页面状态
const chatPartners = ref([])
const isLoading = ref(false)

// 获取聊天伙伴列表
const loadChatPartners = async () => {
  isLoading.value = true
  try {
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
    url: `/src/pages/contact/contactDetail?targetUserId=${partner.userId}&targetUserName=${partner.userName}&targetAvatarUrl=${partner.avatar_url}`
  })
}


onMounted(() => {
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
        :key="partner.userId"
        @click="goToChat(partner)"
      >
        <view class="partner-avatar">
          <image
            v-if="partner.avatar_url"
            :src="BASE_URL + partner.avatar_url"
            class="avatar-img"
          />
          <view v-else class="default-avatar">{{ partner.userName.charAt(0) }}</view>
        </view>
        <view class="partner-info">
          <view class="partner-name">{{ partner.userName }}</view>
          <view class="partner-role">{{ partner.role === 'DESIGNER' ? '设计师' : partner.role === 'CONTRACTOR' ? '承包商' : '用户' }}</view>
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
</style>
