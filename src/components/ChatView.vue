<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div
          v-for="message in messages"
          :key="message.id"
          :class="[
          'message-bubble',
          message.senderId === currentUserInfo.userId ? 'sent' : 'received'
        ]"
      >
        <div class="message-content-wrapper">
          <div class="message-content">
            <!-- 文本消息 -->
            <div v-if="message.type === 'TEXT' || message.contentType === 'TEXT'" class="text-message">
              {{ message.text || message.content }}
            </div>

            <!-- 图片消息 -->
            <div v-else-if="message.type === 'IMAGE' || message.contentType === 'IMAGE'" class="image-message">
              <img
                  :src="getImageUrl(message.imageUrl || message.content)"
                  @click="previewImage(getImageUrl(message.imageUrl || message.content))"
                  alt="图片消息"
              />
            </div>
          </div>

          <div class="message-time">
            {{ formatTime(message.createdAt || message.timestamp) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-actions">
        <button class="action-btn" @click="triggerFileSelect" :disabled="isSending">
          <span>📎</span>
        </button>
        <input
            type="file"
            ref="fileInputRef"
            @change="handleImageUpload"
            accept="image/*"
            style="display: none"
        />
      </div>

      <textarea
          v-model="inputText"
          placeholder="输入消息..."
          @keydown.enter.exact.prevent="sendTextMessageHandler"
          class="message-input"
          :disabled="isSending"
      ></textarea>

      <button
          @click="sendTextMessageHandler"
          :disabled="!inputText.trim() || isSending"
          class="send-btn"
          :class="{ 'enabled': inputText.trim() && !isSending }"
      >
        <span v-if="isSending">⏳</span>
        <span v-else>📤</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, nextTick, computed, watch} from 'vue'
import { getConversation, sendTextMessage, sendImageMessage } from '../../api/message'
import { useUserStore } from '../../store/userStore'
import {BASE_URL} from "../../config/apiConfig";

const props = defineProps({
  targetUserId: {
    type: Number,
    required: true
  }
})

const messages = ref([])
const inputText = ref('')
const isSending = ref(false)
const messagesContainer = ref(null)
const fileInputRef = ref(null)

// 获取当前用户信息
const userStore = useUserStore()
const currentUserInfo = computed(() => ({
  userId: userStore.user.userId,
  username: userStore.user.userName,
  role: userStore.user.role
}))

// 获取用户显示名称
const getUserDisplayName = (userId) => {
  if (userId === currentUserInfo.value.userId) {
    return userStore.user.userName
  }
  return `${userId}`
}

// 获取对话记录
const loadConversation = async () => {
  try {
    const response = await getConversation(props.targetUserId)
    console.log('对话记录:', response)

    // 检查响应结构
    let conversationData = []

    if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        conversationData = response.data
      } else if (Array.isArray(response)) {
        conversationData = response
      } else {
        console.warn('API 返回数据格式不符合预期:', response)
        messages.value = []
        return
      }
    } else {
      console.warn('API 返回数据格式错误:', response)
      messages.value = []
      return
    }

    // 转换数据结构以匹配组件期望
    messages.value = conversationData.map(msg => ({
      ...msg,
      text: msg.content,
      type: msg.contentType,
      createdAt: msg.timestamp,
      senderName: getUserDisplayName(msg.senderId)
    }))

    await nextTick()
    await scrollToBottom()
  } catch (error) {
    console.error('获取对话失败:', error)
    // 显示错误提示
    if (error.response) {
      console.error('服务器错误:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('网络错误:', error.request)
    } else {
      console.error('请求配置错误:', error.message)
    }
  }
}

// 处理图片URL，确保正确拼接
const getImageUrl = (url) => {
  if (!url) return ''

  return BASE_URL + url
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 发送文本消息
const sendTextMessageHandler = async () => {
  if (!inputText.value.trim() || isSending.value) return

  isSending.value = true
  try {
    const requestData = {
      text: inputText.value,
      receiverId: props.targetUserId
    }

    await sendTextMessage(requestData)
    inputText.value = ''
    await loadConversation() // 刷新消息列表
  } catch (error) {
    console.error('发送消息失败:', error)
    // 显示错误提示
    alert('发送消息失败，请稍后重试')
  } finally {
    isSending.value = false
  }
}

// 处理图片上传
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isSending.value = true
  try {
    await sendImageMessage(props.targetUserId, file)
    event.target.value = '' // 清空文件选择
    await loadConversation() // 刷新消息列表
  } catch (error) {
    console.error('发送图片失败:', error)
    // 显示错误提示
    alert('发送图片失败，请稍后重试')
  } finally {
    isSending.value = false
  }
}

// 触发文件选择
const triggerFileSelect = () => {
  if (!isSending.value) {
    fileInputRef.value.click()
  }
}

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)

  // 获取今天的日期，用于比较
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // 比较日期
  const isToday = date.toDateString() === today.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) {
    // 今天：只显示时间
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (isYesterday) {
    // 昨天：显示"昨天" + 时间
    return '昨天 ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else {
    // 更早：显示完整日期 + 时间
    return date.toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 监听目标用户ID变化
watch(() => props.targetUserId, async (newUserId, oldUserId) => {
  if (newUserId !== oldUserId && newUserId) {
    messages.value = [] // 清空之前的消息
    await loadConversation() // 重新加载对话
  }
}, { immediate: true })

// 图片预览功能
const previewImage = (imageUrl) => {
  if (imageUrl) {
    window.open(imageUrl, '_blank')
  }
}

onMounted(() => {
  loadConversation()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=');
  background-color: #f0f2f5;
}

.message-bubble {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 85%;
}

.message-bubble.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.message-content {
  padding: 10px 14px;
  border-radius: 18px;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
}

.sent .message-content {
  background-color: #0084ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.received .message-content {
  background-color: white;
  color: #333;
  border-bottom-left-radius: 4px;
}

.text-message {
  font-size: 14px;
  line-height: 1.4;
}

.image-message img {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
}

.message-time {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  text-align: right;
  padding-right: 4px;
  white-space: nowrap;
}

.input-area {
  display: flex;
  align-items: flex-end;
  padding: 12px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  gap: 8px;
}

.input-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background-color 0.2s;
}

.action-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-input {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  padding: 10px 14px;
  resize: none;
  height: 40px;
  max-height: 100px;
  font-size: 14px;
  outline: none;
}

.message-input:focus {
  border-color: #0084ff;
  box-shadow: 0 0 0 2px rgba(0, 132, 255, 0.1);
}

.message-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #e0e0e0;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
  margin-left: 8px;
}

.send-btn.enabled {
  background: #0084ff;
  color: white;
  cursor: pointer;
}

.send-btn.enabled:hover {
  background: #0077e6;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .chat-container {
    border-radius: 0;
    height: 100vh;
  }

  .message-bubble {
    max-width: 90%;
  }

  .image-message img {
    max-width: 120px;
    max-height: 120px;
  }
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
