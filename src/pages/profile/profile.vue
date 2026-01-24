<template>
  <view class="profile-container">
    <view v-if="loading" class="loading">加载中...</view>

    <view v-else class="profile-content">
      <view class="profile-card">
        <!-- 头像区域 -->
        <view class="avatar-section">
          <view class="avatar-wrapper" @click="chooseImage">
            <view v-if="userInfo && userInfo.avatar_url" class="avatar-img">
              <image :src="BASE_URL + `${userInfo.avatar_url}`" mode="aspectFill"></image>
            </view>
            <view v-else class="default-avatar">头像</view>


          </view>
        </view>

        <!-- 用户信息区域 -->
        <view class="info-section">
          <view class="info-item">
            <text class="label">邮箱:</text>
            <text v-if="!editMode" class="value">{{ userInfo.email }}</text>
            <input
              v-else
              :value="tempUserInfo.email"
              class="edit-input"
              disabled
            />
          </view>

          <view class="info-item">
            <text class="label">用户名:</text>
            <text v-if="!editMode" class="value">{{ userInfo.userName }}</text>
            <input
              v-else
              :value="tempUserInfo.userName"
              @input="onUserNameInput"
              class="edit-input"
            />
          </view>

          <view class="info-item">
            <text class="label">电话:</text>
            <text v-if="!editMode" class="value">{{ userInfo.phone }}</text>
            <input
              v-else
              :value="tempUserInfo.phone"
              @input="onPhoneInput"
              class="edit-input"
            />
          </view>

          <view class="info-item">
            <text class="label">角色:</text>
            <text class="value">{{ userInfo.role }}</text>
          </view>

          <view class="info-item">
            <text class="label">状态:</text>
            <text class="value">{{ userInfo.status === 'ACTIVE' ? '活跃' : '非活跃' }}</text>
          </view>

          <view class="info-item">
            <text class="label">注册时间:</text>
            <text class="value">{{ formatTime(userInfo.createdAt) }}</text>
          </view>

          <view class="info-item">
            <text class="label">最后更新:</text>
            <text class="value">{{ formatTime(userInfo.updatedAt) }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button v-if="!editMode" @click="startEdit" class="edit-btn">编辑资料</button>
          <button v-if="!editMode" @click="openPasswordModal" class="password-btn">修改密码</button>

          <view v-else class="edit-controls">
            <button @click="saveChanges" class="save-btn">保存</button>
            <button @click="cancelEdit" class="cancel-btn">取消</button>
          </view>
        </view>

        <!-- 退出登录按钮 -->
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </view>
    </view>
  </view>

  <!-- 密码修改模态框 -->
  <view v-if="showPasswordModal" class="password-modal">
    <view class="modal-content">
      <text class="modal-title">修改密码</text>

      <view class="form-group">
        <text class="input-label">原密码:</text>
        <input
          :value="passwordForm.oldPassword"
          @input="onOldPasswordInput"
          password
          placeholder="请输入原密码"
          class="modal-input"
        />
      </view>

      <view class="form-group">
        <text class="input-label">新密码:</text>
        <input
          :value="passwordForm.newPassword"
          @input="onNewPasswordInput"
          password
          placeholder="请输入新密码"
          class="modal-input"
        />
      </view>

      <view class="form-group">
        <text class="input-label">确认新密码:</text>
        <input
          :value="passwordForm.confirmNewPassword"
          @input="onConfirmPasswordInput"
          password
          placeholder="请再次输入新密码"
          @blur="validateConfirmPassword"
          class="modal-input"
        />
        <text v-if="confirmPasswordError" class="error-msg">{{ confirmPasswordError }}</text>
      </view>

      <view class="form-actions">
        <button @click="handleChangePassword" :disabled="!isPasswordFormValid" class="modal-submit-btn">修改密码</button>
        <button @click="closePasswordModal" class="modal-cancel-btn">取消</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import {ref, computed} from 'vue'
import { useUserStore } from '../../store/userStore'
import { getCurrentUserInfo, uploadUserAvatar, updateUserProfile, changeUserPassword } from '../../api/user'
import {BASE_URL} from "../../config/apiConfig";
import { onShow } from '@dcloudio/uni-app'

const userStore = useUserStore()
const userInfo = ref(null)
const loading = ref(true)
const editMode = ref(false)
const tempUserInfo = ref({})
const showPasswordModal = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})
const confirmPasswordError = ref('')

