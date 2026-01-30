<template>
  <view class="post-detail">
    <!-- 主内容区域（包含滚动内容） -->
    <view class="main-content">
      <!-- 文章内容区域 -->
      <scroll-view
          class="content"
          scroll-y
          :enable-flex="true"
      >
        <!-- 图片轮播区域 -->
        <view v-if="postDetail.previewImages && postDetail.previewImages.length > 0" class="image-container">
          <view class="image-carousel">
            <swiper
                class="image-swiper"
                :indicator-dots="false"
                :autoplay="false"
                :circular="false"
                :duration="500"
                @change="onSwiperChange"
            >
              <swiper-item
                  v-for="(img, index) in postDetail.previewImages"
                  :key="img.id"
              >
                <image
                    :src="BASE_URL + img.imageUrl"
                    class="carousel-image"
                    mode="aspectFit"
                    @click="previewImage(index)"
                />
              </swiper-item>
            </swiper>
          </view>

          <!-- 图片指示器放在图片外部下方 -->
          <view class="image-indicator">
            <text class="indicator-text">{{ currentIndex + 1 }} / {{ postDetail.previewImages.length }}</text>
          </view>
        </view>

        <!-- 用户信息区域 -->
        <view class="user-section">
          <image
              :src="BASE_URL + postDetail.authorAvatar"
              class="avatar"
              @click="goToUser(postDetail.authorId)"
          />
          <view class="user-info">
            <text class="username">{{ postDetail.authorName }}</text>
            <text class="create-time">{{ formattedTime }}</text>
          </view>
          <view class="action-buttons">
            <button class="follow-btn" @click="toggleFollow">关注</button>
          </view>
        </view>

        <!-- 文章标题 -->
        <view class="title-section">
          <text class="title">{{ postDetail.title }}</text>
        </view>

        <!-- 文章内容 -->
        <view class="content-section">
          <text class="content-text">{{ postDetail.content }}</text>
        </view>

        <!-- 互动区域 -->
        <view class="interaction-section">
          <view class="like-section" @click="toggleLike">
            <image
                :src="isLiked ? '/static/post/liked.png' : '/static/post/like.png'"
                class="like-icon"
                mode="aspectFit"
            />
            <text class="like-count">{{ postDetail.likeCount }}</text>
          </view>

          <view class="share-section" @click="showShareOptions">
            <image src="/static/post/share.png" class="share-icon" mode="aspectFit" />
            <text class="share-text">分享</text>
          </view>
        </view>

        <!-- 评论区域 -->
        <view class="comments-section">
          <view class="section-header">
            <text class="section-title">评论 ({{ postDetail.commentCount }})</text>
          </view>

          <!-- 评论列表 -->
          <view v-if="comments.length > 0" class="comments-list">
            <view
                v-for="comment in comments"
                :key="comment.commentId"
                class="comment-item"
            >
              <image :src="BASE_URL + comment.authorAvatar" class="comment-avatar" />
              <view class="comment-content">
                <view class="comment-header">
                  <text class="comment-author">{{ comment.authorName }}</text>
                  <text class="comment-time">{{ formatTime(comment.createdAt) }}</text>
                </view>
                <text class="comment-text">{{ comment.content }}</text>
                <view class="comment-actions">
                  <text class="reply-btn">回复</text>
                </view>
              </view>
            </view>
          </view>

          <view v-else class="no-comments">
            <text>暂无评论</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部评论输入栏 - 固定在底部 -->
    <view class="bottom-input">
      <input
          v-model="commentInput"
          class="comment-input"
          placeholder="写评论..."
          @confirm="submitComment"
      />
      <button class="send-btn" @click="submitComment">发送</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad, onShow ,onNavigationBarButtonTap} from '@dcloudio/uni-app';
import { BASE_URL } from '../../config/apiConfig';
import { getPostDetail, likePost, createComment, getCommentList, deletePost } from '../../api/post';
import { useUserStore } from '../../store/userStore'

