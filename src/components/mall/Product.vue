<template>
  <view class="product-container">
    <!-- 筛选 -->
    <view class="filter-section">
      <picker mode="selector" :range="materialTypes" range-key="label" @change="onMaterialTypeChange">
        <view class="picker-box">物料类型：{{ selectedMaterialTypeLabel }}</view>
      </picker>
      <picker mode="selector" :range="mainCategoryOptions" range-key="label" @change="onMainCategoryChange">
        <view class="picker-box">主分类：{{ selectedMainCategoryLabel }}</view>
      </picker>
      <picker mode="selector" :range="subCategoryOptions" range-key="label" @change="onSubCategoryChange">
        <view class="picker-box">辅分类：{{ selectedSubCategoryLabel }}</view>
      </picker>
    </view>

    <!-- 搜索 -->
    <view class="search-section">
      <input v-model="searchParams.keyword" placeholder="请输入关键字" />
    </view>

    <!-- 商品列表 -->
    <view v-if="productList.length > 0" class="product-list">
      <view v-for="product in productList" :key="product.productId" class="product-card">
        <image v-if="product.imageUrl" :src="product.imageUrl" class="product-image" mode="aspectFill"/>
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-brand">品牌：{{ product.brand }}</text>
          <text class="product-price">¥{{ product.price }}</text>
          <text class="product-description">{{ product.description }}</text>
          <text v-if="product.stock < 100" class="low-stock">库存紧张</text>
        </view>
        <button class="add-to-cart" @click.stop="addToCart(product)">加入购物车</button>
      </view>
    </view>
    <view v-else class="loading-text">暂无商品</view>

    <!-- 分页 -->
    <view v-if="totalPages > 1" class="pagination">
      <button :disabled="currentPage <= 0" @click="changePage(currentPage - 1)">上一页</button>
      <text>第 {{ currentPage + 1 }} / {{ totalPages }} 页，共 {{ totalElements }} 条</text>
      <button :disabled="currentPage + 1 >= totalPages" @click="changePage(currentPage + 1)">下一页</button>
    </view>

    <!-- 底部购物车条 -->
    <view class="cart-bar" @click="toggleCart">
      <text>已选 {{ cart.items.length }} 件</text>
      <text>总计 ¥{{ cart.totalAmount.toFixed(2) }}</text>
      <text class="checkout-btn">去结算</text>
    </view>

    <!-- 浮层购物车 -->
    <view v-if="showCart" class="cart-drawer">
      <view v-for="item in cart.items" :key="item.id">
        <text>{{ item.productName }} x {{ item.quantity }}</text>
        <view class="cart-item-btns">
          <button @click.stop="decrement(item)">-</button>
          <button @click.stop="increment(item)">+</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { onLoad ,onShow} from '@dcloudio/uni-app';
import {
  addCartItem,
  getCart,
  getProductList,
  removeCartItem,
  updateCartItem
} from '../../api/shopping'

/* 基础参数 */
const stageId = ref(null)
const pageSize = 10

/* 查询参数 */
const searchParams = ref({
  keyword: ''
})

/* 商品列表 */
const productList = ref([])
const totalPages = ref(0)
const currentPage = ref(0)
const totalElements = ref(0)

