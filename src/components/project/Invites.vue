<template>
  <view class="invites-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">我的邀请</text>
    </view>

    <!-- 邀请列表 -->
    <view v-if="invites.length > 0" class="invites-list">
      <view v-for="(invite, index) in invites" :key="index" class="invite-item">
        <!-- 人物信息块 -->
        <view class="section person-section">
          <text class="section-title">雇主信息</text>
          <PersonCard
              :avatar-url="invite.employer.avatar_url"
              :name="`雇主：${invite.employer.userName}`"
              :phone="invite.employer.phone"
              :email="invite.employer.email"
          />
        </view>

        <!-- 房屋信息块 -->
        <view class="section house-section">
          <text class="section-title">房屋信息</text>
          <view class="house-info">
            <text class="label">城市小区：</text>
            <text class="value">{{ invite.house.city }} {{ invite.house.communityName }}</text>
          </view>
          <view class="house-info">
            <text class="label">楼栋单元：</text>
            <text class="value">{{ invite.house.buildingNo }}栋{{ invite.house.unitNo }}单元{{ invite.house.roomNo }}</text>
          </view>
          <view class="house-info">
            <text class="label">户型面积：</text>
            <text class="value">{{ invite.house.layoutType }} / {{ invite.house.area }}㎡</text>
          </view>
        </view>

        <!-- 任务信息块 -->
        <view class="section task-section">
          <text class="section-title">任务信息</text>
          <view class="task-info">
            <text class="label">任务名称：</text>
            <text class="value">{{ invite.assignment.stageName }}</text>
          </view>
          <view class="task-info">
            <text class="label">任务时间：</text>
            <text class="value">{{ formatDate(invite.assignment.expectedStartAt) }}--
              {{ formatDate(invite.assignment.expectedEndAt) }}</text>
          </view>
          <view class="task-info">
            <text class="label">日薪：</text>
            <text class="value">¥{{ invite.assignment.dailyWage }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="actions">
          <!-- 仅在 INVITED 状态下显示按钮 -->
          <template v-if="invite.assignment.status === 'INVITED'">
            <button class="reject-btn" @click="respondInvite(invite.assignment.id, false)">
              拒绝
            </button>
            <button class="accept-btn" @click="respondInvite(invite.assignment.id, true)">
              接受
            </button>
          </template>

          <!-- 在 WORKER_ACCEPTED 状态下显示提示 -->
          <template v-else-if="invite.assignment.status === 'WORKER_ACCEPTED'">
            <text class="status-text">已接受邀请，等待中</text>
          </template>

          <!-- 可扩展其他状态 -->
          <template v-else>
            <text class="status-text">状态异常</text>
          </template>
        </view>

      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text>暂无邀请</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listWorkerInvites, respondToInvite } from '../../api/worker'
import { BASE_URL } from '../../config/apiConfig'
import PersonCard from "../People/PersonCard.vue";

// 页面状态
const invites = ref([])

// 默认头像
const DEFAULT_AVATAR = '/static/default-avatar.png'

// 处理头像 URL
const resolveAvatar = (avatar) => {
  if (!avatar) return DEFAULT_AVATAR
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/uploads')) return BASE_URL + avatar
  return DEFAULT_AVATAR
}

// 格式化房屋地址
const formatHouseAddress = (house) => {
  return `${house.city} ${house.communityName} ${house.buildingNo}栋${house.unitNo}单元${house.roomNo}`
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 加载邀请列表
const loadInvites = async () => {
  try {
    const res = await listWorkerInvites()
    invites.value = res
  } catch (error) {
    console.error('加载邀请失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  }
}

// 响应邀请（接受或拒绝）
const respondInvite = async (assignmentId, isAccepted) => {
  // 弹出确认对话框
  const actionText = isAccepted ? '接受' : '拒绝';
  uni.showModal({
    title: '确认操作',
    content: `确定要${actionText}该邀请吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          // 根据 isAccepted 的值决定传递的状态
          const status = isAccepted ? 'WORKER_ACCEPTED' : 'WORKER_REJECTED';

          await respondToInvite(assignmentId, { status });

          uni.showToast({
            title: isAccepted ? '已接受邀请' : '已拒绝邀请',
            icon: 'success'
          });

          // 重新加载列表
          await loadInvites();
        } catch (error) {
          console.error('响应邀请失败:', error);
          uni.showToast({
            title: '操作失败，请重试',
            icon: 'none'
          });
        }
      }
    }
  });
};



// 页面加载时初始化
onMounted(() => {
  loadInvites()
})
</script>

<style scoped lang="scss">.invites-container {
  padding: 30rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  margin-bottom: 30rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.invites-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.invite-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 新增：模块样式 */
.section {
  margin-bottom: 24rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #1e1e2f;
    margin-bottom: 16rpx;
    display: block;
  }
}

.person-section {
  border-bottom: 1rpx solid #eee;
  padding-bottom: 20rpx;
}

.house-section,
.task-section {
  border-bottom: 1rpx solid #eee;
  padding-bottom: 20rpx;
}

.house-info,
.task-info {
  display: flex;
  margin-bottom: 15rpx;

  .label {
    font-size: 26rpx;
    color: #666;
    width: 180rpx;
  }

  .value {
    font-size: 26rpx;
    color: #333;
  }
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;

  .accept-btn,
  .reject-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 70rpx;
    border-radius: 10rpx;
    font-size: 28rpx;
    color: #fff;
  }

  .accept-btn {
    background: #409eff;
    margin-right: 20rpx;
  }

  .reject-btn {
    background: #f56c6c;
  }
}


.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

.status-text {
  font-size: 28rpx;
  color: #d5a60a;
  text-align: center;
  flex: 1;
}

</style>
