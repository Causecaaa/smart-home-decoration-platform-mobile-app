import request from '../utils/request'

/**
 * REDESIGN：创建布局草稿（选择设计师）
 */
export function createLayoutDraft(data) {
    return request({
        url: '/house-layout/create-draft',
        method: 'POST',
        data
    })
}

/**
 * KEEP_ORIGINAL：创建布局（直接确认）、设计师创建方案
 */
export function createLayout(data) {
    return request({
        url: '/house-layout/create-layout',
        method: 'POST',
        data
    })
}

/**
 * 根据房屋 ID 获取所有布局方案
 */
export function getLayoutsByHouse(houseId) {
    return request({
        url: `/house-layout/overview/${houseId}`,
        method: 'GET'
    })
}

/**
 * 更新布局信息（说明 / 需求等）
 */
export function updateLayout(layoutId, data) {
    return request({
        url: `/house-layout/update/${layoutId}`,
        method: 'PUT',
        data
    })
}

/**
 * 删除布局
 */
export function deleteLayout(layoutId) {
    return request({
        url: `/house-layout/delete/${layoutId}`,
        method: 'DELETE'
    })
}

/**
 * 用户确认布局方案
 */
export function confirmLayoutRequest(layoutId) {
    return request({
        url: `/house-layout/${layoutId}/confirm`,
        method: 'PUT'
    })
}

/**
 * 确认家具设计师
 */
export function confirmFurnitureDesigner(layoutId, furnitureDesignerId) {
    return request({
        url: `/house-layout/${layoutId}/confirm/furnitureDesigner`,
        method: 'PUT',
        data: { furnitureDesignerId }
    })
}
