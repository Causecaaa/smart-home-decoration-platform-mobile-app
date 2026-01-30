// src/store/postFormStore.js
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const usePostFormStore = defineStore('postForm', () => {
  const form = reactive({
    title: '',
    content: '',
    images: [] // 存储图片信息，每个 { file, url, key }
  })

  const errors = reactive({
    title: '',
    content: ''
  })

  // 添加图片
  const addImage = (file, url) => {
    const key = Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    form.images.push({
      key,
      url,
      file // 保存原始文件对象，用于上传
    })
  }

  // 删除图片
  const removeImage = (key) => {
    const index = form.images.findIndex(img => img.key === key)
    if (index !== -1) {
      form.images.splice(index, 1)
    }
  }

  // 重置表单
  const resetForm = () => {
    form.title = ''
    form.content = ''
    form.images = []
    errors.title = ''
    errors.content = ''
  }

  return {
    form,
    errors,
    addImage,
    removeImage,
    resetForm
  }
})
