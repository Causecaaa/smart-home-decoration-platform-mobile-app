import request from '../utils/request'

/**
 * 上传布局图片
 */
export function uploadLayoutImage(layoutId, options = {}) {
    const formData = new FormData()

    if (options.file) {
        formData.append('file', options.file)
    }

    if (options.imageType) {
        formData.append('imageType', options.imageType)
    }

    if (options.imageDesc) {
        formData.append('imageDesc', options.imageDesc)
    }

    return request({
        url: `/house-layout-image/${layoutId}/create`,
        method: 'POST',
        data: formData
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
