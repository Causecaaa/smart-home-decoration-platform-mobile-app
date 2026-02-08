<template>
  <view class="worker-order-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">工人排序</text>
    </view>

    <!-- 工人列表 -->
    <view v-if="workerOrderData.workers && workerOrderData.workers.length > 0" class="workers-section">
      <text class="section-title">工人列表</text>
      <view class="workers-list">
        <view v-for="(worker, index) in workerOrderData.workers" :key="worker.userId" class="worker-item">
          <view class="worker-info-container">
            <image
              :src="BASE_URL + worker.avatarUrl || '/static/default-avatar.png'"
              class="worker-avatar"
              mode="aspectFill"
            />
            <view class="worker-details">
              <text class="worker-name">姓名：{{ worker.realName }}</text>
              <text class="worker-status">状态：{{ worker.status }}</text>
              <text class="worker-wage">日薪：¥{{ worker.daily_wage }}</text>
              <text class="worker-period">{{ worker.expected_Start_at }} 至 {{ worker.expected_End_at }}</text>
            </view>
          </view>
          <view class="worker-order">
            <text class="order-number">第 {{ index + 1 }} 位</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 账单信息 -->
    <view v-if="workerOrderData.bill" class="bill-section">
      <text class="section-title">账单信息</text>
      <view class="bill-info">
        <view class="bill-item">
          <text class="label">总金额：</text>
          <text class="value">¥{{ workerOrderData.bill.amount }}</text>
        </view>
        <view class="bill-item">
          <text class="label">支付状态：</text>
          <text class="value">{{ getPaymentStatusText(workerOrderData.bill.paymentStatus) }}</text>
        </view>
        <view class="bill-item">
          <text class="label">创建时间：</text>
          <text class="value">{{ formatDate(workerOrderData.bill.createdAt) }}</text>
        </view>
      </view>

      <!-- 付款按钮 -->
      <view class="payment-section">
        <button
            class="pay-button"
            :disabled="workerOrderData.bill?.paymentStatus === 'PAID'"
            @click="handlePayment"
        >
          {{ workerOrderData.bill?.paymentStatus === 'PAID' ? '已支付' : '立即支付' }}
        </button>
      </view>
    </view>



    <!-- 空状态 -->
    <view v-if="!workerOrderData.workers || workerOrderData.workers.length === 0" class="empty-state">
      <text>暂无工人信息</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { BASE_URL } from '../../config/apiConfig'
import { getWorkerOrderByStage } from '../../api/worker'
import {payFullRequest} from "../../api/bill";

// 页面状态
const stageId = ref(0)
const workerOrderData = ref({
  workers: [],
  bill: null
})

// 支付状态映射
const PAYMENT_STATUS_MAP = {
  UNPAID: '待支付',
  PAID: '已支付',
  PARTIALLY_PAID: '部分支付'
}

// 页面加载参数
onLoad((options) => {
  console.log('页面参数 options:', options)
  if (!options.stageId) {
    uni.showToast({ title: '缺少 stageId 参数', icon: 'none' })
    return
  }
  stageId.value = Number(options.stageId)
})

// 加载工人排序数据
const loadWorkerOrder = async () => {
  try {
    const res = await getWorkerOrderByStage(stageId.value)
    workerOrderData.value = res
    console.log('工人排序数据加载成功', res)
  } catch (error) {
    console.error('加载工人排序失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  }
}

// 获取支付状态文本
const getPaymentStatusText = (status) => {
  return PAYMENT_STATUS_MAP[status] || status
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理付款逻辑
const handlePayment = async () => {
  if (workerOrderData.value.bill?.paymentStatus === 'PAID') {
    uni.showToast({
      title: '该账单已支付',
      icon: 'none'
    })
    return
  }

  try {
    // 调用 bill.js 中的 payFull 接口
    await payFullRequest(workerOrderData.value.bill.id)
    uni.showToast({
      title: '支付成功',
      icon: 'success'
    })
    // 支付成功后刷新数据
    await loadWorkerOrder()
  } catch (error) {
    console.error('支付失败:', error)
    uni.showToast({
      title: '支付失败，请重试',
      icon: 'none'
    })
  }
}


// 页面初始化
onMounted(() => {
  loadWorkerOrder()
})
</script>

<style scoped lang="scss">
.worker-order-container {
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

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #1e1e2f;
  margin-bottom: 24rpx;
  padding-left: 16rpx;
  border-left: 6rpx solid #409eff;
}

.workers-section,
.bill-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.workers-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.worker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.worker-info-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.worker-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #eee;
}

.worker-details {
  display: flex;
  flex-direction: column;
  gap: 4rpx;

  .worker-name,
  .worker-status,
  .worker-wage,
  .worker-period {
    font-size: 24rpx;
    color: #666;
  }

  .worker-name {
    font-weight: bold;
    color: #333;
  }
}

.worker-order {
  .order-number {
    font-size: 26rpx;
    font-weight: bold;
    color: #409eff;
  }
}

.bill-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.bill-item {
  display: flex;
  justify-content: space-between;

  .label {
    font-size: 26rpx;
    color: #666;
  }

  .value {
    font-size: 26rpx;
    color: #333;
    font-weight: bold;
  }
}

.payment-section {
  display: flex;
  justify-content: center;
  margin-top: 30rpx;
}

.pay-button {
  width: 80%;
  height: 80rpx;
  background: #409eff;
  color: #fff;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;

  &:disabled {
    background: #ccc;
    color: #999;
  }
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
