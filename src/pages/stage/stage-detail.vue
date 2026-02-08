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
        <view class="section-header">
          <text class="section-title">阶段信息</text>
          <view class="button-container">
            <button
                class="mall-button"
                @click="goToLaborMarket"
                v-if="stageData.decorationType === 'LOOSE'"
            >
              人才市场
            </button>
            <button
                class="mall-button"
                @click="goToMall"
                v-if="stageData.decorationType === 'LOOSE'"
            >
              商城
            </button>
          </view>
        </view>
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
            <text class="label">预定开始时间</text>
            <text class="value">{{ formatDate(stageData.expectedStartAt) }}</text>
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

      <!-- 设计图纸展示 -->
      <view v-if="stageData.designing_image_url" class="basic-info-section">
        <text class="section-title">设计图纸</text>
        <image
            :src="`${BASE_URL}${stageData.designing_image_url}`"
            class="design-image"
            mode="aspectFit"
            @tap="previewImage(`${BASE_URL}${stageData.designing_image_url}`)"
        />
      </view>


      <!-- 工人列表 -->
      <view v-if="workers && workers.length > 0" class="workers-section">
        <text class="section-title">施工人员</text>
        <view class="workers-list">
          <view v-for="worker in workers" :key="worker.workerId" class="worker-row">
            <view class="worker-info-container">
              <image
                  :src="worker.avatarUrl || '/static/default-avatar.png'"
                  class="worker-avatar"
                  mode="aspectFill"
              />
              <view class="worker-details">
                <text class="worker-name">姓名：{{ worker.realName }}</text>
                <text class="worker-skill">技能等级：{{ getSkillLevelText(worker.skillLevel) }}</text>
                <text class="worker-rating">评分：⭐ {{ worker.rating }}</text>
                <text class="worker-phone">电话：{{ worker.phone }}</text>
                <text class="worker-email">邮箱：{{ worker.email }}</text>
                <text class="worker-period">时间：{{ formatDate(worker.expectedStartAt) }} - {{ formatDate(worker.expectedEndAt) }}</text>

              </view>
            </view>
            <button class="chat-button" @click="handleChatClick(worker)">联系</button>
          </view>
        </view>
      </view>

      <!-- 推荐材料列表 -->
      <view v-if="stageData.recommendedMaterialTypes && stageData.recommendedMaterialTypes.length > 0" class="materials-section">
        <view class="section-header">
          <text class="section-title">推荐完成</text>

        </view>
        <view class="materials-list">
          <view v-for="(type, index) in stageData.recommendedMaterialTypes" :key="index" class="material-item">
            <view class="material-info">
              <text class="material-type">{{ getMainMaterialTypeText(type) }}</text>
              <text class="material-display-name">推荐购买该类型材料</text>
            </view>
          </view>
        </view>
      </view>



      <!-- 主材列表 -->
      <view v-if="stageData.mainMaterials && stageData.mainMaterials.length > 0" class="materials-section">
        <view class="section-header">
          <text class="section-title">主材清单</text>
          <button
              v-if="stageData.decorationType === 'HALF'"
              class="mall-button"
              @click="goToMall"
          >
            前往商城
          </button>
        </view>
        <view v-if="stageData.decorationType === 'HALF'" class="half-package-hint">
          <text class="hint-text">**半包装修不包含主材部分**<br>**以下主材仅供参考，请自行购买主材**</text>
        </view>
        <view class="materials-list">
          <view v-for="(item, index) in stageData.mainMaterials" :key="index" class="material-item">
            <view class="material-info">
              <text class="material-type">{{ getMainMaterialTypeText(item.type) }}</text>
              <text class="material-display-name">{{ item.displayName }}</text>
            </view>
            <view class="material-specs">
              <text class="spec-item">面积：{{ item.area }}㎡</text>
              <text v-if="item.remark" class="spec-item remark">备注：{{ item.remark }}</text>
            </view>
          </view>
        </view>
      </view>



      <!-- 已购买主材清单 -->
      <view v-if="stageData.purchasedMainMaterials && stageData.purchasedMainMaterials.length > 0" class="materials-section">
        <text class="section-title">已购买主材清单</text>
        <view class="materials-list">
          <view v-for="(item, index) in stageData.purchasedMainMaterials" :key="index" class="material-item">
            <view class="material-info">
              <text class="material-type">{{ getMainMaterialTypeText(item.type) }}</text>
              <text class="material-display-name">{{ item.displayName }}</text>
            </view>

            <view class="material-item-row">

              <view class="material-specs">
                <text class="spec-item">品牌：{{ item.brand }}</text>
                <text class="spec-item">单价：¥{{ item.unitPrice }}</text>
                <text class="spec-item">数量：{{ item.quantity }}</text>
                <text class="spec-item">小计：¥{{ item.subtotal }}</text>
                <text v-if="item.remark" class="spec-item remark">备注：{{ item.remark }}</text>
              </view>

              <image
                  v-if="item.image_url"
                  :src="`${BASE_URL}${item.image_url}`"
                  class="material-image"
                  mode="aspectFill"
                  @tap="previewImage(`${BASE_URL}${item.image_url}`)"
              />

            </view>

          </view>
        </view>
      </view>



      <!-- 如果没有已购买的主材显示提示 -->
      <view v-else-if="stageData.decorationType === 'HALF' && stageData.mainMaterials && stageData.mainMaterials.length > 0" class="no-materials">
        <text class="no-materials-text">暂无已购买的主材</text>
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
      <view v-if="(! stageData.decorationType === 'LOOSE') && (!stageData.mainMaterials || stageData.mainMaterials.length === 0) &&
                 (!stageData.auxiliaryMaterials || stageData.auxiliaryMaterials.length === 0)"
            class="no-materials">
        <text class="no-materials-text">此阶段暂无材料清单</text>
      </view>
    </view>
    <!-- 按钮操作区域 -->
    <view v-if="stageData.status === '待开始' && isStartable" class="action-buttons">
      <button class="start-button" @click="handleStartStage">开始</button>
    </view>

    <view v-else-if="stageData.status === '已完成'" class="action-buttons">
      <button class="accept-button" @click="handleAcceptStage">验收</button>
    </view>

    <!-- 修改弹窗 -->
    <uni-popup ref="modifyPopup" type="center">
      <view class="modal">
        <view class="modal-header">
          <text>修改阶段信息</text>
          <text class="close" @click="closeModifyDialog">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <label>所需人数：</label>
            <input v-model="modifyData.requiredCount" placeholder="请输入所需人数" />
          </view>
          <view class="form-item">
            <label>预计天数：</label>
            <input v-model="modifyData.estimatedDay" placeholder="请输入预计天数" />
          </view>
          <view class="form-item">
            <label>预定开始时间：</label>
            <picker mode="date" :value="modifyData.expectedStartAt" @change="onDateChange">
              <view class="picker">{{ modifyData.expectedStartAt || '请选择日期' }}</view>
            </picker>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeModifyDialog">取消</button>
          <button class="confirm-btn" @click="confirmModify">确认</button>
        </view>
      </view>
    </uni-popup>



  </view>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import { onLoad ,onShow} from '@dcloudio/uni-app';
