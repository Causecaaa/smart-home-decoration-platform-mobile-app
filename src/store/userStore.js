import { defineStore } from 'pinia'
import { validateToken } from '../api/auth'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        user: null,
        worker: null,
    }),

    actions: {
        loginSuccess(data) {
            this.token = data.token
            this.user = data.user
            this.worker = data.worker || null

            uni.setStorageSync('token', data.token)
            uni.setStorageSync('user', data.user)
            uni.setStorageSync('worker', data.worker || null)
        },

        logout() {
            this.token = ''
            this.user = null
            this.worker = null

            uni.removeStorageSync('token')
            uni.removeStorageSync('user')
            uni.removeStorageSync('worker')

            uni.reLaunch({ url: '/src/pages/login/login' })
        },

        async init() {
            const token = uni.getStorageSync('token')

            if (!token) return

            try {
                const res = await validateToken(token)

                this.token = token
                this.user = res.user
                this.worker = res.worker || null

                // 同步刷新本地缓存（很重要）
                uni.setStorageSync('user', res.user)
                uni.setStorageSync('worker', res.worker || null)

            } catch (error) {
                console.error('Token validation failed:', error)
                this.logout()
            }
        },

        updateUserInfo(userData) {
            if (this.user) {
                Object.assign(this.user, userData)
                uni.setStorageSync('user', this.user)
            }
        }
    }
})
