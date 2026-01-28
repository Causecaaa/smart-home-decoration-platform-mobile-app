import { request, uploadRequest } from '../utils/request'

/**
 * 获取布局详情
 */
export function getUserFurnitureLayoutById(layoutId) {
    return request({
        url: `/house-layout/user/furniture/${layoutId}`,
        method: 'GET'
    })
}

export function getDesignerFurnitureLayoutById(layoutId) {
    return request({
        url: `/house-layout/designer/furniture/${layoutId}`,
        method: 'GET'
    })
}

/**
 * 分配家具设计师
 */
export function assignFurnitureDesigner(layoutId, designerId) {
    return request({
        url: `/house-layout/${layoutId}/confirm/furnitureDesigner`,
        method: 'PUT',
        data: {
            furnitureDesignerId: designerId
        }
    })
}

/**
 * 创建房间
 */
export function createRoom(data) {
    return request({
        url: '/room/create',
        method: 'POST',
        data: data
    })
}

/**
 * 获取房间详情
 */
export function getRoomById(roomId) {
    return request({
        url: `/room/${roomId}/get`,
        method: 'GET'
    })
}

/**
 * 更新房间信息
 */
export function updateRoom(roomId, data) {
    return request({
        url: `/room/${roomId}/update`,
        method: 'PUT',
        data: data
    })
}

/**
 * 删除房间
 */
export function deleteRoom(roomId) {
    return request({
        url: `/room/${roomId}`,
        method: 'DELETE'
    })
}

/**
 * 获取布局下的所有房间
 */
export function getRoomsByLayout(layoutId) {
    return request({
        url: `/room/${layoutId}/get-all`,
        method: 'GET'
    })
}

/**
 * 创建家具方案
 */
export function createFurnitureScheme(roomId, filePath) {
    return uploadRequest({
        url: `/furniture-scheme/room/${roomId}/create`,
        filePath
    })
}

/**
 * 更新方案图片
 */
export function updateSchemeImage(schemeId, filePath) {
    return uploadRequest({
        url: `/furniture-scheme/${schemeId}/update-image`,
        filePath
    })
}

/**
 * 获取方案详情
 */
export function getFurnitureSchemeById(schemeId) {
    return request({
        url: `/furniture-scheme/${schemeId}/get`,
        method: 'GET'
    })
}

/**
 * 删除家具方案
 */
export function deleteFurnitureScheme(schemeId) {
    return request({
        url: `/furniture-scheme/${schemeId}`,
        method: 'DELETE'
    })
}

/**
 * 获取房间的所有方案
 */
export function getSchemesByRoom(roomId) {
    return request({
        url: `/furniture-scheme/${roomId}/get-all`,
        method: 'GET'
    })
}

/**
 * 确认家具方案
 * @param {number} schemeId - 方案ID
 * @returns {Promise} 确认后的方案数据
 */
export function confirmFurnitureScheme(schemeId) {
    return request({
        url: `/furniture-scheme/${schemeId}/confirm`,
        method: 'PUT'
    })
}
