<!-- src/components/PersonCard.vue -->
<template>
  <view class="person-card">
    <image
      :src="resolveAvatar(avatarUrl)"
      class="avatar"
      mode="aspectFill"
    />
    <view class="details">
      <text class="name">{{ name }}</text>
      <text v-if="phone" class="phone">电话：{{ phone }}</text>
      <text v-if="email" class="email">邮箱：{{ email }}</text>
    </view>
  </view>
</template>

<script setup>
import { BASE_URL } from '../../config/apiConfig'

// Props 定义
const props = defineProps({
  avatarUrl: {
    type: String,
    default: '/static/default-avatar.png'
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  }
})

// 处理头像 URL
const resolveAvatar = (avatar) => {
  if (!avatar) return props.avatarUrl
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/uploads')) return BASE_URL + avatar
  return props.avatarUrl
}
</script>

<style scoped lang="scss">
.person-card {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .avatar {
    padding-left: 20rpx;
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .details {
    padding-left: 60rpx;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .name {
      font-size: 26rpx;
      font-weight: bold;
      color: #333;
    }

    .phone,
    .email {
      font-size: 22rpx;
      color: #666;
    }
  }
}
</style>
