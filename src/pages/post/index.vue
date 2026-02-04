<template>
  <view class="container">
    <!-- 内容列表 -->
    <scroll-view
        scroll-y
        class="content-list"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
    >

      <view
          v-for="item in posts"
          :key="item.postId"
          class="post-card"
          @click="goToPost(item.postId)"
      >
        <!-- 用户信息区域 -->
        <view class="user-info">
          <image
              :src="BASE_URL + item.authorAvatar"
              class="avatar"
              @click.stop="goToUser(item.authorId)"
              lazy="true"
          />
          <text class="username">{{ item.authorName }}</text>
          <view class="spacer"></view>
          <text class="more-icon">···</text>
        </view>

        <!-- 文章标题 -->
        <text class="post-title">{{ item.title }}</text><br>

        <!-- 文章内容 -->
        <text class="post-content">{{ item.summary }}</text>

        <!-- 预览图片网格 - 仅在有图片时显示 -->
        <view v-if="item.previewImages && item.previewImages.length > 0" class="image-grid">
          <view
              v-for="(img, index) in item.previewImages.slice(0, 9)"
              :key="img.id"
              class="image-item"
          >
            <image
                :src="BASE_URL + img.imageUrl"
                class="preview-image"
                :class="{'single': item.previewImages.length === 1}"
                lazy="true"
            />
          </view>
        </view>

        <!-- 底部统计栏 - 显示点赞和评论数 -->
        <view class="stats-bar">
          <view class="stat-item">
            <image class="stat-icon" src="/static/post/like.png" mode="aspectFit" />
            <text class="stat-count">{{ item.likeCount }}</text>
          </view>
          <view class="stat-item">
            <image class="stat-icon" src="/static/post/comment.png" mode="aspectFit" />
            <text class="stat-count">{{ item.commentCount }}</text>
          </view>
        </view>
      </view>

      <!-- 加载提示 -->
      <view v-if="loading" class="loading-tips">加载中...</view>
      <view v-if="!hasMore" class="no-more-tips">加载中...</view>
    </scroll-view>

    <!-- 新增文章弹窗 -->
    <uni-popup ref="articlePopup" type="center">
      <view class="modal">
        <view class="modal-header">
          <text>新增文章</text>
          <text class="close" @click="closeArticleDialog">×</text>
        </view>
        <view class="modal-body">
          <PostCreateForm
              @success="onSubmitSuccess"
              @cancel="closeArticleDialog"
          />
        </view>
      </view>
    </uni-popup>
  </view>
</template>



<script setup>
import { ref, onMounted } from 'vue';
import { BASE_URL } from "../../config/apiConfig";
import {getPostList, likePost, createPost, uploadPostImage, getPostDetail} from '../../api/post';
import { onLoad, onNavigationBarButtonTap, onShow} from '@dcloudio/uni-app'
import PostCreateForm from '../../components/PostCreateForm.vue';


// 数据状态
const posts = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const pageSize = ref(10); // 每页加载的数量

// 新增文章相关状态
const articlePopup = ref(null);
const newArticle = ref({
  title: '',
  content: ''
});

const onSubmitSuccess = async (newPost) => {
  // 添加新文章到列表顶部，确保包含图片信息
  posts.value.unshift({
    ...newPost,
    isLiked: false,
    previewImages: newPost.previewImages || []  // 确保有图片数组
  });

  // 关闭弹窗
  closeArticleDialog();

  // 刷新数据以确保显示最新信息
  await fetchPosts();
};

// 页面显示时重新加载数据
onShow(async () => {
  console.log('页面显示，重新加载数据');
  await fetchPosts(true);
})



