<template>
  <view class="stage-detail-container">
    <view v-if="!stageData.order" class="loading-container">
      <text>加载中...</text>
    </view>


    <!-- 数据加载完成后显示内容 -->
    <view v-else>
      <view class="stage-header">
        <text class="title">{{ stageData.stageName }}</text>
        <view class="stage-info">
          <text class="stage-order">第 {{ stageData.order }} 阶段</text>
          <text class="stage-status" :class="getStatusClass(stageData.status)">{{ stageData.status }}</text>
        </view>
      </view>

      <!-- 阶段基本信息 -->
      <view class="basic-info-section">
        <text class="section-title">阶段信息</text>
        <view class="info-grid">
          <view class="info-item">
            <text class="label">主要工种</text>
            <text class="value worker-type">{{ stageData.mainWorkerType }}</text>
          </view>
          <view class="info-item">
            <text class="label">所需人数</text>
            <text class="value">{{ stageData.requiredCount }}人</text>
          </view>
          <view class="info-item">
            <text class="label">预计天数</text>
            <text class="value">{{ stageData.estimatedDay }}天</text>
          </view>
          <view v-if="stageData.start_at" class="info-item">
            <text class="label">开始时间</text>
            <text class="value">{{ formatDate(stageData.start_at) }}</text>
          </view>
          <view v-if="stageData.end_at" class="info-item">
            <text class="label">结束时间</text>
            <text class="value">{{ formatDate(stageData.end_at) }}</text>
          </view>
        </view>
      </view>

      <!-- 主材列表 -->
      <view v-if="stageData.mainMaterials && stageData.mainMaterials.length > 0" class="materials-section">
        <text class="section-title">主材清单</text>
        <view class="materials-list">
          <view v-for="(item, index) in stageData.mainMaterials" :key="index" class="material-item">
            <view class="material-info">
              <text class="material-type">{{ getMainMaterialTypeText(item.type) }}</text>
              <text class="material-display-name">{{ item.displayName }}</text>
            </view>
            <view class="material-specs">
              <text class="spec-item">面积：{{ item.area }}㎡</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 辅材列表 -->
      <view v-if="stageData.auxiliaryMaterials && stageData.auxiliaryMaterials.length > 0" class="materials-section">
        <text class="section-title">辅材清单</text>
        <view class="aux-materials-list">
          <view v-for="(material, index) in stageData.auxiliaryMaterials" :key="index" class="aux-material-card">
            <view class="material-header">
              <text class="material-name">{{ material.name }}</text>
              <text class="material-category">{{ getCategoryText(material.category) }}</text>
            </view>
            <view class="material-details">
              <text class="detail-item">单位：{{ material.unit }}</text>
              <text class="detail-item">数量：{{ material.quantity }}{{ material.unit }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 如果没有材料显示提示 -->
      <view v-if="(!stageData.mainMaterials || stageData.mainMaterials.length === 0) &&
                 (!stageData.auxiliaryMaterials || stageData.auxiliaryMaterials.length === 0)"
            class="no-materials">
        <text class="no-materials-text">此阶段暂无材料清单</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import {getStage, getStageDetail} from '../../api/construction';

// 页面状态
const stageData = ref({
  mainMaterials: [],
  auxiliaryMaterials: [],
  order: null,
  stageName: '',
  status: '',
  mainWorkerType: '',
  requiredCount: 0,
  estimatedDay: 0,
  start_at: null,
  end_at: null
});
const houseId = ref(null);
const stageId = ref(null);
// 在 script setup 中添加
const isLoading = ref(true);

// 修改加载函数
const loadStageDetail = async () => {
  try {
    const res = await getStageDetail(houseId.value, stageId.value);
    // 修正：直接使用 res，而不是 res.data
    stageData.value = {
      ...stageData.value,
      ...res
    };
    console.log('阶段详情数据加载成功', stageData.value);
  } catch (error) {
    console.error('加载阶段详情失败:', error);
    uni.showToast({
      title: '加载阶段详情失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};



// 材料类别映射
const CATEGORY_MAP = {
  CEMENT: '水泥建材',
  PIPE: '管道',
  WIRE: '电线',
  ETC: '其他辅材'
};

// 主材类型映射
const MAIN_MATERIAL_TYPE_MAP = {
  FLOOR: '地面',
  WALL: '墙面',
  CEILING: '天花板',
  CABINET: '柜体'
};

// 处理页面加载参数
onLoad((query) => {
  if (query.houseId) {
    houseId.value = Number(query.houseId);
  }
  if (query.stageId) {
    stageId.value = Number(query.stageId);
  }
});


// 获取状态样式类
const getStatusClass = (status) => {
  switch(status) {
    case '进行中':
      return 'status-progress';
    case '已完成':
      return 'status-completed';
    case '已验收':
      return 'status-accepted';
    default:
      return 'status-pending';
  }
};

// 获取材料类别文本
const getCategoryText = (category) => {
  return CATEGORY_MAP[category] || category;
};

// 获取主材类型文本
const getMainMaterialTypeText = (type) => {
  return MAIN_MATERIAL_TYPE_MAP[type] || type;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

onMounted(() => {
  loadStageDetail();
});
</script>

<style lang="scss">
.stage-detail-container {
  padding: 48rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 28rpx;
  color: #666;
}

.stage-header {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #1e1e2f;
    display: block;
    margin-bottom: 16rpx;
  }

  .stage-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .stage-order {
      font-size: 28rpx;
      color: #409eff;
      font-weight: bold;
    }

    .stage-status {
      font-size: 24rpx;
      padding: 6rpx 12rpx;
      border-radius: 12rpx;
      font-weight: bold;

      &.status-pending {
        background-color: #f0f9ff;
        color: #409eff;
        border: 1rpx solid #b3d8ff;
      }

      &.status-progress {
        background-color: #f4f9ff;
        color: #e6a23c;
        border: 1rpx solid #e6cf9f;
      }

      &.status-completed {
        background-color: #f0f9ec;
        color: #67c23a;
        border: 1rpx solid #b3e19d;
      }

      &.status-accepted {
        background-color: #f0f0f9;
        color: #909399;
        border: 1rpx solid #d3d4e2;
      }
    }
  }
}

.basic-info-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    margin-top: 16rpx;

    .info-item {
      display: flex;
      flex-direction: column;
      padding: 16rpx;
      background-color: #f8f9fa;
      border-radius: 8rpx;

      .label {
        font-size: 24rpx;
        color: #666;
        font-weight: 500;
        margin-bottom: 4rpx;
      }

      .value {
        font-size: 26rpx;
        color: #333;

        &.worker-type {
          color: #e6a23c;
          font-weight: bold;
        }
      }
    }
  }
}

.materials-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  .materials-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .aux-materials-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }
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
      color: #e6a23c;
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
    }
  }
}

.aux-material-card {
  border: 1rpx solid #dcdcdc;
  border-radius: 12rpx;
  padding: 16rpx;
  background-color: #fff;

  .material-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;

    .material-name {
      font-size: 26rpx;
      font-weight: bold;
      color: #666;
    }

    .material-category {
      font-size: 22rpx;
      padding: 4rpx 12rpx;
      border-radius: 12rpx;
      background-color: #e6f7ff;
      color: #fa6616;
    }
  }

  .material-details {
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .detail-item {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.no-materials {
  text-align: center;
  padding: 32rpx 0;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  .no-materials-text {
    font-size: 24rpx;
    color: #999;
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
</style>
