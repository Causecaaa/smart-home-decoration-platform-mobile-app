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
          <view class="worker-actions">
            <button class="add-worker-btn" :disabled="isSelected(worker.userId)" @click.stop="addWorker(worker)">
              +
            </button>
          </view>
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

  <!-- 底部邀请条 -->
  <view class="invite-bar" @click="toggleInviteDrawer">
    <text>已选 {{ selectedWorkers.length }} 人</text>
    <text class="invite-btn" @click.stop="openInvitePopup">一键邀请</text>
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


  <!-- 一键邀请弹窗 -->
  <uni-popup ref="invitePopup" type="center">
    <view class="invite-modal">
      <view class="modal-header">
        <text>确认邀请工人</text>
        <text class="close" @click="closeInvitePopup">×</text>
      </view>
      <view class="modal-body">
        <!-- 已选工人列表 -->
        <view class="workers-list">
          <view v-for="worker in selectedWorkers" :key="worker.userId" class="worker-row">
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
              </view>
            </view>
          </view>
        </view>

        <!-- 日工资输入 -->
        <view class="form-item">
          <label>日工资（元）：</label>
          <input v-model="dailyWage" type="number" placeholder="请输入日工资" />
        </view>

      </view>
      <view class="modal-footer">
        <button class="cancel-btn" @click="closeInvitePopup">取消</button>
        <button class="confirm-btn" @click="sendInvite">确认邀请</button>
      </view>
    </view>
  </uni-popup>




</template>

<script setup>
import { onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app';
import {BASE_URL} from "../../config/apiConfig";
import {getLaborMarket, updateStage} from "../../api/worker";
import {inviteWorkers} from "../../api/worker";

const stageData = ref({});
const stageId = ref(0);
const minLevel = ref("JUNIOR");
const dailyWage = ref(0);
const invitePopup = ref(null);

// 分页状态
const currentPage = ref(0)
const pageSize = ref(5)
const totalPages = ref(0)
const totalElements = ref(0)
const workers = ref([])
const selectedWorkers = ref([])
const showInviteDrawer = ref(false)

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

const isSelected = (workerId) => selectedWorkers.value.some(worker => worker.userId === workerId)

const addWorker = (worker) => {
  if (isSelected(worker.userId)) {
    uni.showToast({
      title: '该工人已在队伍',
      icon: 'none'
    });

    return
  }
  selectedWorkers.value = [...selectedWorkers.value, worker]
  uni.showToast({
    title: '加入成功',
    icon: 'success'
  });
}


const toggleInviteDrawer = () => {
  showInviteDrawer.value = !showInviteDrawer.value
}


// 打开邀请弹窗
const openInvitePopup = () => {
  if (selectedWorkers.value.length === 0) {
    uni.showToast({ title: '请先选择工人', icon: 'none' });
    return;
  }
  invitePopup.value?.open();
};

// 关闭邀请弹窗
const closeInvitePopup = () => {
  invitePopup.value?.close();
};

// 发送邀请
const sendInvite = async () => {
  if (dailyWage.value <= 0) {
    uni.showToast({ title: '请输入有效的日工资', icon: 'none' });
    return;
  }

  try {
    await inviteWorkers(stageId.value, {
      dailyWage: Number(dailyWage.value),
      workerIds: selectedWorkers.value.map(worker => worker.userId)
    });
    uni.showToast({ title: '邀请已发送', icon: 'success' });
    selectedWorkers.value = []; // 清空已选工人
    closeInvitePopup(); // 关闭弹窗
  } catch (error) {
    console.error('邀请失败:', error);
    uni.showToast({ title: '邀请失败，请重试', icon: 'none' });
  }
};

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
    console.log('修改阶段数据:', payload);

    await updateStage(stageId.value, payload);
    uni.showToast({
      title: '修改成功',
      icon: 'success'
    });
    closeModifyDialog();
    await loadWorkers();
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
.worker-container {
  padding-bottom: 160rpx;
}

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



  .worker-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx;
    background-color: #f8f9fa;
    border-radius: 8rpx;
  }





  .worker-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .add-worker-btn {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background-color: #409eff;
    color: #fff;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &:disabled {
      background-color: #b6d4ff;
      color: #fff;
    }
  }
}

.worker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  padding-left: 140rpx;
  border-radius: 8rpx;
}

.worker-info-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.workers-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
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

.invite-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  border-top: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-around;
  font-size: 28rpx;
  z-index: 120;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);

  .invite-btn {
    background: #409eff;
    color: #fff;
    padding: 12rpx 24rpx;
    border-radius: 16rpx;
  }
}

.invite-drawer {
  position: fixed;
  bottom: 100rpx;
  left: 0;
  right: 0;
  max-height: 520rpx;
  background: #fff;
  border-top: 1px solid #e5e5e5;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
  padding: 16rpx 24rpx 24rpx;
  overflow-y: auto;

  .invite-empty {
    text-align: center;
    color: #999;
    font-size: 24rpx;
    padding: 24rpx 0;
  }

  .invite-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .invite-avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    background: #f2f2f2;
  }

  .invite-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .invite-name {
      font-size: 26rpx;
      font-weight: 600;
      color: #333;
    }

    .invite-skill {
      font-size: 22rpx;
      color: #666;
    }
  }

  .remove-worker-btn {
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    background-color: #ff6b6b;
    color: #fff;
    font-size: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.section-header {
  display: flex;
  align-items: center;
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
.invite-modal {
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
    .worker-list {
      margin-bottom: 20rpx;

      .worker-item {
        padding: 12rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .form-item {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      label {
        font-size: 28rpx;
        width: 180rpx;
      }

      input {
        flex: 1;
        padding: 12rpx;
        border: 1rpx solid #ccc;
        border-radius: 8rpx;
      }
    }

    .total-amount {
      text-align: right;
      font-size: 28rpx;
      font-weight: bold;
      color: #e6a23c;
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


</style>
