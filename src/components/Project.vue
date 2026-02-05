<template>
  <view class="worker-calendar">
    <!-- 月份选择 -->
    <picker mode="date" fields="month" :value="currentDate" @change="onMonthChange">
      <view class="month-picker">{{ currentMonth }}</view>
    </picker>

    <!-- 星期头 -->
    <view class="week-header">
      <text v-for="w in weeks" :key="w">{{ w }}</text>
    </view>

    <!-- 日期格子 -->
    <view class="calendar">
      <view
          v-for="day in days"
          :key="day.date || `empty-${day.day}`"
          class="day"
          :class="{
    active: day.assignments.length > 0,
    today: day.isToday,
    selected: day.date === selectedDate,
    leave: day.isLeave // 新增请假状态样式
  }"
          @tap="selectDay(day)"
      >
        <view class="date">{{ day.day }}</view>
        <view class="task-indicators">
          <view
              v-for="(assignment, index) in day.assignments"
              :key="index"
              class="indicator"
              :style="{ backgroundColor: getStatusColor(assignment.status) }"
          ></view>
        </view>
      </view>

    </view>

    <view v-if="selectedDate" class="date-action-bar">
      <text class="selected-date-text">
      </text>

      <button
          class="leave-btn"
          v-if="canRequestLeave && !hasLeave"
          @click="Leave"
      >
        请假
      </button>

      <button
          class="cancel-leave-btn"
          v-if="hasLeave"
          @click="cancelLeave"
      >
        取消请假
      </button>

    </view>


    <view
        v-if="selectedDate && selectedAssignments.length === 0"
        class="no-materials"
    >
      <text class="no-materials-text">当天暂无任务安排</text>
    </view>


    <!-- 任务详情显示区域 -->
    <view v-if="selectedAssignments.length > 0" class="task-detail-section">
      <text class="section-title">任务详情</text>
      <view v-for="(assignment, index) in selectedAssignments" :key="index" class="assignment-item">
        <!-- 任务标题 -->
        <view class="task-header">
          <text class="stage-name">{{ assignment.stageName }}</text>
          <text class="task-status" :class="getStatusClass(assignment.status)">
            {{ assignment.status }}
          </text>

          <button
              v-if="assignment.status === 'IN_PROGRESS'"
              class="complete-task-btn"
              @click="completeTask(assignment)"
          >
            完成任务
          </button>
        </view>

        <!-- 地址信息 -->
        <view class="task-address">
          <text class="icon">📍</text>
          <text class="address-text">
            {{ assignment.city }} {{ assignment.communityName }}
            {{ assignment.buildingNo }}栋{{ assignment.unitNo }}单元{{ assignment.roomNo }}
          </text>
        </view>

        <!-- 时间范围 -->
        <view class="task-time">
          <text class="icon">🕒</text>
          <text class="time-text">
            {{ assignment.expected_Start_at }} 至 {{ assignment.expected_End_at }}
          </text>
        </view>

        <view v-if="assignment.designation_image_url" class="design-image-container">
          <image
              :src="`${BASE_URL}${assignment.designation_image_url}`"
              class="design-image"
              mode="aspectFit"
              @tap="previewImage(`${BASE_URL}${assignment.designation_image_url}`)"
          />
        </view>
      </view>
    </view>



    <!-- 工人列表 -->
    <view v-if="allWorkers.length > 0" class="workers-section">
      <text class="section-title">工友</text>
      <view class="workers-list">
        <view v-for="worker in allWorkers" :key="worker.userId" class="worker-row">
          <view class="worker-info-container">
            <image
                :src="worker.avatarUrl || '/static/default-avatar.png'"
                class="worker-avatar"
                mode="aspectFill"
            />
            <view class="worker-details">
              <text class="worker-name">姓名：{{ worker.realName }}</text>
              <text class="worker-phone">电话：{{ worker.phone }}</text>
              <text class="worker-email">邮箱：{{ worker.email }}</text>
              <text class="worker-email">工作时间：{{ (worker.expected_Start_at) }} - {{ (worker.expected_End_at) }}</text>

            </view>
          </view>
          <button class="chat-button" @click="handleChatClick(worker)">聊天</button>
        </view>
      </view>
    </view>

    <!-- 材料列表 -->
    <view v-if="allMainMaterials.length > 0 || allAuxMaterials.length > 0" class="materials-section">
      <!-- 主材 -->
      <view v-if="allMainMaterials.length > 0">
        <text class="section-title">主材清单</text>
        <view class="materials-list">
          <view v-for="(item, i) in allMainMaterials" :key="i" class="material-item">
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

    </view>

    <view v-if="allAuxMaterials.length > 0 || allAuxMaterials.length > 0" class="materials-section">
      <view v-if="allAuxMaterials.length > 0">
        <text class="section-title">辅材清单</text>
        <view class="aux-materials-list">
          <view v-for="(material, i) in allAuxMaterials" :key="i" class="aux-material-card">
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
    </view>

    <view v-if="(selectedAssignments.length) && (!allMainMaterials || allMainMaterials.length === 0) &&
                 (!allAuxMaterials || allAuxMaterials.length === 0)"
          class="no-materials">
      <text class="no-materials-text">此阶段暂无材料清单</text>
    </view>

    <!-- 如果没有任务显示提示 -->
    <view v-if="assignments.length === 0" class="no-materials">
      <text class="no-materials-text">本月暂无任务</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {cancelLeaveRequest, getWorkerStageCalendar, requestLeave} from '../api/worker'
