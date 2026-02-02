<template>
  <view class="quotation-container">
    <view class="quotation-header">
      <text class="title">装修报价单</text>
    </view>

    <!-- 添加条件渲染保护 -->
    <view v-if="quotationData">
      <!-- 房间主材列表 -->
      <view class="rooms-section">
        <text class="section-title">房间主材明细</text>
        <view v-for="room in quotationData.rooms" :key="room.roomId" class="room-card">
          <view class="room-header">
            <text class="room-name">{{ room.roomName }}</text>
            <text class="room-total">小计：¥{{ formatNumber(room.totalCost) }}</text>
          </view>

          <view class="materials-list">
            <!-- 修改：先过滤出非null的项目，再进行渲染 -->
            <view v-for="[materialType, item] in Object.entries(room.mainMaterials || {}).filter(([key, value]) => key !== 'totalCost' && value !== null)"
                  :key="`${room.roomId}-${materialType}`"
                  class="material-item">
              <view class="material-info">
                <text class="material-type">{{ getMaterialTypeText(materialType) }}</text>
                <text class="material-display-name">{{ item.displayName }}</text>
              </view>
              <view class="material-specs">
                <text class="spec-item">面积：{{ item.area }}㎡</text>
                <text class="spec-item">单价：¥{{ item.unitPrice }}/㎡</text>
                <text class="spec-item total">小计：¥{{ formatNumber(item.cost) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 辅材列表 -->
      <view class="auxiliary-materials-section">
        <text class="section-title">辅材明细</text>
        <view class="materials-grid">
          <view v-for="material in quotationData.auxiliaryMaterials" :key="material.name" class="material-card">
            <view class="material-header">
              <text class="material-name">{{ material.name }}</text>
              <text class="material-category">{{ getCategoryText(material.category) }}</text>
            </view>
            <view class="material-details">
              <text class="detail-item">单价：¥{{ material.unitPrice }}/{{ material.unit }}</text>
              <text class="detail-item">数量：{{ material.quantity }}{{ material.unit }}</text>
              <text class="detail-item total-cost">小计：¥{{ formatNumber(material.cost) }}</text>
            </view>
            <text v-if="material.remark" class="material-remark">{{ material.remark }}</text>
          </view>
        </view>
      </view>

      <!-- 报价摘要区域 -->
      <view class="quotation-summary">
        <view class="summary-item">
          <text class="summary-label">主材费用：</text>
          <text class="summary-value main-cost">¥{{ formatNumber(quotationData.mainMaterialsCost) }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">辅材费用：</text>
          <text class="summary-value aux-cost">¥{{ formatNumber(quotationData.auxiliaryMaterialsCost) }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">人工费用：</text>
          <text class="summary-value labor-cost">¥{{ formatNumber(quotationData.laborCost) }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">总费用：</text>
          <text class="summary-value total-cost">¥{{ formatNumber(quotationData.totalCost) }}</text>
        </view>

        <view class="payment-info">
          <text class="payment-status">状态：{{ getPaymentStatusText(quotationData.payStatus) }}</text>
          <view v-if="quotationData.payStatus === 'UNPAID'">
            <text class="payment-hint">您可以一次性支付全款完成报价确认</text>
            <button class="pay-btn" @click="payFull(quotationData.billId)">立即支付全款</button>
          </view>
          <view v-else-if="quotationData.payStatus === 'PAID'">
            <text class="payment-hint success">✅ 您已完成支付，报价已确认</text>
          </view>
          <view v-else>
            <text class="payment-hint">当前支付状态：{{ getPaymentStatusText(quotationData.payStatus) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 数据加载中提示 -->
    <view v-else class="loading-container">
      <text>正在加载报价数据...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getHouseQuotation } from '../../api/house';
import { payFullRequest } from '../../api/bill'; // 导入支付全款API

// 页面状态
const quotationData = ref(null);
const houseId = ref(null);
const isLoading = ref(true); // 添加加载状态

// 材料类别映射
const CATEGORY_MAP = {
  CEMENT: '水泥建材',
  PIPE: '管道',
  WIRE: '电线',
  ETC: '其他辅材'
};

// 主材类型映射
const MATERIAL_TYPE_MAP = {
  floor: '地面',
  wall: '墙面',
  ceiling: '天花板',
  cabinet: '柜体'
};

// 支付状态映射
const PAY_STATUS_MAP = {
  UNPAID: '待支付',
  PAID: '已支付',
  DEPOSIT_PAID: '定金已支付',
  PARTIALLY_PAID: '部分已支付'
};

// 处理页面加载参数
onLoad((query) => {
  if (query.houseId) {
    houseId.value = Number(query.houseId);
  }
});

// 加载报价数据
const loadQuotation = async () => {
  isLoading.value = true; // 开始加载

  try {
    const res = await getHouseQuotation(houseId.value);
    quotationData.value = res;
    console.log('报价数据加载成功', res);
  } catch (error) {
    console.error('加载报价失败:', error);
    uni.showToast({
      title: '加载报价失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false; // 结束加载
  }
};

// 支付全款
const payFull = async (billId) => {
  uni.showModal({
    title: '确认支付',
    content: '确认支付全款吗？支付后报价将生效并开始施工准备',
    success: (res) => {
      if (res.confirm) {
        performPayFull(billId);
      }
    }
  });
};

const performPayFull = async (billId) => {
  try {
    await payFullRequest(billId);
    uni.showToast({
      title: '支付成功',
      icon: 'success'
    });
    // 重新加载数据以更新支付状态
    setTimeout(() => {
      loadQuotation();
    }, 1000);
  } catch (e) {
    uni.showToast({
      title: '支付失败，请稍后重试',
      icon: 'none'
    });
    console.error('支付失败:', e);
  }
};

// 获取支付状态文本
const getPaymentStatusText = (status) => {
  return PAY_STATUS_MAP[status] || status;
};

// 格式化数字
const formatNumber = (num) => {
  return parseFloat(num).toFixed(2);
};

// 获取材料类别文本
const getCategoryText = (category) => {
  return CATEGORY_MAP[category] || category;
};

// 获取材料类型文本
const getMaterialTypeText = (type) => {
  return MATERIAL_TYPE_MAP[type] || type;
};

onMounted(() => {
  loadQuotation();
});
</script>

<style lang="scss">
.quotation-container {
  padding: 48rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.quotation-header {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #1e1e2f;
  }
}

.quotation-summary {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .summary-label {
    font-size: 28rpx;
    color: #666;
  }

  .summary-value {
    font-size: 32rpx;
    font-weight: bold;

    &.total-cost {
      color: #f56c6c;
    }

    &.main-cost {
      color: #409eff;
    }

    &.aux-cost {
      color: #e6a23c;
    }

    &.labor-cost {
      color: #67c23a;
    }
  }
}

// 优化支付信息区域样式
.payment-info {
  margin-top: 24rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid #e0e0e0;

  .payment-status {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
  }

  .payment-hint {
    display: block;
    font-size: 24rpx;
    color: #666;
    margin: 12rpx 0;

    &.success {
      color: #67c23a;
      font-weight: bold;
    }
  }

  .pay-btn {
    margin-top: 16rpx;
    padding: 16rpx 32rpx;
    background: linear-gradient(135deg, #e6a23c, #f2c078);
    color: #fff;
    border: none;
    border-radius: 24rpx;
    cursor: pointer;
    font-size: 26rpx;
    font-weight: bold;
    text-align: center;
    width: 100%;
    max-width: 300rpx;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      background: linear-gradient(135deg, #d4922c, #e2b068);
    }
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

.auxiliary-materials-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.materials-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.material-card {
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 24rpx;
  background-color: #fafafa;

  .material-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .material-name {
      font-size: 28rpx;
      font-weight: bold;
      color: #1e1e2f;
    }

    .material-category {
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 12rpx;
      background-color: #e6f7ff;
      color: #fa6616;
    }
  }

  .material-details {
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .detail-item {
      font-size: 24rpx;
      color: #666;

      &.total-cost {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }

  .material-remark {
    font-size: 22rpx;
    color: #999;
    margin-top: 12rpx;
    display: block;
  }
}

.rooms-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.room-card {
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background-color: #fafafa;

  &:last-child {
    margin-bottom: 0;
  }

  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    padding-bottom: 12rpx;
    border-bottom: 1rpx solid #eee;

    .room-name {
      font-size: 30rpx;
      font-weight: bold;
      color: #1e1e2f;
    }

    .room-total {
      font-size: 28rpx;
      font-weight: bold;
      color: #f56c6c;
    }
  }

  .materials-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .material-item {
    border: 1rpx solid #dcdcdc;
    border-radius: 12rpx;
    padding: 16rpx;
    background-color: #fff;

    .material-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      .material-type {
        font-size: 26rpx;
        font-weight: bold;
        color: #409eff;
      }

      .material-display-name {
        font-size: 26rpx;
        color: #666;
      }
    }

    .material-specs {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .spec-item {
        font-size: 24rpx;
        color: #666;

        &.total {
          color: #f56c6c;
          font-weight: bold;
        }
      }
    }
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 28rpx;
  color: #666;
}
</style>
