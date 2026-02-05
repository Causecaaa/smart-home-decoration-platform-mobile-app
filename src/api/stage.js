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


export function startStage(houseId, stageOrder){
    return request({
        url: `/stage/${houseId}/${stageOrder}/start`,
        method: 'POST'
    })
}

export function completeStage(stageId){
    return request({
        url: `/stage/${stageId}/complete`,
        method: 'POST'
    })
}

export function acceptStage(houseId, stageOrder){
    return request({
        url: `/stage/${houseId}/${stageOrder}/accept`,
        method: 'POST'
    })
}


export function review(stageId, rating, comment){
    return request({
        url: `/stage-review/stage/${stageId}`,
        method: 'POST',
        data: {
            rating,
            comment
        }
    })
}
