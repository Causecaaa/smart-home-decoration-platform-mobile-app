<template>
  <view class="mall-container">
    <view class="mall-header">
      <text class="title">商城</text>
      <!-- 视图切换按钮 -->
      <view class="view-toggle">
        <text
            :class="['toggle-item', viewMode === 'product' && 'active']"
            @click="viewMode = 'product'"
        >
          商品
        </text>
        <text
            :class="['toggle-item', viewMode === 'order' && 'active']"
            @click="viewMode = 'order'"
        >
          订单
        </text>
      </view>
    </view>

    <!-- 切换组件 -->
    <view class="view-container">
      <Product
          v-if="viewMode === 'product'"
          :stage-id="stageId"
          @checkout-success="switchToOrderView"
      />
      <Order v-else-if="viewMode === 'order'" :stage-id="stageId" />
    </view>
  </view>
</template>

<script setup>
import {ref} from "vue";
import { onLoad ,onShow} from '@dcloudio/uni-app';
import Product from "../../components/mall/Product.vue";
import Order from "../../components/mall/Order.vue";
const viewMode = ref('product');
const stageId = ref(0);

// 切换到订单视图
const switchToOrderView = () => {
  viewMode.value = 'order';
};

onLoad((options) => {
  if (!options.stageId) {
    uni.showToast({ title: '缺少 stageId', icon: 'none' });
    return;
  }
  stageId.value = Number(options.stageId);

});

</script>

<style lang="scss">
.mall-container {
  padding: 48rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.mall-header {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #1e1e2f;
    flex: 1;
    margin-right: 16rpx;
  }

  .view-toggle {
    display: flex;
    gap: 16rpx;

    .toggle-item {
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      background: #f0f0f0;
      font-size: 24rpx;
      cursor: pointer;

      &.active {
        background: #409eff;
        color: #fff;
      }
    }
  }
}


</style>
