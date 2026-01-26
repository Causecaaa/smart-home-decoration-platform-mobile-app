import request from '../utils/request'
import {BASE_URL} from "../config/apiConfig";

// 发送文本消息
export const sendTextMessage = (data) => {
    return request({
        url: '/chat/text-create',
        method: 'post',
        data
    })
}

// 发送图片消息
export function sendImageMessage(receiverId, filePath) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token')

        uni.uploadFile({
            url: `${BASE_URL}/chat/image-create/${receiverId}`,
            filePath,
            name: 'file',
            header: {
                Authorization: `Bearer ${token}`
            },
            success: (res) => {
                try {
                    const data = JSON.parse(res.data)
                    if (data.code === 200) {
                        resolve(data.data)
                    } else {
                        reject(data.message || '发送失败')
                    }
                } catch (e) {
                    reject('返回数据解析失败')
                }
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

// 获取与指定用户的对话记录
export const getConversation = (otherId) => {
    return request({
        url: `/chat/conversation/${otherId}`,
        method: 'get'
    })
}

// 删除指定消息
export const deleteMessage = (messageId) => {
    return request({
        url: `/chat/delete/${messageId}`,
        method: 'delete'
    })
}

// 获取最近聊天的用户列表
export const getChatPartners = () => {
    return request({
        url: '/chat/chat-partners',
        method: 'get'
    })
}

