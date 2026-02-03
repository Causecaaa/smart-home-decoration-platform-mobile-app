<template>
  <view class="gantt">
    <!-- 月份选择 -->
    <picker mode="date" fields="month" @change="onMonthChange">
      <view class="month-picker">
        {{ currentMonth }}
      </view>
    </picker>

    <!-- 星期头 -->
    <view class="week-header">
      <text v-for="w in weeks" :key="w">{{ w }}</text>
    </view>

    <!-- 日期格子 -->
    <view class="calendar">
      <!-- 修改后的格子部分 -->
      <view
          v-for="day in days"
          :key="day.date || `empty-${day.day}`"
          class="day"
          :class="{ active: day.expectedStage || day.actualStage , today: day.isToday}"
          @tap="day.expectedStage && showDatePicker(day.expectedStage)"
      >
        <view class="date">{{ day.day }}</view>

        <view class="progress-bars">
          <view
              v-if="day.expectedStage"
              class="progress-bar expected"
              :style="{ backgroundColor: '#1677ff' }"
          >
            <text class="progress-text">{{ getStageShortName(day.expectedStage.stageName) }}</text>
          </view>

          <view
              v-if="day.actualStage"
              class="progress-bar actual"
              :style="{ backgroundColor: '#ffa500' }"
          >
            <text class="progress-text">{{ getStageShortName(day.actualStage.stageName) }}</text>
          </view>
        </view>
      </view>


    </view>

    <!-- 图例说明 -->
    <view class="legend">
      <view class="legend-item">
        <view class="legend-color expected"></view>
        <text>预期进度</text>
      </view>
      <view class="legend-item">
        <view class="legend-color actual"></view>
        <text>实际进度</text>
      </view>
    </view>


    <uni-popup ref="datePickerPopup" type="dialog">
      <view class="date-picker-content">
        <!-- 显示当前修改的阶段 -->
        <text class="stage-title">修改阶段：{{ selectedStage.stageName }}</text>

        <picker
            mode="date"
            :value="selectedDate"
            @change="onDateConfirm"
        >
          <view class="picker-display">{{ selectedDate }}</view>
        </picker>
      </view>
    </uni-popup>


  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getStage, updateStageSchedule } from '../api/construction'
import { onLoad } from '@dcloudio/uni-app'

const houseId = ref(null)

onLoad(async (options) => {
  houseId.value = Number(options.houseId)

  const res = await getStage(houseId.value)

  stages.value = res?.stages || []
})


// 定义 emits
const emit = defineEmits(['change'])

const weeks = ['一', '二', '三', '四', '五', '六', '日']

const currentMonth = ref('2026-02')
const stages = ref([])
const selectedStage = ref({})
const selectedDate = ref('')
const datePickerPopup = ref(null)

const onDateChange = async (stage, e) => {
  const newDate = e.detail.value
  try {
    await updateStageSchedule(houseId.value, stage.order, newDate)

    // 更新本地数据
    const updatedStage = stages.value.find(s => s.order === stage.order)
    if (updatedStage) {
      const start = new Date(newDate)
      const days = updatedStage.estimatedDay
      const end = new Date(start)
      end.setDate(end.getDate() + days - 1)

      updatedStage.expectedStartAt = start.toISOString().split('T')[0] + 'T00:00:00'
      updatedStage.expectedEndAt = end.toISOString().split('T')[0] + 'T00:00:00'
    }

    emit('change', { order: stage.order, expectedStartAt: newDate })

    uni.showToast({ title: '更新成功', icon: 'success' })
  } catch (error) {
    console.error('更新阶段计划失败:', error)
    uni.showToast({ title: '更新失败', icon: 'error' })
  }
}


// 监听 stages 变化并触发更新
watch(stages, () => {
  // 当 stages 更新时，触发计算属性重新计算
}, { deep: true })

/**
 * 月份切换
 */
function onMonthChange(e) {
  currentMonth.value = e.detail.value
}

/**
 * 工具：日期 + n 天
 */
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days - 1)
  return d.toISOString().slice(0, 10)
}

/**
 * 工具：解析日期字符串
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr);
}

const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
/**
 * 计算当前月的每一天
 */
