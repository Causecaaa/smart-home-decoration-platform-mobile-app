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


export function requestLeave(leaveDate, leaveType, reason) {
    return request({
        url: '/worker/leave',
        method: 'POST',
        data: {
            leaveDate,  // 传递请假日期
            leaveType,  // 传递请假类型
            reason      // 传递请假原因
        }
    });
}


export function cancelLeaveRequest(leaveDate){
    return request({
        url: '/worker/leave/cancel',
        method: 'POST',
        data: {
            leaveDate // 确保 leaveDate 参数被传递
        }
    });
}