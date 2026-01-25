<template>
  <view class="house-form">
    <!-- 城市 -->
    <view class="input-row">
      <text class="label">城市</text>
      <view class="input-col">
        <uni-easyinput
          v-model="form.city"
          placeholder="请输入城市"
          @blur="validateCity"
          type="text"
        />
        <text v-if="errors.city" class="error-text">× {{ errors.city }}</text>
      </view>
    </view>

    <!-- 小区 -->
    <view class="input-row">
      <text class="label">小区</text>
      <view class="input-col">
        <uni-easyinput
          v-model="form.communityName"
          placeholder="请输入小区名"
          @blur="validateCommunity"
          type="text"
        />
        <text v-if="errors.communityName" class="error-text">× {{ errors.communityName }}</text>
      </view>
    </view>

    <!-- 楼栋/单元/房号 -->
    <view class="input-row">
      <text class="label">楼栋</text>
      <view class="input-col">
        <uni-easyinput
          v-model="form.buildingNo"
          placeholder="栋号"
          @blur="validateBuildingNo"
          type="text"
        />
        <text v-if="errors.buildingNo" class="error-text">× {{ errors.buildingNo }}</text>
      </view>
    </view>
    <view class="input-row">
      <text class="label">单元</text>
      <view class="input-col">
        <uni-easyinput
          v-model="form.unitNo"
          placeholder="单元号"
          @blur="validateUnitNo"
          type="text"
        />
        <text v-if="errors.unitNo" class="error-text">× {{ errors.unitNo }}</text>
      </view>
    </view>
    <view class="input-row">
      <text class="label">房号</text>
      <view class="input-col">
        <uni-easyinput
          v-model="form.roomNo"
          placeholder="房号"
          @blur="validateRoomNo"
          type="text"
        />
        <text v-if="errors.roomNo" class="error-text">× {{ errors.roomNo }}</text>
      </view>
    </view>

    <!-- 面积 -->
    <view class="input-row">
      <text class="label">面积</text>
      <view class="input-col">
        <uni-easyinput
          v-model="form.area"
          placeholder="㎡"
          @blur="validateArea"
          type="number"
        />
        <text v-if="errors.area" class="error-text">× {{ errors.area }}</text>
      </view>
    </view>

    <!-- 户型 -->
    <view class="input-row">
      <text class="label">户型</text>
      <view class="input-col">
        <uni-easyinput
          v-model="form.layoutType"
          placeholder="例如 2室1厅"
          @blur="validateLayoutType"
          type="text"
        />
        <text v-if="errors.layoutType" class="error-text">× {{ errors.layoutType }}</text>
      </view>
    </view>

    <!-- 楼层 -->
    <view class="input-row">
      <text class="label">楼层</text>
      <view class="input-col">
        <uni-easyinput
          v-model="form.floorCount"
          @blur="validateFloorCount"
          type="number"
        />
        <text v-if="errors.floorCount" class="error-text">× {{ errors.floorCount }}</text>
      </view>
    </view>

    <!-- 装修类型下拉框 -->
    <view class="input-row">
      <text class="label">装修类型</text>
      <picker
        :range="decorationTypes"
        :range-key="'label'"
        :value="currentDecorationIndex"
        @change="onDecorationChange"
        :disabled="isEditMode"
      >
        <view class="picker">{{ form.decorationType ? selectedDecorationLabel : '请选择装修类型' }}</view>
      </picker>
    </view>

    <view class="form-footer">
      <button class="submit-btn" @click="submit">
        {{ isEditMode ? '保存' : '新增' }}
      </button>
    </view>
  </view>
</template>

<script>
import { createHouse, updateHouse } from '../api/house'

