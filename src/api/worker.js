import {request, uploadRequest} from '../utils/request'


export function getWorkerStageCalendar(month) {
    return request({
        url: '/worker/calendar',
        method: 'GET',
        params: {
            month // 确保 month 参数被传递
        }
    });
}
