import { request } from '../utils/request'

export function getStage(houseId) {
    return request({
        url: `/stage/${houseId}`,  // 修改为正确的路径
        method: 'GET'
    })
}

export function getStageDetail(houseId, orderId){
    return request({
        url: `/stage/${houseId}/${orderId}`,
        method: 'GET'
    })
}

export function updateStageSchedule(houseId, stageOrder, expectedStartAt) {
    return request({
        url: `/stage/${houseId}/${stageOrder}/schedule?expectedStartAt=${expectedStartAt}`,
        method: 'POST'
    })
}


