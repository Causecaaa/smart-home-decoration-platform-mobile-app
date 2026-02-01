import { request } from '../utils/request'

export function getStage(houseId) {
    return request({
        url: `/stage/${houseId}`,  // 修改为正确的路径
        method: 'GET'
    })
}