// 分类映射
const materialTypes = [
  { label: '全部', value: null },
  { label: '主材', value: 1 },
  { label: '辅材', value: 2 }
];
const categoriesMap = {
  1: { FLOOR: ['全部','TILES','WOOD_FLOOR','COMPOSITE_FLOOR','STONE'], WALL: ['全部','EMULSION_PAINT','WALLPAPER','ARTISTIC_COATING','DIATOM_MUDE'], CEILING: ['全部','PLASTERBOARD_CEILING','INTEGRATED_CEILING','ALUMINUM_SCREW_CEILING','ORIGINAL_TOP_BRUSH_WHITE','WOODEN_DECORATIVE_CEILING'], CABINET: ['全部','SOLID_WOOD_PARTICLE_BOARD','MULTI_LAYER_SOLID_WOOD_BOARD','DENSITY_BOARD','STAINLESS_STEEL','ACRYLIC']},
  2: { AUX: ['全部','ADHESIVE','WATERPROOF','PUTTY','KEEL'] }
};
const categoriesLabelMap = { FLOOR:'地面', WALL:'墙面', CEILING:'吊顶', CABINET:'橱柜', AUX:'辅材', TILES:'抛釉瓷砖', WOOD_FLOOR:'多层实木地板', COMPOSITE_FLOOR:'复合强化地板', STONE:'天然大理石', EMULSION_PAINT:'乳胶漆', WALLPAPER:'壁纸', ARTISTIC_COATING:'艺术涂料', DIATOM_MUDE:'硅藻泥', PLASTERBOARD_CEILING:'石膏板吊顶', INTEGRATED_CEILING:'集成吊顶', ALUMINUM_SCREW_CEILING:'铝扣板吊顶', ORIGINAL_TOP_BRUSH_WHITE:'原顶刷白', WOODEN_DECORATIVE_CEILING:'木饰面吊顶', SOLID_WOOD_PARTICLE_BOARD:'实木颗粒板', MULTI_LAYER_SOLID_WOOD_BOARD:'多层实木板', DENSITY_BOARD:'密度板', STAINLESS_STEEL:'不锈钢柜体', ACRYLIC:'亚克力门板', ADHESIVE:'瓷砖胶', WATERPROOF:'防水涂料', PUTTY:'腻子粉', KEEL:'龙骨' };

// 下拉选中状态
const selectedMaterialType = ref(null);
const selectedMainCategory = ref(null);
const selectedSubCategory = ref(null);

const selectedMaterialTypeLabel = computed(() => materialTypes.find(m => m.value === selectedMaterialType.value)?.label || '全部');
const mainCategoryOptions = computed(() => selectedMaterialType.value ? Object.keys(categoriesMap[selectedMaterialType.value]).map(k => ({ label: categoriesLabelMap[k], value: k })).concat({ label: '全部', value: null }) : [{ label: '全部', value: null }]);
const subCategoryOptions = computed(() => selectedMaterialType.value && selectedMainCategory.value ? categoriesMap[selectedMaterialType.value][selectedMainCategory.value].map(k => ({ label: categoriesLabelMap[k] || k, value: k === '全部' ? null : k })) : [{ label: '全部', value: null }]);
const selectedMainCategoryLabel = computed(() => selectedMainCategory.value ? categoriesLabelMap[selectedMainCategory.value] || selectedMainCategory.value : '全部');
const selectedSubCategoryLabel = computed(() => selectedSubCategory.value ? categoriesLabelMap[selectedSubCategory.value] || selectedSubCategory.value : '全部');

// 下拉事件
const onMaterialTypeChange = e => { selectedMaterialType.value = materialTypes[e.detail.value].value; selectedMainCategory.value = null; selectedSubCategory.value = null; loadProductList(0); };
const onMainCategoryChange = e => { selectedMainCategory.value = mainCategoryOptions.value[e.detail.value].value; selectedSubCategory.value = null; loadProductList(0); };
const onSubCategoryChange = e => { selectedSubCategory.value = subCategoryOptions.value[e.detail.value].value; loadProductList(0); };


/* 搜索防抖 */
let searchTimer = null
watch(
    () => searchParams.value.keyword,
    () => {
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        loadProductList(0)
      }, 500)
    }
)

/* 加载商品 */
const loadProductList = async (page = 0) => {
  const res = await getProductList({
    materialType: selectedMaterialType.value,
    mainCategory: selectedMainCategory.value,
    subCategory: selectedSubCategory.value,
    keyword: searchParams.value.keyword,
    page,
    size: pageSize
  })

  productList.value = res.content || []
  totalPages.value = res.totalPages || 0
  totalElements.value = res.totalElements || 0
  currentPage.value = page
}

