<template>
  <view class="worker-container">
    <view class="basic-info-section">
      <view class="section-header">
        <text class="section-title">阶段信息</text>
        <button class="mall-button" @click="openModifyDialog">修改</button>
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
      </view>
    </view>

    <!-- 工人列表 -->
    <view class="workers-section">
      <text class="section-title">此时间段空闲工人列表</text>
      <view class="workers-list">
        <view v-for="worker in workers" :key="worker.userId" class="worker-row">
          <view class="worker-info-container">
            <image
                :src="BASE_URL + worker.avatarUrl || '/static/default-avatar.png'"
                class="worker-avatar"
                mode="aspectFill"
            />
            <view class="worker-details">
              <text class="worker-name">姓名：{{ worker.realName }}</text>
              <text class="worker-skill">技能等级：{{ getSkillLevelText(worker.level) }}</text>
              <text class="worker-rating">评分：⭐ {{ worker.rating }}</text>
              <text class="worker-phone">电话：{{ worker.phone }}</text>
              <text class="worker-email">邮箱：{{ worker.email }}</text>
            </view>
          </view>
          <button class="chat-button" @click="handleChatClick(worker)">联系</button>
        </view>
      </view>
    </view>

    <!-- 分页控件 -->
    <uni-pagination
        :current="currentPage + 1"
        :total="totalElements"
        :pageSize="pageSize"
        @change="handlePageChange"
    />



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
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { onLoad ,onShow} from '@dcloudio/uni-app';
import {BASE_URL} from "../../config/apiConfig";
import {getLaborMarket, updateStage} from "../../api/worker";
import {inviteWorkers} from "../../api/worker";

const stageData = ref({});
const stageId = ref(0);
const minLevel = ref("JUNIOR");

// 分页状态
const currentPage = ref(0)
const pageSize = ref(5)
const totalPages = ref(0)
const totalElements = ref(0)
const workers = ref([])

// 技能等级映射
const SKILL_LEVEL_MAP = {
  JUNIOR: '初级',
  SKILLED: '熟练',
  MASTER: '大师级'
}


const getSkillLevelText = (level) => {
  return SKILL_LEVEL_MAP[level] || level
}

// 加载工人列表
const loadWorkers = async () => {
  try {
    const res = await getLaborMarket(stageId.value, minLevel.value, currentPage.value, pageSize.value)
    const {
      workers: workerList,
      totalPages: totalPageCount,
      totalElements: totalCount,
      mainWorkerType,
      requiredCount,
      expectedStartAt,
      estimatedDay
    } = res

    // 更新工人列表和分页信息
    workers.value = workerList
    totalPages.value = totalPageCount
    totalElements.value = totalCount

    // 更新阶段信息
    stageData.value = {
      mainWorkerType,
      requiredCount,
      expectedStartAt,
      estimatedDay
    }
  } catch (error) {
    console.error('加载工人列表失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  }
}


// 分页切换
const handlePageChange = (e) => {
  currentPage.value = e.current - 1 // uni-pagination 页码从 1 开始
  loadWorkers()
}

// 联系工人
const handleChatClick = (worker) => {
  uni.navigateTo({
    url: `/src/pages/contact/contactDetail?targetUserId=${worker.userId}&targetUserName=${worker.realName}&targetAvatarUrl=${worker.avatarUrl}`
  })
}

// 页面加载时初始化
onMounted(() => {
  loadWorkers()
})


onLoad((options) =>{
  console.log('页面参数 option1s:', options)
  if (!options.stageId) {
    uni.showToast({ title: '缺少 stageId 参数', icon: 'none' })
    return
  }
  stageId.value = Number(options.stageId)
})

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 弹窗相关数据
const modifyPopup = ref(null);
const modifyData = ref({
  requiredCount: '',
  estimatedDay: '',
  expectedStartAt: ''
});

// 打开修改弹窗
const openModifyDialog = () => {
  modifyData.value = {
    requiredCount: stageData.value.requiredCount,
    estimatedDay: stageData.value.estimatedDay,
    expectedStartAt: formatDate(stageData.value.expectedStartAt)
  };
  modifyPopup.value?.open();
};


// 关闭修改弹窗
const closeModifyDialog = () => {
  modifyPopup.value?.close();
};

// 日期选择回调
const onDateChange = (e) => {
  modifyData.value.expectedStartAt = e.detail.value;
};

// 确认修改
const confirmModify = async () => {
  try {
    const payload = {
      requiredCount: Number(modifyData.value.requiredCount),
      estimatedDay: Number(modifyData.value.estimatedDay),
      expectedStartAt: modifyData.value.expectedStartAt
    };

    await updateStage(houseId.value, stageId.value, payload);
    uni.showToast({
      title: '修改成功',
      icon: 'success'
    });
    closeModifyDialog();
  } catch (error) {
    console.error('修改失败:', error);
    uni.showToast({
      title: '修改失败，请重试',
      icon: 'none'
    });
  }
};


</script>




<style scoped lang="scss">
.workers-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1e1e2f;
    margin-bottom: 24rpx;
  }

  .workers-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .worker-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx;
    background-color: #f8f9fa;
    border-radius: 8rpx;
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
    .worker-skill,
    .worker-rating,
    .worker-phone,
    .worker-email {
      font-size: 22rpx;
      color: #666;
    }

    .worker-name {
      font-weight: bold;
      color: #333;
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
    white-space: nowrap;
  }
}


</style>