import {getStage, getStageDetail} from '../../api/stage';
import { BASE_URL } from '../../config/apiConfig';
import { startStage, acceptStage } from '../../api/stage';
import {updateStage} from "../../api/worker";



// 页面状态
const stageData = ref({
  mainMaterials: [],
  auxiliaryMaterials: [],
  purchasedMainMaterials: [], // 新增字段
  purchasedAuxiliaryMaterials: [], // 可选：如果需要显示已购买的辅材
  order: null,
  stageName: '',
  status: '',
  mainWorkerType: '',
  requiredCount: 0,
  estimatedDay: 0,
  start_at: null,
  end_at: null,
  decorationType: ''
});


const houseId = ref(null);
const stageId = ref(null);
const isLoading = ref(true);
const workers = ref([]);
const isStartable = computed(() => {
  if (!stageData.value.expectedStartAt) return false;
  const expectedStartTime = new Date(stageData.value.expectedStartAt).getTime();
  const currentTime = new Date().getTime();
  return currentTime >= expectedStartTime;
});
// 格式化日期，只保留年月日
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const loadStageDetail = async () => {
  try {
    const res = await getStageDetail(houseId.value, stageId.value);
    stageData.value = {
      ...stageData.value,
      ...res.stageInfo,
      decorationType: res.decorationType,
      purchasedMainMaterials: res.stageInfo.purchasedMainMaterials || [] // 提取已购买主材
    };
    // 处理工人信息
    workers.value = (res.workerResponse?.workers || []).map(worker => ({
      ...worker,
      avatarUrl: worker.avatarUrl ? `${BASE_URL}${worker.avatarUrl}` : null
    }));
    console.log('阶段详情数据加载成功', stageData.value, '工人列表:', workers.value);
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

const goToMall = () => {
  // 跳转到商城页面，可以根据实际路由调整
  uni.navigateTo({
    url: `/src/pages/mall/mall?stageId=${stageData.value.stageId}` // 示例商城页面路径
  });
};

const goToLaborMarket = () => {
  uni.navigateTo({
    url: `/src/pages/mall/labor-market?stageId=${stageData.value.stageId}` // 示例商城页面路径
  });
};


const handleChatClick = (worker) => {
  console.log('与工人聊天:', worker.realName);
  uni.navigateTo({
    url: `/src/pages/contact/contactDetail?targetUserId=
    ${Number(worker.workerId)}&targetUserName=${worker.realName}&targetAvatarUrl=${worker.avatarUrl}`
  });

};

// 图片预览
const previewImage = (imgUrl) => {
  uni.previewImage({
    urls: [imgUrl]
  })
}

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

onLoad((options) => {
  console.log('页面参数 options:', options); // 正确获取参数
  if (!options.houseId) {
    uni.showToast({ title: '缺少 houseId', icon: 'none' });
    return;
  }
  houseId.value = Number(options.houseId);
  stageId.value = options.stageId ? Number(options.stageId) : null;

  // 参数拿到后再加载数据
  loadStageDetail();
});


onShow(() => {
  loadStageDetail();
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

const SKILL_LEVEL_MAP = {
  BEGINNER: '初级',
  INTERMEDIATE: '中级',
  SKILLED: '高级',
  EXPERT: '专家'
};

const getSkillLevelText = (level) => {
  return SKILL_LEVEL_MAP[level] || level;
};


// 获取材料类别文本
const getCategoryText = (category) => {
  return CATEGORY_MAP[category] || category;
};

// 获取主材类型文本
const getMainMaterialTypeText = (type) => {
  return MAIN_MATERIAL_TYPE_MAP[type] || type;
};


// 开始阶段
const handleStartStage = async () => {
  uni.showModal({
    title: '确认开始',
    content: '请确认所有材料与人员均已到场',
    success: async (res) => {
      if (res.confirm) {
        try {
          await startStage(houseId.value, stageData.value.order);
          uni.showToast({
            title: '阶段已开始',
            icon: 'success'
          });
          // 刷新页面数据
          await loadStageDetail();
        } catch (error) {
          console.error('开始阶段失败:', error);
          uni.showToast({
            title: '开始阶段失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 验收阶段
const handleAcceptStage = async () => {
  uni.showModal({
    title: '确认验收',
    content: '确定要验收该阶段吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await acceptStage(houseId.value, stageData.value.order);
          uni.showToast({
            title: '阶段已验收',
            icon: 'success'
          });
          // 刷新页面数据
          await loadStageDetail();
        } catch (error) {
          console.error('验收阶段失败:', error);
          uni.showToast({
            title: '验收阶段失败',
            icon: 'none'
          });
        }
      }
    }
  });
};


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
        background-color: #f4ecf9;
        color: #953ac2;
        border: 1rpx solid #bf9fe6;
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

  .material-item-row {
    display: flex;
    gap: 24rpx;
    align-items: flex-start;

    .material-image {
      width: 190rpx;
      height: 190rpx;
      border-radius: 12rpx;
      background-color: #f0f0f0;
      flex-shrink: 0;
    }


  }
}
.material-specs {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(1, 1fr); // 两列布局，如果想四列可以改
  gap: 12rpx;

  .spec-item {
    font-size: 24rpx;
    color: #666;
  }

  .remark {
    grid-column: span 2; // 备注占满整行
    color: #999;
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

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.section-header .section-title {
  flex: 1; /* 占满左边空间 */
  font-size: 32rpx;
  font-weight: bold;
  color: #1e1e2f;
}

.section-header .mall-button {
  font-size: 24rpx;
  color: #fff;
  background-color: #409eff;
  border: none;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  cursor: pointer;
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

.workers-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  .workers-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .worker-row {
    display: flex;
    justify-content: space-between; /* 让内容和按钮分布在两端 */
    align-items: center;
    padding: 16rpx;
    background-color: #f8f9fa;
    border-radius: 8rpx;
  }

  .worker-info-container {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex: 1; /* 占据剩余空间，让按钮靠右 */
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

    .worker-name {
      font-size: 26rpx;
      font-weight: bold;
      color: #333;
    }

    .worker-skill,
    .worker-rating,
    .worker-phone,
    .worker-period,
    .worker-email {
      font-size: 22rpx;
      color: #666;
    }
  }

  .chat-button {
    font-size: 24rpx;
    color: #fff;
    background-color: #409eff;
    border: none;
    border-radius: 8rpx;
    padding: 8rpx 16rpx;
    cursor: pointer;
    white-space: nowrap; /* 防止按钮文字换行 */
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 32rpx;

  .start-button,
  .accept-button {
    width: 200rpx;
    height: 60rpx;
    font-size: 28rpx;
    border-radius: 8rpx;
    border: none;
    color: #fff;
    cursor: pointer;
  }

  .start-button {
    background-color: #409eff; // 蓝色表示“开始”
  }

  .accept-button {
    background-color: #67c23a; // 绿色表示“验收”
  }
}
.half-package-hint {
  background-color: #fffbe6;
  border: 1rpx solid #ffe58f;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 32rpx;
  text-align: center;

  .hint-text {
    font-size: 26rpx;
    color: #faad14;
    font-weight: bold;
  }
}

.modify-dialog {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  width: 80vw;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .dialog-title {
      font-size: 32rpx;
      font-weight: bold;
    }

    .close {
      font-size: 40rpx;
      cursor: pointer;
    }
  }

  .dialog-body {
    input, .picker {
      width: 100%;
      padding: 16rpx;
      margin-bottom: 16rpx;
      border: 1rpx solid #ccc;
      border-radius: 8rpx;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-around;
    margin-top: 24rpx;

    button {
      padding: 12rpx 24rpx;
      border-radius: 8rpx;
      border: none;
      color: #fff;
      background-color: #409eff;
    }
  }
}

.modal {
  background: #fff;
  border-radius: 24rpx;
  width: 80vw;
  max-height: 80vh;
  padding: 30rpx;

  .modal-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    margin-bottom: 24rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #eee;

    .close {
      cursor: pointer;
      font-size: 40rpx;
    }
  }

  .modal-body {
    .form-item {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      label {
        font-size: 28rpx;
        width: 180rpx;
      }

      input,
      .picker {
        flex: 1;
        padding: 12rpx;
        border: 1rpx solid #ccc;
        border-radius: 8rpx;
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: space-around;
    margin-top: 24rpx;

    button {
      padding: 12rpx 24rpx;
      border-radius: 8rpx;
      border: none;
      color: #fff;
    }

    .cancel-btn {
      background-color: #ccc;
    }

    .confirm-btn {
      background-color: #409eff;
    }
  }
}
.section-header .button-container {
  display: flex;
  gap: 16rpx; /* 按钮之间的间距 */
}

.mall-button {
  font-size: 24rpx;
  color: #fff;
  background-color: #409eff;
  border: none;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  cursor: pointer;
  white-space: nowrap; /* 防止文字换行 */
}

</style>