const changePage = page => {
  const p = Math.max(0, Math.min(page, totalPages.value - 1))
  loadProductList(p)
}

/* 购物车 */
const cart = ref({
  items: [],
  totalAmount: 0
})

const showCart = ref(false)

const toggleCart = () => {
  showCart.value = !showCart.value
}

const loadCart = async () => {
  cart.value = await getCart(stageId.value)
}

const addToCart = async product => {
  await addCartItem(stageId.value, {
    productId: product.productId,
    quantity: 1
  })
  loadCart()
}

const increment = async item => {
  await updateCartItem(stageId.value, item.id, {
    quantity: item.quantity + 1
  })
  loadCart()
}

const decrement = async item => {
  if (item.quantity > 1) {
    await updateCartItem(stageId.value, item.id, {
      quantity: item.quantity - 1
    })
  } else {
    await removeCartItem(stageId.value, item.id)
  }
  loadCart()
}

onLoad((options) =>{
  console.log('页面参数 option1s:', options)
  if (!options.stageId) {
    uni.showToast({ title: '缺少 stageId 参数', icon: 'none' })
    return
  }
  stageId.value = Number(options.stageId)
  loadProductList(0)
  loadCart()
})
</script>





<style scoped lang="scss">
.product-container{padding:24rpx}
.filter-section{display:flex;gap:16rpx;margin-bottom:24rpx;.picker-box{flex:1;padding:12rpx;border-radius:12rpx;border:1rpx solid #ddd;background:#f8f8f8;text-align:center;color:#333;font-size:28rpx}}
.search-section{display:flex;gap:16rpx;margin-bottom:24rpx;input{flex:1;padding:12rpx;border-radius:12rpx;border:1rpx solid #ddd}}
.product-list{display:flex;flex-direction:column;gap:24rpx;.product-card{display:flex;padding:16rpx;background:#fff;border-radius:12rpx;box-shadow:0 2rpx 8rpx rgba(0,0,0,0.08);align-items:center;.product-image{width:120rpx;height:120rpx;border-radius:8rpx;margin-right:16rpx}.product-info{flex:1;display:flex;flex-direction:column;gap:4rpx;.product-name{font-size:28rpx;font-weight:bold;color:#333}.product-brand,.product-price,.product-description{font-size:24rpx;color:#666}.low-stock{color:#fa541c;font-weight:bold}}.add-to-cart{padding:8rpx 16rpx;background-color:#409eff;color:#fff;border-radius:8rpx;font-size:24rpx}}}
.loading-text{text-align:center;color:#999;font-size:24rpx;margin-top:32rpx}
.pagination{display:flex;justify-content:center;align-items:center;gap:12rpx;margin-top:24rpx;button{padding:8rpx 12rpx;border-radius:6rpx;border:1px solid #409eff;background:#fff;color:#409eff;&:disabled{border-color:#ccc;color:#ccc}}text{font-size:24rpx}}
.cart-bar{position:fixed;bottom:0;left:0;right:0;height:100rpx;background:#fff;border-top:1px solid #ddd;display:flex;justify-content:space-around;align-items:center;font-size:28rpx;z-index:100;box-shadow:0 -2rpx 8rpx rgba(0,0,0,0.1);.checkout-btn{background:#409eff;color:#fff;padding:12rpx 20rpx;border-radius:12rpx}}
.cart-drawer{position:fixed;bottom:100rpx;left:0;right:0;max-height:400rpx;background:#fff;border-top:1px solid #ddd;box-shadow:0 -2rpx 12rpx rgba(0,0,0,0.1);padding:16rpx;overflow-y:auto;.cart-item{display:flex;justify-content:space-between;margin-bottom:12rpx}.cart-item-btns button{margin:0 8rpx}.checkout-btn{width:100%;padding:12rpx;background-color:#409eff;color:#fff;border-radius:12rpx;text-align:center}}
</style>