const userStore = useUserStore()

// 数据状态
const postId = ref('');
const postDetail = ref({});
const comments = ref([]);
const commentInput = ref('');
const isLiked = ref(false);
const currentIndex = ref(0);  // 当前图片索引
const authorId = ref(0);

// 计算属性 - 格式化时间
const formattedTime = computed(() => {
  if (!postDetail.value.createdAt) return '';
  const date = new Date(postDetail.value.createdAt);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
});

// 页面加载
onLoad(async (options) => {
  postId.value = options.postId;
  await loadPostDetail();

  const isAuthor = userStore.user.userId === authorId.value

  console.log('userStore.user.userId', userStore.user.userId)
  console.log('authorId', authorId.value)
  console.log('isAuthor', isAuthor)

  if (typeof plus !== 'undefined') {
    const currentWebview = plus.webview.currentWebview()

    if (isAuthor) {
      // 如果是作者，添加编辑/删除按钮
      currentWebview.setStyle({
        titleNView: {
          buttons: [
            {
              type: 'more',
              float: 'right',
              color: '#ffffff',
              text: '⋮',
              fontSize: '20px',
              width: '44px',
              height: '44px'
            }
          ]
        }
      })
    } else {
      // 如果不是作者，隐藏按钮
      currentWebview.setStyle({
        titleNView: {
          buttons: []
        }
      })
    }
  }
});

// 在 <script setup> 部分添加或修改 onShow 钩子
onShow(async () => {
  console.log('页面显示，重新加载数据');
  await loadPostDetail();
  await loadComments();
});



onMounted(() => {
  loadComments();
});

onNavigationBarButtonTap((event) => {
  console.log('导航栏按钮被点击', event)
  uni.showActionSheet({
    itemList: ['编辑文章', '删除文章'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 编辑文章
        editPost()
      } else if (res.tapIndex === 1) {
        // 删除文章
        deleteCurrentPost()
      }
    }
  })
})

// 编辑文章
const editPost = () => {
  uni.navigateTo({
    url: `/src/pages/post/edit?postId=${postId.value}`
  })
}

// 删除文章
const deleteCurrentPost = async () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这篇文章吗？此操作不可撤销。',
    confirmText: '确认删除',
    confirmColor: '#ff4444',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deletePost(postId.value)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })

          // 延迟返回上一页，让用户看到成功提示
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          console.error('删除文章失败:', error)
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 监听轮播图切换
const onSwiperChange = (e) => {
  currentIndex.value = e.detail.current;
};

// 加载文章详情
const loadPostDetail = async () => {
  try {
    const response = await getPostDetail(postId.value);
    // 根据你的 API 响应结构，直接使用 response
    postDetail.value = response;
    console.log('postDetail.value.authorId', postDetail.value.authorId)
    authorId.value = postDetail.value.authorId;
    isLiked.value = response.liked || false;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    uni.showToast({
      title: '获取文章详情失败',
      icon: 'none'
    });
  }
};

// 加载评论列表
const loadComments = async () => {
  try {
    const response = await getCommentList(postId.value);
    // 根据你的 API 响应结构，直接使用 response
    comments.value = response || [];
  } catch (error) {
    console.error('获取评论列表失败:', error);
  }
};

// 点赞/取消点赞
const toggleLike = async () => {
  try {
    const response = await likePost(postId.value);
    // 如果点赞API返回更新后的点赞数，可以在这里处理
    isLiked.value = !isLiked.value;
    postDetail.value.likeCount += isLiked.value ? 1 : -1;

    uni.showToast({
      title: isLiked.value ? '已点赞' : '已取消点赞',
      icon: 'none'
    });
  } catch (error) {
    console.error('操作失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
};

// 提交评论
const submitComment = async () => {
  if (!commentInput.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none'
    });
    return;
  }

  try {
    await createComment(postId.value, {
      content: commentInput.value
    });

    commentInput.value = ''; // 清空输入框
    postDetail.value.commentCount += 1; // 更新评论计数
    loadComments(); // 重新加载评论列表

    uni.showToast({
      title: '评论成功',
      icon: 'none'
    });
  } catch (error) {
    console.error('评论失败:', error);
    uni.showToast({
      title: '评论失败',
      icon: 'none'
    });
  }
};

