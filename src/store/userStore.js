import { defineStore } from 'pinia'
import {validateToken} from "../api/auth";

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        user: null,
        hasTokenChanged: false  // 添加标记
    }),

    actions: {
        loginSuccess(data) {
            this.token = data.token
            this.user = data.user

            uni.setStorageSync('token', data.token)
            uni.setStorageSync('user', data.user)
        },

        logout() {
            this.token = ''
            this.user = null
            uni.removeStorageSync('token')
            uni.removeStorageSync('user')
            uni.reLaunch({ url: '/src/pages/login/login' })
        },

        async init() {
            const token = uni.getStorageSync('token')
            const user = uni.getStorageSync('user')

            if (token) {
                console.log('init token', token)
                try {
                    const res = await validateToken(token)
                    console.log('success')
                    this.token = token
                    this.user = res.user

                } catch (error) {
                    console.error('Token validation failed:', error)
                    // 验证失败时登出
                    this.logout()
                }
            }
        },

        updateUserInfo(userData) {
            if (this.user) {
                Object.assign(this.user, userData)
            }
        }
    }
})