const days = computed(() => {
  if (!currentMonth.value || !stages.value || !Array.isArray(stages.value)) return []

  const [year, month] = currentMonth.value.split('-').map(Number)

  // 获取当月第一天是周几（1-7，1为周一）
  const firstDay = new Date(year, month - 1, 1).getDay()
  const adjustedFirstDay = firstDay === 0 ? 7 : firstDay // 将周日(0)转为7，确保周一为1

  // 获取当月总天数
  const total = new Date(year, month, 0).getDate()

  const result = []

  // 添加上个月的空格子（调整为周一开头）
  for (let i = 1; i < adjustedFirstDay; i++) {
    result.push({
      day: '',
      date: null,
      expectedStage: null,
      actualStage: null
    })
  }

  // 添加当月的日期
  for (let i = 1; i <= total; i++) {
    const date = `${currentMonth.value}-${String(i).padStart(2, '0')}`

    // 找该日期属于哪个预期阶段
    const expectedStage = stages.value.find(s => {
      const start = s.expectedStartAt.slice(0, 10)
      const end = addDays(start, s.estimatedDay)
      return date >= start && date <= end
    })

    // 找该日期属于哪个实际阶段
    const actualStage = stages.value.find(s => {
      if (!s.start_at) return false;
      const start = s.start_at.slice(0, 10)
      const end = s.end_at ? s.end_at.slice(0, 10) : start
      return date >= start && date <= end
    })

    result.push({
      day: i,
      date,
      expectedStage,
      actualStage,
      isToday: date === todayStr
    })
  }

  return result
})


/**
 * 截取阶段名称前两个字符
 */
const getStageShortName = (name) => {
  return name.substring(0, 2)
}


/**
 * 格式化日期
 */
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

/**
 * 获取状态类
 */
const getStatusClass = (status) => {
  switch (status) {
    case '已完成':
      return 'status-completed'
    case '进行中':
      return 'status-progress'
    case '待开始':
      return 'status-pending'
    case '已验收':
      return 'status-accepted'
    default:
      return 'status-default'
  }
}

/**
 * 显示日期选择器
 */
const showDatePicker = (stage) => {
  selectedStage.value = stage
  const date = new Date(stage.expectedStartAt)
  selectedDate.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  datePickerPopup.value.open()
}

const onDateConfirm = async (e) => {
  selectedDate.value = e.detail.value
  try {
    // 1️⃣ 调用后端更新阶段时间
    await updateStageSchedule(
        houseId.value,
        selectedStage.value.order,
        selectedDate.value
    )

    // 2️⃣ 重新拉取全部 stages 或在本地更新整个 stages
    const res = await getStage(houseId.value)  // ✅ 后端返回最新 stages
    stages.value = res?.stages || []

    // 3️⃣ 发射事件通知父组件
    emit('change', {
      order: selectedStage.value.order,
      expectedStartAt: selectedDate.value
    })

    uni.showToast({ title: '更新成功', icon: 'success' })
    closeDatePicker()
  } catch (error) {
    console.error('更新阶段计划失败:', error)
    uni.showToast({ title: '更新失败', icon: 'error' })
  }
}


/**
 * 关闭日期选择器
 */
const closeDatePicker = () => {
  datePickerPopup.value.close()
}
</script>

<style scoped>
.gantt {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

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
}

.day {
  height: 130rpx;
  border: 1px solid #eee;
  padding: 4rpx;
  font-size: 24rpx;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.day.active {
  background: #e8f3ff;
}

.date {
  font-size: 20rpx;
  font-weight: bold;
  align-self: flex-end;
}

.progress-bars {
  height: 70rpx;      /* 下半区固定高度 */
  position: relative;  /* 用绝对定位放两条条 */
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  width: 100%;
  flex-grow: 1;
}

.progress-bar.expected {
  position: absolute;
  top: 0;            /* 上半区 */
  height: 50%;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4rpx;
}

.progress-bar.actual {
  position: absolute;
  bottom: 0;         /* 下半区 */
  height: 50%;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4rpx;
}



.progress-text {
  font-size: 20rpx;
  color: white;
  text-align: center;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding: 0 4rpx;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 20rpx;
  padding: 10rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-color {
  width: 20rpx;
  height: 10rpx;
  border-radius: 2rpx;
}

.legend-color.expected {
  background-color: #1677ff;
}

.legend-color.actual {
  background-color: #ffa500;
}

.stages-list {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.stage-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.stage-summary:last-child {
  border-bottom: none;
}

.stage-summary-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stage-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stage-dates {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.stage-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  color: white;
}

.stage-status.status-pending {
  background-color: #409eff;
}

.stage-status.status-progress {
  background-color: #e6a23c;
}

.stage-status.status-completed {
  background-color: #67c23a;
}

.stage-status.status-accepted {
  background-color: #909399;
}

.edit-btn {
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.date-picker-content {
  background-color: #ffffff;
  padding: 40rpx;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  margin: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 500rpx;
}

.picker-display {
  margin-top: 20rpx;
  padding: 20rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  text-align: center;
}

.stage-title {
  font-size: 28rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
  color: #333;
}

.day.today {
  border: 2rpx solid #ff4d4f;   /* 红色边框 */
  background-color: #fff0f0;     /* 可选浅红底 */
}


</style>