// 预览图片
const previewImage = (index) => {
  const urls = postDetail.value.previewImages.map(img => BASE_URL + img.imageUrl);
  uni.previewImage({
    current: index,
    urls: urls
  });
};

// 跳转到用户页面
const goToUser = (userId) => {
  uni.navigateTo({
    url: `/pages/user/profile?userId=${userId}`
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 显示分享选项
const showShareOptions = () => {
  uni.showActionSheet({
    itemList: ['微信好友', '朋友圈', '复制链接', '更多'],
    success(res) {
      console.log('用户选择:', res.tapIndex);
    }
  });
};

// 格式化时间
const formatTime = (timeStr) => {
  const date = new Date(timeStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else {
    return `${diffDays}天前`;
  }
};

// 关注/取消关注
const toggleFollow = () => {
  uni.showToast({
    title: '功能开发中...',
    icon: 'none'
  });
};
</script>

<style scoped>
.post-detail {
  height: 100vh;
}

.header {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: relative;
  z-index: 10;
}

.main-content {
  height: calc(100vh - 60px); /* 减去底部输入栏 */
}

.content {
  height: 100%;
}

.back-btn {
  padding: 5px;
}

.back-icon {
  font-size: 18px;
  color: #333;
}

.image-carousel {
  width: 100%;
  height: 520px;
  background-color: #fff;
  border-bottom: 1px solid #eee;  /* 只在图片区域下方添加分割线 */
}

.image-swiper {
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #fff;
}

.user-section {
  display: flex;
  align-items: center;
  padding: 15px;
  /* 移除 border-bottom */
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.create-time {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.follow-btn {
  background-color: #1296db;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 5px 15px;
  font-size: 12px;
}

.title-section {
  padding-left: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}

.content-section {
  padding-left: 20px;
  padding-top: 10px;
}

.content-text {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}

.interaction-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid #eee;  /* 在互动区域上方添加分割线 */
}

.like-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-icon {
  width: 24px;
  height: 24px;
  margin-right: 5px;
}

.like-count {
  font-size: 14px;
  color: #666;
}

.share-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-icon {
  width: 24px;
  height: 24px;
  margin-right: 5px;
}

.share-text {
  font-size: 14px;
  color: #666;
}

.comments-section {
  padding: 15px;
  border-top: 1px solid #eee;  /* 在评论区域上方添加分割线 */
}

.section-header {
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.comments-list {
  margin-top: 10px;
}

.comment-item {
  display: flex;
  padding-top: 15px;
  margin-bottom: 15px;
  border-top: 1px solid #f2f2f2;
}


.comment-item:first-child {
  border-top: none;
  padding-top: 0;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comment-author {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 5px;
}

.comment-actions {
  display: flex;
}

.reply-btn {
  font-size: 12px;
  color: #1296db;
  margin-right: 15px;
}

.no-comments {
  text-align: center;
  padding: 30px 0;
  color: #999;
}

.bottom-input {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  position: fixed;  /* 使用固定定位 */
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 60px;  /* 设置固定高度 */
}

.comment-input {
  flex: 1;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 18px;
  padding: 0 15px;
  font-size: 14px;
}

.send-btn {
  margin-left: 10px;
  background-color: #1296db;
  color: white;
  border: none;
  border-radius: 18px;
  padding: 0 15px;
  font-size: 14px;
  height: 35px;
}
.image-container {
  position: relative;
}

.image-indicator {
  position: absolute;
  right: 12px;
  bottom: 12px;
  background: rgba(0, 0, 0, 0.55);
  padding: 4px 10px;
  border-radius: 12px;
}

.indicator-text {
  color: #fff;
  font-size: 12px;
}
</style>
