<template>
  <view class="construction-container">
    <view class="construction-header">
      <text class="title">施工阶段详情</text>
    </view>

    <!-- 施工阶段列表 -->
    <view class="stages-section">
      <text class="section-title">装修施工阶段</text>
      <view v-for="stageItem in stagesData.stages" :key="stageItem.stage" class="stage-card">
        <view class="stage-header">
          <text class="stage-name">{{ stageItem.stageName }}</text>
          <text class="stage-number">第 {{ stageItem.stage }} 阶段</text>
        </view>

        <!-- 主材列表 -->
        <view v-if="stageItem.mainMaterials && stageItem.mainMaterials.length > 0" class="materials-section">
          <text class="materials-title">主材清单</text>
          <view class="materials-list">
            <view v-for="(item, index) in stageItem.mainMaterials" :key="index" class="material-item">
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
        <view v-if="stageItem.auxiliaryMaterials && stageItem.auxiliaryMaterials.length > 0" class="materials-section">
          <text class="materials-title">辅材清单</text>
          <view class="aux-materials-list">
            <view v-for="(material, index) in stageItem.auxiliaryMaterials" :key="index" class="aux-material-card">
              <view class="material-header">
                <text class="material-name">{{ material.name }}</text>
                <text class="material-category">{{ getCategoryText(material.category) }}</text>
              </view>
              <view class="material-details">
                <text class="detail-item">单位：{{ material.unit }}</text>
                <text class="detail-item">数量：{{ material.quantity }}{{ material.unit }}</text>
              </view>
              <text v-if="material.remark" class="material-remark">{{ material.remark }}</text>
            </view>
          </view>
        </view>

        <!-- 如果没有材料显示提示 -->
        <view v-if="(!stageItem.mainMaterials || stageItem.mainMaterials.length === 0) &&
                   (!stageItem.auxiliaryMaterials || stageItem.auxiliaryMaterials.length === 0)"
             class="no-materials">
          <text class="no-materials-text">此阶段暂无材料清单</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getStage } from '../../api/construction';

// 页面状态
const stagesData = ref({ stages: [] });
const houseId = ref(null);

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
});

// 加载施工阶段数据
const loadStages = async () => {
  try {
    const res = await getStage(houseId.value);
    stagesData.value = res;
    console.log('施工阶段数据加载成功', res);
  } catch (error) {
    console.error('加载施工阶段失败:', error);
    uni.showToast({
      title: '加载施工阶段失败',
      icon: 'none'
    });
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

onMounted(() => {
  loadStages();
});
</script>

<style lang="scss">
.construction-container {
  padding: 48rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.construction-header {
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

.stages-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.stage-card {
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background-color: #fafafa;

  &:last-child {
    margin-bottom: 0;
  }

  .stage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    padding-bottom: 12rpx;
    border-bottom: 1rpx solid #eee;

    .stage-name {
      font-size: 30rpx;
      font-weight: bold;
      color: #1e1e2f;
    }

    .stage-number {
      font-size: 26rpx;
      color: #409eff;
      font-weight: bold;
    }
  }

  .materials-section {
    margin-top: 16rpx;

    .materials-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #409eff;
      display: block;
      margin-bottom: 12rpx;
    }

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

    .material-remark {
      font-size: 22rpx;
      color: #999;
      margin-top: 8rpx;
      display: block;
    }
  }

  .no-materials {
    text-align: center;
    padding: 32rpx 0;

    .no-materials-text {
      font-size: 24rpx;
      color: #999;
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
</style>
