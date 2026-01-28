// src/api/auth.js
import { request } from '../utils/request'


export function validateToken(token) {
  return request({
    url: '/auth/validate',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${token}`
    },
    skipGlobalToken: true  // 绕过全局 token 设置
  })
}