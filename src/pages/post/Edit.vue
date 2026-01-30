<template>
  <view class="edit-post-page">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">编辑文章</text>
      <view class="save-btn" @click="submitForm">
        <text class="save-text">保存</text>
      </view>
    </view>

    <view class="form-container">
      <PostEditForm
        :initial-data="initialData"
        @success="onSubmitSuccess"
        @cancel="handleCancel"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getPostDetail } from '../../api/post';
import PostEditForm from '../../components/PostEditForm.vue';

// 数据状态
const postId = ref('');
const initialData = ref({
  postId: null,
  title: '',
  content: '',
  images: []
});

// 页面加载
onLoad((options) => {
  postId.value = options.postId;
  loadPostForEdit();
});

// 加载文章详情用于编辑
const loadPostForEdit = async () => {
  try {
    const response = await getPostDetail(postId.value);
    const postData = response.data || response;

    initialData.value = {
      postId: postData.postId,
      title: postData.title,
      content: postData.content,
      images: [...(postData.previewImages || [])]
    };
  } catch (error) {
    console.error('加载文章详情失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  }
};

// 表单提交成功
const onSubmitSuccess = (updatedPost) => {
  uni.showToast({
    title: '更新成功',
    icon: 'success'
  });

  // 延迟返回详情页，让用户看到成功提示
  setTimeout(() => {
    uni.redirectTo({
      url: `/pages/post/detail?postId=${postId.value}`
    });
  }, 1500);
};

// 提交表单
const submitForm = () => {
  // 触发组件内的表单提交
  const event = new CustomEvent('submit', { bubbles: true, cancelable: true });
  document.dispatchEvent(event);
};

// 取消编辑
const handleCancel = () => {
  goBack();
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.edit-post-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
}

.back-btn {
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:active {
  background-color: #f0f0f0;
}

.back-icon {
  font-size: 18px;
  color: #333;
  font-weight: bold;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.save-btn {
  padding: 6px 12px;
  border-radius: 20px;
  background-color: #1296db;
  transition: all 0.3s ease;
}

.save-btn:active {
  background-color: #0e77b0;
  transform: scale(0.95);
}

.save-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.form-container {
  flex: 1;
  padding: 15px;
  background-color: #fff;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 添加滚动条样式 */
.form-container::-webkit-scrollbar {
  width: 6px;
}

.form-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.form-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
