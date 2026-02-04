import {request, uploadRequest} from '../utils/request'


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
    return uploadRequest({
        url: '/user/upload-avatar',
        filePath
    })
}