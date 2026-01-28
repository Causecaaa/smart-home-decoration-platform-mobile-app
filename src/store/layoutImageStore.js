// store
import { defineStore } from 'pinia'

// 在 store/layoutImageStore.js 中移除缓存机制
export const useLayoutImageStore = defineStore('layoutImage', {
    state: () => ({
        images: {}, // 直接存储图片，不使用缓存层
    }),
    actions: {
        // 移除缓存相关的清理和恢复方法
        setImages(layoutId, images) {
            this.images[layoutId] = images
            // 移除本地存储缓存逻辑
        },
        addImage(layoutId, image) {
            if (!this.images[layoutId]) {
                this.images[layoutId] = []
            }
            this.images[layoutId].push(image)
            // 移除本地存储更新逻辑
        }
    }
})

