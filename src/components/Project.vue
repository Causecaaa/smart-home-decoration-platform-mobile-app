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
        :class="{ active: day.assignments.length > 0, today: day.isToday }"
        @tap="day.assignments.length > 0 && showTaskDetails(day.assignments)"
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

    <!-- 任务详情弹窗 -->
    <uni-popup ref="taskDetailPopup" type="bottom">
      <view class="task-detail">
        <text class="popup-title">任务详情</text>
        <view v-for="(assignment, index) in selectedAssignments" :key="index" class="assignment-item">
          <text class="stage-name">{{ assignment.stageName }}</text>
          <text class="address">{{ assignment.city }} {{ assignment.communityName }} {{ assignment.buildingNo }}栋{{ assignment.unitNo }}单元{{ assignment.roomNo }}</text>
          <text class="time-range">{{ assignment.expected_Start_at }} 至 {{ assignment.expected_End_at }}</text>
          <view class="workers-section">
            <text class="section-title">施工人员</text>
            <view class="workers-list">
              <view v-for="worker in assignment.coworkers" :key="worker.userId" class="worker-row">
                <image :src="worker.avatarUrl || '/static/default-avatar.png'" class="worker-avatar" mode="aspectFill" />
                <view class="worker-details">
                  <text class="worker-name">{{ worker.realName }}</text>
                  <text class="worker-contact">{{ worker.phone }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { getWorkerStageCalendar } from '../api/worker';
import { onLoad } from '@dcloudio/uni-app'

const weeks = ['一', '二', '三', '四', '五', '六', '日'];
const currentDate = ref(new Date()) // 用于 picker 绑定
const currentMonth = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
})

const onMonthChange = async (e) => {
  // e.detail.value 是 "YYYY-MM" 格式
  const [y, m] = e.detail.value.split('-')
  currentDate.value = new Date(Number(y), Number(m) - 1, 1) // 更新 picker
  await loadAssignments()
}


const assignments = ref([]);
const selectedAssignments = ref([]);
const taskDetailPopup = ref(null);

// 或者
onMounted(() => {
  console.log('onMounted triggered');
  loadAssignments();
});


// 获取当前月份的所有任务
const loadAssignments = async () => {
  try {
    console.log("current: "+currentMonth.value)
    assignments.value = await getWorkerStageCalendar(currentMonth.value);
  } catch (error) {
    console.error('获取任务失败:', error);
  }
};

// 计算每天的任务
const days = computed(() => {
  const [year, month] = currentMonth.value.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 7 : firstDay;
  const totalDays = new Date(year, month, 0).getDate();

  const result = [];

  // 填充空白格子
  for (let i = 1; i < adjustedFirstDay; i++) {
    result.push({ day: '', date: null, assignments: [] });
  }

  // 填充每日任务
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${currentMonth.value}-${String(i).padStart(2, '0')}`;
    const dailyAssignments = assignments.value.filter(a =>
      dateStr >= a.expected_Start_at && dateStr <= a.expected_End_at
    );
    result.push({
      day: i,
      date: dateStr,
      assignments: dailyAssignments,
      isToday: dateStr === new Date().toISOString().slice(0, 10)
    });
  }

  return result;
});

// 获取状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return '#409eff';
    case 'IN_PROGRESS': return '#e6a23c';
    case 'COMPLETED': return '#67c23a';
    default: return '#909399';
  }
};

// 显示任务详情
const showTaskDetails = (tasks) => {
  selectedAssignments.value = tasks;
  taskDetailPopup.value.open();
};

</script>


<style>
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
        border: 2rpx solid #ff4d4f;
        background-color: #fff0f0;
      }

      .date {
        font-size: 20rpx;
        font-weight: bold;
        align-self: flex-end;
      }

      .task-indicators {
        display: flex;
        flex-wrap: wrap;
        gap: 4rpx;

        .indicator {
          width: 16rpx;
          height: 16rpx;
          border-radius: 50%;
        }
      }
    }
  }

  .task-detail {
    padding: 30rpx;
    background-color: #fff;
    border-top-left-radius: 16rpx;
    border-top-right-radius: 16rpx;

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 20rpx;
      text-align: center;
    }

    .assignment-item {
      margin-bottom: 20rpx;
      padding: 20rpx;
      border: 1rpx solid #eee;
      border-radius: 8rpx;

      .stage-name {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .address,
      .time-range {
        font-size: 24rpx;
        color: #666;
        margin-top: 8rpx;
      }

      .workers-section {
        margin-top: 16rpx;

        .section-title {
          font-size: 26rpx;
          font-weight: bold;
          margin-bottom: 12rpx;
        }

        .workers-list {
          display: flex;
          flex-direction: column;
          gap: 12rpx;

          .worker-row {
            display: flex;
            align-items: center;
            gap: 12rpx;

            .worker-avatar {
              width: 60rpx;
              height: 60rpx;
              border-radius: 50%;
            }

            .worker-details {
              display: flex;
              flex-direction: column;
              gap: 4rpx;

              .worker-name {
                font-size: 24rpx;
                font-weight: bold;
              }

              .worker-contact {
                font-size: 22rpx;
                color: #666;
              }
            }
          }
        }
      }
    }
  }
}

</style>
