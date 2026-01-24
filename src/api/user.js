import request from "../utils/request";
import { BASE_URL } from "../config/apiConfig";

export function registerUser(data) {
    return request({
        url: '/user/create',
        method: 'POST',
        data
    })
}

export function loginUser(data) {
    return request({
        url: '/user/login',
        method: 'POST',
        data
    })
}

export function getCurrentUserInfo() {
    return request({
        url: '/user/userInfo',
        method: 'GET'
    })
}

export function updateUserProfile(data) {
    return request({
        url: '/user/update-profile',
        method: 'PUT',
        data
    })
}

export function changeUserPassword(data) {
    return request({
        url: '/user/change-password',
        method: 'PUT',
        data
    })
}

export function uploadUserAvatar(filePath) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token')

        uni.uploadFile({
            url: BASE_URL + '/user/upload-avatar',
            filePath,
            name: 'file',
            header: {
                Authorization: `Bearer ${token}`
            },
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
