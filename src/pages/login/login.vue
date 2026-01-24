<template>
  <view class="login-container">
    <view class="login-card">
      <view class="login-header">
        <text class="title">用户登录</text>
      </view>

      <view class="login-form">
        <view class="input-group">
          <input
              class="input-field"
              :value="email"
              @input="onEmailInput"
              placeholder="请输入邮箱"
              type="text"
          />
          <text v-if="errors.email" class="error-text">{{ errors.email }}</text>
        </view>

        <view class="input-group">
          <input
              class="input-field"
              :value="password"
              @input="onPasswordInput"
              password
              placeholder="请输入密码"
              type="text"
          />
          <text v-if="errors.password" class="error-text">{{ errors.password }}</text>
        </view>

        <button class="login-btn" @click="handleLogin">登录</button>
      </view>

      <!-- 在登录页面的按钮下方添加 -->
      <view class="switch-container">
        <text class="switch-text">没有账号？</text>
        <text class="switch-link" @click="goToRegister">立即注册</text>
      </view>

    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { loginUser } from '../../api/user'
import { useUserStore } from '../../store/userStore'

const email = ref('')
const password = ref('')
const userStore = useUserStore()

// 错误信息对象
const errors = ref({
  email: '',
  password: ''
})

const onEmailInput = (event) => {
  email.value = event.detail.value
  validateEmail()
}

const onPasswordInput = (event) => {
  password.value = event.detail.value
  validatePassword()
}

// 跳转到注册页面
const goToRegister = () => {
  console.log('goToRegister')
  uni.redirectTo({
    url: '/src/pages/register/register'
  })
}


// 邮箱验证
const validateEmail = () => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    errors.value.email = '邮箱不能为空'
    return false
  } else if (!re.test(email.value)) {
    errors.value.email = '邮箱格式不正确'
    return false
  }
  errors.value.email = ''
  return true
}

// 密码验证
const validatePassword = () => {
  if (!password.value) {
    errors.value.password = '密码不能为空'
    return false
  } else if (password.value.length < 6) {
    errors.value.password = '密码长度至少6位'
    return false
  }
  errors.value.password = ''
  return true
}

// 登录处理
const handleLogin = async () => {
  // 验证输入
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (!isEmailValid || !isPasswordValid) {
    uni.showToast({
      title: '请检查输入信息',
      icon: 'none'
    })
    return
  }

  try {
    const data = await loginUser({
      email: email.value,
      password: password.value
    })

    userStore.loginSuccess(data)

    uni.reLaunch({
      url: '/src/pages/home/home'
    })
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: e.message || '登录失败',
      icon: 'none'
    })
  }
}
</script>

<style>
.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
  box-sizing: border-box;
  overflow: hidden; /* 禁止滚动 */
}

.login-card {
  width: 80%;
  max-width: 400rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.login-form {
  display: flex;
  flex-direction: column;
}
.switch-container {
  display: flex;
  justify-content: center;
  align-items: center;
}


.switch-text {
  font-size: 26rpx;
  color: #666;
  margin-right: 10rpx;
}

.switch-link {
  font-size: 26rpx;
  color: #4a90e2;
  text-decoration: underline;
}

.input-group {
  margin-bottom: 30rpx;
}

.input-field {
  width: 100%;
  height: 80rpx;
  background: #f8f9fa;
  padding: 0 20rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 8rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #333;
}

.input-field:focus {
  border-color: #6c757d;
  outline: none;
  background: #ffffff;
}

.error-text {
  color: #dc3545;
  font-size: 24rpx;
  margin-top: 8rpx;
  margin-left: 8rpx;
}

.login-btn {
  width: 100%;
  height: 80rpx;
  background: #4a90e2;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 10rpx;
  transition: all 0.3s ease;
}

.login-btn:active {
  background: #357abd;
  transform: translateY(-1rpx);
}
</style>
