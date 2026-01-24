<template>
  <view>
    <text>App 启动成功</text>
  </view>
</template>

<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from './src/store/userStore'

onLaunch(async () => {
  const userStore = useUserStore()
  await userStore.init()  // 异步初始化
})
</script>


<style>
#app {
  min-height: 100vh;           /* 让背景铺满整个屏幕高度 */
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2); /* 示例渐变背景 */
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>