export default {
  name: "homeForm",
  props: { house: Object },
  emits: ['success'],
  data() {
    return {
      // 后端枚举 -> 中文
      DECORATION_MAP: { FULL: '全包', HALF: '半包', LOOSE: '散装' },
      // 装修类型选项
      decorationTypes: [
        { value: 'FULL', label: '全包' },
        { value: 'HALF', label: '半包' },
        { value: 'LOOSE', label: '散装' }
      ],
      // 表单数据
      form: {
        city: this.house?.city || '',
        communityName: this.house?.communityName || '',
        buildingNo: this.house?.buildingNo || '',
        unitNo: this.house?.unitNo || '',
        roomNo: this.house?.roomNo || '',
        area: this.house?.area || '',
        layoutType: this.house?.layoutType || '',
        floorCount: this.house?.floorCount || '',
        decorationType: this.house?.decorationType || 'FULL'
      },
      // 错误信息
      errors: {
        city: '',
        communityName: '',
        buildingNo: '',
        unitNo: '',
        roomNo: '',
        area: '',
        layoutType: '',
        floorCount: ''
      },
      isSubmitting: false
    }
  },
  computed: {
    isEditMode() {
      return !!this.house
    },
    currentDecorationIndex() {
      return this.decorationTypes.findIndex(item => item.value === this.form.decorationType)
    },
    selectedDecorationLabel() {
      const found = this.decorationTypes.find(item => item.value === this.form.decorationType)
      return found ? found.label : ''
    }
  },
  methods: {
    // 校验函数
    validateCity() {
      this.errors.city = this.form.city ? '' : '城市不能为空'
      return !this.errors.city
    },
    validateCommunity() {
      this.errors.communityName = this.form.communityName ? '' : '小区不能为空'
      return !this.errors.communityName
    },
    validateBuildingNo() {
      this.errors.buildingNo = this.form.buildingNo ? '' : '楼栋不能为空'
      return !this.errors.buildingNo
    },
    validateUnitNo() {
      this.errors.unitNo = this.form.unitNo ? '' : '单元不能为空'
      return !this.errors.unitNo
    },
    validateRoomNo() {
      this.errors.roomNo = this.form.roomNo ? '' : '房号不能为空'
      return !this.errors.roomNo
    },
    validateArea() {
      this.errors.area = this.form.area > 0 ? '' : '面积必须大于0'
      return !this.errors.area
    },
    validateLayoutType() {
      this.errors.layoutType = this.form.layoutType ? '' : '户型不能为空'
      return !this.errors.layoutType
    },
    validateFloorCount() {
      this.errors.floorCount = this.form.floorCount > 0 ? '' : '楼层必须大于0'
      return !this.errors.floorCount
    },

    validateAll() {
      return [
        this.validateCity(),
        this.validateCommunity(),
        this.validateBuildingNo(),
        this.validateUnitNo(),
        this.validateRoomNo(),
        this.validateArea(),
        this.validateLayoutType(),
        this.validateFloorCount()
      ].every(v => v)
    },

    onDecorationChange(e) {
      const index = e.detail.value
      this.form.decorationType = this.decorationTypes[index].value
    },

    async submit() {
      if (this.isSubmitting) return
      if (!this.validateAll()) {
        uni.showToast({
          title: '请检查表单信息',
          icon: 'none'
        })
        return
      }

      this.isSubmitting = true
      try {
        let res
        if (this.isEditMode) {
          res = await updateHouse(this.house.houseId, this.form)
        } else {
          res = await createHouse(this.form)
        }
        this.$emit('success', res)

        uni.showToast({
          title: this.isEditMode ? '保存成功' : '新增成功',
          icon: 'success'
        })
      } catch (err) {
        console.error('提交失败', err)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style>
.house-form {
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.label {
  width: 180rpx;
  font-size: 28rpx;
  color: #333;
}

.input-col {
  flex: 1;
}

.error-text {
  color: #f56c6c;
  font-size: 24rpx;
  margin-top: 8rpx;
}

.picker {
  padding: 10rpx 20rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.submit-btn {
  width: 100%;
  background: #1296db;
  color: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 32rpx;
}

.form-footer {
  margin-top: 40rpx;
}
</style>
