import { request, uploadRequest } from '../utils/request'

/**
 * 创建文章
 * POST /post/create
 */
export const createPost = (data) => {
    return request({
        url: '/post/create',
        method: 'post',
        data
    })
}

/**
 * 首页文章列表（SimplePostResponse）
 * GET /post/list
 */
export const getPostList = () => {
    return request({
        url: '/post/list',
        method: 'get'
    })
}

export const getPostSimple = (postId) => {
    return request({
        url: `/post/${postId}/simple`,
        method: 'get'
    })
}

/**
 * 获取文章详情（DetailPostResponse）
 * GET /post/{postId}
 */
export const getPostDetail = (postId) => {
    return request({
        url: `/post/${postId}`,
        method: 'get'
    })
}

/**
 * 修改文章
 * PUT /post/{postId}
 */
export const updatePost = (postId, data) => {
    return request({
        url: `/post/${postId}`,
        method: 'put',
        data
    })
}

/**
 * 删除文章
 * DELETE /post/{postId}
 */
export const deletePost = (postId) => {
    return request({
        url: `/post/${postId}`,
        method: 'delete'
    })
}

/**
 * 上传文章图片
 * @param {Number} postId
 * @param {String} filePath  // uni.chooseImage 返回的路径
 */
export function uploadPostImage(postId, filePath) {
    return uploadRequest({
        url: `/post/image/${postId}`,
        filePath
    })
}


/**
 * 删除文章图片
 */
export function deletePostImage(imageId) {
    return request({
        url: `/post/image/${imageId}`,
        method: 'delete'
    })
}

export function likePost(postId) {
    return request({
        url: `/post/${postId}/like`,
        method: 'post'
    })
}

/**
 * 发表评论
 */
export function createComment(postId, data) {
    return request({
        url: `/post/${postId}/comment`,
        method: 'post',
        data
    })
}

/**
 * 评论列表
 */
export function getCommentList(postId) {
    return request({
        url: `/post/${postId}/comment`,
        method: 'get'
    })
}

/**
 * 删除评论
 */
export function deleteComment(postId, commentId) {
    return request({
        url: `/post/${postId}/comment/${commentId}`,
        method: 'delete'
    })
}