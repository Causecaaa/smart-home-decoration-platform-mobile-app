import { request } from '../utils/request'



export function payDepositRequest(billId) {
    return request({
        url: `/bill/pay/deposit/${billId}`,
        method: 'POST'
    })
}

export function payFinalRequest(billId) {
    return request({
        url: `/bill/pay/final/${billId}`,
        method: 'POST'
    })
}

export function payFullRequest(billId) {
    return request({
        url: `/bill/pay/full/${billId}`,
        method: 'POST'
    })
}

/**
 * 获取账单列表
 */
export function getBills(params) {
    return request({
        url: '/bills',
        method: 'GET',
        params
    })
}

/**
 * 获取账单详情
 */
export function getBillById(billId) {
    return request({
        url: `/bills/${billId}`,
        method: 'GET'
    })
}

/**
 * 创建账单
 */
export function createBill(data) {
    return request({
        url: '/bills',
        method: 'POST',
        data
    })
}

/**
 * 更新账单
 */
export function updateBill(billId, data) {
    return request({
        url: `/bills/${billId}`,
        method: 'PUT',
        data
    })
}

/**
 * 删除账单
 */
export function deleteBill(billId) {
    return request({
        url: `/bills/${billId}`,
        method: 'DELETE'
    })
}

/**
 * 获取账单统计信息
 */
export function getBillStatistics(params) {
    return request({
        url: '/bills/statistics',
        method: 'GET',
        params
    })
}
