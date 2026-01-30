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
            <!-- 现有图片 -->
            <view
              v-for="img in existingImages"
              :key="img.id"
              class="preview-item"
            >
              <image :src="BASE_URL + img.imageUrl" mode="aspectFill" class="preview-img" />
              <button
                class="remove-btn"
                @click="removeExistingImage(img.id)"
                type="button"
              >
                ×
              </button>
            </view>

            <!-- 新添加的图片 -->
            <view
              v-for="img in newImages"
              :key="img.key"
              class="preview-item"
            >
              <image :src="img.url" mode="aspectFill" class="preview-img" />
              <button
                class="remove-btn"
                @click="removeNewImage(img.key)"
                type="button"
              >
                ×
              </button>
            </view>
          </view>
        </view>
      </view>

      <view class="form-actions">
        <button form-type="submit" class="submit-btn">保存</button>
        <button type="button" @click="handleCancel" class="cancel-btn">取消</button>
      </view>
    </form>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
import { usePostFormStore } from '../store/postFormStore';
import { BASE_URL } from '../config/apiConfig';
import { updatePost, getPostSimple, uploadPostImage, deletePostImage } from '../api/post';

// 定义 props
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      postId: null,
      title: '',
      content: '',
      images: []
    })
  }
});

// 定义 emits
const emit = defineEmits(['success', 'cancel']);

// 使用 store
const store = usePostFormStore();

// 编辑专用状态
const existingImages = ref([]); // 现有图片
const newImages = ref([]); // 新添加的图片
const removedImageIds = ref([]); // 要删除的图片ID
const postId = ref(null);

// 监听初始数据变化
watch(() => props.initialData, (newData) => {
  if (newData) {
    postId.value = newData.postId;
    store.form.title = newData.title || '';
    store.form.content = newData.content || '';

    // 初始化现有图片
    existingImages.value = [...(newData.images || [])];
    // 清空新图片
    newImages.value = [];
    // 清空删除列表
    removedImageIds.value = [];
  }
}, { immediate: true });

// 选择图片
const chooseImages = () => {
  uni.chooseImage({
    count: 9 - (existingImages.value.length + newImages.value.length), // 最多9张图片
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (!res.tempFilePaths || res.tempFilePaths.length === 0) return;

      res.tempFilePaths.forEach(filePath => {
        const key = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        newImages.value.push({
          key,
          url: filePath,
          file: { path: filePath } // 保存原始文件对象，用于上传
        });
      });
    },
    fail: (err) => {
      console.error('选择图片失败', err);
    }
  });
};

// 删除现有图片
const removeExistingImage = (imageId) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        // 从现有图片列表中移除
        const index = existingImages.value.findIndex(img => img.id === imageId);
        if (index !== -1) {
          existingImages.value.splice(index, 1);
          // 添加到要删除的图片ID列表
          removedImageIds.value.push(imageId);
        }
      }
    }
  });
};

// 删除新添加的图片
const removeNewImage = (key) => {
  const index = newImages.value.findIndex(img => img.key === key);
  if (index !== -1) {
    newImages.value.splice(index, 1);
  }
};

// 提交表单
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
    // 更新文章基本信息
    await updatePost(postId.value, {
      title: store.form.title,
      content: store.form.content
    });

    // 删除图片
    for (const imageId of removedImageIds.value) {
      await deletePostImage(imageId);
    }

    // 上传新图片
    if (newImages.value.length > 0) {
      for (const img of newImages.value) {
        await uploadPostImage(postId.value, img.file.path);
      }

      // 重新获取文章详情以获取最新的图片信息
      const updatedPost = await getPostSimple(postId.value);
      emit('success', updatedPost);  // 返回包含图片信息的文章
    } else {
      // 获取更新后的文章信息
      const updatedPost = await getPostSimple(postId.value);
      emit('success', updatedPost);  // 没有新图片时也返回更新后的文章
    }

    uni.showToast({
      title: '文章更新成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    uni.showToast({
      title: error.message || '更新失败，请重试',
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
