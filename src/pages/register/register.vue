<template>
  <view class="register-container">
    <view class="register-card">
      <view class="register-header">
        <text class="title">用户注册</text>
      </view>

      <view class="register-form">
        <!-- 用户名 -->
        <view class="input-group">
          <input
              class="input-field"
              :value="username"
              @input="onUsernameInput"
              placeholder="请输入用户名"
              type="text"
          />
          <text v-if="errors.username" class="error-text">{{ errors.username }}</text>
        </view>

        <!-- 邮箱 -->
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

        <!-- 手机号 -->
        <view class="input-group">
          <input
              class="input-field"
              :value="phone"
              @input="onPhoneInput"
              placeholder="请输入手机号"
              type="text"
          />
          <text v-if="errors.phone" class="error-text">{{ errors.phone }}</text>
        </view>

        <!-- 密码 -->
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

        <!-- 确认密码 -->
        <view class="input-group">
          <input
              class="input-field"
              :value="confirmPassword"
              @input="onConfirmPasswordInput"
              password
              placeholder="请再次输入密码"
              type="text"
          />
          <text v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</text>
        </view>

        <button class="register-btn" @click="handleRegister">注册</button>

        <!-- 切换到登录 -->
        <view class="switch-container">
          <text class="switch-text">已有账号？</text>
          <text class="switch-link" @click="goToLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { registerUser } from '../../api/user'

const username = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')

// 错误信息对象
const errors = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 用户名验证
const validateUsername = () => {
  if (!username.value) {
    errors.value.username = '用户名不能为空'
    return false
  } else if (username.value.length < 5 || username.value.length > 50) {
    errors.value.username = '长度应在5-50个字符'
    return false
  }
  errors.value.username = ''
  return true
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

// 手机号验证
const validatePhone = () => {
  if (!phone.value) {
    errors.value.phone = '手机号不能为空'
    return false
  } else if (phone.value.length < 10 || phone.value.length > 20) {
    errors.value.phone = '电话长度应在10-20字符'
    return false
  }
  errors.value.phone = ''
  return true
}

// 密码验证
const validatePassword = () => {
  const re = /^(?=.*[A-Za-z])(?=.*[0-9!@#$%^&*()_+\-=]).+$/
  if (!password.value) {
    errors.value.password = '密码不能为空'
    return false
  } else if (password.value.length < 8) {
    errors.value.password = '密码长度至少8位'
    return false
  } else if (!re.test(password.value)) {
    errors.value.password = '密码必须包含字母和数字'
    return false
  }
  errors.value.password = ''
  return true
}

// 确认密码验证
const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.value.confirmPassword = '请再次输入密码'
    return false
  } else if (confirmPassword.value !== password.value) {
    errors.value.confirmPassword = '两次输入不一致'
    return false
  }
  errors.value.confirmPassword = ''
  return true
}

const onUsernameInput = (event) => {
  username.value = event.detail.value
  validateUsername()
}

const onEmailInput = (event) => {
  email.value = event.detail.value
  validateEmail()
}

const onPhoneInput = (event) => {
  phone.value = event.detail.value
  validatePhone()
}

const onPasswordInput = (event) => {
  password.value = event.detail.value
  validatePassword()
}

const onConfirmPasswordInput = (event) => {
  confirmPassword.value = event.detail.value
  validateConfirmPassword()
}

// 注册处理
const handleRegister = async () => {
  const validations = [
    validateUsername(),
    validateEmail(),
    validatePhone(),
    validatePassword(),
    validateConfirmPassword()
  ]

  const isValid = validations.every(v => v)

  if (!isValid) {
    uni.showToast({
      title: '请检查输入信息',
      icon: 'none'
    })
    return
  }

  try {
    await registerUser({
      username: username.value,
      email: email.value,
      phone: phone.value,
      password: password.value
    })

    uni.showToast({
      title: '注册成功',
      icon: 'success'
    })

    // 注册成功后跳转到登录页面
    setTimeout(() => {
      goToLogin()
    }, 1000)
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: e.message || '注册失败',
      icon: 'none'
    })
  }
}

// 跳转到登录页面
const goToLogin = () => {
  uni.redirectTo({
    url: '/src/pages/login/login'
  })
}
</script>

<style>
.register-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.register-card {
  width: 80%;
  max-width: 400rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
}

.register-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.register-form {
  display: flex;
  flex-direction: column;
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

.register-btn {
  width: 100%;
  height: 80rpx;
  background: #4a90e2;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 10rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
}

.register-btn:active {
  background: #357abd;
  transform: translateY(-1rpx);
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
</style>
