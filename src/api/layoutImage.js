import {request, uploadRequest} from '../utils/request'

import {BASE_URL} from "../config/apiConfig";

/**
 * 上传布局图片
 */
export function uploadLayoutImage(layoutId, filePath) {
    return uploadRequest({
        url: `/house-layout-image/${layoutId}/create`,
        filePath,
        formData: {
            imageType: "STRUCTURE",
        }
    })
}


/**
 * 获取某个 layout 下的所有图片
 */
export function getLayoutImages(layoutId) {
    return request({
        url: `/house-layout-image/${layoutId}/get`,
        method: 'GET'
    })
}

/**
 * 删除图片
 */
export function deleteLayoutImage(imageId) {
    return request({
        url: `/house-layout-image/${imageId}/delete`,
        method: 'DELETE'
    })
}

/**
 * 更新图片信息（描述 / 类型）
 */
export function updateLayoutImage(imageId, data) {
    return request({
        url: `/house-layout-image/${imageId}/update`,
        method: 'PUT',
        data
    })
}