// 获取首页数据 - 添加强制刷新参数
const fetchPosts = async (forceRefresh = false) => {
  if (loading.value || (!forceRefresh && !hasMore.value)) return;

  loading.value = true;

  try {
    const postsData = await getPostList();

    const startIndex = (page.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    const paginatedData = postsData.slice(startIndex, endIndex);

    const newPosts = paginatedData.map(post => ({
      ...post,
      isLiked: false
    }));

    if (newPosts.length === 0) {
      hasMore.value = false;
    } else {
      if (page.value === 1 || forceRefresh) {
        // 强制刷新时替换所有数据
        posts.value = newPosts;
      } else {
        posts.value = [...posts.value, ...newPosts];
      }

      if (paginatedData.length < pageSize.value) {
        hasMore.value = false; // 数据不足一页时标记无更多数据
      } else {
        hasMore.value = true;  // 仍有数据时保持可加载状态
      }

    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};


/* ⭐ App 原生导航栏按钮 */
onNavigationBarButtonTap((event) => {
  console.log('导航栏按钮被点击', event)
  uni.showActionSheet({
    itemList: ['新增文章', '其他功能1', '其他功能2'],
    success(res) {
      if (res.tapIndex === 0) {
        openArticleDialog();
      }
    }
  })
})

// 页面加载时获取数据
onMounted(() => {
  fetchPosts();
});

// 上拉加载更多
const onReachBottom = () => {
  // 即使在加载中也要检查是否有更多数据
  if (!hasMore.value) {
    return;
  }
  fetchPosts(); // 继续加载，但内部会检查 loading 状态
};


// 打开新增文章弹窗
function openArticleDialog() {
  newArticle.value = { title: '', content: '' }; // 清空表单
  articlePopup.value?.open();
}

// 关闭新增文章弹窗
function closeArticleDialog() {
  articlePopup.value?.close();
  newArticle.value = { title: '', content: '' }; // 清空表单
}

// 跳转到用户页面
const goToUser = (userId) => {
  uni.navigateTo({
    url: `/pages/user/profile?userId=${userId}`
  });
};

// 跳转到文章详情页
const goToPost = (postId) => {
  uni.navigateTo({
    url: `/src/pages/post/detail?postId=${postId}`  // 改为带 src 的路径
  });
};


// 分享文章
const sharePost = (post) => {
  uni.share({
    provider: "weixin",
    scene: "WXSenceTimeline",
    type: 0,
    href: `/pages/post/detail?postId=${post.postId}`,
    title: post.title,
    summary: post.summary,
    success: function(res) {
      console.log("分享成功：" + JSON.stringify(res));
    },
    fail: function(err) {
      console.log("分享失败：" + JSON.stringify(err));
    }
  });
};

// 添加刷新相关状态
const refreshing = ref(false)

const onRefresh = async () => {
  if (refreshing.value) return

  refreshing.value = true
  page.value = 1
  hasMore.value = true

  try {
    await fetchPosts(true)
  } finally {
    refreshing.value = false
  }
}



</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  padding: 0 10px; /* 左右各留10px间距 */
}


.content-list {
  flex: 1;          /* ✅ 关键 */
  overflow: hidden; /* 推荐加 */
}




.navbar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.nav-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.content-list {
  height: calc(100vh - 44px);
}

.post-card {
  margin: 10px;
  border-radius: 12px; /* 增大圆角 */
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* 强化阴影效果 */
  background-color: #fff; /* 明确卡片背景色 */
}


.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.spacer {
  flex: 1;
}

.more-icon {
  font-size: 18px;
  color: #999;
}

.post-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.post-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.image-item {
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.preview-image.single {
  height: 100px;
}

.stats-bar {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 8px;
  border-top: 2px solid #ddd; /* 加粗分割线 */
}


.stat-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.stat-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.stat-count {
  font-size: 12px;
  color: #666;
}

.loading-tips, .no-more-tips {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

/* 新增文章弹窗样式 */
.modal {
  border-radius: 24rpx;
  width: 80vw;
  max-height: 80vh;
  padding: 30rpx;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* 强化弹窗阴影 */
  background-color: #fff; /* 明确弹窗背景色 */
}


.modal-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-header .close {
  cursor: pointer;
  font-size: 40rpx;
}

.modal-body {
  padding: 10rpx 0;
}
</style>
