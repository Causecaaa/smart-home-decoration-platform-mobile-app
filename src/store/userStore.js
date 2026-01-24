import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        user: null
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

        init() {
            const token = uni.getStorageSync('token')
            const user = uni.getStorageSync('user')
            if (token) this.token = token
            if (user) this.user = user
        }
    }
})
