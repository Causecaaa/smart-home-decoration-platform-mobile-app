<template>
  <view class="home">
    <text>欢迎你：</text>
    <text>{{ user?.userName }}</text>

    <button @click="logout">退出登录</button>
  </view>
</template>

<script setup>
import { useUserStore } from '../../store/userStore'

const userStore = useUserStore()
const user = userStore.user

const logout = () => {
  userStore.logout()
}
</script>

<style>
.home {
  padding: 40rpx;
}
</style>
