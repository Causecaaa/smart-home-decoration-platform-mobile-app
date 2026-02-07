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

export function updateStage(stageId, stageUpdateRequest) {
    return request({
        url: `/stage/${stageId}/update`,
        method: 'POST',
        data: stageUpdateRequest
    });
}

export function getLaborMarket(stageId, minLevel, page = 0, size = 5) {
    return request({
        url: '/worker/labor-market',
        method: 'GET',
        params: {
            stageId,
            minLevel,
            page,
            size
        }
    });
}

// 邀请工人接口
// public class InviteWorkersRequest {
//     @NotNull(message = "日薪不能为空")
//     private BigDecimal dailyWage;
//
//     @NotEmpty(message = "工人列表不能为空")
//     private List<Long> workerIds;
// }

export function inviteWorkers(stageId, request1) {
    return request({
        url: `/stage/${stageId}/invite-workers`,
        method: 'POST',
        data: request1
    });
}

// 获取阶段邀请列表接口
export function listStageInvites(stageId) {
    return request({
        url: `/stage/${stageId}/invites`,
        method: 'GET'
    });
}
