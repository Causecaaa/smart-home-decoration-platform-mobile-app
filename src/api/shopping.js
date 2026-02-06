// src/api/shopping.js
import { request } from '../utils/request'

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} [params.materialType] - 材料类型
 * @param {string} [params.mainCategory] - 主分类
 * @param {string} [params.subCategory] - 子分类
 * @param {string} [params.keyword] - 关键词
 * @returns {Promise} 商品列表数据
 */
export function getProductList(params = {}) {
    return request({
        url: '/product/list',
        method: 'GET',
        params
    })
}


/**
 * 根据ID获取商品详情
 * @param {number} productId - 商品ID
 * @returns {Promise} 商品详情数据
 */
export function getProductById(productId) {
    return request({
        url: `/product/${productId}`,
        method: 'GET'
    })
}

/**
 * 添加商品到购物车
 * @param {number} stageId - 阶段ID
 * @param {Object} data - 商品信息
 * @returns {Promise} 购物车数据
 */
export function addCartItem(stageId, data) {
    return request({
        url: `/stage-cart/${stageId}/item`,
        method: 'POST',
        data
    })
}

/**
 * 更新购物车中的商品
 * @param {number} stageId - 阶段ID
 * @param {number} itemId - 商品项ID
 * @param {Object} data - 更新的商品信息
 * @returns {Promise} 购物车数据
 */
export function updateCartItem(stageId, itemId, data) {
    return request({
        url: `/stage-cart/${stageId}/item/${itemId}`,
        method: 'PUT',
        data
    })
}

/**
 * 从购物车中移除商品
 * @param {number} stageId - 阶段ID
 * @param {number} itemId - 商品项ID
 * @returns {Promise} 购物车数据
 */
export function removeCartItem(stageId, itemId) {
    return request({
        url: `/stage-cart/${stageId}/item/${itemId}`,
        method: 'DELETE'
    })
}

/**
 * 获取购物车信息
 * @param {number} stageId - 阶段ID
 * @returns {Promise} 购物车数据
 */
export function getCart(stageId) {
    return request({
        url: `/stage-cart/${stageId}`,
        method: 'GET'
    })
}

/**
 * 结算阶段订单
 * @param {number} stageId - 阶段ID
 * @returns {Promise} 订单信息
 */
export function checkoutStageOrder(stageId) {
    return request({
        url: `/stage-order/${stageId}/checkout`,
        method: 'POST'
    })
}

export function getOrders(stageId) {
    return request({
        url: `/stage-order/${stageId}/orders`,
        method: 'GET'
    })
}

/**
 * 支付订单
 * @param {number} orderId - 订单ID
 * @returns {Promise} 更新后的订单信息
 */
export function payStageOrder(orderId) {
    return request({
        url: `/stage-order/${orderId}/pay-order`,
        method: 'PATCH'
    })
}

/**
 * 获取阶段购买材料汇总
 * @param {number} stageId - 阶段ID
 * @returns {Promise} 购买材料汇总信息
 */
export function getPurchasedMaterialsSummary(stageId) {
    return request({
        url: `/stage-order/${stageId}/summary`,
        method: 'GET'
    })
}