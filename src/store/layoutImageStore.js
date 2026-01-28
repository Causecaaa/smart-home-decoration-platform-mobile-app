// 改进版本
import {defineStore} from "pinia";

export const useLayoutImageStore = defineStore('layoutImage', {
    state: () => ({
        images: {},
    }),
    actions: {
        setImages(layoutId, images) {
            if (!layoutId || !Array.isArray(images)) {
                console.warn('Invalid parameters for setImages');
                return;
            }
            this.images[layoutId] = images;
        },

        addImage(layoutId, image) {
            if (!layoutId || !image) {
                console.warn('Invalid parameters for addImage');
                return;
            }

            if (!this.images[layoutId]) {
                this.images[layoutId] = [];
            }
            this.images[layoutId].push(image);
        },

        // 新增安全访问方法
        getImages(layoutId) {
            return this.images[layoutId] || [];
        },

        clearImages(layoutId) {
            if (this.images[layoutId]) {
                delete this.images[layoutId];
            }
        }
    }
})
