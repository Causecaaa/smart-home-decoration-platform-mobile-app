import { request } from '../utils/request'


// 获取当前登录用户的房屋列表
export function getHousesByUser() {
    return request({
        url: '/house/get-all',
        method: 'GET'
    })
}

// 获取单个房屋信息
export function getHouseById(houseId) {
    return request({
        url: `/house/${houseId}/find`,
        method: 'GET'
    })
}

// 新增房屋
export function createHouse(data) {
    return request({
        url: '/house/create-house',
        method: 'POST',
        data
    })
}

// 更新房屋
export function updateHouse(houseId, data) {
    return request({
        url: `/house/${houseId}/update`,
        method: 'PUT',
        data
    })
}

// 删除房屋
export function deleteHouse(houseId) {
    return request({
        url: `/house/${houseId}`,
        method: 'DELETE'
    })
}

export function getHouseQuotation(houseId){
    return request({
        url: `/house/quotation/${houseId}`,
        method: 'GET'
    })
}
