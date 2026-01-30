<!-- src/components/PostCreateForm.vue -->
<template>
  <view class="form-container">
    <form @submit="handleSubmit" class="article-form">
      <view class="form-group">
        <input
          type="text"
          placeholder="请输入文章标题"
          v-model="store.form.title"
          class="form-input"
        />
        <text v-if="store.errors.title" class="error-text">{{ store.errors.title }}</text>
      </view>

      <view class="form-group">
        <textarea
          placeholder="请输入文章内容"
          v-model="store.form.content"
          class="form-textarea"
          rows="4"
        />
        <text v-if="store.errors.content" class="error-text">{{ store.errors.content }}</text>
      </view>

      <!-- 图片上传区域 -->
      <view class="form-group">
        <view class="upload-section">
          <button @click="chooseImages" class="upload-btn">选择图片</button>
          <view class="preview">
            <view
              v-for="img in store.form.images"
              :key="img.key"
              class="preview-item"
            >
              <image :src="img.url" mode="aspectFill" class="preview-img" />
              <button
                class="remove-btn"
                @click="removeImage(img.key)"
                type="button"
              >
                ×
              </button>
            </view>
          </view>
        </view>
      </view>

      <view class="form-actions">
        <button form-type="submit" class="submit-btn">提交</button>
        <button type="button" @click="handleCancel" class="cancel-btn">取消</button>
      </view>
    </form>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { usePostFormStore } from '../store/postFormStore';
import {createPost, getPostSimple, uploadPostImage} from '../api/post';


// 定义 props
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      title: '',
      content: '',
      images: []
    })
  }
});

// 定义 emits
const emit = defineEmits(['submit', 'cancel']);

// 使用 store
const store = usePostFormStore();

// 初始化表单数据
if (props.initialData) {
  store.form.title = props.initialData.title || '';
  store.form.content = props.initialData.content || '';
  // 如果有初始图片数据，也可以在这里处理
}

// 选择图片
const chooseImages = () => {
  uni.chooseImage({
    count: 9 - store.form.images.length, // 最多9张图片
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (!res.tempFilePaths || res.tempFilePaths.length === 0) return;

      res.tempFilePaths.forEach(filePath => {
        store.addImage({ path: filePath }, filePath);
      });
    },
    fail: (err) => {
      console.error('选择图片失败', err);
    }
  });
};

// 删除图片
const removeImage = (key) => {
  store.removeImage(key);
};


async function handleSubmit(e) {
  e.preventDefault();

  // 验证表单数据
  store.errors.title = '';
  store.errors.content = '';

  if (!store.form.title.trim()) {
    store.errors.title = '请输入文章标题';
    uni.showToast({
      title: '请输入文章标题',
      icon: 'none'
    });
    return;
  }

  if (!store.form.content.trim()) {
    store.errors.content = '请输入文章内容';
    uni.showToast({
      title: '请输入文章内容',
      icon: 'none'
    });
    return;
  }

  try {
    // 创建文章
    const createdPost = await createPost({
      title: store.form.title,
      content: store.form.content
    });

    // 上传图片
    if (store.form.images.length > 0) {
      for (const img of store.form.images) {
        await uploadPostImage(createdPost.postId, img.file.path);
      }

      // 重新获取文章详情以获取最新的图片信息
      const updatedPost = await getPostSimple(createdPost.postId);
      emit('success', updatedPost);  // 返回包含图片信息的文章
    } else {
      emit('success', createdPost);  // 没有图片时直接返回
    }

    uni.showToast({
      title: '文章发布成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('发布文章失败:', error);
    uni.showToast({
      title: error.message || '发布失败，请重试',
      icon: 'none'
    });
  }
}

// 取消表单
function handleCancel() {
  store.resetForm();
  emit('cancel');
}
</script>

<style scoped>
.form-container {
  width: 100%;
}

.article-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 15rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.form-textarea {
  padding: 15rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  min-height: 150rpx;
  line-height: 1.5;
}

.upload-section {
  margin-top: 10rpx;
}

.upload-btn {
  background-color: #409eff;
  color: white;
  border-radius: 10rpx;
  padding: 15rpx 20rpx;
  margin-bottom: 15rpx;
  font-size: 28rpx;
}

.preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
}

.preview-img {
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 0;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.submit-btn, .cancel-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 10rpx;
  border: none;
  font-size: 28rpx;
}

.submit-btn {
  background: #1296db;
  color: #fff;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.error-text {
  color: #f56c6c;
  font-size: 24rpx;
  margin-top: 8rpx;
}
</style>