import {completeStage} from "../api/stage";
import {BASE_URL} from "../config/apiConfig";

const weeks = ['一', '二', '三', '四', '五', '六', '日']
const currentDate = ref(new Date())
const currentMonth = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
})
const selectedDate = ref('')
const hasLeave = ref(false); // 是否已请假
const todayStr = new Date().toISOString().slice(0, 10)


const canRequestLeave = computed(() => {
  if (!selectedDate.value) return false
  return selectedDate.value > todayStr
})
// 图片预览
const previewImage = (imgUrl) => {
  uni.previewImage({
    urls: [imgUrl]
  })
}

const Leave = async () => {
  // 初始化请假类型和原因
  let leaveType = '';
  let reason = '';

  // 自定义弹窗组件或使用 uni.showActionSheet + uni.showModal 实现
  uni.showActionSheet({
    itemList: ['病假 (SICK)', '事假 (PERSONAL)', '其他 (OTHER)'],
    success: async (res) => {
      const leaveTypes = ['SICK', 'PERSONAL', 'OTHER'];
      leaveType = leaveTypes[res.tapIndex];

      // 输入请假原因
      uni.showModal({
        title: '请输入请假原因',
        editable: true,
        placeholderText: '请填写具体原因...',
        success: async (inputRes) => {
          if (inputRes.confirm) {
            reason = inputRes.content.trim();

            if (!reason) {
              uni.showToast({
                title: '请假原因不能为空',
                icon: 'none'
              });
              return;
            }

            try {
              // 调用请假接口，传递请假日期、类型和原因
              await requestLeave(selectedDate.value, leaveType, reason);

              uni.showToast({
                title: '请假申请已提交',
                icon: 'success'
              });

              // 重新加载任务数据以更新视图
              await loadAssignments();
            } catch (error) {
              console.error('请假申请失败:', error);
              uni.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    }
  });
};


const cancelLeave = async () => {
  uni.showModal({
    title: '确认取消请假',
    content: `确定要取消 ${selectedDate.value} 的请假吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用取消请假接口（假设后端提供此接口）
          await cancelLeaveRequest(selectedDate.value);

          // 显示成功提示
          uni.showToast({
            title: '请假已取消',
            icon: 'success'
          });

          // 重新加载任务数据以更新视图
          await loadAssignments();
        } catch (error) {
          console.error('取消请假失败:', error);
          uni.showToast({
            title: '操作失败，请重试',
            icon: 'none'
          });
        }
      }
    }
  });
};


const assignments = ref([])
const days = ref([])
const selectedAssignments = ref([])

// 合并工人和材料
const allWorkers = computed(() => {
  const workersMap = {}
  selectedAssignments.value.forEach(a => {
    a.coworkers?.forEach(w => { workersMap[w.userId] = w })
  })
  return Object.values(workersMap)
})

const allMainMaterials = computed(() => {
  const map = {}
  selectedAssignments.value.forEach(a => {
    a.mainMaterials?.forEach(m => { map[m.id || `${m.type}-${m.displayName}`] = m })
  })
  return Object.values(map)
})

const allAuxMaterials = computed(() => {
  const map = {}
  selectedAssignments.value.forEach(a => {
    a.auxiliaryMaterials?.forEach(m => { map[m.id || m.name] = m })
  })
  return Object.values(map)
})


const getStatusClass = status => {
  switch (status) {
    case 'PENDING':
      return 'status-pending'
    case 'IN_PROGRESS':
      return 'status-in-progress'
    case 'COMPLETED':
      return 'status-completed'
    default:
      return ''
  }
}

const loadAssignments = async () => {
  try {
    const response = await getWorkerStageCalendar(currentMonth.value);
    assignments.value = response?.assignments || [];
    generateDays(response); // 将 response 传递给 generateDays
  } catch (err) {
    console.error(err);
  }
};

const generateDays = (response) => { // 接收 response 参数
  const [year, month] = currentMonth.value.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 7 : firstDay;
  const totalDays = new Date(year, month, 0).getDate();

  const result = [];
  for (let i = 1; i < adjustedFirstDay; i++) {
    result.push({ day: '', date: null, assignments: [], isLeave: false });
  }

  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${currentMonth.value}-${String(i).padStart(2, '0')}`;
    const dailyAssignments = assignments.value.filter(
        a => dateStr >= a.expected_Start_at && dateStr <= a.expected_End_at
    );

    // 检查是否是请假日期
    const isLeave = response?.leaveDays?.includes(dateStr) || false;

    result.push({
      day: i,
      date: dateStr,
      assignments: dailyAssignments,
      isToday: dateStr === new Date().toISOString().slice(0, 10),
      isLeave // 标记是否为请假日期
    });
  }
  days.value = result;
};


const onMonthChange = async e => {
  const value = e?.detail?.value
  if (!value) return
  const parts = value.split('-')
  if (parts.length < 2) return
  const [y, m] = parts
  currentDate.value = new Date(Number(y), Number(m) - 1, 1)
  await loadAssignments()
}

const completeTask = async (assignment) => {
  try {
    // 调用完成任务的 API
    await completeStage(assignment.stageId);

    await loadAssignments()

    // 手动更新 assignment 的状态
    assignment.status = 'COMPLETED';

    // 触发响应式更新（强制刷新）
    selectedAssignments.value = [...selectedAssignments.value];


    uni.showToast({
      title: '任务已完成',
      icon: 'success'
    });
  } catch (error) {
    console.error('完成任务失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
};


const selectDay = (day) => {
  selectedDate.value = day.date;

  // 判断是否已请假
  hasLeave.value = day.isLeave;

  if (day.assignments && day.assignments.length > 0) {
    selectedAssignments.value = day.assignments;
  } else {
    selectedAssignments.value = [];
  }
};




const CATEGORY_MAP = { CEMENT: '水泥建材', PIPE: '管道', WIRE: '电线', ETC: '其他辅材' }
const MAIN_MATERIAL_TYPE_MAP = { FLOOR: '地面', WALL: '墙面', CEILING: '天花板', CABINET: '柜体' }
const SKILL_LEVEL_MAP = { BEGINNER: '初级', INTERMEDIATE: '中级', SKILLED: '高级', EXPERT: '专家' }

const getSkillLevelText = level => SKILL_LEVEL_MAP[level] || level
const getCategoryText = cat => CATEGORY_MAP[cat] || cat
const getMainMaterialTypeText = type => MAIN_MATERIAL_TYPE_MAP[type] || type

const handleChatClick = worker => {
  uni.navigateTo({
    url: `/src/pages/contact/contactDetail?targetUserId=${worker.userId}&targetUserName=${worker.realName}&targetAvatarUrl=${worker.avatarUrl}`
  })
}

const getStatusColor = status => {
  switch (status) {
    case 'PENDING': return '#409eff'
    case 'IN_PROGRESS': return '#e6a23c'
    case 'COMPLETED': return '#67c23a'
    default: return '#909399'
  }
}

onMounted(() => loadAssignments())
</script>


<style>
.date-action-bar {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 30rpx; /* 👈 核心 */
}


.worker-calendar {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;

  .month-picker {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    padding: 10rpx;
    background-color: #fff;
    border-radius: 8rpx;
    text-align: center;
  }

  .week-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 10rpx;
  }

  .calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4rpx;
    margin-bottom: 30rpx;

    .day {
      height: 130rpx;
      border: 1px solid #eee;
      padding: 4rpx;
      font-size: 24rpx;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      &.active {
        background: #e8f3ff;
      }

      &.today {
        border: 2rpx solid #4da6ff;
        background-color: #f0fdff;
      }

      .date {
        font-size: 20rpx;
        font-weight: bold;
        align-self: flex-end;
      }

      .task-indicators {
        display: flex;
        flex-direction: column;   /* 垂直堆叠多条 */
        gap: 4rpx;
        width: 100%;
      }

      /* 关键：从圆点变成条 */
      .indicator {
        width: 100%;
        height: 10rpx;            /* 细条高度 */
        border-radius: 6rpx;      /* 圆角条 */
        opacity: 0.9;
      }



    }
  }

  .task-detail-section {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-top: 32rpx;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #1e1e2f;
      margin-bottom: 24rpx;
      padding-left: 16rpx;
      border-left: 6rpx solid #409eff;
    }

    .assignment-item {
      padding: 24rpx;
      border-radius: 12rpx;
      background-color: #f8f9fa;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

      &:last-child {
        margin-bottom: 0; /* 最后一项去掉底部间距 */
      }

      .complete-task-btn {
        font-size: 24rpx;
        color: #fff;
        background-color: #67c23a; /* 绿色背景 */
        border: none;
        border-radius: 8rpx;
        padding: 8rpx 16rpx;
        cursor: pointer;
        white-space: nowrap;
        transition: background-color 0.3s ease; /* 添加过渡效果 */
      }

      .complete-task-btn:hover {
        background-color: #5daf34; /* hover 时加深颜色 */
      }

      .task-header {
        display: flex;
        justify-content: space-between; /* 左右分布 */
        align-items: center;
        margin-bottom: 16rpx;

        .stage-name {
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
        }

        .task-status {
          font-size: 22rpx;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          font-weight: bold;

          &.status-pending {
            background-color: #f0f9ff;
            color: #409eff;
          }

          &.status-in-progress {
            background-color: #f4f9ff;
            color: #e6a23c;
          }

          &.status-completed {
            background-color: #f0f9ec;
            color: #67c23a;
          }
        }
      }

      .task-address,
      .task-time {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;

        .icon {
          font-size: 24rpx;
          margin-right: 12rpx;
          color: #909399;
        }

        .address-text,
        .time-text {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }




}
.day.selected {
  transform: scale(1.04);
  box-shadow: 0 6rpx 16rpx rgba(64, 158, 255, 0.35);
  border: none;
  outline: 3rpx solid #ffd04b;
}
.day.today.selected {
  outline: 3rpx solid #ffd04b;
}

.day.leave {
  background-color: #ffebee; /* 浅红色背景 */
  border: 2rpx dashed #f44336; /* 红色虚线边框 */
}

.day.leave .date {
  color: #f44336; /* 红色文字 */
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

/* 日期列表容器 */
.date-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

/* 单个日期项 */
.date-item {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  position: relative;
}

/* 悬停效果（可选，H5效果） */
.date-item:hover {
  background: rgba(64, 158, 255, 0.1);
}

/* 今日日期样式 */
.date-item.today {
  border: 2rpx solid #409eff;
  color: #409eff;
  font-weight: bold;
}

/* 选中日期样式 */
.date-item.selected {
  color: #fff;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(64, 158, 255, 0.3);
}

/* 日期上的小提示，比如“今天”文字 */
.date-item .label {
  position: absolute;
  top: 4rpx;
  font-size: 20rpx;
  font-weight: 500;
}

/* 选中日期的小标签可变白色 */
.date-item.selected .label {
  color: #fff;
}

/* 日期数字 */
.date-item .day {
  font-size: 32rpx;
}

/* 可选：周几显示 */
.date-item .week {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
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




</style>
