import { useUserStore } from '../store/userStore'
import { BASE_URL } from '../config/apiConfig'

export function request(options) {
    return new Promise((resolve, reject) => {
        const userStore = useUserStore()

        const skipGlobalToken = options.skipGlobalToken || false

        uni.request({
            url: BASE_URL + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                ...(skipGlobalToken ? {} : (userStore.token
                    ? { Authorization: `Bearer ${userStore.token}` }
                    : {})),
                ...(options.header || {})
            },
            timeout: 10000,
            success: (res) => {
                const { code, data, message } = res.data || {}

                if (code !== 200) {
                    uni.showToast({
                        title: message || '请求失败',
                        icon: 'none'
                    })
                    reject(message)
                } else {
                    resolve(data)
                }
            },
            fail: (err) => {
                uni.showToast({
                    title: '网络错误',
                    icon: 'none'
                })
                reject(err)
            }
        })
    })
}

export function uploadRequest({ url, filePath, formData = {} }) {
    return new Promise((resolve, reject) => {
        const userStore = useUserStore()

        uni.uploadFile({
            url: BASE_URL + url,
            filePath,
            name: 'file',
            formData,
            header: userStore.token
                ? { Authorization: `Bearer ${userStore.token}` }
                : {},
            success: (res) => {
                const data = JSON.parse(res.data)
                if (data.code === 200) {
                    resolve(data.data)
                } else {
                    reject(data.message)
                }
            },
            fail: reject
        })
    })
}