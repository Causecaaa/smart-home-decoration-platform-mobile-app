import { useUserStore } from '../store/userStore'
import { BASE_URL } from '../config/apiConfig'

function request(options) {
    return new Promise((resolve, reject) => {
        const userStore = useUserStore()

        uni.request({
            url: BASE_URL + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                ...(options.header || {}),
                ...(userStore.token
                    ? { Authorization: `Bearer ${userStore.token}` }
                    : {})
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

export default request
