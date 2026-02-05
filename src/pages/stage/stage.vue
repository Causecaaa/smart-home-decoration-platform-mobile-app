<template>
  <view class="construction-container">
    <view class="construction-header">
      <text class="title">施工阶段详情</text>
      <!-- 视图切换按钮 -->
      <view class="view-toggle">
        <text
          :class="['toggle-item', viewMode === 'list' && 'active']"
          @click="viewMode = 'list'"
          @tap="loadStages"
        >
          阶段列表
        </text>
        <text
          :class="['toggle-item', viewMode === 'gantt' && 'active']"
          @click="viewMode = 'gantt'"
          @tap="loadStages"
        >
          甘特图
        </text>
      </view>
    </view>

    <!-- 列表视图 -->
    <view v-if="viewMode === 'list'" class="stages-section">
      <text class="section-title">装修施工阶段</text>
      <view v-for="stageItem in stagesData.stages" :key="stageItem.order" class="stage-card">
        <view class="stage-header">
          <text class="stage-name">{{ stageItem.stageName }}</text>
          <view class="stage-actions">
            <text class="stage-status" :class="getStatusClass(stageItem.status)">{{ stageItem.status }}</text>
            <button
                    class="enter-btn"
                    @click="enterStageDetail(stageItem)">
              进入
            </button>
          </view>
        </view>

        <!-- 阶段详细信息 - 修改为网格布局 -->
        <view class="stage-details-grid">
          <view class="detail-item">
            <text class="label">阶段序号：<text class="value">{{ stageItem.order }}</text></text>
          </view>
          <view class="detail-item">
            <text class="label">主要工种：<text class="value worker-type">{{ stageItem.mainWorkerType }}</text></text>
          </view>
          <view class="detail-item">
            <text class="label">所需人数：<text class="value">{{ stageItem.requiredCount }}人</text></text>
          </view>
          <view class="detail-item">
            <text class="label">预计天数：<text class="value">{{ stageItem.estimatedDay }}天</text></text>
          </view>
          <view v-if="stageItem.start_at" class="detail-item">
            <text class="label">开始时间：<text class="value">{{ formatDate(stageItem.start_at) }}</text></text>
          </view>
          <view v-if="stageItem.end_at" class="detail-item">
            <text class="label">结束时间：<text class="value">{{ formatDate(stageItem.end_at) }}</text></text>
          </view>
        </view>

        <!-- 状态进度条 -->
        <view class="stage-progress-bar">
          <view class="progress-step"
                v-for="(status, index) in ['待开始', '进行中', '已完成', '已验收']"
                :key="index"
                :class="{ active: isStatusActive(stageItem.status, status) }">
            <view class="step-dot"></view>
            <text class="step-label">{{ status }}</text>
          </view>
          <view class="progress-line"></view>
        </view>
      </view>
    </view>

    <!-- 甘特图视图 -->
    <view v-else-if="viewMode === 'gantt'">
      <StageGantt
        :stages="stagesData.stages"
        @change="onGanttChange"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad ,onShow} from '@dcloudio/uni-app';
import { getStage, updateStageSchedule } from '../../api/stage';
import StageGantt from '../../components/StageGantt.vue'; // 假设组件已存在

// 页面状态
const stagesData = ref({ stages: [] });
const houseId = ref(null);
const viewMode = ref('list'); // 添加视图模式状态

// 处理页面加载参数
onLoad((query) => {
  if (query.houseId) {
    houseId.value = Number(query.houseId);
  }
});

onShow(() => {
  loadStages();
});


// 加载施工阶段数据
const loadStages = async () => {
  try {
    const res = await getStage(houseId.value);
    console.log('原始API返回数据', res);

    // 根据实际返回的数据结构来设置 stagesData
    if (res && res.stages) {
      // 如果直接返回 { stages: [...] } 格式
      stagesData.value = res;
    } else if (res && res.data && res.data.stages) {
      // 如果返回 { data: { stages: [...] } } 格式
      stagesData.value = res.data;
    } else {
      // 如果都没有，则初始化为空数组
      stagesData.value = { stages: [] };
      console.warn('API 返回数据格式不符合预期', res);
    }

    console.log('施工阶段数据加载成功', stagesData.value);
  } catch (error) {
    console.error('加载施工阶段失败:', error);
    uni.showToast({
      title: '加载施工阶段失败',
      icon: 'none'
    });
  }
};

// 甘特图修改回调
const onGanttChange = async ({ order, expectedStartAt }) => {
  try {
    await updateStageSchedule(houseId.value, order, expectedStartAt);
    await loadStages(); // 重新加载数据
    uni.showToast({
      title: '排期更新成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('排期更新失败:', error);
    uni.showToast({
      title: '排期更新失败',
      icon: 'none'
    });
  }
};

// 判断状态是否激活
const isStatusActive = (currentStatus, targetStatus) => {
  const statusOrder = ['待开始', '进行中', '已完成', '已验收'];
  const currentIdx = statusOrder.indexOf(currentStatus);
  const targetIdx = statusOrder.indexOf(targetStatus);
  return currentIdx >= targetIdx;
};

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

const enterStageDetail = (stageItem) => {
  uni.navigateTo({
    url: `/src/pages/stage/stage-detail?houseId=${houseId.value}&stageId=${stageItem.order}`
  });
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

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
      flex: 1;
      margin-right: 12rpx;
    }

    .stage-actions {
      display: flex;
      align-items: center;
      gap: 12rpx;

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
          background-color: #f4ecf9;
          color: #953ac2;
          border: 1rpx solid #bf9fe6;
        }
      }

      .enter-btn {
        font-size: 22rpx;
        padding: 8rpx 16rpx;
        background-color: #409eff;
        color: white;
        border: none;
        border-radius: 8rpx;
        line-height: 1;
      }
    }
  }

  .stage-progress-bar {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16rpx 0;
    padding: 0 12rpx;

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 1;
      position: relative;

      .step-dot {
        width: 24rpx;
        height: 24rpx;
        border-radius: 50%;
        background-color: #dcdfe6;
        margin-bottom: 8rpx;
        border: 2rpx solid #e4e7ed;

        &.active {
          background-color: #409eff;
          border-color: #409eff;
        }
      }

      .step-label {
        font-size: 20rpx;
        color: #909399;

        &.active {
          color: #409eff;
          font-weight: 500;
        }
      }

      &.active {
        .step-dot {
          background-color: #409eff;
          border-color: #409eff;
        }

        .step-label {
          color: #409eff;
          font-weight: 500;
        }
      }
    }

    .progress-line {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2rpx;
      background-color: #e4e7ed;
      z-index: 0;
      transform: translateY(-50%);
    }
  }

  .stage-details {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8rpx 0;

      .label {
        font-size: 26rpx;
        color: #666;
        font-weight: 500;
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

// 添加网格布局样式
.stage-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 两列布局 */
  gap: 12rpx;
  margin-top: 16rpx;

  .detail-item {
    display: flex;
    flex-direction: column;
    padding: 12rpx;
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
