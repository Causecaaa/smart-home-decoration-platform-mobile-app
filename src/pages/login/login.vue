<template>
  <view class="login">
    <input
        :value="email"
        @input="onEmailInput"
        placeholder="邮箱"
    />
    <input
        :value="password"
        @input="onPasswordInput"
        password
        placeholder="密码"
    />
    <button @click="handleLogin">登录1</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { loginUser } from '../../api/user'
import { useUserStore } from '../../store/userStore'

const email = ref('')
const password = ref('')
const userStore = useUserStore()

const onEmailInput = (event) => {
  email.value = event.detail.value
}

const onPasswordInput = (event) => {
  password.value = event.detail.value
}

const handleLogin = async () => {
  console.log('handleLogin')
  try {
    const data = await loginUser({
      email: email.value,
      password: password.value
    })

    userStore.loginSuccess(data)

    uni.reLaunch({
      url: '/src/pages/index/index'
    })
  } catch (e) {
    console.error(e)
  }
}
</script>

<style>
.login {
  padding: 40rpx;
}
input {
  background: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
}
button {
  background: #007aff;
  color: #fff;
}
</style>
