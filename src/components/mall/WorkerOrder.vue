<template>

</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { onLoad ,onShow} from '@dcloudio/uni-app';
import {BASE_URL} from "../../config/apiConfig";

const stageId = ref(0);

onLoad((options) =>{
  console.log('页面参数 option1s:', options)
  if (!options.stageId) {
    uni.showToast({ title: '缺少 stageId 参数', icon: 'none' })
    return
  }
  stageId.value = Number(options.stageId)
})
</script>


<style scoped lang="scss">

</style>