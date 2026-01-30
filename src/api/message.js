import {request, uploadRequest} from '../utils/request'

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
    return uploadRequest({
        url: `/chat/image-create/${receiverId}`,
        filePath
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