// 加载用户信息
const initializePage = async () => {
  try {
    loading.value = true
    console.log('获取用户信息...')
    const userData = await getCurrentUserInfo()
    userInfo.value = userData

    // 同步到用户store
    userStore.user = userData
  } catch (error) {
    console.error('获取用户信息失败:', error)
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN')
}

// 编辑模式
const startEdit = () => {
  tempUserInfo.value = { ...userInfo.value }
  editMode.value = true
}

const cancelEdit = () => {
  editMode.value = false
  tempUserInfo.value = {}
}

const saveChanges = async () => {
  try {
    if (!tempUserInfo.value) {
      uni.showToast({
        title: '临时用户信息为空',
        icon: 'none'
      })
      return
    }

    await updateUserProfile(tempUserInfo.value)
    Object.assign(userInfo.value, tempUserInfo.value)

    // 更新store中的用户信息
    userStore.user = { ...userInfo.value }

    editMode.value = false
    uni.showToast({
      title: '资料更新成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('更新用户资料失败:', error)
    uni.showToast({
      title: '更新失败，请重试',
      icon: 'none'
    })
  }
}

// 头像上传
const chooseImage = async () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths[0]
      try {
        const result = await uploadUserAvatar(filePath)

        // 更新页面显示
        userInfo.value.avatar_url = result.avatar_url

        // 重要：同步更新 Store 中的用户信息
        userStore.user.avatar_url = result.avatar_url

        uni.showToast({
          title: '头像上传成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('上传头像失败:', error)
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
      }
    }
  })
}


// 用户信息输入处理
const onUserNameInput = (event) => {
  tempUserInfo.value.userName = event.detail.value
}

const onPhoneInput = (event) => {
  tempUserInfo.value.phone = event.detail.value
}

// 密码相关处理
const onOldPasswordInput = (event) => {
  passwordForm.value.oldPassword = event.detail.value
}

const onNewPasswordInput = (event) => {
  passwordForm.value.newPassword = event.detail.value
}

const onConfirmPasswordInput = (event) => {
  passwordForm.value.confirmNewPassword = event.detail.value
}

// 密码确认验证
const validateConfirmPassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
    confirmPasswordError.value = '两次输入的密码不一致'
    return false
  }
  confirmPasswordError.value = ''
  return true
}

// 检查表单是否有效
const isPasswordFormValid = computed(() => {
  return passwordForm.value.oldPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmNewPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmNewPassword &&
         !confirmPasswordError.value
})

// 处理密码修改
const handleChangePassword = async () => {
  if (!validateConfirmPassword()) return

  try {
    await changeUserPassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })

    uni.showToast({
      title: '密码修改成功',
      icon: 'success'
    })
    closePasswordModal()
  } catch (error) {
    console.error('密码修改失败:', error)
    uni.showToast({
      title: error.message || '密码修改失败，请检查原密码是否正确',
      icon: 'none'
    })
  }
}

// 打开/关闭密码修改模态框
const openPasswordModal = () => {
  showPasswordModal.value = true
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  }
  confirmPasswordError.value = ''
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  confirmPasswordError.value = ''
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

// 页面显示时检查登录状态
onShow(async () => {
  const userStore = useUserStore()
  if (!userStore.token) {
    uni.navigateTo({
      url: '/src/pages/login/login'
    })
    return
  }

  // 登录后首次进入或 token 更新时重新加载数据
  if (!userInfo.value || userStore.hasTokenChanged) {
    await initializePage()
    userStore.hasTokenChanged = false
  }
})
</script>

<style>
.profile-container {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  box-sizing: border-box;
}

.loading {
  text-align: center;
  padding: 100rpx;
  font-size: 28rpx;
  color: #666;
}

.profile-content {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
}

.avatar-section {
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #e0e0e0;
}

.avatar-img image {
  width: 100%;
  height: 100%;
}

.default-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 28rpx;
}

.upload-btn {
  margin-top: 20rpx;
  background: #4a90e2;
  color: #fff;
  padding: 10rpx 24rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.info-section {
  width: 100%;
  max-width: 600rpx;
}

.info-item {
  display: flex;
  margin-bottom: 30rpx;
  align-items: center;
  padding: 0 20rpx;
}

.label {
  width: 140rpx;
  font-weight: bold;
  color: #333;
  font-size: 28rpx;
}

.value {
  flex: 1;
  color: #666;
  font-size: 28rpx;
}

.edit-input {
  flex: 1;
  padding: 10rpx 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #f8f9fa;
}

.action-buttons {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
}

.edit-btn, .password-btn, .save-btn, .cancel-btn, .logout-btn {
  padding: 16rpx 40rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  margin: 0 10rpx;
}

.edit-btn {
  background: #409eff;
  color: white;
}

.password-btn {
  background: #e6a23c;
  color: white;
}

.save-btn {
  background: #67c23a;
  color: white;
}

.cancel-btn {
  background: #909399;
  color: white;
}

.logout-btn {
  background: #f56c6c;
  color: white;
  width: 60%;  /* 限制宽度 */
  max-width: 400rpx;  /* 最大宽度 */
  margin-top: 40rpx;
  padding: 20rpx;  /* 调整内边距 */
  border-radius: 12rpx;  /* 圆角 */
}


.edit-controls {
  display: flex;
  justify-content: center;
}

.password-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40rpx;
  border-radius: 16rpx;
  width: 80%;
  max-width: 600rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 30rpx;
  text-align: center;
}

.form-group {
  margin-bottom: 30rpx;
}

.input-label {
  display: block;
  margin-bottom: 10rpx;
  font-weight: bold;
  font-size: 28rpx;
}

.modal-input {
  width: 100%;
  padding: 16rpx 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.error-msg {
  color: #f56c6c;
  font-size: 24rpx;
  margin-top: 8rpx;
  display: block;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.modal-submit-btn, .modal-cancel-btn {
  flex: 1;
  padding: 16rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.modal-submit-btn {
  background: #409eff;
  color: white;
}

.modal-cancel-btn {
  background: #909399;
  color: white;
}
</style>
