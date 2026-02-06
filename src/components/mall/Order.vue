<template>
  <view class="order-container">
    <view v-if="orders.length > 0" class="order-list">
      <view v-for="order in orders" :key="order.id" class="order-card">
        <view class="order-header">
          <text class="order-id">订单号: {{ order.id }}</text>
          <text class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </text>
        </view>
        <view class="order-items">
          <view v-for="item in order.items" :key="item.id" class="order-item">
            <image :src="BASE_URL + item.image_url" class="item-image" mode="aspectFill" />
            <view class="item-info">
              <text class="item-name">{{ item.productName }}</text>
              <text class="item-brand">品牌: {{ item.brand }}</text>
              <text class="item-price">¥{{ item.price }}</text>
            </view>
            <view class="item-quantity">
              <text>x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
        <view class="order-footer">
          <text class="order-total">总计: ¥{{ order.totalAmount }}</text>
          <button
            v-if="order.status === 'CREATED'"
            class="pay-button"
            @click="handlePay(order.id)"
          >
            立即支付
          </button>
        </view>
      </view>
    </view>
    <view v-else class="no-orders">
      <text>暂无订单</text>
    </view>
  </view>
</template>

<script setup>
import { BASE_URL } from "../../config/apiConfig";
import { getOrders, payStageOrder } from "../../api/shopping";
import { onLoad, onShow } from '@dcloudio/uni-app';
import { ref } from "vue";

const stageId = ref(0);
const orders = ref([]);


const loadOrders = async () => {
  try {
    const res = await getOrders(stageId.value);
    orders.value = res || []; // 直接使用 res，而不是 res.data
  } catch (error) {
    console.error('获取订单失败:', error);
    uni.showToast({ title: '获取订单失败', icon: 'none' });
  }
};


onLoad((options) => {
  console.log('页面参数 options:', options);
  if (!options.stageId) {
    uni.showToast({ title: '缺少 stageId 参数', icon: 'none' });
    return;
  }
  stageId.value = Number(options.stageId);
});

onShow(() => {
  loadOrders();
});

const getStatusText = (status) => {
  const statusMap = {
    'CREATED': '待支付',
    'PAID': '已支付',
    'SHIPPED': '已发货',
    'DELIVERED': '已完成'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  return `status-${status.toLowerCase()}`;
};

const handlePay = async (orderId) => {
  try {
    await payStageOrder(orderId);
    uni.showToast({ title: '支付成功', icon: 'success' });
    loadOrders(); // 重新加载订单列表
  } catch (error) {
    console.error('支付失败:', error);
    uni.showToast({ title: '支付失败', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped>
.order-container {
  padding: 24rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.order-card {
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  padding: 24rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #eee;
}

.order-id {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.order-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.status-created {
  background: #fff7e6;
  color: #fa8c16;
}

.status-paid {
  background: #f6ffed;
  color: #52c41a;
}

.status-shipped {
  background: #e6f7ff;
  color: #1890ff;
}

.status-delivered {
  background: #f9f0ff;
  color: #722ed1;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.item-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.item-brand,
.item-price {
  font-size: 24rpx;
  color: #666;
}

.item-quantity {
  font-size: 28rpx;
  color: #333;
}

.order-footer {
  display: flex;
  flex-direction: column; // 垂直排列
  align-items: flex-end; // 内容靠右对齐
  gap: 12rpx; // 设置总计和按钮之间的间距
  padding-top: 16rpx;
  border-top: 1rpx solid #eee;
}

.order-total {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  align-self: flex-end; // 单独靠右对齐
}

.pay-button {
  background: #409eff;
  color: #fff;
  border: none;
  padding: 8rpx 24rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  align-self: flex-end; // 单独靠右对齐
}


.no-orders {
  text-align: center;
  padding: 64rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
