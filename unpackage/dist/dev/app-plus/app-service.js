if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_LAUNCH = "onLaunch";
  const ON_LOAD = "onLoad";
  const ON_NAVIGATION_BAR_BUTTON_TAP = "onNavigationBarButtonTap";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLaunch = /* @__PURE__ */ createLifeCycleHook(
    ON_LAUNCH,
    1
    /* HookFlags.APP */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const onNavigationBarButtonTap = /* @__PURE__ */ createLifeCycleHook(
    ON_NAVIGATION_BAR_BUTTON_TAP,
    2
    /* HookFlags.PAGE */
  );
  class MPAnimation {
    constructor(options, _this) {
      this.options = options;
      this.animation = uni.createAnimation({
        ...options
      });
      this.currentStepAnimates = {};
      this.next = 0;
      this.$ = _this;
    }
    _nvuePushAnimates(type, args) {
      let aniObj = this.currentStepAnimates[this.next];
      let styles = {};
      if (!aniObj) {
        styles = {
          styles: {},
          config: {}
        };
      } else {
        styles = aniObj;
      }
      if (animateTypes1.includes(type)) {
        if (!styles.styles.transform) {
          styles.styles.transform = "";
        }
        let unit = "";
        if (type === "rotate") {
          unit = "deg";
        }
        styles.styles.transform += `${type}(${args + unit}) `;
      } else {
        styles.styles[type] = `${args}`;
      }
      this.currentStepAnimates[this.next] = styles;
    }
    _animateRun(styles = {}, config = {}) {
      let ref = this.$.$refs["ani"].ref;
      if (!ref)
        return;
      return new Promise((resolve, reject) => {
        nvueAnimation.transition(ref, {
          styles,
          ...config
        }, (res) => {
          resolve();
        });
      });
    }
    _nvueNextAnimate(animates, step = 0, fn) {
      let obj = animates[step];
      if (obj) {
        let {
          styles,
          config
        } = obj;
        this._animateRun(styles, config).then(() => {
          step += 1;
          this._nvueNextAnimate(animates, step, fn);
        });
      } else {
        this.currentStepAnimates = {};
        typeof fn === "function" && fn();
        this.isEnd = true;
      }
    }
    step(config = {}) {
      this.animation.step(config);
      return this;
    }
    run(fn) {
      this.$.animationData = this.animation.export();
      this.$.timer = setTimeout(() => {
        typeof fn === "function" && fn();
      }, this.$.durationTime);
    }
  }
  const animateTypes1 = [
    "matrix",
    "matrix3d",
    "rotate",
    "rotate3d",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "translateZ"
  ];
  const animateTypes2 = ["opacity", "backgroundColor"];
  const animateTypes3 = ["width", "height", "left", "right", "top", "bottom"];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach((type) => {
    MPAnimation.prototype[type] = function(...args) {
      this.animation[type](...args);
      return this;
    };
  });
  function createAnimation(option, _this) {
    if (!_this)
      return;
    clearTimeout(_this.timer);
    return new MPAnimation(option, _this);
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$o = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: false
      },
      modeClass: {
        type: [Array, String],
        default() {
          return "fade";
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default() {
          return {};
        }
      },
      customClass: {
        type: String,
        default: ""
      },
      onceRender: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isShow: false,
        transform: "",
        opacity: 1,
        animationData: {},
        durationTime: 300,
        config: {}
      };
    },
    watch: {
      show: {
        handler(newVal) {
          if (newVal) {
            this.open();
          } else {
            if (this.isShow) {
              this.close();
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      // 生成样式数据
      stylesObject() {
        let styles = {
          ...this.styles,
          "transition-duration": this.duration / 1e3 + "s"
        };
        let transform = "";
        for (let i in styles) {
          let line = this.toLine(i);
          transform += line + ":" + styles[i] + ";";
        }
        return transform;
      },
      // 初始化动画条件
      transformStyles() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject;
      }
    },
    created() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      };
      this.durationTime = this.duration;
    },
    methods: {
      /**
       *  ref 触发 初始化动画
       */
      init(obj = {}) {
        if (obj.duration) {
          this.durationTime = obj.duration;
        }
        this.animation = createAnimation(Object.assign(this.config, obj), this);
      },
      /**
       * 点击组件触发回调
       */
      onClick() {
        this.$emit("click", {
          detail: this.isShow
        });
      },
      /**
       * ref 触发 动画分组
       * @param {Object} obj
       */
      step(obj, config = {}) {
        if (!this.animation)
          return;
        for (let i in obj) {
          try {
            if (typeof obj[i] === "object") {
              this.animation[i](...obj[i]);
            } else {
              this.animation[i](obj[i]);
            }
          } catch (e) {
            formatAppLog("error", "at uni_modules/uni-transition/components/uni-transition/uni-transition.vue:148", `方法 ${i} 不存在`);
          }
        }
        this.animation.step(config);
        return this;
      },
      /**
       *  ref 触发 执行动画
       */
      run(fn) {
        if (!this.animation)
          return;
        this.animation.run(fn);
      },
      // 开始过度动画
      open() {
        clearTimeout(this.timer);
        this.transform = "";
        this.isShow = true;
        let { opacity, transform } = this.styleInit(false);
        if (typeof opacity !== "undefined") {
          this.opacity = opacity;
        }
        this.transform = transform;
        this.$nextTick(() => {
          this.timer = setTimeout(() => {
            this.animation = createAnimation(this.config, this);
            this.tranfromInit(false).step();
            this.animation.run();
            this.$emit("change", {
              detail: this.isShow
            });
          }, 20);
        });
      },
      // 关闭过度动画
      close(type) {
        if (!this.animation)
          return;
        this.tranfromInit(true).step().run(() => {
          this.isShow = false;
          this.animationData = null;
          this.animation = null;
          let { opacity, transform } = this.styleInit(false);
          this.opacity = opacity || 1;
          this.transform = transform;
          this.$emit("change", {
            detail: this.isShow
          });
        });
      },
      // 处理动画开始前的默认样式
      styleInit(type) {
        let styles = {
          transform: ""
        };
        let buildStyle = (type2, mode) => {
          if (mode === "fade") {
            styles.opacity = this.animationType(type2)[mode];
          } else {
            styles.transform += this.animationType(type2)[mode] + " ";
          }
        };
        if (typeof this.modeClass === "string") {
          buildStyle(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildStyle(type, mode);
          });
        }
        return styles;
      },
      // 处理内置组合动画
      tranfromInit(type) {
        let buildTranfrom = (type2, mode) => {
          let aniNum = null;
          if (mode === "fade") {
            aniNum = type2 ? 0 : 1;
          } else {
            aniNum = type2 ? "-100%" : "0";
            if (mode === "zoom-in") {
              aniNum = type2 ? 0.8 : 1;
            }
            if (mode === "zoom-out") {
              aniNum = type2 ? 1.2 : 1;
            }
            if (mode === "slide-right") {
              aniNum = type2 ? "100%" : "0";
            }
            if (mode === "slide-bottom") {
              aniNum = type2 ? "100%" : "0";
            }
          }
          this.animation[this.animationMode()[mode]](aniNum);
        };
        if (typeof this.modeClass === "string") {
          buildTranfrom(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildTranfrom(type, mode);
          });
        }
        return this.animation;
      },
      animationType(type) {
        return {
          fade: type ? 0 : 1,
          "slide-top": `translateY(${type ? "0" : "-100%"})`,
          "slide-right": `translateX(${type ? "0" : "100%"})`,
          "slide-bottom": `translateY(${type ? "0" : "100%"})`,
          "slide-left": `translateX(${type ? "0" : "-100%"})`,
          "zoom-in": `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
          "zoom-out": `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
        };
      },
      // 内置动画类型与实际动画对应字典
      animationMode() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        };
      },
      // 驼峰转中横线
      toLine(name) {
        return name.replace(/([A-Z])/g, "-$1").toLowerCase();
      }
    }
  };
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
      ref: "ani",
      animation: $data.animationData,
      class: vue.normalizeClass($props.customClass),
      style: vue.normalizeStyle($options.transformStyles),
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 14, ["animation"])), [
      [vue.vShow, $data.isShow]
    ]);
  }
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$o], ["__file", "D:/CODE/mobile-app/uni_modules/uni-transition/components/uni-transition/uni-transition.vue"]]);
  const _sfc_main$n = {
    name: "uniPopup",
    components: {},
    emits: ["change", "maskClick"],
    props: {
      // 开启动画
      animation: {
        type: Boolean,
        default: true
      },
      // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
      // message: 消息提示 ; dialog : 对话框
      type: {
        type: String,
        default: "center"
      },
      // maskClick
      isMaskClick: {
        type: Boolean,
        default: null
      },
      // TODO 2 个版本后废弃属性 ，使用 isMaskClick
      maskClick: {
        type: Boolean,
        default: null
      },
      backgroundColor: {
        type: String,
        default: "none"
      },
      safeArea: {
        type: Boolean,
        default: true
      },
      maskBackgroundColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.4)"
      },
      borderRadius: {
        type: String
      }
    },
    watch: {
      /**
       * 监听type类型
       */
      type: {
        handler: function(type) {
          if (!this.config[type])
            return;
          this[this.config[type]](true);
        },
        immediate: true
      },
      isDesktop: {
        handler: function(newVal) {
          if (!this.config[newVal])
            return;
          this[this.config[this.type]](true);
        },
        immediate: true
      },
      /**
       * 监听遮罩是否可点击
       * @param {Object} val
       */
      maskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      isMaskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      // H5 下禁止底部滚动
      showPopup(show) {
      }
    },
    data() {
      return {
        duration: 300,
        ani: [],
        showPopup: false,
        showTrans: false,
        popupWidth: 0,
        popupHeight: 0,
        config: {
          top: "top",
          bottom: "bottom",
          center: "center",
          left: "left",
          right: "right",
          message: "top",
          dialog: "center",
          share: "bottom"
        },
        maskClass: {
          position: "fixed",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        },
        transClass: {
          backgroundColor: "transparent",
          borderRadius: this.borderRadius || "0",
          position: "fixed",
          left: 0,
          right: 0
        },
        maskShow: true,
        mkclick: true,
        popupstyle: "top"
      };
    },
    computed: {
      getStyles() {
        let res = { backgroundColor: this.bg };
        if (this.borderRadius || "0") {
          res = Object.assign(res, { borderRadius: this.borderRadius });
        }
        return res;
      },
      isDesktop() {
        return this.popupWidth >= 500 && this.popupHeight >= 500;
      },
      bg() {
        if (this.backgroundColor === "" || this.backgroundColor === "none") {
          return "transparent";
        }
        return this.backgroundColor;
      }
    },
    mounted() {
      const fixSize = () => {
        const {
          windowWidth,
          windowHeight,
          windowTop,
          safeArea,
          screenHeight,
          safeAreaInsets
        } = uni.getSystemInfoSync();
        this.popupWidth = windowWidth;
        this.popupHeight = windowHeight + (windowTop || 0);
        if (safeArea && this.safeArea) {
          this.safeAreaInsets = safeAreaInsets.bottom;
        } else {
          this.safeAreaInsets = 0;
        }
      };
      fixSize();
    },
    // TODO vue3
    unmounted() {
      this.setH5Visible();
    },
    activated() {
      this.setH5Visible(!this.showPopup);
    },
    deactivated() {
      this.setH5Visible(true);
    },
    created() {
      if (this.isMaskClick === null && this.maskClick === null) {
        this.mkclick = true;
      } else {
        this.mkclick = this.isMaskClick !== null ? this.isMaskClick : this.maskClick;
      }
      if (this.animation) {
        this.duration = 300;
      } else {
        this.duration = 0;
      }
      this.messageChild = null;
      this.clearPropagation = false;
      this.maskClass.backgroundColor = this.maskBackgroundColor;
    },
    methods: {
      setH5Visible(visible = true) {
      },
      /**
       * 公用方法，不显示遮罩层
       */
      closeMask() {
        this.maskShow = false;
      },
      /**
       * 公用方法，遮罩层禁止点击
       */
      disableMask() {
        this.mkclick = false;
      },
      // TODO nvue 取消冒泡
      clear(e) {
        e.stopPropagation();
        this.clearPropagation = true;
      },
      open(direction) {
        if (this.showPopup) {
          return;
        }
        let innerType = ["top", "center", "bottom", "left", "right", "message", "dialog", "share"];
        if (!(direction && innerType.indexOf(direction) !== -1)) {
          direction = this.type;
        }
        if (!this.config[direction]) {
          formatAppLog("error", "at uni_modules/uni-popup/components/uni-popup/uni-popup.vue:310", "缺少类型：", direction);
          return;
        }
        this[this.config[direction]]();
        this.$emit("change", {
          show: true,
          type: direction
        });
      },
      close(type) {
        this.showTrans = false;
        this.$emit("change", {
          show: false,
          type: this.type
        });
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.showPopup = false;
        }, 300);
      },
      // TODO 处理冒泡事件，头条的冒泡事件有问题 ，先这样兼容
      touchstart() {
        this.clearPropagation = false;
      },
      onTap() {
        if (this.clearPropagation) {
          this.clearPropagation = false;
          return;
        }
        this.$emit("maskClick");
        if (!this.mkclick)
          return;
        this.close();
      },
      /**
       * 顶部弹出样式处理
       */
      top(type) {
        this.popupstyle = this.isDesktop ? "fixforpc-top" : "top";
        this.ani = ["slide-top"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
        this.$nextTick(() => {
          this.showPoptrans();
          if (this.messageChild && this.type === "message") {
            this.messageChild.timerClose();
          }
        });
      },
      /**
       * 底部弹出样式处理
       */
      bottom(type) {
        this.popupstyle = "bottom";
        this.ani = ["slide-bottom"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: this.safeAreaInsets + "px",
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      /**
       * 中间弹出样式处理
       */
      center(type) {
        this.popupstyle = "center";
        this.ani = ["zoom-out", "fade"];
        this.transClass = {
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      left(type) {
        this.popupstyle = "left";
        this.ani = ["slide-left"];
        this.transClass = {
          position: "fixed",
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      right(type) {
        this.popupstyle = "right";
        this.ani = ["slide-right"];
        this.transClass = {
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      showPoptrans() {
        this.$nextTick(() => {
          this.showPopup = true;
          this.showTrans = true;
        });
      }
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_0$3);
    return $data.showPopup ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["uni-popup", [$data.popupstyle, $options.isDesktop ? "fixforpc-z-index" : ""]])
      },
      [
        vue.createElementVNode(
          "view",
          {
            onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.touchstart && $options.touchstart(...args))
          },
          [
            $data.maskShow ? (vue.openBlock(), vue.createBlock(_component_uni_transition, {
              key: "1",
              name: "mask",
              "mode-class": "fade",
              styles: $data.maskClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, null, 8, ["styles", "duration", "show", "onClick"])) : vue.createCommentVNode("v-if", true),
            vue.createVNode(_component_uni_transition, {
              key: "2",
              "mode-class": $data.ani,
              name: "content",
              styles: $data.transClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["uni-popup__wrapper", [$data.popupstyle]]),
                    style: vue.normalizeStyle($options.getStyles),
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.clear && $options.clear(...args))
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ],
                  6
                  /* CLASS, STYLE */
                )
              ]),
              _: 3
              /* FORWARDED */
            }, 8, ["mode-class", "styles", "duration", "show", "onClick"])
          ],
          32
          /* NEED_HYDRATION */
        )
      ],
      2
      /* CLASS */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$n], ["__scopeId", "data-v-4dd3c44b"], ["__file", "D:/CODE/mobile-app/uni_modules/uni-popup/components/uni-popup/uni-popup.vue"]]);
  const BASE_URL = "http://192.168.31.47:8181";
  var isVue2 = false;
  function set(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia) => activePinia = pinia;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject(o) {
    return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    try {
      xhr.send();
    } catch (e) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    if (typeof blob === "string") {
      a.href = blob;
      if (a.origin !== location.origin) {
        if (corsEnabled(a.href)) {
          download(blob, name, opts);
        } else {
          a.target = "_blank";
          click(a);
        }
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 4e4);
      setTimeout(function() {
        click(a);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.target = "_blank";
        setTimeout(function() {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url = reader.result;
        if (typeof url !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url;
        } else {
          location.assign(url);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url);
      else
        location.href = url;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o) {
    return "_a" in o && "install" in o;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error) {
    if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  function loadStoresState(pinia, state) {
    for (const key in state) {
      const storeState = pinia.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store) {
    return isPinia(store) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store.$id,
      label: store.$id
    };
  }
  function formatStoreForInspectorState(store) {
    if (isPinia(store)) {
      const storeNames = Array.from(store._s.keys());
      const storeMap = store._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store2 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store2._getters.reduce((getters, key) => {
              getters[key] = store2[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store.$state).map((key) => ({
        editable: true,
        key,
        value: store.$state[key]
      }))
    };
    if (store._getters && store._getters.length) {
      state.getters = store._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store[getterName]
      }));
    }
    if (store._customProperties.size) {
      state.customProperties = Array.from(store._customProperties).map((key) => ({
        editable: true,
        key,
        value: store[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api) => {
      if (typeof api.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store = pinia._s.get(nodeId);
              if (!store) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store) => {
            payload.instanceData.state.push({
              type: getStoreType(store.$id),
              key: "state",
              editable: true,
              value: store._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store.$state).reduce((state, key) => {
                  state[key] = store.$state[key];
                  return state;
                }, {})
              )
            });
            if (store._getters && store._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store.$id),
                key: "getters",
                editable: false,
                value: store._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store[key];
                  } catch (error) {
                    getters[key] = error;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store) => "$id" in store ? store.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store = pinia._s.get(storeId);
          if (!store) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store) {
    if (!componentStateTypes.includes(getStoreType(store.$id))) {
      componentStateTypes.push(getStoreType(store.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api) => {
      const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
      store.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                error
              },
              groupId
            }
          });
        });
      }, true);
      store._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store[name]), (newValue, oldValue) => {
          api.notifyComponentUpdate();
          api.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store.$subscribe(({ events, type }, state) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store._hotUpdate;
      store._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store;
      store.$dispose = () => {
        $dispose();
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.getSettings().logStoreChanges && toastMessage(`Disposed "${store.$id}" store 🗑`);
      };
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
      api.getSettings().logStoreChanges && toastMessage(`"${store.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store, options }) {
    if (store.$id.startsWith("__hot:")) {
      return;
    }
    store._isOptionsAPI = !!options.state;
    patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
    const originalHotUpdate = store._hotUpdate;
    vue.toRaw(store)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
    };
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        setActivePinia(pinia);
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  const noop = () => {
  };
  function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription);
    }
    return removeSubscription;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function shouldHydrate(obj) {
    return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o) {
    return !!(vue.isRef(o) && o.effect);
  }
  function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia);
          const store2 = pinia._s.get(id);
          return getters[name].call(store2, store2);
        }));
        return computedGetters;
      }, {}));
    }
    store = createSetupStore(id, setup, options, pinia, hot, true);
    return store;
  }
  function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia._s.delete($id);
    }
    function wrapAction(name, action) {
      return function() {
        setActivePinia(pinia);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name,
          store,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store, args);
        } catch (error) {
          triggerSubscriptions(onErrorCallbackList, error);
          throw error;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
    }
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia,
      // _s: scope,
      $id,
      $onAction: addSubscription.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription;
      },
      $dispose
    };
    const store = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia._s.set($id, store);
    const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(setup)));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : wrapAction(key, prop);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store, setupStore);
      assign(vue.toRaw(store), setupStore);
    }
    Object.defineProperty(store, "$state", {
      get: () => hot ? hotState.value : pinia.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store._hotUpdate = vue.markRaw((newStore) => {
        store._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set(store, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const action = newStore[actionName];
          set(store, actionName, wrapAction(actionName, action));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia);
              return getter.call(store, store);
            })
          ) : getter;
          set(store, getterName, getterValue);
        }
        Object.keys(store._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store, key);
          }
        });
        Object.keys(store._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store, key);
          }
        });
        store._hmrPayload = newStore._hmrPayload;
        store._getters = newStore._getters;
        store._hotUpdating = false;
      });
    }
    if (USE_DEVTOOLS) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p) => {
        Object.defineProperty(store, p, assign({ value: store[p] }, nonEnumerable));
      });
    }
    pinia._p.forEach((extender) => {
      if (USE_DEVTOOLS) {
        const extensions = scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
        assign(store, extensions);
      } else {
        assign(store, scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        })));
      }
    });
    if (store.$state && typeof store.$state === "object" && typeof store.$state.constructor === "function" && !store.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store;
  }
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
    }
    function useStore(pinia, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia)
        setActivePinia(pinia);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia = activePinia;
      if (!pinia._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia);
        } else {
          createOptionsStore(id, options, pinia);
        }
        {
          useStore._pinia = pinia;
        }
      }
      const store = pinia._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
        hot._hotUpdate(newStore);
        delete pinia.state.value[hotId];
        pinia._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store;
        }
      }
      return store;
    }
    useStore.$id = id;
    return useStore;
  }
  function validateToken(token) {
    return request({
      url: "/auth/validate",
      method: "POST",
      header: {
        "Authorization": `Bearer ${token}`
      },
      skipGlobalToken: true
      // 绕过全局 token 设置
    });
  }
  const useUserStore = defineStore("user", {
    state: () => ({
      token: "",
      user: null,
      hasTokenChanged: false
      // 添加标记
    }),
    actions: {
      loginSuccess(data) {
        this.token = data.token;
        this.user = data.user;
        uni.setStorageSync("token", data.token);
        uni.setStorageSync("user", data.user);
      },
      logout() {
        this.token = "";
        this.user = null;
        uni.removeStorageSync("token");
        uni.removeStorageSync("user");
        uni.reLaunch({ url: "/src/pages/login/login" });
      },
      async init() {
        const token = uni.getStorageSync("token");
        uni.getStorageSync("user");
        if (token) {
          formatAppLog("log", "at src/store/userStore.js:33", "init token", token);
          try {
            const res = await validateToken(token);
            formatAppLog("log", "at src/store/userStore.js:36", "success");
            this.token = token;
            this.user = res.user;
          } catch (error) {
            formatAppLog("error", "at src/store/userStore.js:41", "Token validation failed:", error);
            this.logout();
          }
        }
      },
      updateUserInfo(userData) {
        if (this.user) {
          Object.assign(this.user, userData);
        }
      }
    }
  });
  function request(options) {
    return new Promise((resolve, reject) => {
      const userStore = useUserStore();
      const skipGlobalToken = options.skipGlobalToken || false;
      uni.request({
        url: BASE_URL + options.url,
        method: options.method || "GET",
        data: options.data || {},
        header: {
          ...skipGlobalToken ? {} : userStore.token ? { Authorization: `Bearer ${userStore.token}` } : {},
          ...options.header || {}
        },
        timeout: 1e4,
        success: (res) => {
          const { code, data, message } = res.data || {};
          if (code !== 200) {
            uni.showToast({
              title: message || "请求失败",
              icon: "none"
            });
            reject(message);
          } else {
            resolve(data);
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "网络错误",
            icon: "none"
          });
          reject(err);
        }
      });
    });
  }
  function uploadRequest({ url, filePath, formData = {} }) {
    return new Promise((resolve, reject) => {
      const userStore = useUserStore();
      uni.uploadFile({
        url: BASE_URL + url,
        filePath,
        name: "file",
        formData,
        header: userStore.token ? { Authorization: `Bearer ${userStore.token}` } : {},
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data.data);
          } else {
            reject(data.message);
          }
        },
        fail: reject
      });
    });
  }
  const createPost = (data) => {
    return request({
      url: "/post/create",
      method: "post",
      data
    });
  };
  const getPostList = () => {
    return request({
      url: "/post/list",
      method: "get"
    });
  };
  const getPostSimple = (postId) => {
    return request({
      url: `/post/${postId}/simple`,
      method: "get"
    });
  };
  const getPostDetail = (postId) => {
    return request({
      url: `/post/${postId}`,
      method: "get"
    });
  };
  const updatePost = (postId, data) => {
    return request({
      url: `/post/${postId}`,
      method: "put",
      data
    });
  };
  const deletePost = (postId) => {
    return request({
      url: `/post/${postId}`,
      method: "delete"
    });
  };
  function uploadPostImage(postId, filePath) {
    return uploadRequest({
      url: `/post/image/${postId}`,
      filePath
    });
  }
  function deletePostImage(imageId) {
    return request({
      url: `/post/image/${imageId}`,
      method: "delete"
    });
  }
  function likePost(postId) {
    return request({
      url: `/post/${postId}/like`,
      method: "post"
    });
  }
  function createComment(postId, data) {
    return request({
      url: `/post/${postId}/comment`,
      method: "post",
      data
    });
  }
  function getCommentList(postId) {
    return request({
      url: `/post/${postId}/comment`,
      method: "get"
    });
  }
  const usePostFormStore = defineStore("postForm", () => {
    const form = vue.reactive({
      title: "",
      content: "",
      images: []
      // 存储图片信息，每个 { file, url, key }
    });
    const errors = vue.reactive({
      title: "",
      content: ""
    });
    const addImage = (file, url) => {
      const key = Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      form.images.push({
        key,
        url,
        file
        // 保存原始文件对象，用于上传
      });
    };
    const removeImage = (key) => {
      const index = form.images.findIndex((img) => img.key === key);
      if (index !== -1) {
        form.images.splice(index, 1);
      }
    };
    const resetForm = () => {
      form.title = "";
      form.content = "";
      form.images = [];
      errors.title = "";
      errors.content = "";
    };
    return {
      form,
      errors,
      addImage,
      removeImage,
      resetForm
    };
  });
  const _sfc_main$m = {
    __name: "PostCreateForm",
    props: {
      initialData: {
        type: Object,
        default: () => ({
          title: "",
          content: "",
          images: []
        })
      }
    },
    emits: ["submit", "cancel"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const store = usePostFormStore();
      if (props.initialData) {
        store.form.title = props.initialData.title || "";
        store.form.content = props.initialData.content || "";
      }
      const chooseImages = () => {
        uni.chooseImage({
          count: 9 - store.form.images.length,
          // 最多9张图片
          sourceType: ["album", "camera"],
          success: (res) => {
            if (!res.tempFilePaths || res.tempFilePaths.length === 0)
              return;
            res.tempFilePaths.forEach((filePath) => {
              store.addImage({ path: filePath }, filePath);
            });
          },
          fail: (err) => {
            formatAppLog("error", "at src/components/PostCreateForm.vue:100", "选择图片失败", err);
          }
        });
      };
      const removeImage = (key) => {
        store.removeImage(key);
      };
      async function handleSubmit(e) {
        e.preventDefault();
        store.errors.title = "";
        store.errors.content = "";
        if (!store.form.title.trim()) {
          store.errors.title = "请输入文章标题";
          uni.showToast({
            title: "请输入文章标题",
            icon: "none"
          });
          return;
        }
        if (!store.form.content.trim()) {
          store.errors.content = "请输入文章内容";
          uni.showToast({
            title: "请输入文章内容",
            icon: "none"
          });
          return;
        }
        try {
          const createdPost = await createPost({
            title: store.form.title,
            content: store.form.content
          });
          if (store.form.images.length > 0) {
            for (const img of store.form.images) {
              await uploadPostImage(createdPost.postId, img.file.path);
            }
            const updatedPost = await getPostSimple(createdPost.postId);
            emit("success", updatedPost);
          } else {
            emit("success", createdPost);
          }
          uni.showToast({
            title: "文章发布成功",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at src/components/PostCreateForm.vue:161", "发布文章失败:", error);
          uni.showToast({
            title: error.message || "发布失败，请重试",
            icon: "none"
          });
        }
      }
      function handleCancel() {
        store.resetForm();
        emit("cancel");
      }
      const __returned__ = { props, emit, store, chooseImages, removeImage, handleSubmit, handleCancel, get usePostFormStore() {
        return usePostFormStore;
      }, get createPost() {
        return createPost;
      }, get getPostSimple() {
        return getPostSimple;
      }, get uploadPostImage() {
        return uploadPostImage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "form-container" }, [
      vue.createElementVNode(
        "form",
        {
          onSubmit: $setup.handleSubmit,
          class: "article-form"
        },
        [
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                placeholder: "请输入文章标题",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.store.form.title = $event),
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.store.form.title]
            ]),
            $setup.store.errors.title ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.store.errors.title),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                placeholder: "请输入文章内容",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.store.form.content = $event),
                class: "form-textarea",
                rows: "4"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.store.form.content]
            ]),
            $setup.store.errors.content ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.store.errors.content),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("view", { class: "upload-section" }, [
              vue.createElementVNode("button", {
                onClick: $setup.chooseImages,
                class: "upload-btn"
              }, "选择图片"),
              vue.createElementVNode("view", { class: "preview" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.store.form.images, (img) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: img.key,
                      class: "preview-item"
                    }, [
                      vue.createElementVNode("image", {
                        src: img.url,
                        mode: "aspectFill",
                        class: "preview-img"
                      }, null, 8, ["src"]),
                      vue.createElementVNode("button", {
                        class: "remove-btn",
                        onClick: ($event) => $setup.removeImage(img.key),
                        type: "button"
                      }, " × ", 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-actions" }, [
            vue.createElementVNode("button", {
              "form-type": "submit",
              class: "submit-btn"
            }, "提交"),
            vue.createElementVNode("button", {
              type: "button",
              onClick: $setup.handleCancel,
              class: "cancel-btn"
            }, "取消")
          ])
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PostCreateForm = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$m], ["__scopeId", "data-v-0f3d7bb4"], ["__file", "D:/CODE/mobile-app/src/components/PostCreateForm.vue"]]);
  const _imports_0$1 = "/static/post/like.png";
  const _imports_1 = "/static/post/comment.png";
  const _sfc_main$l = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const posts = vue.ref([]);
      const loading = vue.ref(false);
      const hasMore = vue.ref(true);
      const page = vue.ref(1);
      const pageSize = vue.ref(10);
      const articlePopup = vue.ref(null);
      const newArticle = vue.ref({
        title: "",
        content: ""
      });
      const onSubmitSuccess = async (newPost) => {
        posts.value.unshift({
          ...newPost,
          isLiked: false,
          previewImages: newPost.previewImages || []
          // 确保有图片数组
        });
        closeArticleDialog();
        await fetchPosts();
      };
      onShow(async () => {
        formatAppLog("log", "at src/pages/post/index.vue:130", "页面显示，重新加载数据");
        await fetchPosts(true);
      });
      const fetchPosts = async (forceRefresh = false) => {
        if (loading.value || !forceRefresh && !hasMore.value)
          return;
        loading.value = true;
        try {
          const postsData = await getPostList();
          const startIndex = (page.value - 1) * pageSize.value;
          const endIndex = startIndex + pageSize.value;
          const paginatedData = postsData.slice(startIndex, endIndex);
          const newPosts = paginatedData.map((post) => ({
            ...post,
            isLiked: false
          }));
          if (newPosts.length === 0) {
            hasMore.value = false;
          } else {
            if (page.value === 1 || forceRefresh) {
              posts.value = newPosts;
            } else {
              posts.value = [...posts.value, ...newPosts];
            }
            if (paginatedData.length < pageSize.value) {
              hasMore.value = false;
            } else {
              hasMore.value = true;
            }
          }
        } catch (error) {
          formatAppLog("error", "at src/pages/post/index.vue:172", "获取文章列表失败:", error);
          uni.showToast({
            title: "获取数据失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      onNavigationBarButtonTap((event) => {
        formatAppLog("log", "at src/pages/post/index.vue:185", "导航栏按钮被点击", event);
        uni.showActionSheet({
          itemList: ["新增文章", "其他功能1", "其他功能2"],
          success(res) {
            if (res.tapIndex === 0) {
              openArticleDialog();
            }
          }
        });
      });
      vue.onMounted(() => {
        fetchPosts();
      });
      const onReachBottom = () => {
        if (!hasMore.value) {
          return;
        }
        fetchPosts();
      };
      function openArticleDialog() {
        var _a;
        newArticle.value = { title: "", content: "" };
        (_a = articlePopup.value) == null ? void 0 : _a.open();
      }
      function closeArticleDialog() {
        var _a;
        (_a = articlePopup.value) == null ? void 0 : _a.close();
        newArticle.value = { title: "", content: "" };
      }
      const goToUser = (userId) => {
        uni.navigateTo({
          url: `/pages/user/profile?userId=${userId}`
        });
      };
      const goToPost = (postId) => {
        uni.navigateTo({
          url: `/src/pages/post/detail?postId=${postId}`
          // 改为带 src 的路径
        });
      };
      const sharePost = (post) => {
        uni.share({
          provider: "weixin",
          scene: "WXSenceTimeline",
          type: 0,
          href: `/pages/post/detail?postId=${post.postId}`,
          title: post.title,
          summary: post.summary,
          success: function(res) {
            formatAppLog("log", "at src/pages/post/index.vue:248", "分享成功：" + JSON.stringify(res));
          },
          fail: function(err) {
            formatAppLog("log", "at src/pages/post/index.vue:251", "分享失败：" + JSON.stringify(err));
          }
        });
      };
      const refreshing = vue.ref(false);
      const onRefresh = async () => {
        if (refreshing.value)
          return;
        refreshing.value = true;
        page.value = 1;
        hasMore.value = true;
        try {
          await fetchPosts(true);
        } finally {
          refreshing.value = false;
        }
      };
      const __returned__ = { posts, loading, hasMore, page, pageSize, articlePopup, newArticle, onSubmitSuccess, fetchPosts, onReachBottom, openArticleDialog, closeArticleDialog, goToUser, goToPost, sharePost, refreshing, onRefresh, ref: vue.ref, onMounted: vue.onMounted, get BASE_URL() {
        return BASE_URL;
      }, get getPostList() {
        return getPostList;
      }, get likePost() {
        return likePost;
      }, get createPost() {
        return createPost;
      }, get uploadPostImage() {
        return uploadPostImage;
      }, get getPostDetail() {
        return getPostDetail;
      }, get onLoad() {
        return onLoad;
      }, get onNavigationBarButtonTap() {
        return onNavigationBarButtonTap;
      }, get onShow() {
        return onShow;
      }, PostCreateForm };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "content-list",
        "refresher-enabled": "",
        "refresher-triggered": $setup.refreshing,
        onRefresherrefresh: $setup.onRefresh
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.posts, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: item.postId,
              class: "post-card",
              onClick: ($event) => $setup.goToPost(item.postId)
            }, [
              vue.createElementVNode("view", { class: "user-info" }, [
                vue.createElementVNode("image", {
                  src: $setup.BASE_URL + item.authorAvatar,
                  class: "avatar",
                  onClick: vue.withModifiers(($event) => $setup.goToUser(item.authorId), ["stop"]),
                  lazy: "true"
                }, null, 8, ["src", "onClick"]),
                vue.createElementVNode(
                  "text",
                  { class: "username" },
                  vue.toDisplayString(item.authorName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "spacer" }),
                vue.createElementVNode("text", { class: "more-icon" }, "···")
              ]),
              vue.createElementVNode(
                "text",
                { class: "post-title" },
                vue.toDisplayString(item.title),
                1
                /* TEXT */
              ),
              vue.createElementVNode("br"),
              vue.createElementVNode(
                "text",
                { class: "post-content" },
                vue.toDisplayString(item.summary),
                1
                /* TEXT */
              ),
              item.previewImages && item.previewImages.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "image-grid"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(item.previewImages.slice(0, 9), (img, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: img.id,
                      class: "image-item"
                    }, [
                      vue.createElementVNode("image", {
                        src: $setup.BASE_URL + img.imageUrl,
                        class: vue.normalizeClass(["preview-image", { "single": item.previewImages.length === 1 }]),
                        lazy: "true"
                      }, null, 10, ["src"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "stats-bar" }, [
                vue.createElementVNode("view", { class: "stat-item" }, [
                  vue.createElementVNode("image", {
                    class: "stat-icon",
                    src: _imports_0$1,
                    mode: "aspectFit"
                  }),
                  vue.createElementVNode(
                    "text",
                    { class: "stat-count" },
                    vue.toDisplayString(item.likeCount),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "stat-item" }, [
                  vue.createElementVNode("image", {
                    class: "stat-icon",
                    src: _imports_1,
                    mode: "aspectFit"
                  }),
                  vue.createElementVNode(
                    "text",
                    { class: "stat-count" },
                    vue.toDisplayString(item.commentCount),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-tips"
        }, "加载中...")) : vue.createCommentVNode("v-if", true),
        !$setup.hasMore ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "no-more-tips"
        }, "加载中...")) : vue.createCommentVNode("v-if", true)
      ], 40, ["refresher-triggered"]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "articlePopup",
          type: "center"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "modal" }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode("text", null, "新增文章"),
                vue.createElementVNode("text", {
                  class: "close",
                  onClick: $setup.closeArticleDialog
                }, "×")
              ]),
              vue.createElementVNode("view", { class: "modal-body" }, [
                vue.createVNode($setup["PostCreateForm"], {
                  onSuccess: $setup.onSubmitSuccess,
                  onCancel: $setup.closeArticleDialog
                })
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const SrcPagesPostIndex = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$l], ["__scopeId", "data-v-28671761"], ["__file", "D:/CODE/mobile-app/src/pages/post/index.vue"]]);
  const fontData = [
    {
      "font_class": "arrow-down",
      "unicode": ""
    },
    {
      "font_class": "arrow-left",
      "unicode": ""
    },
    {
      "font_class": "arrow-right",
      "unicode": ""
    },
    {
      "font_class": "arrow-up",
      "unicode": ""
    },
    {
      "font_class": "auth",
      "unicode": ""
    },
    {
      "font_class": "auth-filled",
      "unicode": ""
    },
    {
      "font_class": "back",
      "unicode": ""
    },
    {
      "font_class": "bars",
      "unicode": ""
    },
    {
      "font_class": "calendar",
      "unicode": ""
    },
    {
      "font_class": "calendar-filled",
      "unicode": ""
    },
    {
      "font_class": "camera",
      "unicode": ""
    },
    {
      "font_class": "camera-filled",
      "unicode": ""
    },
    {
      "font_class": "cart",
      "unicode": ""
    },
    {
      "font_class": "cart-filled",
      "unicode": ""
    },
    {
      "font_class": "chat",
      "unicode": ""
    },
    {
      "font_class": "chat-filled",
      "unicode": ""
    },
    {
      "font_class": "chatboxes",
      "unicode": ""
    },
    {
      "font_class": "chatboxes-filled",
      "unicode": ""
    },
    {
      "font_class": "chatbubble",
      "unicode": ""
    },
    {
      "font_class": "chatbubble-filled",
      "unicode": ""
    },
    {
      "font_class": "checkbox",
      "unicode": ""
    },
    {
      "font_class": "checkbox-filled",
      "unicode": ""
    },
    {
      "font_class": "checkmarkempty",
      "unicode": ""
    },
    {
      "font_class": "circle",
      "unicode": ""
    },
    {
      "font_class": "circle-filled",
      "unicode": ""
    },
    {
      "font_class": "clear",
      "unicode": ""
    },
    {
      "font_class": "close",
      "unicode": ""
    },
    {
      "font_class": "closeempty",
      "unicode": ""
    },
    {
      "font_class": "cloud-download",
      "unicode": ""
    },
    {
      "font_class": "cloud-download-filled",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload-filled",
      "unicode": ""
    },
    {
      "font_class": "color",
      "unicode": ""
    },
    {
      "font_class": "color-filled",
      "unicode": ""
    },
    {
      "font_class": "compose",
      "unicode": ""
    },
    {
      "font_class": "contact",
      "unicode": ""
    },
    {
      "font_class": "contact-filled",
      "unicode": ""
    },
    {
      "font_class": "down",
      "unicode": ""
    },
    {
      "font_class": "bottom",
      "unicode": ""
    },
    {
      "font_class": "download",
      "unicode": ""
    },
    {
      "font_class": "download-filled",
      "unicode": ""
    },
    {
      "font_class": "email",
      "unicode": ""
    },
    {
      "font_class": "email-filled",
      "unicode": ""
    },
    {
      "font_class": "eye",
      "unicode": ""
    },
    {
      "font_class": "eye-filled",
      "unicode": ""
    },
    {
      "font_class": "eye-slash",
      "unicode": ""
    },
    {
      "font_class": "eye-slash-filled",
      "unicode": ""
    },
    {
      "font_class": "fire",
      "unicode": ""
    },
    {
      "font_class": "fire-filled",
      "unicode": ""
    },
    {
      "font_class": "flag",
      "unicode": ""
    },
    {
      "font_class": "flag-filled",
      "unicode": ""
    },
    {
      "font_class": "folder-add",
      "unicode": ""
    },
    {
      "font_class": "folder-add-filled",
      "unicode": ""
    },
    {
      "font_class": "font",
      "unicode": ""
    },
    {
      "font_class": "forward",
      "unicode": ""
    },
    {
      "font_class": "gear",
      "unicode": ""
    },
    {
      "font_class": "gear-filled",
      "unicode": ""
    },
    {
      "font_class": "gift",
      "unicode": ""
    },
    {
      "font_class": "gift-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-down",
      "unicode": ""
    },
    {
      "font_class": "hand-down-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-up",
      "unicode": ""
    },
    {
      "font_class": "hand-up-filled",
      "unicode": ""
    },
    {
      "font_class": "headphones",
      "unicode": ""
    },
    {
      "font_class": "heart",
      "unicode": ""
    },
    {
      "font_class": "heart-filled",
      "unicode": ""
    },
    {
      "font_class": "help",
      "unicode": ""
    },
    {
      "font_class": "help-filled",
      "unicode": ""
    },
    {
      "font_class": "home",
      "unicode": ""
    },
    {
      "font_class": "home-filled",
      "unicode": ""
    },
    {
      "font_class": "image",
      "unicode": ""
    },
    {
      "font_class": "image-filled",
      "unicode": ""
    },
    {
      "font_class": "images",
      "unicode": ""
    },
    {
      "font_class": "images-filled",
      "unicode": ""
    },
    {
      "font_class": "info",
      "unicode": ""
    },
    {
      "font_class": "info-filled",
      "unicode": ""
    },
    {
      "font_class": "left",
      "unicode": ""
    },
    {
      "font_class": "link",
      "unicode": ""
    },
    {
      "font_class": "list",
      "unicode": ""
    },
    {
      "font_class": "location",
      "unicode": ""
    },
    {
      "font_class": "location-filled",
      "unicode": ""
    },
    {
      "font_class": "locked",
      "unicode": ""
    },
    {
      "font_class": "locked-filled",
      "unicode": ""
    },
    {
      "font_class": "loop",
      "unicode": ""
    },
    {
      "font_class": "mail-open",
      "unicode": ""
    },
    {
      "font_class": "mail-open-filled",
      "unicode": ""
    },
    {
      "font_class": "map",
      "unicode": ""
    },
    {
      "font_class": "map-filled",
      "unicode": ""
    },
    {
      "font_class": "map-pin",
      "unicode": ""
    },
    {
      "font_class": "map-pin-ellipse",
      "unicode": ""
    },
    {
      "font_class": "medal",
      "unicode": ""
    },
    {
      "font_class": "medal-filled",
      "unicode": ""
    },
    {
      "font_class": "mic",
      "unicode": ""
    },
    {
      "font_class": "mic-filled",
      "unicode": ""
    },
    {
      "font_class": "micoff",
      "unicode": ""
    },
    {
      "font_class": "micoff-filled",
      "unicode": ""
    },
    {
      "font_class": "minus",
      "unicode": ""
    },
    {
      "font_class": "minus-filled",
      "unicode": ""
    },
    {
      "font_class": "more",
      "unicode": ""
    },
    {
      "font_class": "more-filled",
      "unicode": ""
    },
    {
      "font_class": "navigate",
      "unicode": ""
    },
    {
      "font_class": "navigate-filled",
      "unicode": ""
    },
    {
      "font_class": "notification",
      "unicode": ""
    },
    {
      "font_class": "notification-filled",
      "unicode": ""
    },
    {
      "font_class": "paperclip",
      "unicode": ""
    },
    {
      "font_class": "paperplane",
      "unicode": ""
    },
    {
      "font_class": "paperplane-filled",
      "unicode": ""
    },
    {
      "font_class": "person",
      "unicode": ""
    },
    {
      "font_class": "person-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled-copy",
      "unicode": ""
    },
    {
      "font_class": "phone",
      "unicode": ""
    },
    {
      "font_class": "phone-filled",
      "unicode": ""
    },
    {
      "font_class": "plus",
      "unicode": ""
    },
    {
      "font_class": "plus-filled",
      "unicode": ""
    },
    {
      "font_class": "plusempty",
      "unicode": ""
    },
    {
      "font_class": "pulldown",
      "unicode": ""
    },
    {
      "font_class": "pyq",
      "unicode": ""
    },
    {
      "font_class": "qq",
      "unicode": ""
    },
    {
      "font_class": "redo",
      "unicode": ""
    },
    {
      "font_class": "redo-filled",
      "unicode": ""
    },
    {
      "font_class": "refresh",
      "unicode": ""
    },
    {
      "font_class": "refresh-filled",
      "unicode": ""
    },
    {
      "font_class": "refreshempty",
      "unicode": ""
    },
    {
      "font_class": "reload",
      "unicode": ""
    },
    {
      "font_class": "right",
      "unicode": ""
    },
    {
      "font_class": "scan",
      "unicode": ""
    },
    {
      "font_class": "search",
      "unicode": ""
    },
    {
      "font_class": "settings",
      "unicode": ""
    },
    {
      "font_class": "settings-filled",
      "unicode": ""
    },
    {
      "font_class": "shop",
      "unicode": ""
    },
    {
      "font_class": "shop-filled",
      "unicode": ""
    },
    {
      "font_class": "smallcircle",
      "unicode": ""
    },
    {
      "font_class": "smallcircle-filled",
      "unicode": ""
    },
    {
      "font_class": "sound",
      "unicode": ""
    },
    {
      "font_class": "sound-filled",
      "unicode": ""
    },
    {
      "font_class": "spinner-cycle",
      "unicode": ""
    },
    {
      "font_class": "staff",
      "unicode": ""
    },
    {
      "font_class": "staff-filled",
      "unicode": ""
    },
    {
      "font_class": "star",
      "unicode": ""
    },
    {
      "font_class": "star-filled",
      "unicode": ""
    },
    {
      "font_class": "starhalf",
      "unicode": ""
    },
    {
      "font_class": "trash",
      "unicode": ""
    },
    {
      "font_class": "trash-filled",
      "unicode": ""
    },
    {
      "font_class": "tune",
      "unicode": ""
    },
    {
      "font_class": "tune-filled",
      "unicode": ""
    },
    {
      "font_class": "undo",
      "unicode": ""
    },
    {
      "font_class": "undo-filled",
      "unicode": ""
    },
    {
      "font_class": "up",
      "unicode": ""
    },
    {
      "font_class": "top",
      "unicode": ""
    },
    {
      "font_class": "upload",
      "unicode": ""
    },
    {
      "font_class": "upload-filled",
      "unicode": ""
    },
    {
      "font_class": "videocam",
      "unicode": ""
    },
    {
      "font_class": "videocam-filled",
      "unicode": ""
    },
    {
      "font_class": "vip",
      "unicode": ""
    },
    {
      "font_class": "vip-filled",
      "unicode": ""
    },
    {
      "font_class": "wallet",
      "unicode": ""
    },
    {
      "font_class": "wallet-filled",
      "unicode": ""
    },
    {
      "font_class": "weibo",
      "unicode": ""
    },
    {
      "font_class": "weixin",
      "unicode": ""
    }
  ];
  const getVal = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$k = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      },
      fontFamily: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: fontData
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v) => v.font_class === this.type);
        if (code) {
          return code.unicode;
        }
        return "";
      },
      iconSize() {
        return getVal(this.size);
      },
      styleObj() {
        if (this.fontFamily !== "") {
          return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`;
        }
        return `color: ${this.color}; font-size: ${this.iconSize};`;
      }
    },
    methods: {
      _onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle($options.styleObj),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$k], ["__scopeId", "data-v-d31e1c47"], ["__file", "D:/CODE/mobile-app/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  function obj2strClass(obj) {
    let classess = "";
    for (let key in obj) {
      const val = obj[key];
      if (val) {
        classess += `${key} `;
      }
    }
    return classess;
  }
  function obj2strStyle(obj) {
    let style = "";
    for (let key in obj) {
      const val = obj[key];
      style += `${key}:${val};`;
    }
    return style;
  }
  const _sfc_main$j = {
    name: "uni-easyinput",
    emits: [
      "click",
      "iconClick",
      "update:modelValue",
      "input",
      "focus",
      "blur",
      "confirm",
      "clear",
      "eyes",
      "change",
      "keyboardheightchange"
    ],
    model: {
      prop: "modelValue",
      event: "update:modelValue"
    },
    options: {
      virtualHost: true
    },
    inject: {
      form: {
        from: "uniForm",
        default: null
      },
      formItem: {
        from: "uniFormItem",
        default: null
      }
    },
    props: {
      name: String,
      value: [Number, String],
      modelValue: [Number, String],
      type: {
        type: String,
        default: "text"
      },
      clearable: {
        type: Boolean,
        default: true
      },
      autoHeight: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: " "
      },
      placeholderStyle: String,
      focus: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      maxlength: {
        type: [Number, String],
        default: 140
      },
      confirmType: {
        type: String,
        default: "done"
      },
      clearSize: {
        type: [Number, String],
        default: 24
      },
      inputBorder: {
        type: Boolean,
        default: true
      },
      prefixIcon: {
        type: String,
        default: ""
      },
      suffixIcon: {
        type: String,
        default: ""
      },
      trim: {
        type: [Boolean, String],
        default: false
      },
      cursorSpacing: {
        type: Number,
        default: 0
      },
      passwordIcon: {
        type: Boolean,
        default: true
      },
      adjustPosition: {
        type: Boolean,
        default: true
      },
      primaryColor: {
        type: String,
        default: "#2979ff"
      },
      styles: {
        type: Object,
        default() {
          return {
            color: "#333",
            backgroundColor: "#fff",
            disableColor: "#F7F6F6",
            borderColor: "#e5e5e5"
          };
        }
      },
      errorMessage: {
        type: [String, Boolean],
        default: ""
      }
    },
    data() {
      return {
        focused: false,
        val: "",
        showMsg: "",
        border: false,
        isFirstBorder: false,
        showClearIcon: false,
        showPassword: false,
        focusShow: false,
        localMsg: "",
        isEnter: false
        // 用于判断当前是否是使用回车操作
      };
    },
    computed: {
      // 输入框内是否有值
      isVal() {
        const val = this.val;
        if (val || val === 0) {
          return true;
        }
        return false;
      },
      msg() {
        return this.localMsg || this.errorMessage;
      },
      // 因为uniapp的input组件的maxlength组件必须要数值，这里转为数值，用户可以传入字符串数值
      inputMaxlength() {
        return Number(this.maxlength);
      },
      // 处理外层样式的style
      boxStyle() {
        return `color:${this.inputBorder && this.msg ? "#e43d33" : this.styles.color};`;
      },
      // input 内容的类和样式处理
      inputContentClass() {
        return obj2strClass({
          "is-input-border": this.inputBorder,
          "is-input-error-border": this.inputBorder && this.msg,
          "is-textarea": this.type === "textarea",
          "is-disabled": this.disabled,
          "is-focused": this.focusShow
        });
      },
      inputContentStyle() {
        const focusColor = this.focusShow ? this.primaryColor : this.styles.borderColor;
        const borderColor = this.inputBorder && this.msg ? "#dd524d" : focusColor;
        return obj2strStyle({
          "border-color": borderColor || "#e5e5e5",
          "background-color": this.disabled ? this.styles.disableColor : this.styles.backgroundColor
        });
      },
      // input右侧样式
      inputStyle() {
        const paddingRight = this.type === "password" || this.clearable || this.prefixIcon ? "" : "10px";
        return obj2strStyle({
          "padding-right": paddingRight,
          "padding-left": this.prefixIcon ? "" : "10px"
        });
      }
    },
    watch: {
      value(newVal) {
        if (newVal === null) {
          this.val = "";
          return;
        }
        this.val = newVal;
      },
      modelValue(newVal) {
        if (newVal === null) {
          this.val = "";
          return;
        }
        this.val = newVal;
      },
      focus(newVal) {
        this.$nextTick(() => {
          this.focused = this.focus;
          this.focusShow = this.focus;
        });
      }
    },
    created() {
      this.init();
      if (this.form && this.formItem) {
        this.$watch("formItem.errMsg", (newVal) => {
          this.localMsg = newVal;
        });
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.focused = this.focus;
        this.focusShow = this.focus;
      });
    },
    methods: {
      /**
       * 初始化变量值
       */
      init() {
        if (this.value || this.value === 0) {
          this.val = this.value;
        } else if (this.modelValue || this.modelValue === 0 || this.modelValue === "") {
          this.val = this.modelValue;
        } else {
          this.val = "";
        }
      },
      /**
       * 点击图标时触发
       * @param {Object} type
       */
      onClickIcon(type) {
        this.$emit("iconClick", type);
      },
      /**
       * 显示隐藏内容，密码框时生效
       */
      onEyes() {
        this.showPassword = !this.showPassword;
        this.$emit("eyes", this.showPassword);
      },
      /**
       * 输入时触发
       * @param {Object} event
       */
      onInput(event) {
        let value = event.detail.value;
        if (this.trim) {
          if (typeof this.trim === "boolean" && this.trim) {
            value = this.trimStr(value);
          }
          if (typeof this.trim === "string") {
            value = this.trimStr(value, this.trim);
          }
        }
        if (this.errMsg)
          this.errMsg = "";
        this.val = value;
        this.$emit("input", value);
        this.$emit("update:modelValue", value);
      },
      /**
       * 外部调用方法
       * 获取焦点时触发
       * @param {Object} event
       */
      onFocus() {
        this.$nextTick(() => {
          this.focused = true;
        });
        this.$emit("focus", null);
      },
      _Focus(event) {
        this.focusShow = true;
        this.$emit("focus", event);
      },
      /**
       * 外部调用方法
       * 失去焦点时触发
       * @param {Object} event
       */
      onBlur() {
        this.focused = false;
        this.$emit("blur", null);
      },
      _Blur(event) {
        event.detail.value;
        this.focusShow = false;
        this.$emit("blur", event);
        if (this.isEnter === false) {
          this.$emit("change", this.val);
        }
        if (this.form && this.formItem) {
          const { validateTrigger } = this.form;
          if (validateTrigger === "blur") {
            this.formItem.onFieldChange();
          }
        }
      },
      /**
       * 按下键盘的发送键
       * @param {Object} e
       */
      onConfirm(e) {
        this.$emit("confirm", this.val);
        this.isEnter = true;
        this.$emit("change", this.val);
        this.$nextTick(() => {
          this.isEnter = false;
        });
      },
      /**
       * 清理内容
       * @param {Object} event
       */
      onClear(event) {
        this.val = "";
        this.$emit("input", "");
        this.$emit("update:modelValue", "");
        this.$emit("clear");
      },
      /**
       * 键盘高度发生变化的时候触发此事件
       * 兼容性：微信小程序2.7.0+、App 3.1.0+
       * @param {Object} event
       */
      onkeyboardheightchange(event) {
        this.$emit("keyboardheightchange", event);
      },
      /**
       * 去除空格
       */
      trimStr(str, pos = "both") {
        if (pos === "both") {
          return str.trim();
        } else if (pos === "left") {
          return str.trimLeft();
        } else if (pos === "right") {
          return str.trimRight();
        } else if (pos === "start") {
          return str.trimStart();
        } else if (pos === "end") {
          return str.trimEnd();
        } else if (pos === "all") {
          return str.replace(/\s+/g, "");
        } else if (pos === "none") {
          return str;
        }
        return str;
      }
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-easyinput", { "uni-easyinput-error": $options.msg }]),
        style: vue.normalizeStyle($options.boxStyle)
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["uni-easyinput__content", $options.inputContentClass]),
            style: vue.normalizeStyle($options.inputContentStyle)
          },
          [
            $props.prefixIcon ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
              key: 0,
              class: "content-clear-icon",
              type: $props.prefixIcon,
              color: "#c0c4cc",
              onClick: _cache[0] || (_cache[0] = ($event) => $options.onClickIcon("prefix")),
              size: "22"
            }, null, 8, ["type"])) : vue.createCommentVNode("v-if", true),
            vue.renderSlot(_ctx.$slots, "left", {}, void 0, true),
            $props.type === "textarea" ? (vue.openBlock(), vue.createElementBlock("textarea", {
              key: 1,
              class: vue.normalizeClass(["uni-easyinput__content-textarea", { "input-padding": $props.inputBorder }]),
              name: $props.name,
              value: $data.val,
              placeholder: $props.placeholder,
              placeholderStyle: $props.placeholderStyle,
              disabled: $props.disabled,
              "placeholder-class": "uni-easyinput__placeholder-class",
              maxlength: $options.inputMaxlength,
              focus: $data.focused,
              autoHeight: $props.autoHeight,
              "cursor-spacing": $props.cursorSpacing,
              "adjust-position": $props.adjustPosition,
              onInput: _cache[1] || (_cache[1] = (...args) => $options.onInput && $options.onInput(...args)),
              onBlur: _cache[2] || (_cache[2] = (...args) => $options._Blur && $options._Blur(...args)),
              onFocus: _cache[3] || (_cache[3] = (...args) => $options._Focus && $options._Focus(...args)),
              onConfirm: _cache[4] || (_cache[4] = (...args) => $options.onConfirm && $options.onConfirm(...args)),
              onKeyboardheightchange: _cache[5] || (_cache[5] = (...args) => $options.onkeyboardheightchange && $options.onkeyboardheightchange(...args))
            }, null, 42, ["name", "value", "placeholder", "placeholderStyle", "disabled", "maxlength", "focus", "autoHeight", "cursor-spacing", "adjust-position"])) : (vue.openBlock(), vue.createElementBlock("input", {
              key: 2,
              type: $props.type === "password" ? "text" : $props.type,
              class: "uni-easyinput__content-input",
              style: vue.normalizeStyle($options.inputStyle),
              name: $props.name,
              value: $data.val,
              password: !$data.showPassword && $props.type === "password",
              placeholder: $props.placeholder,
              placeholderStyle: $props.placeholderStyle,
              "placeholder-class": "uni-easyinput__placeholder-class",
              disabled: $props.disabled,
              maxlength: $options.inputMaxlength,
              focus: $data.focused,
              confirmType: $props.confirmType,
              "cursor-spacing": $props.cursorSpacing,
              "adjust-position": $props.adjustPosition,
              onFocus: _cache[6] || (_cache[6] = (...args) => $options._Focus && $options._Focus(...args)),
              onBlur: _cache[7] || (_cache[7] = (...args) => $options._Blur && $options._Blur(...args)),
              onInput: _cache[8] || (_cache[8] = (...args) => $options.onInput && $options.onInput(...args)),
              onConfirm: _cache[9] || (_cache[9] = (...args) => $options.onConfirm && $options.onConfirm(...args)),
              onKeyboardheightchange: _cache[10] || (_cache[10] = (...args) => $options.onkeyboardheightchange && $options.onkeyboardheightchange(...args))
            }, null, 44, ["type", "name", "value", "password", "placeholder", "placeholderStyle", "disabled", "maxlength", "focus", "confirmType", "cursor-spacing", "adjust-position"])),
            $props.type === "password" && $props.passwordIcon ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 3 },
              [
                $options.isVal ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                  key: 0,
                  class: vue.normalizeClass(["content-clear-icon", { "is-textarea-icon": $props.type === "textarea" }]),
                  type: $data.showPassword ? "eye-slash-filled" : "eye-filled",
                  size: 22,
                  color: $data.focusShow ? $props.primaryColor : "#c0c4cc",
                  onClick: $options.onEyes
                }, null, 8, ["class", "type", "color", "onClick"])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true),
            $props.suffixIcon ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 4 },
              [
                $props.suffixIcon ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                  key: 0,
                  class: "content-clear-icon",
                  type: $props.suffixIcon,
                  color: "#c0c4cc",
                  onClick: _cache[11] || (_cache[11] = ($event) => $options.onClickIcon("suffix")),
                  size: "22"
                }, null, 8, ["type"])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 5 },
              [
                $props.clearable && $options.isVal && !$props.disabled && $props.type !== "textarea" ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                  key: 0,
                  class: vue.normalizeClass(["content-clear-icon", { "is-textarea-icon": $props.type === "textarea" }]),
                  type: "clear",
                  size: $props.clearSize,
                  color: $options.msg ? "#dd524d" : $data.focusShow ? $props.primaryColor : "#c0c4cc",
                  onClick: $options.onClear
                }, null, 8, ["class", "size", "color", "onClick"])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            )),
            vue.renderSlot(_ctx.$slots, "right", {}, void 0, true)
          ],
          6
          /* CLASS, STYLE */
        )
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$j], ["__scopeId", "data-v-09fd5285"], ["__file", "D:/CODE/mobile-app/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue"]]);
  function getHousesByUser() {
    return request({
      url: "/house/get-all",
      method: "GET"
    });
  }
  function createHouse(data) {
    return request({
      url: "/house/create-house",
      method: "POST",
      data
    });
  }
  function updateHouse(houseId, data) {
    return request({
      url: `/house/${houseId}/update`,
      method: "PUT",
      data
    });
  }
  function deleteHouse(houseId) {
    return request({
      url: `/house/${houseId}`,
      method: "DELETE"
    });
  }
  function getHouseQuotation(houseId) {
    return request({
      url: `/house/quotation/${houseId}`,
      method: "GET"
    });
  }
  const _sfc_main$i = {
    name: "homeForm",
    props: { house: Object },
    emits: ["success"],
    data() {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      return {
        // 后端枚举 -> 中文
        DECORATION_MAP: { FULL: "全包", HALF: "半包", LOOSE: "散装" },
        // 装修类型选项
        decorationTypes: [
          { value: "FULL", label: "全包" },
          { value: "HALF", label: "半包" },
          { value: "LOOSE", label: "散装" }
        ],
        // 表单数据
        form: {
          city: ((_a = this.house) == null ? void 0 : _a.city) || "",
          communityName: ((_b = this.house) == null ? void 0 : _b.communityName) || "",
          buildingNo: ((_c = this.house) == null ? void 0 : _c.buildingNo) || "",
          unitNo: ((_d = this.house) == null ? void 0 : _d.unitNo) || "",
          roomNo: ((_e = this.house) == null ? void 0 : _e.roomNo) || "",
          area: ((_f = this.house) == null ? void 0 : _f.area) || "",
          layoutType: ((_g = this.house) == null ? void 0 : _g.layoutType) || "",
          floorCount: ((_h = this.house) == null ? void 0 : _h.floorCount) || "",
          decorationType: ((_i = this.house) == null ? void 0 : _i.decorationType) || "FULL"
        },
        // 错误信息
        errors: {
          city: "",
          communityName: "",
          buildingNo: "",
          unitNo: "",
          roomNo: "",
          area: "",
          layoutType: "",
          floorCount: ""
        },
        isSubmitting: false
      };
    },
    computed: {
      isEditMode() {
        return !!this.house;
      },
      currentDecorationIndex() {
        return this.decorationTypes.findIndex((item) => item.value === this.form.decorationType);
      },
      selectedDecorationLabel() {
        const found = this.decorationTypes.find((item) => item.value === this.form.decorationType);
        return found ? found.label : "";
      }
    },
    methods: {
      // 校验函数
      validateCity() {
        this.errors.city = this.form.city ? "" : "城市不能为空";
        return !this.errors.city;
      },
      validateCommunity() {
        this.errors.communityName = this.form.communityName ? "" : "小区不能为空";
        return !this.errors.communityName;
      },
      validateBuildingNo() {
        this.errors.buildingNo = this.form.buildingNo ? "" : "楼栋不能为空";
        return !this.errors.buildingNo;
      },
      validateUnitNo() {
        this.errors.unitNo = this.form.unitNo ? "" : "单元不能为空";
        return !this.errors.unitNo;
      },
      validateRoomNo() {
        this.errors.roomNo = this.form.roomNo ? "" : "房号不能为空";
        return !this.errors.roomNo;
      },
      validateArea() {
        this.errors.area = this.form.area > 0 ? "" : "面积必须大于0";
        return !this.errors.area;
      },
      validateLayoutType() {
        this.errors.layoutType = this.form.layoutType ? "" : "户型不能为空";
        return !this.errors.layoutType;
      },
      validateFloorCount() {
        this.errors.floorCount = this.form.floorCount > 0 ? "" : "楼层必须大于0";
        return !this.errors.floorCount;
      },
      validateAll() {
        return [
          this.validateCity(),
          this.validateCommunity(),
          this.validateBuildingNo(),
          this.validateUnitNo(),
          this.validateRoomNo(),
          this.validateArea(),
          this.validateLayoutType(),
          this.validateFloorCount()
        ].every((v) => v);
      },
      onDecorationChange(e) {
        const index = e.detail.value;
        this.form.decorationType = this.decorationTypes[index].value;
      },
      async submit() {
        if (this.isSubmitting)
          return;
        if (!this.validateAll()) {
          uni.showToast({
            title: "请检查表单信息",
            icon: "none"
          });
          return;
        }
        this.isSubmitting = true;
        try {
          let res;
          if (this.isEditMode) {
            res = await updateHouse(this.house.houseId, this.form);
          } else {
            res = await createHouse(this.form);
          }
          this.$emit("success", res);
          uni.showToast({
            title: this.isEditMode ? "保存成功" : "新增成功",
            icon: "success"
          });
        } catch (err) {
          formatAppLog("error", "at src/components/homeForm.vue:265", "提交失败", err);
          uni.showToast({
            title: "提交失败，请重试",
            icon: "none"
          });
        } finally {
          this.isSubmitting = false;
        }
      }
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_easyinput = resolveEasycom(vue.resolveDynamicComponent("uni-easyinput"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "house-form" }, [
      vue.createElementVNode("view", { class: "input-row" }, [
        vue.createElementVNode("text", { class: "label" }, "城市"),
        vue.createElementVNode("view", { class: "input-col" }, [
          vue.createVNode(_component_uni_easyinput, {
            modelValue: $data.form.city,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.form.city = $event),
            placeholder: "请输入城市",
            onBlur: $options.validateCity,
            type: "text"
          }, null, 8, ["modelValue", "onBlur"]),
          $data.errors.city ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            "× " + vue.toDisplayString($data.errors.city),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "input-row" }, [
        vue.createElementVNode("text", { class: "label" }, "小区"),
        vue.createElementVNode("view", { class: "input-col" }, [
          vue.createVNode(_component_uni_easyinput, {
            modelValue: $data.form.communityName,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.form.communityName = $event),
            placeholder: "请输入小区名",
            onBlur: $options.validateCommunity,
            type: "text"
          }, null, 8, ["modelValue", "onBlur"]),
          $data.errors.communityName ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            "× " + vue.toDisplayString($data.errors.communityName),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "input-row" }, [
        vue.createElementVNode("text", { class: "label" }, "楼栋"),
        vue.createElementVNode("view", { class: "input-col" }, [
          vue.createVNode(_component_uni_easyinput, {
            modelValue: $data.form.buildingNo,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.form.buildingNo = $event),
            placeholder: "栋号",
            onBlur: $options.validateBuildingNo,
            type: "text"
          }, null, 8, ["modelValue", "onBlur"]),
          $data.errors.buildingNo ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            "× " + vue.toDisplayString($data.errors.buildingNo),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "input-row" }, [
        vue.createElementVNode("text", { class: "label" }, "单元"),
        vue.createElementVNode("view", { class: "input-col" }, [
          vue.createVNode(_component_uni_easyinput, {
            modelValue: $data.form.unitNo,
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.form.unitNo = $event),
            placeholder: "单元号",
            onBlur: $options.validateUnitNo,
            type: "text"
          }, null, 8, ["modelValue", "onBlur"]),
          $data.errors.unitNo ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            "× " + vue.toDisplayString($data.errors.unitNo),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "input-row" }, [
        vue.createElementVNode("text", { class: "label" }, "房号"),
        vue.createElementVNode("view", { class: "input-col" }, [
          vue.createVNode(_component_uni_easyinput, {
            modelValue: $data.form.roomNo,
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.form.roomNo = $event),
            placeholder: "房号",
            onBlur: $options.validateRoomNo,
            type: "text"
          }, null, 8, ["modelValue", "onBlur"]),
          $data.errors.roomNo ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            "× " + vue.toDisplayString($data.errors.roomNo),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "input-row" }, [
        vue.createElementVNode("text", { class: "label" }, "面积"),
        vue.createElementVNode("view", { class: "input-col" }, [
          vue.createVNode(_component_uni_easyinput, {
            modelValue: $data.form.area,
            "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.form.area = $event),
            placeholder: "㎡",
            onBlur: $options.validateArea,
            type: "number"
          }, null, 8, ["modelValue", "onBlur"]),
          $data.errors.area ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            "× " + vue.toDisplayString($data.errors.area),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "input-row" }, [
        vue.createElementVNode("text", { class: "label" }, "户型"),
        vue.createElementVNode("view", { class: "input-col" }, [
          vue.createVNode(_component_uni_easyinput, {
            modelValue: $data.form.layoutType,
            "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.form.layoutType = $event),
            placeholder: "例如 2室1厅",
            onBlur: $options.validateLayoutType,
            type: "text"
          }, null, 8, ["modelValue", "onBlur"]),
          $data.errors.layoutType ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            "× " + vue.toDisplayString($data.errors.layoutType),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "input-row" }, [
        vue.createElementVNode("text", { class: "label" }, "楼层"),
        vue.createElementVNode("view", { class: "input-col" }, [
          vue.createVNode(_component_uni_easyinput, {
            modelValue: $data.form.floorCount,
            "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.form.floorCount = $event),
            onBlur: $options.validateFloorCount,
            type: "number"
          }, null, 8, ["modelValue", "onBlur"]),
          $data.errors.floorCount ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            "× " + vue.toDisplayString($data.errors.floorCount),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "input-row" }, [
        vue.createElementVNode("text", { class: "label" }, "装修类型"),
        vue.createElementVNode("picker", {
          range: $data.decorationTypes,
          "range-key": "label",
          value: $options.currentDecorationIndex,
          onChange: _cache[8] || (_cache[8] = (...args) => $options.onDecorationChange && $options.onDecorationChange(...args)),
          disabled: $options.isEditMode
        }, [
          vue.createElementVNode(
            "view",
            { class: "picker" },
            vue.toDisplayString($data.form.decorationType ? $options.selectedDecorationLabel : "请选择装修类型"),
            1
            /* TEXT */
          )
        ], 40, ["range", "value", "disabled"])
      ]),
      vue.createElementVNode("view", { class: "form-footer" }, [
        vue.createElementVNode(
          "button",
          {
            class: "submit-btn",
            onClick: _cache[9] || (_cache[9] = (...args) => $options.submit && $options.submit(...args))
          },
          vue.toDisplayString($options.isEditMode ? "保存" : "新增"),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const homeForm = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$i], ["__scopeId", "data-v-5f8d72f0"], ["__file", "D:/CODE/mobile-app/src/components/homeForm.vue"]]);
  const _sfc_main$h = {
    __name: "project",
    setup(__props, { expose: __expose }) {
      __expose();
      const DECORATION_MAP = {
        FULL: "全包",
        HALF: "半包",
        LOOSE: "散装"
      };
      const houses = vue.ref([]);
      const dialogMode = vue.ref("add");
      const currentHouse = vue.ref(null);
      const popup = vue.ref(null);
      const houseMenuPopup = vue.ref(null);
      const selectedHouse = vue.ref(null);
      onLoad(() => {
        formatAppLog("log", "at src/pages/project/project.vue:104", "加载房屋列表");
        loadHouses();
      });
      onNavigationBarButtonTap((event) => {
        formatAppLog("log", "at src/pages/project/project.vue:110", "导航栏按钮被点击", event);
        uni.showActionSheet({
          itemList: ["新增房屋", "其他功能1", "其他功能2"],
          success(res) {
            if (res.tapIndex === 0) {
              openDialog("add");
            }
          }
        });
      });
      onShow(() => {
        formatAppLog("log", "at src/pages/project/project.vue:123", "页面显示，重新加载房屋列表");
        loadHouses();
      });
      function showHouseMenu(house) {
        var _a;
        selectedHouse.value = house;
        (_a = houseMenuPopup.value) == null ? void 0 : _a.open();
      }
      function handleEdit(house) {
        var _a;
        (_a = houseMenuPopup.value) == null ? void 0 : _a.close();
        openDialog("edit", house);
      }
      function handleDelete(houseId) {
        var _a;
        (_a = houseMenuPopup.value) == null ? void 0 : _a.close();
        confirmDelete(houseId);
      }
      function goLayoutPage(houseId) {
        uni.navigateTo({
          url: `/src/pages/layout/layout?houseId=${houseId}`
        });
      }
      function goFurniturePage(house) {
        if (!house.confirmedLayoutId) {
          uni.showToast({
            title: "此房屋尚不存在已完成的布局设计",
            icon: "none"
          });
          return;
        }
        uni.navigateTo({
          url: `/src/pages/furniture/furniture?layoutId=${house.confirmedLayoutId}`
        });
      }
      function startQuotation(house) {
        uni.navigateTo({
          url: `/src/pages/quotation/quotation?houseId=${house.houseId}`
        });
      }
      function startConstruction(house) {
        uni.navigateTo({
          url: `/src/pages/stage/stage?houseId=${house.houseId}`
        });
      }
      async function loadHouses() {
        try {
          const res = await getHousesByUser();
          houses.value = res;
        } catch (err) {
          houses.value = [];
          uni.showToast({
            title: "加载房屋失败，请重试",
            icon: "none"
          });
        }
      }
      function openDialog(mode, house = null) {
        var _a;
        dialogMode.value = mode;
        currentHouse.value = house;
        (_a = popup.value) == null ? void 0 : _a.open();
      }
      function closeDialog() {
        var _a;
        (_a = popup.value) == null ? void 0 : _a.close();
        currentHouse.value = null;
      }
      function confirmDelete(houseId) {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除该房屋吗？",
          success(res) {
            if (res.confirm) {
              performDelete(houseId);
            }
          }
        });
      }
      async function performDelete(houseId) {
        var _a, _b;
        try {
          await deleteHouse(houseId);
          houses.value = houses.value.filter((h) => h.houseId !== houseId);
          uni.showToast({
            title: "删除成功",
            icon: "success"
          });
        } catch (err) {
          const msg = ((_b = (_a = err == null ? void 0 : err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "删除失败，请重试";
          uni.showToast({
            title: msg,
            icon: "none"
          });
        }
      }
      function onFormSuccess() {
        loadHouses();
        closeDialog();
        uni.showToast({
          title: "操作成功",
          icon: "success"
        });
      }
      const __returned__ = { DECORATION_MAP, houses, dialogMode, currentHouse, popup, houseMenuPopup, selectedHouse, showHouseMenu, handleEdit, handleDelete, goLayoutPage, goFurniturePage, startQuotation, startConstruction, loadHouses, openDialog, closeDialog, confirmDelete, performDelete, onFormSuccess, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get onNavigationBarButtonTap() {
        return onNavigationBarButtonTap;
      }, get onShow() {
        return onShow;
      }, homeForm, get getHousesByUser() {
        return getHousesByUser;
      }, get deleteHouse() {
        return deleteHouse;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "houses-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "我的房屋")
      ]),
      vue.createElementVNode("view", { class: "house-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.houses, (house) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "house-item",
              key: house.houseId
            }, [
              vue.createElementVNode("view", { class: "house-header-relative" }, [
                vue.createElementVNode(
                  "text",
                  { class: "house-title" },
                  vue.toDisplayString(house.city) + " * " + vue.toDisplayString(house.communityName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("button", {
                  class: "menu-btn-absolute",
                  onClick: ($event) => $setup.showHouseMenu(house)
                }, "⋮", 8, ["onClick"])
              ]),
              vue.createElementVNode(
                "text",
                { class: "house-info" },
                vue.toDisplayString(house.layoutType) + " | " + vue.toDisplayString(house.area) + "㎡",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "house-info" },
                vue.toDisplayString(house.buildingNo) + "栋 · " + vue.toDisplayString(house.unitNo) + "单元 · " + vue.toDisplayString(house.roomNo),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "house-info" }, [
                vue.createTextVNode(
                  " 装修类型：" + vue.toDisplayString($setup.DECORATION_MAP[house.decorationType] || house.decorationType) + " ",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "info-separator" }),
                vue.createTextVNode(
                  " 楼层：" + vue.toDisplayString(house.floorCount),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "design-buttons" }, [
                vue.createElementVNode("button", {
                  class: "design-btn",
                  onClick: ($event) => $setup.goLayoutPage(house.houseId)
                }, "布局设计", 8, ["onClick"]),
                vue.createElementVNode("button", {
                  class: "design-btn furniture-btn",
                  onClick: ($event) => $setup.goFurniturePage(house)
                }, "家具设计", 8, ["onClick"])
              ]),
              house.canStartQuotation || house.canStartConstruction ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "construction-buttons"
              }, [
                house.canStartQuotation ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 0,
                  class: "construction-btn quotation-btn",
                  onClick: ($event) => $setup.startQuotation(house)
                }, " 报价 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                house.canStartConstruction ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 1,
                  class: "construction-btn construction-btn-only",
                  onClick: ($event) => $setup.startConstruction(house)
                }, " 进入施工 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
              ])) : vue.createCommentVNode("v-if", true)
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.houses.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "no-house"
        }, [
          vue.createElementVNode("text", null, "还没有房屋信息，快去新增吧～")
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "houseMenuPopup",
          type: "share"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "menu-content" }, [
              vue.createElementVNode("button", {
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.handleEdit($setup.selectedHouse))
              }, "编辑"),
              vue.createElementVNode("button", {
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.handleDelete($setup.selectedHouse.houseId))
              }, "删除")
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      ),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "popup",
          type: "center"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "modal" }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($setup.dialogMode === "edit" ? "编辑房屋" : "新增房屋"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", {
                  class: "close",
                  onClick: $setup.closeDialog
                }, "×")
              ]),
              vue.createElementVNode("view", { class: "modal-body" }, [
                vue.createVNode($setup["homeForm"], {
                  house: $setup.currentHouse,
                  onSuccess: $setup.onFormSuccess
                }, null, 8, ["house"])
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const SrcPagesProjectProject = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$h], ["__file", "D:/CODE/mobile-app/src/pages/project/project.vue"]]);
  const _imports_0 = "/static/post/share.png";
  const _sfc_main$g = {
    __name: "detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const postId = vue.ref("");
      const postDetail = vue.ref({});
      const comments = vue.ref([]);
      const commentInput = vue.ref("");
      const isLiked = vue.ref(false);
      const currentIndex = vue.ref(0);
      const authorId = vue.ref(0);
      const formattedTime = vue.computed(() => {
        if (!postDetail.value.createdAt)
          return "";
        const date = new Date(postDetail.value.createdAt);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      });
      onLoad(async (options) => {
        postId.value = options.postId;
        await loadPostDetail();
        const isAuthor = userStore.user.userId === authorId.value;
        formatAppLog("log", "at src/pages/post/detail.vue:164", "userStore.user.userId", userStore.user.userId);
        formatAppLog("log", "at src/pages/post/detail.vue:165", "authorId", authorId.value);
        formatAppLog("log", "at src/pages/post/detail.vue:166", "isAuthor", isAuthor);
        if (typeof plus !== "undefined") {
          const currentWebview = plus.webview.currentWebview();
          if (isAuthor) {
            currentWebview.setStyle({
              titleNView: {
                buttons: [
                  {
                    type: "more",
                    float: "right",
                    color: "#ffffff",
                    text: "⋮",
                    fontSize: "20px",
                    width: "44px",
                    height: "44px"
                  }
                ]
              }
            });
          } else {
            currentWebview.setStyle({
              titleNView: {
                buttons: []
              }
            });
          }
        }
      });
      onShow(async () => {
        formatAppLog("log", "at src/pages/post/detail.vue:201", "页面显示，重新加载数据");
        await loadPostDetail();
        await loadComments();
      });
      vue.onMounted(() => {
        loadComments();
      });
      onNavigationBarButtonTap((event) => {
        formatAppLog("log", "at src/pages/post/detail.vue:213", "导航栏按钮被点击", event);
        uni.showActionSheet({
          itemList: ["编辑文章", "删除文章"],
          success: (res) => {
            if (res.tapIndex === 0) {
              editPost();
            } else if (res.tapIndex === 1) {
              deleteCurrentPost();
            }
          }
        });
      });
      const editPost = () => {
        uni.navigateTo({
          url: `/src/pages/post/edit?postId=${postId.value}`
        });
      };
      const deleteCurrentPost = async () => {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除这篇文章吗？此操作不可撤销。",
          confirmText: "确认删除",
          confirmColor: "#ff4444",
          cancelText: "取消",
          success: async (res) => {
            if (res.confirm) {
              try {
                await deletePost(postId.value);
                uni.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              } catch (error) {
                formatAppLog("error", "at src/pages/post/detail.vue:257", "删除文章失败:", error);
                uni.showToast({
                  title: error.message || "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      };
      const onSwiperChange = (e) => {
        currentIndex.value = e.detail.current;
      };
      const loadPostDetail = async () => {
        try {
          const response = await getPostDetail(postId.value);
          postDetail.value = response;
          formatAppLog("log", "at src/pages/post/detail.vue:279", "postDetail.value.authorId", postDetail.value.authorId);
          authorId.value = postDetail.value.authorId;
          isLiked.value = response.liked || false;
        } catch (error) {
          formatAppLog("error", "at src/pages/post/detail.vue:283", "获取文章详情失败:", error);
          uni.showToast({
            title: "获取文章详情失败",
            icon: "none"
          });
        }
      };
      const loadComments = async () => {
        try {
          const response = await getCommentList(postId.value);
          comments.value = response || [];
        } catch (error) {
          formatAppLog("error", "at src/pages/post/detail.vue:298", "获取评论列表失败:", error);
        }
      };
      const toggleLike = async () => {
        try {
          const response = await likePost(postId.value);
          isLiked.value = !isLiked.value;
          postDetail.value.likeCount += isLiked.value ? 1 : -1;
          uni.showToast({
            title: isLiked.value ? "已点赞" : "已取消点赞",
            icon: "none"
          });
        } catch (error) {
          formatAppLog("error", "at src/pages/post/detail.vue:315", "操作失败:", error);
          uni.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      };
      const submitComment = async () => {
        if (!commentInput.value.trim()) {
          uni.showToast({
            title: "请输入评论内容",
            icon: "none"
          });
          return;
        }
        try {
          await createComment(postId.value, {
            content: commentInput.value
          });
          commentInput.value = "";
          postDetail.value.commentCount += 1;
          loadComments();
          uni.showToast({
            title: "评论成功",
            icon: "none"
          });
        } catch (error) {
          formatAppLog("error", "at src/pages/post/detail.vue:347", "评论失败:", error);
          uni.showToast({
            title: "评论失败",
            icon: "none"
          });
        }
      };
      const previewImage = (index) => {
        const urls = postDetail.value.previewImages.map((img) => BASE_URL + img.imageUrl);
        uni.previewImage({
          current: index,
          urls
        });
      };
      const goToUser = (userId) => {
        uni.navigateTo({
          url: `/pages/user/profile?userId=${userId}`
        });
      };
      const goBack = () => {
        uni.navigateBack();
      };
      const showShareOptions = () => {
        uni.showActionSheet({
          itemList: ["微信好友", "朋友圈", "复制链接", "更多"],
          success(res) {
            formatAppLog("log", "at src/pages/post/detail.vue:381", "用户选择:", res.tapIndex);
          }
        });
      };
      const formatTime = (timeStr) => {
        const date = new Date(timeStr);
        const now2 = /* @__PURE__ */ new Date();
        const diffMs = now2 - date;
        const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
        if (diffDays === 0) {
          return "今天";
        } else if (diffDays === 1) {
          return "昨天";
        } else {
          return `${diffDays}天前`;
        }
      };
      const toggleFollow = () => {
        uni.showToast({
          title: "功能开发中...",
          icon: "none"
        });
      };
      const __returned__ = { userStore, postId, postDetail, comments, commentInput, isLiked, currentIndex, authorId, formattedTime, editPost, deleteCurrentPost, onSwiperChange, loadPostDetail, loadComments, toggleLike, submitComment, previewImage, goToUser, goBack, showShareOptions, formatTime, toggleFollow, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get onNavigationBarButtonTap() {
        return onNavigationBarButtonTap;
      }, get BASE_URL() {
        return BASE_URL;
      }, get getPostDetail() {
        return getPostDetail;
      }, get likePost() {
        return likePost;
      }, get createComment() {
        return createComment;
      }, get getCommentList() {
        return getCommentList;
      }, get deletePost() {
        return deletePost;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "post-detail" }, [
      vue.createElementVNode("view", { class: "main-content" }, [
        vue.createElementVNode("scroll-view", {
          class: "content",
          "scroll-y": "",
          "enable-flex": true
        }, [
          $setup.postDetail.previewImages && $setup.postDetail.previewImages.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "image-container"
          }, [
            vue.createElementVNode("view", { class: "image-carousel" }, [
              vue.createElementVNode(
                "swiper",
                {
                  class: "image-swiper",
                  "indicator-dots": false,
                  autoplay: false,
                  circular: false,
                  duration: 500,
                  onChange: $setup.onSwiperChange
                },
                [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.postDetail.previewImages, (img, index) => {
                      return vue.openBlock(), vue.createElementBlock("swiper-item", {
                        key: img.id
                      }, [
                        vue.createElementVNode("image", {
                          src: $setup.BASE_URL + img.imageUrl,
                          class: "carousel-image",
                          mode: "aspectFit",
                          onClick: ($event) => $setup.previewImage(index)
                        }, null, 8, ["src", "onClick"])
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                32
                /* NEED_HYDRATION */
              )
            ]),
            vue.createElementVNode("view", { class: "image-indicator" }, [
              vue.createElementVNode(
                "text",
                { class: "indicator-text" },
                vue.toDisplayString($setup.currentIndex + 1) + " / " + vue.toDisplayString($setup.postDetail.previewImages.length),
                1
                /* TEXT */
              )
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "user-section" }, [
            vue.createElementVNode("image", {
              src: $setup.BASE_URL + $setup.postDetail.authorAvatar,
              class: "avatar",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.goToUser($setup.postDetail.authorId))
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "user-info" }, [
              vue.createElementVNode(
                "text",
                { class: "username" },
                vue.toDisplayString($setup.postDetail.authorName),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "create-time" },
                vue.toDisplayString($setup.formattedTime),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "action-buttons" }, [
              vue.createElementVNode("button", {
                class: "follow-btn",
                onClick: $setup.toggleFollow
              }, "关注")
            ])
          ]),
          vue.createElementVNode("view", { class: "title-section" }, [
            vue.createElementVNode(
              "text",
              { class: "title" },
              vue.toDisplayString($setup.postDetail.title),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "content-section" }, [
            vue.createElementVNode(
              "text",
              { class: "content-text" },
              vue.toDisplayString($setup.postDetail.content),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "interaction-section" }, [
            vue.createElementVNode("view", {
              class: "like-section",
              onClick: $setup.toggleLike
            }, [
              vue.createElementVNode("image", {
                src: $setup.isLiked ? "/static/post/liked.png" : "/static/post/like.png",
                class: "like-icon",
                mode: "aspectFit"
              }, null, 8, ["src"]),
              vue.createElementVNode(
                "text",
                { class: "like-count" },
                vue.toDisplayString($setup.postDetail.likeCount),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "share-section",
              onClick: $setup.showShareOptions
            }, [
              vue.createElementVNode("image", {
                src: _imports_0,
                class: "share-icon",
                mode: "aspectFit"
              }),
              vue.createElementVNode("text", { class: "share-text" }, "分享")
            ])
          ]),
          vue.createElementVNode("view", { class: "comments-section" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode(
                "text",
                { class: "section-title" },
                "评论 (" + vue.toDisplayString($setup.postDetail.commentCount) + ")",
                1
                /* TEXT */
              )
            ]),
            $setup.comments.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "comments-list"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.comments, (comment) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: comment.commentId,
                    class: "comment-item"
                  }, [
                    vue.createElementVNode("image", {
                      src: $setup.BASE_URL + comment.authorAvatar,
                      class: "comment-avatar"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "comment-content" }, [
                      vue.createElementVNode("view", { class: "comment-header" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "comment-author" },
                          vue.toDisplayString(comment.authorName),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "comment-time" },
                          vue.toDisplayString($setup.formatTime(comment.createdAt)),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode(
                        "text",
                        { class: "comment-text" },
                        vue.toDisplayString(comment.content),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "comment-actions" }, [
                        vue.createElementVNode("text", { class: "reply-btn" }, "回复")
                      ])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "no-comments"
            }, [
              vue.createElementVNode("text", null, "暂无评论")
            ]))
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "bottom-input" }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.commentInput = $event),
            class: "comment-input",
            placeholder: "写评论...",
            onConfirm: $setup.submitComment
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [
          [vue.vModelText, $setup.commentInput]
        ]),
        vue.createElementVNode("button", {
          class: "send-btn",
          onClick: $setup.submitComment
        }, "发送")
      ])
    ]);
  }
  const SrcPagesPostDetail = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$g], ["__scopeId", "data-v-1a2d8da8"], ["__file", "D:/CODE/mobile-app/src/pages/post/detail.vue"]]);
  const sendTextMessage = (data) => {
    return request({
      url: "/chat/text-create",
      method: "post",
      data
    });
  };
  function sendImageMessage(receiverId, filePath) {
    return uploadRequest({
      url: `/chat/image-create/${receiverId}`,
      filePath
    });
  }
  const getConversation = (otherId) => {
    return request({
      url: `/chat/conversation/${otherId}`,
      method: "get"
    });
  };
  const getChatPartners = () => {
    return request({
      url: "/chat/chat-partners",
      method: "get"
    });
  };
  const _sfc_main$f = {
    __name: "contact",
    setup(__props, { expose: __expose }) {
      __expose();
      const chatPartners = vue.ref([]);
      const isLoading = vue.ref(false);
      const loadChatPartners = async () => {
        isLoading.value = true;
        try {
          chatPartners.value = await getChatPartners();
        } catch (error) {
          formatAppLog("error", "at src/pages/contact/contact.vue:19", "获取聊天伙伴失败:", error);
          uni.showToast({
            title: "获取联系人列表失败",
            icon: "none"
          });
        } finally {
          isLoading.value = false;
        }
      };
      const goToChat = (partner) => {
        formatAppLog("log", "at src/pages/contact/contact.vue:32", "点击了联系人:", partner);
        uni.navigateTo({
          url: `/src/pages/contact/contactDetail?targetUserId=${partner.partnerId}&targetUserName=${partner.partnerName}&targetAvatarUrl=${partner.partnerAvatar}`
        });
      };
      const formatTime = (timeString) => {
        if (!timeString)
          return "";
        const date = new Date(timeString);
        const today = /* @__PURE__ */ new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        if (isToday) {
          return `${hours}:${minutes}`;
        } else if (isYesterday) {
          return `昨天 ${hours}:${minutes}`;
        } else {
          return `${year}/${month}/${day} ${hours}:${minutes}`;
        }
      };
      onShow(() => {
        loadChatPartners();
      });
      const __returned__ = { chatPartners, isLoading, loadChatPartners, goToChat, formatTime, onMounted: vue.onMounted, ref: vue.ref, get getChatPartners() {
        return getChatPartners;
      }, get BASE_URL() {
        return BASE_URL;
      }, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "contact-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "联系人")
      ]),
      vue.createElementVNode("view", { class: "partners-list" }, [
        $setup.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-partners"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          vue.renderList($setup.chatPartners, (partner) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "partner-item",
              key: partner.partnerId,
              onClick: ($event) => $setup.goToChat(partner)
            }, [
              vue.createElementVNode("view", { class: "partner-avatar" }, [
                partner.partnerAvatar ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  src: $setup.BASE_URL + partner.partnerAvatar,
                  class: "avatar-img"
                }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 1,
                    class: "default-avatar"
                  },
                  vue.toDisplayString(partner.partnerName.charAt(0)),
                  1
                  /* TEXT */
                )),
                partner.unread ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 2,
                  class: "unread-dot"
                })) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", { class: "partner-info" }, [
                vue.createElementVNode("view", { class: "top-row" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "partner-name" },
                    vue.toDisplayString(partner.partnerName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "partner-time" },
                    vue.toDisplayString($setup.formatTime(partner.lastMessageTime)),
                    1
                    /* TEXT */
                  )
                ]),
                partner.lastMessageContent ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "partner-message"
                  },
                  vue.toDisplayString(partner.lastMessageContent),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.chatPartners.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-partners"
        }, [
          vue.createElementVNode("text", null, "暂无联系人")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const SrcPagesContactContact = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$f], ["__file", "D:/CODE/mobile-app/src/pages/contact/contact.vue"]]);
  function registerUser(data) {
    return request({
      url: "/user/create",
      method: "POST",
      data
    });
  }
  function loginUser(data) {
    return request({
      url: "/user/login",
      method: "POST",
      data
    });
  }
  function getCurrentUserInfo() {
    return request({
      url: "/user/userInfo",
      method: "GET"
    });
  }
  function updateUserProfile(data) {
    return request({
      url: "/user/update-profile",
      method: "PUT",
      data
    });
  }
  function changeUserPassword(data) {
    return request({
      url: "/user/change-password",
      method: "PUT",
      data
    });
  }
  function uploadUserAvatar(filePath) {
    return uploadRequest({
      url: "/user/upload-avatar",
      filePath
    });
  }
  const _sfc_main$e = {
    __name: "profile",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const userInfo = vue.ref(null);
      const loading = vue.ref(true);
      const editMode = vue.ref(false);
      const tempUserInfo = vue.ref({});
      const showPasswordModal = vue.ref(false);
      const passwordForm = vue.ref({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
      const confirmPasswordError = vue.ref("");
      const initializePage = async () => {
        try {
          loading.value = true;
          formatAppLog("log", "at src/pages/profile/profile.vue:164", "获取用户信息...");
          const userData = await getCurrentUserInfo();
          userInfo.value = userData;
          userStore.user = userData;
        } catch (error) {
          formatAppLog("error", "at src/pages/profile/profile.vue:171", "获取用户信息失败:", error);
          uni.showToast({
            title: "获取用户信息失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const formatTime = (timeString) => {
        if (!timeString)
          return "";
        const date = new Date(timeString);
        const today = /* @__PURE__ */ new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        if (isToday) {
          return `${hours}:${minutes}`;
        } else if (isYesterday) {
          return `昨天 ${hours}:${minutes}`;
        } else {
          return `${year}/${month}/${day} ${hours}:${minutes}`;
        }
      };
      const startEdit = () => {
        tempUserInfo.value = { ...userInfo.value };
        editMode.value = true;
      };
      const cancelEdit = () => {
        editMode.value = false;
        tempUserInfo.value = {};
      };
      const saveChanges = async () => {
        try {
          if (!tempUserInfo.value) {
            uni.showToast({
              title: "临时用户信息为空",
              icon: "none"
            });
            return;
          }
          await updateUserProfile(tempUserInfo.value);
          Object.assign(userInfo.value, tempUserInfo.value);
          userStore.user = { ...userInfo.value };
          editMode.value = false;
          uni.showToast({
            title: "资料更新成功",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at src/pages/profile/profile.vue:247", "更新用户资料失败:", error);
          uni.showToast({
            title: "更新失败，请重试",
            icon: "none"
          });
        }
      };
      const chooseImage = async () => {
        uni.chooseImage({
          count: 1,
          sourceType: ["album", "camera"],
          success: async (res) => {
            const filePath = res.tempFilePaths[0];
            try {
              const result = await uploadUserAvatar(filePath);
              userInfo.value.avatar_url = result.avatar_url;
              userStore.user.avatar_url = result.avatar_url;
              uni.showToast({
                title: "头像上传成功",
                icon: "success"
              });
            } catch (error) {
              formatAppLog("error", "at src/pages/profile/profile.vue:276", "上传头像失败:", error);
              uni.showToast({
                title: "上传失败，请重试",
                icon: "none"
              });
            }
          }
        });
      };
      const onUserNameInput = (event) => {
        tempUserInfo.value.userName = event.detail.value;
      };
      const onPhoneInput = (event) => {
        tempUserInfo.value.phone = event.detail.value;
      };
      const onOldPasswordInput = (event) => {
        passwordForm.value.oldPassword = event.detail.value;
      };
      const onNewPasswordInput = (event) => {
        passwordForm.value.newPassword = event.detail.value;
      };
      const onConfirmPasswordInput = (event) => {
        passwordForm.value.confirmNewPassword = event.detail.value;
      };
      const validateConfirmPassword = () => {
        if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
          confirmPasswordError.value = "两次输入的密码不一致";
          return false;
        }
        confirmPasswordError.value = "";
        return true;
      };
      const isPasswordFormValid = vue.computed(() => {
        return passwordForm.value.oldPassword && passwordForm.value.newPassword && passwordForm.value.confirmNewPassword && passwordForm.value.newPassword === passwordForm.value.confirmNewPassword && !confirmPasswordError.value;
      });
      const handleChangePassword = async () => {
        if (!validateConfirmPassword())
          return;
        try {
          await changeUserPassword({
            oldPassword: passwordForm.value.oldPassword,
            newPassword: passwordForm.value.newPassword
          });
          uni.showToast({
            title: "密码修改成功",
            icon: "success"
          });
          closePasswordModal();
        } catch (error) {
          formatAppLog("error", "at src/pages/profile/profile.vue:344", "密码修改失败:", error);
          uni.showToast({
            title: error.message || "密码修改失败，请检查原密码是否正确",
            icon: "none"
          });
        }
      };
      const openPasswordModal = () => {
        showPasswordModal.value = true;
        passwordForm.value = {
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: ""
        };
        confirmPasswordError.value = "";
      };
      const closePasswordModal = () => {
        showPasswordModal.value = false;
        confirmPasswordError.value = "";
      };
      const handleLogout = () => {
        uni.showModal({
          title: "确认退出",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              userStore.logout();
            }
          }
        });
      };
      onShow(async () => {
        const userStore2 = useUserStore();
        if (!userStore2.token) {
          uni.navigateTo({
            url: "/src/pages/login/login"
          });
          return;
        }
        if (!userInfo.value || userStore2.hasTokenChanged) {
          await initializePage();
          userStore2.hasTokenChanged = false;
        }
      });
      const __returned__ = { userStore, userInfo, loading, editMode, tempUserInfo, showPasswordModal, passwordForm, confirmPasswordError, initializePage, formatTime, startEdit, cancelEdit, saveChanges, chooseImage, onUserNameInput, onPhoneInput, onOldPasswordInput, onNewPasswordInput, onConfirmPasswordInput, validateConfirmPassword, isPasswordFormValid, handleChangePassword, openPasswordModal, closePasswordModal, handleLogout, ref: vue.ref, computed: vue.computed, get useUserStore() {
        return useUserStore;
      }, get getCurrentUserInfo() {
        return getCurrentUserInfo;
      }, get uploadUserAvatar() {
        return uploadUserAvatar;
      }, get updateUserProfile() {
        return updateUserProfile;
      }, get changeUserPassword() {
        return changeUserPassword;
      }, get BASE_URL() {
        return BASE_URL;
      }, get onShow() {
        return onShow;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("view", { class: "profile-container" }, [
          $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "loading"
          }, "加载中...")) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "profile-content"
          }, [
            vue.createElementVNode("view", { class: "profile-card" }, [
              vue.createElementVNode("view", { class: "avatar-section" }, [
                vue.createElementVNode("view", {
                  class: "avatar-wrapper",
                  onClick: $setup.chooseImage
                }, [
                  $setup.userInfo && $setup.userInfo.avatar_url ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "avatar-img"
                  }, [
                    vue.createElementVNode("image", {
                      src: $setup.BASE_URL + `${$setup.userInfo.avatar_url}`,
                      mode: "aspectFill"
                    }, null, 8, ["src"])
                  ])) : (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "default-avatar"
                  }, "头像"))
                ])
              ]),
              vue.createElementVNode("view", { class: "info-section" }, [
                vue.createElementVNode("view", { class: "info-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "邮箱:"),
                  !$setup.editMode ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "value"
                    },
                    vue.toDisplayString($setup.userInfo.email),
                    1
                    /* TEXT */
                  )) : (vue.openBlock(), vue.createElementBlock("input", {
                    key: 1,
                    value: $setup.tempUserInfo.email,
                    class: "edit-input",
                    disabled: ""
                  }, null, 8, ["value"]))
                ]),
                vue.createElementVNode("view", { class: "info-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "用户名:"),
                  !$setup.editMode ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "value"
                    },
                    vue.toDisplayString($setup.userInfo.userName),
                    1
                    /* TEXT */
                  )) : (vue.openBlock(), vue.createElementBlock("input", {
                    key: 1,
                    value: $setup.tempUserInfo.userName,
                    onInput: $setup.onUserNameInput,
                    class: "edit-input"
                  }, null, 40, ["value"]))
                ]),
                vue.createElementVNode("view", { class: "info-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "电话:"),
                  !$setup.editMode ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "value"
                    },
                    vue.toDisplayString($setup.userInfo.phone),
                    1
                    /* TEXT */
                  )) : (vue.openBlock(), vue.createElementBlock("input", {
                    key: 1,
                    value: $setup.tempUserInfo.phone,
                    onInput: $setup.onPhoneInput,
                    class: "edit-input"
                  }, null, 40, ["value"]))
                ]),
                vue.createElementVNode("view", { class: "info-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "角色:"),
                  vue.createElementVNode(
                    "text",
                    { class: "value" },
                    vue.toDisplayString($setup.userInfo.role),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "info-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "状态:"),
                  vue.createElementVNode(
                    "text",
                    { class: "value" },
                    vue.toDisplayString($setup.userInfo.status === "ACTIVE" ? "活跃" : "非活跃"),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "info-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "注册时间:"),
                  vue.createElementVNode(
                    "text",
                    { class: "value" },
                    vue.toDisplayString($setup.formatTime($setup.userInfo.createdAt)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "info-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "最后更新:"),
                  vue.createElementVNode(
                    "text",
                    { class: "value" },
                    vue.toDisplayString($setup.formatTime($setup.userInfo.updatedAt)),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "action-buttons" }, [
                !$setup.editMode ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 0,
                  onClick: $setup.startEdit,
                  class: "edit-btn"
                }, "编辑资料")) : vue.createCommentVNode("v-if", true),
                !$setup.editMode ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 1,
                  onClick: $setup.openPasswordModal,
                  class: "password-btn"
                }, "修改密码")) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 2,
                  class: "edit-controls"
                }, [
                  vue.createElementVNode("button", {
                    onClick: $setup.saveChanges,
                    class: "save-btn"
                  }, "保存"),
                  vue.createElementVNode("button", {
                    onClick: $setup.cancelEdit,
                    class: "cancel-btn"
                  }, "取消")
                ]))
              ]),
              vue.createElementVNode("button", {
                onClick: $setup.handleLogout,
                class: "logout-btn"
              }, "退出登录")
            ])
          ]))
        ]),
        $setup.showPasswordModal ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "password-modal"
        }, [
          vue.createElementVNode("view", { class: "modal-content" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "修改密码"),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("text", { class: "input-label" }, "原密码:"),
              vue.createElementVNode("input", {
                value: $setup.passwordForm.oldPassword,
                onInput: $setup.onOldPasswordInput,
                password: "",
                placeholder: "请输入原密码",
                class: "modal-input"
              }, null, 40, ["value"])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("text", { class: "input-label" }, "新密码:"),
              vue.createElementVNode("input", {
                value: $setup.passwordForm.newPassword,
                onInput: $setup.onNewPasswordInput,
                password: "",
                placeholder: "请输入新密码",
                class: "modal-input"
              }, null, 40, ["value"])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("text", { class: "input-label" }, "确认新密码:"),
              vue.createElementVNode("input", {
                value: $setup.passwordForm.confirmNewPassword,
                onInput: $setup.onConfirmPasswordInput,
                password: "",
                placeholder: "请再次输入新密码",
                onBlur: $setup.validateConfirmPassword,
                class: "modal-input"
              }, null, 40, ["value"]),
              $setup.confirmPasswordError ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "error-msg"
                },
                vue.toDisplayString($setup.confirmPasswordError),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("view", { class: "form-actions" }, [
              vue.createElementVNode("button", {
                onClick: $setup.handleChangePassword,
                disabled: !$setup.isPasswordFormValid,
                class: "modal-submit-btn"
              }, "修改密码", 8, ["disabled"]),
              vue.createElementVNode("button", {
                onClick: $setup.closePasswordModal,
                class: "modal-cancel-btn"
              }, "取消")
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const SrcPagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$e], ["__file", "D:/CODE/mobile-app/src/pages/profile/profile.vue"]]);
  const _sfc_main$d = {
    __name: "login",
    setup(__props, { expose: __expose }) {
      __expose();
      const email = vue.ref("");
      const password = vue.ref("");
      const userStore = useUserStore();
      const errors = vue.ref({
        email: "",
        password: ""
      });
      const onEmailInput = (event) => {
        email.value = event.detail.value;
        validateEmail();
      };
      const onPasswordInput = (event) => {
        password.value = event.detail.value;
        validatePassword();
      };
      const goToRegister = () => {
        formatAppLog("log", "at src/pages/login/login.vue:72", "goToRegister");
        uni.redirectTo({
          url: "/src/pages/register/register"
        });
      };
      const validateEmail = () => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value) {
          errors.value.email = "邮箱不能为空";
          return false;
        } else if (!re.test(email.value)) {
          errors.value.email = "邮箱格式不正确";
          return false;
        }
        errors.value.email = "";
        return true;
      };
      const validatePassword = () => {
        if (!password.value) {
          errors.value.password = "密码不能为空";
          return false;
        } else if (password.value.length < 6) {
          errors.value.password = "密码长度至少6位";
          return false;
        }
        errors.value.password = "";
        return true;
      };
      const handleLogin = async () => {
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        if (!isEmailValid || !isPasswordValid) {
          uni.showToast({
            title: "请检查输入信息",
            icon: "none"
          });
          return;
        }
        try {
          const data = await loginUser({
            email: email.value,
            password: password.value
          });
          userStore.loginSuccess(data);
          uni.reLaunch({
            url: "/src/pages/profile/profile"
          });
        } catch (e) {
          formatAppLog("error", "at src/pages/login/login.vue:132", e);
          uni.showToast({
            title: e.message || "登录失败",
            icon: "none"
          });
        }
      };
      const __returned__ = { email, password, userStore, errors, onEmailInput, onPasswordInput, goToRegister, validateEmail, validatePassword, handleLogin, ref: vue.ref, get loginUser() {
        return loginUser;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("view", { class: "login-card" }, [
        vue.createElementVNode("view", { class: "login-header" }, [
          vue.createElementVNode("text", { class: "title" }, "用户登录")
        ]),
        vue.createElementVNode("view", { class: "login-form" }, [
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("input", {
              class: "input-field",
              value: $setup.email,
              onInput: $setup.onEmailInput,
              placeholder: "请输入邮箱",
              type: "text"
            }, null, 40, ["value"]),
            $setup.errors.email ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.errors.email),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("input", {
              class: "input-field",
              value: $setup.password,
              onInput: $setup.onPasswordInput,
              password: "",
              placeholder: "请输入密码",
              type: "text"
            }, null, 40, ["value"]),
            $setup.errors.password ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.errors.password),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("button", {
            class: "login-btn",
            onClick: $setup.handleLogin
          }, "登录")
        ]),
        vue.createElementVNode("view", { class: "switch-container" }, [
          vue.createElementVNode("text", { class: "switch-text" }, "没有账号？"),
          vue.createElementVNode("text", {
            class: "switch-link",
            onClick: $setup.goToRegister
          }, "立即注册")
        ])
      ])
    ]);
  }
  const SrcPagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$d], ["__file", "D:/CODE/mobile-app/src/pages/login/login.vue"]]);
  const _sfc_main$c = {
    __name: "register",
    setup(__props, { expose: __expose }) {
      __expose();
      const username = vue.ref("");
      const email = vue.ref("");
      const phone = vue.ref("");
      const password = vue.ref("");
      const confirmPassword = vue.ref("");
      const errors = vue.ref({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      });
      const validateUsername = () => {
        if (!username.value) {
          errors.value.username = "用户名不能为空";
          return false;
        } else if (username.value.length < 5 || username.value.length > 50) {
          errors.value.username = "长度应在5-50个字符";
          return false;
        }
        errors.value.username = "";
        return true;
      };
      const validateEmail = () => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value) {
          errors.value.email = "邮箱不能为空";
          return false;
        } else if (!re.test(email.value)) {
          errors.value.email = "邮箱格式不正确";
          return false;
        }
        errors.value.email = "";
        return true;
      };
      const validatePhone = () => {
        if (!phone.value) {
          errors.value.phone = "手机号不能为空";
          return false;
        } else if (phone.value.length < 10 || phone.value.length > 20) {
          errors.value.phone = "电话长度应在10-20字符";
          return false;
        }
        errors.value.phone = "";
        return true;
      };
      const validatePassword = () => {
        const re = /^(?=.*[A-Za-z])(?=.*[0-9!@#$%^&*()_+\-=]).+$/;
        if (!password.value) {
          errors.value.password = "密码不能为空";
          return false;
        } else if (password.value.length < 8) {
          errors.value.password = "密码长度至少8位";
          return false;
        } else if (!re.test(password.value)) {
          errors.value.password = "密码必须包含字母和数字";
          return false;
        }
        errors.value.password = "";
        return true;
      };
      const validateConfirmPassword = () => {
        if (!confirmPassword.value) {
          errors.value.confirmPassword = "请再次输入密码";
          return false;
        } else if (confirmPassword.value !== password.value) {
          errors.value.confirmPassword = "两次输入不一致";
          return false;
        }
        errors.value.confirmPassword = "";
        return true;
      };
      const onUsernameInput = (event) => {
        username.value = event.detail.value;
        validateUsername();
      };
      const onEmailInput = (event) => {
        email.value = event.detail.value;
        validateEmail();
      };
      const onPhoneInput = (event) => {
        phone.value = event.detail.value;
        validatePhone();
      };
      const onPasswordInput = (event) => {
        password.value = event.detail.value;
        validatePassword();
      };
      const onConfirmPasswordInput = (event) => {
        confirmPassword.value = event.detail.value;
        validateConfirmPassword();
      };
      const handleRegister = async () => {
        const validations = [
          validateUsername(),
          validateEmail(),
          validatePhone(),
          validatePassword(),
          validateConfirmPassword()
        ];
        const isValid = validations.every((v) => v);
        if (!isValid) {
          uni.showToast({
            title: "请检查输入信息",
            icon: "none"
          });
          return;
        }
        try {
          await registerUser({
            username: username.value,
            email: email.value,
            phone: phone.value,
            password: password.value
          });
          uni.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            goToLogin();
          }, 1e3);
        } catch (e) {
          formatAppLog("error", "at src/pages/register/register.vue:235", e);
          uni.showToast({
            title: e.message || "注册失败",
            icon: "none"
          });
        }
      };
      const goToLogin = () => {
        uni.redirectTo({
          url: "/src/pages/login/login"
        });
      };
      const __returned__ = { username, email, phone, password, confirmPassword, errors, validateUsername, validateEmail, validatePhone, validatePassword, validateConfirmPassword, onUsernameInput, onEmailInput, onPhoneInput, onPasswordInput, onConfirmPasswordInput, handleRegister, goToLogin, ref: vue.ref, get registerUser() {
        return registerUser;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createElementVNode("view", { class: "register-card" }, [
        vue.createElementVNode("view", { class: "register-header" }, [
          vue.createElementVNode("text", { class: "title" }, "用户注册")
        ]),
        vue.createElementVNode("view", { class: "register-form" }, [
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("input", {
              class: "input-field",
              value: $setup.username,
              onInput: $setup.onUsernameInput,
              placeholder: "请输入用户名",
              type: "text"
            }, null, 40, ["value"]),
            $setup.errors.username ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.errors.username),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("input", {
              class: "input-field",
              value: $setup.email,
              onInput: $setup.onEmailInput,
              placeholder: "请输入邮箱",
              type: "text"
            }, null, 40, ["value"]),
            $setup.errors.email ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.errors.email),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("input", {
              class: "input-field",
              value: $setup.phone,
              onInput: $setup.onPhoneInput,
              placeholder: "请输入手机号",
              type: "text"
            }, null, 40, ["value"]),
            $setup.errors.phone ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.errors.phone),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("input", {
              class: "input-field",
              value: $setup.password,
              onInput: $setup.onPasswordInput,
              password: "",
              placeholder: "请输入密码",
              type: "text"
            }, null, 40, ["value"]),
            $setup.errors.password ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.errors.password),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("input", {
              class: "input-field",
              value: $setup.confirmPassword,
              onInput: $setup.onConfirmPasswordInput,
              password: "",
              placeholder: "请再次输入密码",
              type: "text"
            }, null, 40, ["value"]),
            $setup.errors.confirmPassword ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.errors.confirmPassword),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("button", {
            class: "register-btn",
            onClick: $setup.handleRegister
          }, "注册"),
          vue.createElementVNode("view", { class: "switch-container" }, [
            vue.createElementVNode("text", { class: "switch-text" }, "已有账号？"),
            vue.createElementVNode("text", {
              class: "switch-link",
              onClick: $setup.goToLogin
            }, "立即登录")
          ])
        ])
      ])
    ]);
  }
  const SrcPagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$c], ["__file", "D:/CODE/mobile-app/src/pages/register/register.vue"]]);
  const _sfc_main$b = {
    __name: "contactDetail",
    props: {
      targetUserId: {
        type: Number,
        required: true
      },
      targetUserName: {
        type: String,
        default: ""
      },
      targetAvatarUrl: {
        type: String,
        default: ""
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const defaultAvatar = vue.ref("/static/default-avatar.png");
      const messages = vue.ref([]);
      const inputText = vue.ref("");
      const isSending = vue.ref(false);
      const messagesContainer = vue.ref(null);
      const fileInputRef = vue.ref(null);
      const props = __props;
      const userStore = useUserStore();
      const currentUserInfo = vue.computed(() => ({
        userId: userStore.user.userId,
        username: userStore.user.userName,
        role: userStore.user.role
      }));
      const getUserDisplayName = (userId) => {
        if (userId === currentUserInfo.value.userId) {
          return userStore.user.userName;
        }
        return `${userId}`;
      };
      onLoad((options) => {
        if (options.targetUserName) {
          uni.setNavigationBarTitle({
            title: options.targetUserName
          });
        }
      });
      const loadConversation = async () => {
        try {
          const response = await getConversation(props.targetUserId);
          formatAppLog("log", "at src/pages/contact/contactDetail.vue:154", "对话记录:", response);
          let conversationData = [];
          if (response && typeof response === "object") {
            if (response.data && Array.isArray(response.data)) {
              conversationData = response.data;
            } else if (Array.isArray(response)) {
              conversationData = response;
            } else {
              formatAppLog("warn", "at src/pages/contact/contactDetail.vue:165", "API 返回数据格式不符合预期:", response);
              messages.value = [];
              return;
            }
          } else {
            formatAppLog("warn", "at src/pages/contact/contactDetail.vue:170", "API 返回数据格式错误:", response);
            messages.value = [];
            return;
          }
          messages.value = conversationData.map((msg) => ({
            ...msg,
            text: msg.content,
            type: msg.contentType,
            createdAt: msg.timestamp,
            senderName: getUserDisplayName(msg.senderId)
          }));
          await vue.nextTick();
          await scrollToBottom();
        } catch (error) {
          formatAppLog("error", "at src/pages/contact/contactDetail.vue:187", "获取对话失败:", error);
          if (error.response) {
            formatAppLog("error", "at src/pages/contact/contactDetail.vue:190", "服务器错误:", error.response.status, error.response.data);
          } else if (error.request) {
            formatAppLog("error", "at src/pages/contact/contactDetail.vue:192", "网络错误:", error.request);
          } else {
            formatAppLog("error", "at src/pages/contact/contactDetail.vue:194", "请求配置错误:", error.message);
          }
        }
      };
      const chooseChatImage = () => {
        if (isSending.value)
          return;
        uni.chooseImage({
          count: 1,
          sourceType: ["album", "camera"],
          success: async (res) => {
            const filePath = res.tempFilePaths[0];
            try {
              isSending.value = true;
              await sendImageMessage(props.targetUserId, filePath);
              await loadConversation();
            } catch (e) {
              uni.showToast({ title: "发送失败", icon: "none" });
            } finally {
              isSending.value = false;
            }
          }
        });
      };
      const getImageUrl = (url) => {
        if (!url)
          return "";
        return BASE_URL + url;
      };
      const scrollToBottom = async () => {
        await vue.nextTick();
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      };
      const sendTextMessageHandler = async () => {
        if (!inputText.value.trim() || isSending.value)
          return;
        isSending.value = true;
        try {
          const requestData = {
            text: inputText.value,
            receiverId: props.targetUserId
          };
          await sendTextMessage(requestData);
          inputText.value = "";
          await loadConversation();
        } catch (error) {
          formatAppLog("error", "at src/pages/contact/contactDetail.vue:252", "发送消息失败:", error);
          alert("发送消息失败，请稍后重试");
        } finally {
          isSending.value = false;
        }
      };
      const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file)
          return;
        isSending.value = true;
        try {
          await sendImageMessage(props.targetUserId, file);
          event.target.value = "";
          await loadConversation();
        } catch (error) {
          formatAppLog("error", "at src/pages/contact/contactDetail.vue:271", "发送图片失败:", error);
          alert("发送图片失败，请稍后重试");
        } finally {
          isSending.value = false;
        }
      };
      const formatTime = (timeString) => {
        if (!timeString)
          return "";
        const date = new Date(timeString);
        const today = /* @__PURE__ */ new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        if (isToday) {
          return `${hours}:${minutes}`;
        } else if (isYesterday) {
          return `昨天 ${hours}:${minutes}`;
        } else {
          return `${year}/${month}/${day} ${hours}:${minutes}`;
        }
      };
      vue.watch(() => props.targetUserId, async (newUserId, oldUserId) => {
        if (newUserId !== oldUserId && newUserId) {
          messages.value = [];
          await loadConversation();
        }
      }, { immediate: true });
      const previewImage = (imageUrl) => {
        if (imageUrl) {
          window.open(imageUrl, "_blank");
        }
      };
      vue.onMounted(() => {
        loadConversation();
      });
      const __returned__ = { defaultAvatar, messages, inputText, isSending, messagesContainer, fileInputRef, props, userStore, currentUserInfo, getUserDisplayName, loadConversation, chooseChatImage, getImageUrl, scrollToBottom, sendTextMessageHandler, handleImageUpload, formatTime, previewImage, ref: vue.ref, onMounted: vue.onMounted, nextTick: vue.nextTick, computed: vue.computed, watch: vue.watch, get getConversation() {
        return getConversation;
      }, get sendTextMessage() {
        return sendTextMessage;
      }, get sendImageMessage() {
        return sendImageMessage;
      }, get useUserStore() {
        return useUserStore;
      }, get BASE_URL() {
        return BASE_URL;
      }, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("div", { class: "chat-container" }, [
      vue.createElementVNode(
        "div",
        {
          class: "messages-container",
          ref: "messagesContainer"
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.messages, (message) => {
              return vue.openBlock(), vue.createElementBlock(
                "div",
                {
                  key: message.id,
                  class: vue.normalizeClass([
                    "message-bubble",
                    message.senderId === $setup.currentUserInfo.userId ? "sent" : "received"
                  ])
                },
                [
                  vue.createElementVNode("div", { class: "message-avatar" }, [
                    message.senderId === $setup.currentUserInfo.userId ? (vue.openBlock(), vue.createElementBlock("img", {
                      key: 0,
                      src: $setup.userStore.user.avatar_url ? $setup.BASE_URL + $setup.userStore.user.avatar_url : $setup.defaultAvatar,
                      alt: "用户头像",
                      class: "avatar-img"
                    }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("img", {
                      key: 1,
                      src: $props.targetAvatarUrl ? $setup.BASE_URL + $props.targetAvatarUrl : $setup.defaultAvatar,
                      alt: "联系人头像",
                      class: "avatar-img"
                    }, null, 8, ["src"]))
                  ]),
                  vue.createElementVNode("div", { class: "message-content-wrapper" }, [
                    vue.createElementVNode("div", { class: "message-content" }, [
                      message.type === "TEXT" || message.contentType === "TEXT" ? (vue.openBlock(), vue.createElementBlock(
                        "div",
                        {
                          key: 0,
                          class: "text-message"
                        },
                        vue.toDisplayString(message.text || message.content),
                        1
                        /* TEXT */
                      )) : message.type === "IMAGE" || message.contentType === "IMAGE" ? (vue.openBlock(), vue.createElementBlock("div", {
                        key: 1,
                        class: "image-message"
                      }, [
                        vue.createElementVNode("img", {
                          src: $setup.getImageUrl(message.imageUrl || message.content),
                          onClick: ($event) => $setup.previewImage($setup.getImageUrl(message.imageUrl || message.content)),
                          alt: "图片消息"
                        }, null, 8, ["src", "onClick"])
                      ])) : vue.createCommentVNode("v-if", true)
                    ]),
                    vue.createElementVNode(
                      "div",
                      { class: "message-time" },
                      vue.toDisplayString($setup.formatTime(message.createdAt || message.timestamp)),
                      1
                      /* TEXT */
                    )
                  ])
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        512
        /* NEED_PATCH */
      ),
      vue.createElementVNode("div", { class: "input-area" }, [
        vue.createElementVNode("div", { class: "input-actions" }, [
          vue.createElementVNode("button", {
            class: "action-btn",
            onClick: $setup.chooseChatImage
          }, " 📎 "),
          vue.createElementVNode(
            "input",
            {
              type: "file",
              ref: "fileInputRef",
              onChange: $setup.handleImageUpload,
              accept: "image/*",
              style: { "display": "none" }
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          )
        ]),
        vue.withDirectives(vue.createElementVNode("textarea", {
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.inputText = $event),
          placeholder: "输入消息...",
          onKeydown: vue.withKeys(vue.withModifiers($setup.sendTextMessageHandler, ["exact", "prevent"]), ["enter"]),
          class: "message-input",
          disabled: $setup.isSending
        }, null, 40, ["onKeydown", "disabled"]), [
          [vue.vModelText, $setup.inputText]
        ]),
        vue.createElementVNode("button", {
          onClick: $setup.sendTextMessageHandler,
          disabled: !$setup.inputText.trim() || $setup.isSending,
          class: vue.normalizeClass(["send-btn", { "enabled": $setup.inputText.trim() && !$setup.isSending }])
        }, [
          $setup.isSending ? (vue.openBlock(), vue.createElementBlock("span", { key: 0 }, "⏳")) : (vue.openBlock(), vue.createElementBlock("span", { key: 1 }, "📤"))
        ], 10, ["disabled"])
      ])
    ]);
  }
  const SrcPagesContactContactDetail = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__scopeId", "data-v-c8354b46"], ["__file", "D:/CODE/mobile-app/src/pages/contact/contactDetail.vue"]]);
  function getDesignerList(params = {}) {
    return request({
      url: "/designer/list",
      method: "get",
      params
    });
  }
  const useLayoutFormStore = defineStore("layoutForm", () => {
    const form = vue.reactive({
      houseId: null,
      layoutIntent: "KEEP_ORIGINAL",
      // 默认保留现有户型
      redesignNotes: "",
      images: [],
      // 每个 { file, url, key }
      designerId: ""
    });
    const errors = vue.reactive({
      layoutIntent: "",
      designerId: ""
    });
    const resetForm = () => {
      form.houseId = null;
      form.layoutIntent = "KEEP_ORIGINAL";
      form.redesignNotes = "";
      form.images = [];
      form.designerId = "";
      errors.layoutIntent = "";
      errors.designerId = "";
    };
    return {
      form,
      errors,
      resetForm
    };
  });
  function createLayoutDraft(data) {
    return request({
      url: "/house-layout/create-draft",
      method: "POST",
      data
    });
  }
  function createLayout(data) {
    return request({
      url: "/house-layout/create-layout",
      method: "POST",
      data
    });
  }
  function getLayoutsByHouse(houseId) {
    return request({
      url: `/house-layout/overview/${houseId}`,
      method: "GET"
    });
  }
  function deleteLayout(layoutId) {
    return request({
      url: `/house-layout/delete/${layoutId}`,
      method: "DELETE"
    });
  }
  function confirmLayoutRequest(layoutId) {
    return request({
      url: `/house-layout/${layoutId}/confirm`,
      method: "PUT"
    });
  }
  function uploadLayoutImage(layoutId, filePath) {
    return uploadRequest({
      url: `/house-layout-image/${layoutId}/create`,
      filePath,
      formData: {
        imageType: "STRUCTURE"
      }
    });
  }
  function getLayoutImages(layoutId) {
    return request({
      url: `/house-layout-image/${layoutId}/get`,
      method: "GET"
    });
  }
  function deleteLayoutImage(imageId) {
    return request({
      url: `/house-layout-image/${imageId}/delete`,
      method: "DELETE"
    });
  }
  const _sfc_main$a = {
    __name: "LayoutForm",
    props: {
      houseId: {
        type: Number,
        required: true
      }
    },
    emits: ["success"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const store = useLayoutFormStore();
      const form = store.form;
      const errors = store.errors;
      const isSubmitting = vue.ref(false);
      const step = vue.ref(1);
      const designers = vue.ref([]);
      const showDropdown = vue.ref(false);
      const layoutIntentOptions = [
        { text: "保留现有户型", value: "KEEP_ORIGINAL" },
        { text: "需要重新设计", value: "REDESIGN" }
      ];
      form.houseId = props.houseId;
      const selectedOptionText = vue.computed(() => {
        if (form.layoutIntent) {
          const option = layoutIntentOptions.find((opt) => opt.value === form.layoutIntent);
          return option ? option.text : "请选择布局意图";
        }
        return "请选择布局意图";
      });
      const totalSteps = vue.computed(() => form.layoutIntent === "REDESIGN" ? 3 : 2);
      const isLastStep = vue.computed(() => step.value === totalSteps.value);
      const toggleDropdown = () => {
        showDropdown.value = !showDropdown.value;
      };
      const selectItem = (value) => {
        form.layoutIntent = value;
        showDropdown.value = false;
        validateStep();
      };
      const handleCardClick = (event) => {
        setTimeout(() => {
          if (showDropdown.value)
            ;
        }, 0);
      };
      const handleCardClickOutside = (e) => {
        setTimeout(() => {
          if (showDropdown.value) {
            uni.createSelectorQuery().select(".custom-dropdown").boundingClientRect((rect) => {
            }).exec();
          }
        }, 50);
      };
      const validateStep = () => {
        if (step.value === 1 && !form.layoutIntent) {
          errors.layoutIntent = "请选择布局意图";
          return false;
        }
        errors.layoutIntent = "";
        if (step.value === 3 && !form.designerId) {
          errors.designerId = "请选择设计师";
          return false;
        }
        errors.designerId = "";
        return true;
      };
      const nextStep = async () => {
        if (!validateStep())
          return;
        if (step.value === 2 && form.layoutIntent === "REDESIGN" && designers.value.length === 0) {
          await loadDesigners();
        }
        step.value++;
      };
      const chooseImages = () => {
        var _a;
        uni.chooseImage({
          count: 9 - (((_a = form.images) == null ? void 0 : _a.length) || 0),
          // 剩余可选张数
          sourceType: ["album", "camera"],
          success: (res) => {
            if (!res.tempFilePaths || res.tempFilePaths.length === 0)
              return;
            form.images = form.images || [];
            res.tempFilePaths.forEach((filePath) => {
              const key = Date.now() + "_" + filePath.split("/").pop();
              form.images.push({
                key,
                url: filePath,
                file: { path: filePath }
                // 保存原始文件对象，方便之后上传
              });
            });
          },
          fail: (err) => {
            formatAppLog("error", "at src/components/LayoutForm.vue:242", "选择图片失败", err);
          }
        });
      };
      const removeImage = (index) => {
        form.images.splice(index, 1);
      };
      const selectDesigner = (designer) => {
        form.designerId = designer.userId;
        formatAppLog("log", "at src/components/LayoutForm.vue:256", "选择设计师:", designer);
      };
      const submitForm = async () => {
        var _a, _b;
        if (!validateStep())
          return;
        uni.showLoading({
          title: "提交中..."
        });
        try {
          let response;
          let layoutId;
          if (store.form.layoutIntent === "KEEP_ORIGINAL") {
            const layoutData = {
              houseId: store.form.houseId,
              layoutIntent: store.form.layoutIntent,
              redesignNotes: store.form.redesignNotes || null
            };
            response = await createLayout(layoutData);
            if (!response || typeof response !== "object") {
              throw new Error("API响应格式错误");
            }
            layoutId = response.layoutId || response.id || ((_a = response.data) == null ? void 0 : _a.layoutId);
            if (!layoutId) {
              throw new Error("未能获取到layoutId");
            }
            for (const img of store.form.images) {
              await uploadLayoutImage(layoutId, img.file.path);
            }
          } else if (store.form.layoutIntent === "REDESIGN") {
            const layoutData = {
              houseId: store.form.houseId,
              layoutIntent: store.form.layoutIntent,
              redesignNotes: store.form.redesignNotes || null,
              designerId: store.form.designerId
            };
            response = await createLayoutDraft(layoutData);
            if (!response || typeof response !== "object") {
              throw new Error("API响应格式错误");
            }
            layoutId = response.layoutId || response.id || ((_b = response.data) == null ? void 0 : _b.layoutId);
            if (!layoutId) {
              throw new Error("未能获取到layoutId");
            }
            for (const img of store.form.images) {
              await uploadLayoutImage(layoutId, img.file.path);
            }
          }
          uni.hideLoading();
          uni.showToast({
            title: "提交成功",
            icon: "success"
          });
          emit("success", { layoutId });
        } catch (err) {
          uni.hideLoading();
          formatAppLog("error", "at src/components/LayoutForm.vue:332", "提交失败", err);
          let errorMessage = "提交出错";
          if (err.message) {
            errorMessage = err.message;
          } else if (typeof err === "string") {
            errorMessage = err;
          }
          uni.showToast({
            title: errorMessage,
            icon: "error"
          });
        }
      };
      const loadDesigners = async () => {
        try {
          const data = await getDesignerList();
          designers.value = data.map((d) => ({
            userId: d.userId,
            name: d.name,
            avatar: BASE_URL + d.avatar,
            style: d.style,
            experienceYears: d.experienceYears,
            shortBio: d.shortBio,
            rating: d.rating,
            orderCount: d.orderCount
          }));
        } catch (err) {
          formatAppLog("error", "at src/components/LayoutForm.vue:365", err);
          uni.showToast({
            title: "加载设计师失败",
            icon: "error"
          });
        }
      };
      vue.onMounted(() => {
        if (form.layoutIntent === "REDESIGN") {
          loadDesigners();
        }
      });
      const __returned__ = { props, emit, store, form, errors, isSubmitting, step, designers, showDropdown, layoutIntentOptions, selectedOptionText, totalSteps, isLastStep, toggleDropdown, selectItem, handleCardClick, handleCardClickOutside, validateStep, nextStep, chooseImages, removeImage, selectDesigner, submitForm, loadDesigners, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get getDesignerList() {
        return getDesignerList;
      }, get useLayoutFormStore() {
        return useLayoutFormStore;
      }, get createLayout() {
        return createLayout;
      }, get createLayoutDraft() {
        return createLayoutDraft;
      }, get uploadLayoutImage() {
        return uploadLayoutImage;
      }, get BASE_URL() {
        return BASE_URL;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "layout-card",
      onClick: $setup.handleCardClickOutside
    }, [
      vue.withDirectives(vue.createElementVNode(
        "view",
        null,
        [
          vue.createElementVNode("view", { class: "input-row" }, [
            vue.createElementVNode("text", { class: "label" }, "布局意图"),
            vue.createElementVNode("view", { class: "input-col" }, [
              vue.createElementVNode("view", { class: "custom-dropdown" }, [
                vue.createElementVNode("view", {
                  class: "dropdown-header",
                  onClick: $setup.toggleDropdown
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($setup.selectedOptionText),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "arrow" },
                    vue.toDisplayString($setup.showDropdown ? "▲" : "▼"),
                    1
                    /* TEXT */
                  )
                ]),
                $setup.showDropdown ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "dropdown-list"
                }, [
                  (vue.openBlock(), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.layoutIntentOptions, (item, index) => {
                      return vue.createElementVNode("view", {
                        class: "dropdown-item",
                        key: index,
                        onClick: ($event) => $setup.selectItem(item.value)
                      }, vue.toDisplayString(item.text), 9, ["onClick"]);
                    }),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              $setup.errors.layoutIntent ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "error-text"
                },
                "× " + vue.toDisplayString($setup.errors.layoutIntent),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          $setup.form.layoutIntent === "REDESIGN" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "input-row",
            style: { "margin-top": "20rpx" }
          }, [
            vue.createElementVNode("text", {
              class: "label",
              style: { "padding-top": "20rpx" }
            }, "设计需求"),
            vue.createElementVNode("view", {
              class: "input-col",
              style: { "padding-top": "20rpx" }
            }, [
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.redesignNotes = $event),
                  placeholder: "简单描述你的设计需求（可选）",
                  maxlength: 200,
                  class: "textarea"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.form.redesignNotes]
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ],
        512
        /* NEED_PATCH */
      ), [
        [vue.vShow, $setup.step === 1]
      ]),
      vue.withDirectives(vue.createElementVNode(
        "view",
        null,
        [
          vue.createElementVNode("text", { class: "step-title" }, "上传图片"),
          vue.createElementVNode("view", { class: "upload-section" }, [
            vue.createElementVNode("button", {
              onClick: $setup.chooseImages,
              class: "upload-btn"
            }, "选择图片"),
            vue.createElementVNode("view", { class: "preview" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.form.images, (img, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: img.key,
                    class: "preview-item"
                  }, [
                    vue.createElementVNode("image", {
                      src: img.url,
                      mode: "aspectFill",
                      class: "preview-img"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("button", {
                      class: "remove-btn",
                      onClick: ($event) => $setup.removeImage(index),
                      type: "button"
                    }, " × ", 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ],
        512
        /* NEED_PATCH */
      ), [
        [vue.vShow, $setup.step === 2]
      ]),
      vue.withDirectives(vue.createElementVNode(
        "view",
        null,
        [
          vue.createElementVNode("text", { class: "step-title" }, "选择设计师"),
          vue.createElementVNode("view", { class: "designer-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.designers, (designer) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: designer.userId,
                  class: vue.normalizeClass(["designer-item", { "selected": $setup.form.designerId === designer.userId }]),
                  onClick: ($event) => $setup.selectDesigner(designer)
                }, [
                  vue.createElementVNode("image", {
                    src: designer.avatar,
                    class: "avatar"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "designer-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "name" },
                      vue.toDisplayString(designer.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "style" },
                      "风格: " + vue.toDisplayString(designer.style),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "experience" },
                      "经验: " + vue.toDisplayString(designer.experienceYears) + "年",
                      1
                      /* TEXT */
                    )
                  ])
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          $setup.errors.designerId ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            "× " + vue.toDisplayString($setup.errors.designerId),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ],
        512
        /* NEED_PATCH */
      ), [
        [vue.vShow, $setup.step === 3 && $setup.form.layoutIntent === "REDESIGN"]
      ]),
      vue.createElementVNode("view", { class: "form-footer" }, [
        !$setup.isLastStep ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          onClick: $setup.nextStep,
          class: "btn-primary"
        }, "下一步")) : (vue.openBlock(), vue.createElementBlock("button", {
          key: 1,
          onClick: $setup.submitForm,
          disabled: $setup.isSubmitting,
          class: "btn-primary",
          loading: $setup.isSubmitting
        }, vue.toDisplayString($setup.isSubmitting ? "提交中..." : "提交"), 9, ["disabled", "loading"]))
      ]),
      vue.createElementVNode("view", { class: "dots" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.totalSteps, (n) => {
            return vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: n,
                class: vue.normalizeClass(["dot", { "active": $setup.step === n }])
              },
              null,
              2
              /* CLASS */
            );
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]);
  }
  const LayoutForm = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__scopeId", "data-v-16bb0760"], ["__file", "D:/CODE/mobile-app/src/components/LayoutForm.vue"]]);
  const useLayoutImageStore = defineStore("layoutImage", {
    state: () => ({
      images: {}
    }),
    actions: {
      setImages(layoutId, images) {
        if (!layoutId || !Array.isArray(images)) {
          formatAppLog("warn", "at src/store/layoutImageStore.js:11", "Invalid parameters for setImages");
          return;
        }
        this.images[layoutId] = images;
      },
      addImage(layoutId, image) {
        if (!layoutId || !image) {
          formatAppLog("warn", "at src/store/layoutImageStore.js:19", "Invalid parameters for addImage");
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
  });
  function payDepositRequest(billId) {
    return request({
      url: `/bill/pay/deposit/${billId}`,
      method: "POST"
    });
  }
  function payFinalRequest(billId) {
    return request({
      url: `/bill/pay/final/${billId}`,
      method: "POST"
    });
  }
  function payFullRequest(billId) {
    return request({
      url: `/bill/pay/full/${billId}`,
      method: "POST"
    });
  }
  const _sfc_main$9 = {
    __name: "layout",
    setup(__props, { expose: __expose }) {
      __expose();
      const LAYOUT_INTENT_MAP = {
        KEEP_ORIGINAL: "保留现有户型",
        REDESIGN: "需要重新设计"
      };
      const LAYOUT_STATUS_MAP = {
        DRAFT: "草稿",
        SUBMITTED: "已提交",
        CONFIRMED: "已确认",
        ARCHIVED: "已封存"
      };
      const houseId = vue.ref(null);
      onLoad((query) => {
        if (query.houseId) {
          houseId.value = Number(query.houseId);
        }
      });
      const imageStore = useLayoutImageStore();
      const draftLayout = vue.ref(null);
      const designerLayouts = vue.ref([]);
      const keepOriginalLayout = vue.ref(null);
      const showLayoutDialog = vue.ref(false);
      const currentHouseId = vue.ref(houseId);
      const activeDropdownId = vue.ref(null);
      const showChatModal = vue.ref(false);
      const chatTargetUserId = vue.ref(null);
      const showImagePreview = vue.ref(false);
      const previewImageUrl = vue.ref("");
      const toggleDropdown = (layoutId) => {
        activeDropdownId.value = activeDropdownId.value === layoutId ? null : layoutId;
      };
      function resolveBillMeta(layout) {
        if (!layout.billId) {
          formatAppLog("error", "at src/pages/layout/layout.vue:277", "No bill meta data available");
          layout._billMeta = { visible: false };
          return;
        }
        const payStatus = layout.payStatus;
        formatAppLog("log", "at src/pages/layout/layout.vue:283", payStatus);
        layout._billMeta = {
          billId: layout.billId,
          payStatus,
          amount: layout.billAmount,
          depositAmount: layout.depositAmount,
          canPayDeposit: payStatus === "UNPAID",
          depositPaid: payStatus === "DEPOSIT_PAID"
        };
      }
      const payDeposit = async (billId) => {
        const res = await uni.showModal({
          title: "确认支付",
          content: "确认支付定金吗？支付后将进入设计阶段",
          confirmText: "确认支付",
          cancelText: "取消"
        });
        if (!res.confirm)
          return;
        try {
          await payDepositRequest(billId);
          uni.showToast({
            title: "定金支付成功",
            icon: "success"
          });
          await loadLayouts();
        } catch (e) {
          uni.showToast({
            title: "支付失败，请稍后重试",
            icon: "none"
          });
        }
      };
      const payFinal = async (billId) => {
        const res = await uni.showModal({
          title: "确认支付",
          content: "确认支付尾款吗？",
          confirmText: "确认支付",
          cancelText: "取消"
        });
        if (!res.confirm)
          return;
        try {
          await payFinalRequest(billId);
          uni.showToast({
            title: "尾款支付成功",
            icon: "success"
          });
          await loadLayouts();
        } catch (e) {
          uni.showToast({
            title: "支付失败，请稍后重试",
            icon: "none"
          });
        }
      };
      const openChatWithDesigner = () => {
        formatAppLog("log", "at src/pages/layout/layout.vue:347", "openChatWithDesigner");
        uni.navigateTo({
          url: `/src/pages/contact/contactDetail?targetUserId=${draftLayout.value.designerId}&targetUserName=${draftLayout.value.designerUsername}&targetAvatarUrl=${draftLayout.value.avatarUrl}`
        });
      };
      const closeChatModal = () => {
        showChatModal.value = false;
      };
      const loadLayouts = async () => {
        try {
          formatAppLog("log", "at src/pages/layout/layout.vue:361", houseId.value);
          const res = await getLayoutsByHouse(houseId.value);
          draftLayout.value = res.draftLayout ? {
            ...res.draftLayout,
            layoutVersion: res.draftLayout.version ?? 0
          } : null;
          if (draftLayout.value) {
            resolveBillMeta(draftLayout.value);
          }
          designerLayouts.value = (res.designerLayouts || []).map((l) => ({
            ...l,
            layoutVersion: l.version ?? 0
          }));
          keepOriginalLayout.value = res.keepOriginalLayout ? {
            ...res.keepOriginalLayout,
            layoutVersion: res.keepOriginalLayout.version ?? 0
          } : null;
          await loadAllLayoutImages();
        } catch (err) {
          draftLayout.value = null;
          designerLayouts.value = [];
          uni.showToast({
            title: "加载布局失败",
            icon: "none"
          });
        }
      };
      const loadAllLayoutImages = async () => {
        const ids = [];
        if (draftLayout.value) {
          ids.push(draftLayout.value.layoutId);
        }
        designerLayouts.value.forEach((l) => ids.push(l.layoutId));
        if (keepOriginalLayout.value) {
          ids.push(keepOriginalLayout.value.layoutId);
        }
        await Promise.all(ids.map(loadLayoutImages));
      };
      const loadLayoutImages = async (layoutId) => {
        const imgList = await getLayoutImages(layoutId);
        const formatted = await Promise.all(
          imgList.map((img) => {
            const fullUrl = BASE_URL + img.imageUrl;
            return { id: img.imageId, url: fullUrl };
          })
        );
        imageStore.setImages(layoutId, formatted);
      };
      const previewImage = (imgObj) => {
        uni.previewImage({
          urls: [imgObj.url]
        });
      };
      const closeImagePreview = () => {
        showImagePreview.value = false;
        if (previewImageUrl.value) {
          URL.revokeObjectURL(previewImageUrl.value);
          previewImageUrl.value = "";
        }
      };
      const openLayoutDialog = () => {
        if (draftLayout.value) {
          uni.showToast({
            title: "当前房屋已存在布局",
            icon: "none"
          });
          return;
        }
        showLayoutDialog.value = true;
      };
      const closeLayoutDialog = () => {
        showLayoutDialog.value = false;
      };
      const onLayoutCreated = async () => {
        showLayoutDialog.value = false;
        await loadLayouts();
      };
      const confirmDelete = async (layoutId) => {
        const res = await uni.showModal({
          title: "确认删除",
          content: "确定删除该布局？",
          confirmText: "确认删除",
          cancelText: "取消"
        });
        if (!res.confirm)
          return;
        await deleteLayout(layoutId);
        await loadLayouts();
        uni.showToast({
          title: "删除成功",
          icon: "success"
        });
      };
      const chooseImage = (layout, event) => {
        if (event)
          event.stopPropagation();
        if (layout.layoutStatus === "CONFIRMED" || layout.layoutStatus === "ARCHIVED") {
          uni.showToast({
            title: "当前布局不可编辑",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at src/pages/layout/layout.vue:496", "chooseImage", layout);
        uni.chooseImage({
          count: 1,
          sourceType: ["album", "camera"],
          success: async (res) => {
            if (!res.tempFilePaths || res.tempFilePaths.length === 0)
              return;
            const filePath = res.tempFilePaths[0];
            const layoutId = layout.layoutId;
            try {
              const uploadRes = await uploadLayoutImage(layoutId, filePath);
              const formatted = { id: uploadRes.imageId, url: BASE_URL + uploadRes.imageUrl };
              imageStore.addImage(layoutId, formatted);
              uni.showToast({
                title: "上传成功",
                icon: "success"
              });
              formatAppLog("log", "at src/pages/layout/layout.vue:519", "上传成功", uploadRes);
            } catch (error) {
              formatAppLog("error", "at src/pages/layout/layout.vue:521", "上传失败:", error);
              uni.showToast({
                title: typeof error === "string" ? error : (error == null ? void 0 : error.message) || "上传失败",
                icon: "none"
              });
            }
          }
        });
      };
      const removeImage = async (layout, keyOrId) => {
        var _a;
        if (layout.layoutStatus === "CONFIRMED" || layout.layoutStatus === "ARCHIVED") {
          uni.showToast({
            title: "当前布局不可编辑",
            icon: "none"
          });
          return;
        }
        const res = await uni.showModal({
          title: "确认删除",
          content: "确定要删除这张图片吗？",
          confirmText: "确认删除",
          cancelText: "取消"
        });
        if (!res.confirm)
          return;
        const layoutId = layout.layoutId;
        const target = (_a = imageStore.images[layoutId]) == null ? void 0 : _a.find(
          (i) => i.id === keyOrId || i.key === keyOrId
        );
        if (!target)
          return;
        try {
          if (target.id) {
            await deleteLayoutImage(target.id);
          }
          await loadLayouts();
          uni.showToast({
            title: "删除成功",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at src/pages/layout/layout.vue:571", "删除图片失败:", error);
          uni.showToast({
            title: "删除失败",
            icon: "none"
          });
        }
      };
      const goToFurnitureDesign = (layout) => {
        uni.navigateTo({
          url: `/src/pages/furniture/furniture?layoutId=${layout.confirmedLayoutId}`
        });
      };
      const confirmLayout = async (layout) => {
        if (layout.layoutStatus === "CONFIRMED" || layout.layoutStatus === "ARCHIVED") {
          uni.showToast({
            title: "不可再次确认",
            icon: "none"
          });
          return;
        }
        const res = await uni.showModal({
          title: "确认布局",
          content: "确认要使用此布局吗？",
          confirmText: "确认",
          cancelText: "取消"
        });
        if (!res.confirm)
          return;
        await confirmLayoutRequest(layout.layoutId);
        uni.showToast({
          title: "布局已确认",
          icon: "success"
        });
        await loadLayouts();
      };
      const onAvatarError = (e) => {
        formatAppLog("log", "at src/pages/layout/layout.vue:614", "头像加载失败", e);
      };
      vue.onMounted(loadLayouts);
      const __returned__ = { LAYOUT_INTENT_MAP, LAYOUT_STATUS_MAP, houseId, imageStore, draftLayout, designerLayouts, keepOriginalLayout, showLayoutDialog, currentHouseId, activeDropdownId, showChatModal, chatTargetUserId, showImagePreview, previewImageUrl, toggleDropdown, resolveBillMeta, payDeposit, payFinal, openChatWithDesigner, closeChatModal, loadLayouts, loadAllLayoutImages, loadLayoutImages, previewImage, closeImagePreview, openLayoutDialog, closeLayoutDialog, onLayoutCreated, confirmDelete, chooseImage, removeImage, goToFurnitureDesign, confirmLayout, onAvatarError, ref: vue.ref, onMounted: vue.onMounted, getCurrentInstance: vue.getCurrentInstance, LayoutForm, get getLayoutsByHouse() {
        return getLayoutsByHouse;
      }, get deleteLayout() {
        return deleteLayout;
      }, get confirmLayoutRequest() {
        return confirmLayoutRequest;
      }, get getLayoutImages() {
        return getLayoutImages;
      }, get uploadLayoutImage() {
        return uploadLayoutImage;
      }, get deleteLayoutImage() {
        return deleteLayoutImage;
      }, get useLayoutImageStore() {
        return useLayoutImageStore;
      }, get payDepositRequest() {
        return payDepositRequest;
      }, get payFinalRequest() {
        return payFinalRequest;
      }, get BASE_URL() {
        return BASE_URL;
      }, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    return vue.openBlock(), vue.createElementBlock("view", { class: "layouts-container" }, [
      vue.createElementVNode("view", { class: "layouts-content" }, [
        vue.createElementVNode("view", { class: "header" }, [
          vue.createElementVNode("text", { class: "title" }, "房屋布局"),
          vue.createElementVNode("button", {
            onClick: $setup.openLayoutDialog,
            class: "add-btn"
          }, "新增布局")
        ]),
        vue.createElementVNode("view", { class: "layout-and-rooms-container" }, [
          $setup.draftLayout ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "layout-item user-layout"
          }, [
            vue.createElementVNode("view", { class: "layout-header" }, [
              vue.createElementVNode("text", { class: "layout-title" }, [
                vue.createTextVNode(
                  " 布局意图：" + vue.toDisplayString($setup.LAYOUT_INTENT_MAP[$setup.draftLayout.layoutIntent]) + " ",
                  1
                  /* TEXT */
                ),
                $setup.draftLayout.version !== void 0 ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  { key: 0 },
                  " - V" + vue.toDisplayString($setup.draftLayout.version),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", {
                class: "actions-wrapper",
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.toggleDropdown($setup.draftLayout.layoutId))
              }, [
                vue.createElementVNode("text", { class: "dot-btn" }, "⋮"),
                $setup.activeDropdownId === $setup.draftLayout.layoutId ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "dropdown"
                }, [
                  vue.createElementVNode("button", {
                    onClick: _cache[0] || (_cache[0] = ($event) => $setup.confirmDelete($setup.draftLayout.layoutId))
                  }, "删除布局")
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            $setup.draftLayout.designerUsername ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "designer-info"
            }, [
              vue.createElementVNode(
                "text",
                { class: "info-text" },
                "设计师：" + vue.toDisplayString($setup.draftLayout.designerUsername) + "（" + vue.toDisplayString($setup.draftLayout.designerEmail) + "）",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "info-text" },
                "设计需求：" + vue.toDisplayString($setup.draftLayout.redesignNotes),
                1
                /* TEXT */
              ),
              $setup.draftLayout.designerId ? (vue.openBlock(), vue.createElementBlock("button", {
                key: 0,
                class: "chat-btn",
                onClick: $setup.openChatWithDesigner
              }, " 💬 联系设计师 ")) : vue.createCommentVNode("v-if", true)
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "images" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.imageStore.images[$setup.draftLayout.layoutId] || [], (img, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: img.id || img.key || index,
                    class: "image-wrapper"
                  }, [
                    vue.createElementVNode("image", {
                      src: img.url,
                      class: "image",
                      onClick: ($event) => $setup.previewImage(img)
                    }, null, 8, ["src", "onClick"]),
                    vue.createElementVNode("button", {
                      class: "delete-btn",
                      onClick: vue.withModifiers(($event) => $setup.removeImage($setup.draftLayout, img.id || img.key), ["stop"])
                    }, "×", 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createElementVNode("button", {
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.chooseImage($setup.draftLayout)),
              class: "file-btn"
            }, "新增图片"),
            vue.createElementVNode("view", { class: "bill-box" }, [
              vue.createElementVNode("text", { class: "bill-title" }, "💰 设计方案费用"),
              ((_a = $setup.draftLayout._billMeta) == null ? void 0 : _a.payStatus) === "UNPAID" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                vue.createElementVNode(
                  "text",
                  { class: "bill-text" },
                  "总价：¥" + vue.toDisplayString((_b = $setup.draftLayout._billMeta) == null ? void 0 : _b.amount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "bill-text" },
                  "定金：¥" + vue.toDisplayString((_c = $setup.draftLayout._billMeta) == null ? void 0 : _c.depositAmount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "bill-hint" }, "支付定金后，设计师将开始方案设计"),
                vue.createElementVNode("button", {
                  class: "btn",
                  onClick: _cache[3] || (_cache[3] = ($event) => {
                    var _a2;
                    return $setup.payDeposit((_a2 = $setup.draftLayout._billMeta) == null ? void 0 : _a2.billId);
                  })
                }, "支付定金")
              ])) : ((_d = $setup.draftLayout._billMeta) == null ? void 0 : _d.payStatus) === "DEPOSIT_PAID" && $setup.draftLayout.layoutStatus !== "ARCHIVED" ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
                vue.createElementVNode(
                  "text",
                  { class: "bill-text" },
                  "已支付定金：¥" + vue.toDisplayString((_e = $setup.draftLayout._billMeta) == null ? void 0 : _e.depositAmount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "bill-hint" }, "设计师正在出方案，确认方案后需支付尾款")
              ])) : ((_f = $setup.draftLayout._billMeta) == null ? void 0 : _f.payStatus) === "DEPOSIT_PAID" && $setup.draftLayout.layoutStatus === "ARCHIVED" ? (vue.openBlock(), vue.createElementBlock("view", { key: 2 }, [
                vue.createElementVNode(
                  "text",
                  { class: "bill-text" },
                  "总价：¥" + vue.toDisplayString((_g = $setup.draftLayout._billMeta) == null ? void 0 : _g.amount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "bill-text" },
                  "已付定金：¥" + vue.toDisplayString((_h = $setup.draftLayout._billMeta) == null ? void 0 : _h.depositAmount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "bill-text" },
                  "需支付尾款：¥" + vue.toDisplayString(((_i = $setup.draftLayout._billMeta) == null ? void 0 : _i.amount) - ((_j = $setup.draftLayout._billMeta) == null ? void 0 : _j.depositAmount)),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "bill-hint" }, "方案已确认，请支付尾款"),
                vue.createElementVNode("button", {
                  class: "btn",
                  onClick: _cache[4] || (_cache[4] = ($event) => {
                    var _a2;
                    return $setup.payFinal((_a2 = $setup.draftLayout._billMeta) == null ? void 0 : _a2.billId);
                  })
                }, "支付尾款")
              ])) : $setup.draftLayout._billMeta.payStatus === "PAID" ? (vue.openBlock(), vue.createElementBlock("view", { key: 3 }, [
                vue.createElementVNode(
                  "text",
                  { class: "bill-text" },
                  "总价：¥" + vue.toDisplayString($setup.draftLayout._billMeta.amount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "bill-hint success" }, " ✅ 费用已全部结清\\n已完成房屋结构设计 "),
                vue.createElementVNode("button", {
                  class: "btn",
                  onClick: _cache[5] || (_cache[5] = ($event) => $setup.goToFurnitureDesign($setup.draftLayout))
                }, "前往家具设计")
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.designerLayouts.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "designer-layouts-wrapper"
          }, [
            vue.createElementVNode("text", { class: "section-title" }, "设计师方案"),
            vue.createElementVNode("view", { class: "designer-layouts-grid" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.designerLayouts, (layout) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: layout.layoutId,
                    class: "layout-item designer-layout"
                  }, [
                    vue.createElementVNode("view", { class: "layout-header" }, [
                      vue.createElementVNode("text", { class: "layout-title" }, [
                        vue.createTextVNode(
                          " 布局意图：" + vue.toDisplayString($setup.LAYOUT_INTENT_MAP[layout.layoutIntent]) + " ",
                          1
                          /* TEXT */
                        ),
                        layout.version !== void 0 ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          { key: 0 },
                          " - V" + vue.toDisplayString(layout.version),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ])
                    ]),
                    layout.redesignNotes ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 0,
                        class: "info-text"
                      },
                      "设计需求：" + vue.toDisplayString(layout.redesignNotes),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode(
                      "text",
                      { class: "info-text" },
                      "状态：" + vue.toDisplayString($setup.LAYOUT_STATUS_MAP[layout.layoutStatus]),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "images" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.imageStore.images[layout.layoutId] || [], (img, index) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: img.id || img.key || index,
                            class: "image-wrapper"
                          }, [
                            vue.createElementVNode("image", {
                              src: img.url,
                              onError: _cache[6] || (_cache[6] = (...args) => _ctx.onImageError && _ctx.onImageError(...args)),
                              class: "image",
                              onClick: ($event) => $setup.previewImage(img)
                            }, null, 40, ["src", "onClick"])
                          ]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    vue.createElementVNode("button", {
                      onClick: ($event) => $setup.confirmLayout(layout),
                      class: "btn"
                    }, "确认布局", 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.keepOriginalLayout ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "layout-item user-layout"
          }, [
            vue.createElementVNode("view", { class: "layout-header" }, [
              vue.createElementVNode("text", { class: "layout-title" }, [
                vue.createTextVNode(
                  " 布局意图：" + vue.toDisplayString($setup.LAYOUT_INTENT_MAP[$setup.keepOriginalLayout.layoutIntent]) + " ",
                  1
                  /* TEXT */
                ),
                $setup.keepOriginalLayout.version !== void 0 ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  { key: 0 },
                  " - V" + vue.toDisplayString($setup.keepOriginalLayout.version),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", {
                class: "actions-wrapper",
                onClick: _cache[8] || (_cache[8] = ($event) => $setup.toggleDropdown($setup.keepOriginalLayout.layoutId))
              }, [
                vue.createElementVNode("text", { class: "dot-btn" }, "⋮"),
                $setup.activeDropdownId === $setup.keepOriginalLayout.layoutId ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "dropdown"
                }, [
                  vue.createElementVNode("button", {
                    onClick: _cache[7] || (_cache[7] = ($event) => $setup.confirmDelete($setup.keepOriginalLayout.layoutId))
                  }, "删除布局")
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createElementVNode(
              "text",
              { class: "info-text" },
              "状态：" + vue.toDisplayString($setup.LAYOUT_STATUS_MAP[$setup.keepOriginalLayout.layoutStatus]),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "images" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.imageStore.images[$setup.keepOriginalLayout.layoutId] || [], (img, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: img.id || img.key || index,
                    class: "image-wrapper"
                  }, [
                    vue.createElementVNode("image", {
                      src: img.url,
                      class: "image",
                      onClick: ($event) => $setup.previewImage(img.url),
                      mode: "aspectFill"
                    }, null, 8, ["src", "onClick"]),
                    vue.createElementVNode("button", {
                      class: "delete-btn",
                      onClick: vue.withModifiers(($event) => $setup.removeImage($setup.keepOriginalLayout, img.id || img.key), ["stop"])
                    }, "×", 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createElementVNode("button", {
              onClick: _cache[9] || (_cache[9] = ($event) => $setup.chooseImage($setup.keepOriginalLayout)),
              class: "file-btn"
            }, "新增图片"),
            vue.createElementVNode("button", {
              onClick: _cache[10] || (_cache[10] = ($event) => $setup.confirmLayout($setup.keepOriginalLayout)),
              class: "btn"
            }, "确认布局")
          ])) : vue.createCommentVNode("v-if", true),
          !$setup.draftLayout && $setup.designerLayouts.length === 0 && !$setup.keepOriginalLayout ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 3,
            class: "no-layout"
          }, " 还没有布局信息，快去新增吧～ ")) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      $setup.showLayoutDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "overlay",
        onClick: $setup.closeLayoutDialog
      }, [
        vue.createElementVNode("view", {
          class: "modal",
          onClick: _cache[11] || (_cache[11] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", null, "布局设计"),
            vue.createElementVNode("text", {
              class: "close",
              onClick: $setup.closeLayoutDialog
            }, "×")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.createVNode($setup["LayoutForm"], {
              houseId: $setup.currentHouseId,
              onSuccess: $setup.onLayoutCreated
            }, null, 8, ["houseId"])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showImagePreview ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "overlay image-preview-overlay",
        onClick: $setup.closeImagePreview
      }, [
        vue.createElementVNode("view", {
          class: "modal",
          onClick: _cache[12] || (_cache[12] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("image", {
            src: $setup.previewImageUrl,
            class: "preview-image"
          }, null, 8, ["src"])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const SrcPagesLayoutLayout = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9], ["__file", "D:/CODE/mobile-app/src/pages/layout/layout.vue"]]);
  const scriptRel = "modulepreload";
  const assetsURL = function(dep) {
    return "/" + dep;
  };
  const seen = {};
  const __vitePreload = function preload(baseModule, deps, importerUrl) {
    let promise = Promise.resolve();
    if (false) {
      const links = document.getElementsByTagName("link");
      const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
      const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
      promise = Promise.all(deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen)
          return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        const isBaseRelative = !!importerUrl;
        if (isBaseRelative) {
          for (let i = links.length - 1; i >= 0; i--) {
            const link2 = links[i];
            if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
              return;
            }
          }
        } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
          link.crossOrigin = "";
        }
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
          });
        }
      }));
    }
    return promise.then(() => baseModule()).catch((err) => {
      const e = new Event("vite:preloadError", { cancelable: true });
      e.payload = err;
      window.dispatchEvent(e);
      if (!e.defaultPrevented) {
        throw err;
      }
    });
  };
  const _sfc_main$8 = {
    __name: "DesignerSelector",
    props: {
      designers: { type: Array, default: () => [] },
      modelValue: { type: [String, Number], default: null }
    },
    emits: ["update:modelValue", "select"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit = __emit;
      const selectDesigner = (designer) => {
        emit("update:modelValue", designer.userId);
        emit("select", designer);
      };
      const __returned__ = { emit, selectDesigner, get BASE_URL() {
        return BASE_URL;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "designer-list" }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($props.designers, (designer) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            key: designer.userId,
            class: vue.normalizeClass(["designer-item", { selected: designer.userId === $props.modelValue }]),
            onClick: ($event) => $setup.selectDesigner(designer)
          }, [
            vue.createElementVNode("image", {
              src: $setup.BASE_URL + designer.avatar,
              class: "avatar",
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "info" }, [
              vue.createElementVNode("view", { class: "top-row" }, [
                vue.createElementVNode(
                  "view",
                  { class: "name" },
                  vue.toDisplayString(designer.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "rating-orders" },
                  " ⭐ " + vue.toDisplayString(designer.rating) + " | 接单: " + vue.toDisplayString(designer.orderCount),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode(
                "view",
                { class: "style" },
                "风格: " + vue.toDisplayString(designer.style),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "experience" },
                "经验: " + vue.toDisplayString(designer.experienceYears) + " 年",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "bio" },
                vue.toDisplayString(designer.shortBio),
                1
                /* TEXT */
              )
            ]),
            designer.userId === $props.modelValue ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "check"
            }, "✔")) : vue.createCommentVNode("v-if", true)
          ], 10, ["onClick"]);
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ]);
  }
  const DesignerSelector = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__scopeId", "data-v-23bd4fad"], ["__file", "D:/CODE/mobile-app/src/components/DesignerSelector.vue"]]);
  const DesignerSelector$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: DesignerSelector
  }, Symbol.toStringTag, { value: "Module" }));
  function getUserFurnitureLayoutById(layoutId) {
    return request({
      url: `/house-layout/user/furniture/${layoutId}`,
      method: "GET"
    });
  }
  function assignFurnitureDesigner(layoutId, designerId) {
    return request({
      url: `/house-layout/${layoutId}/confirm/furnitureDesigner`,
      method: "PUT",
      data: {
        furnitureDesignerId: designerId
      }
    });
  }
  function getRoomsByLayout(layoutId) {
    return request({
      url: `/room/${layoutId}/get-all`,
      method: "GET"
    });
  }
  function getSchemesByRoom(roomId) {
    return request({
      url: `/furniture-scheme/${roomId}/get-all`,
      method: "GET"
    });
  }
  function confirmFurnitureScheme(schemeId) {
    return request({
      url: `/furniture-scheme/${schemeId}/confirm`,
      method: "PUT"
    });
  }
  const _sfc_main$7 = {
    __name: "furniture",
    setup(__props, { expose: __expose }) {
      __expose();
      const showChatModal = vue.ref(false);
      const chatTargetUserId = vue.ref(null);
      const layoutId = vue.ref(null);
      onLoad((query) => {
        if (query.layoutId) {
          layoutId.value = Number(query.layoutId);
        }
      });
      const layoutDetail = vue.ref(null);
      const layoutImages = vue.ref([]);
      const designers = vue.ref([]);
      const selectedDesignerId = vue.ref(null);
      const showDesignerDialog = vue.ref(false);
      const rooms = vue.ref([]);
      const designer = vue.ref(null);
      const showImagePreview = vue.ref(false);
      const previewImageUrl = vue.ref("");
      const showPreview = vue.ref(false);
      const previewUrl = vue.ref(null);
      const showSchemeModal = vue.ref(false);
      const currentRoomSchemes = vue.ref([]);
      const currentRoom = vue.ref(null);
      const loadLayoutDetail = async () => {
        try {
          const res = await getUserFurnitureLayoutById(layoutId.value);
          layoutDetail.value = res;
          if (layoutDetail.value) {
            formatAppLog("log", "at src/pages/furniture/furniture.vue:276", res);
          } else {
            formatAppLog("log", "at src/pages/furniture/furniture.vue:278", "没有数据");
          }
          if (!res.furnitureDesignerId) {
            await loadDesigners();
          } else {
            selectedDesignerId.value = res.furnitureDesignerId;
          }
          if (res.furnitureDesignerId) {
            await loadRooms();
          }
          if (res.furnitureDesignerId) {
            designer.value = {
              id: res.furnitureDesignerId,
              username: res.designerUsername,
              email: res.designerEmail,
              avatar: res.designerAvatar
            };
          }
          await loadAllLayoutImages();
        } catch (error) {
          uni.showToast({
            title: "加载布局详情失败",
            icon: "none"
          });
          formatAppLog("error", "at src/pages/furniture/furniture.vue:308", error);
        }
      };
      const loadRooms = async () => {
        try {
          const res = await getRoomsByLayout(layoutId.value);
          rooms.value = res;
        } catch (error) {
          uni.showToast({
            title: "加载房间信息失败",
            icon: "none"
          });
          formatAppLog("error", "at src/pages/furniture/furniture.vue:322", error);
        }
      };
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
      };
      const loadDesigners = async () => {
        try {
          const res = await getDesignerList();
          designers.value = res.map((d) => ({
            userId: d.userId,
            name: d.name,
            avatar: d.avatar,
            rating: d.rating,
            orderCount: d.orderCount,
            style: d.style,
            experienceYears: d.experienceYears,
            shortBio: d.shortBio
          }));
        } catch (error) {
          uni.showToast({
            title: "加载设计师列表失败",
            icon: "none"
          });
          formatAppLog("error", "at src/pages/furniture/furniture.vue:358", error);
        }
      };
      const openChatWithDesigner = () => {
        formatAppLog("log", "at src/pages/furniture/furniture.vue:364", "openChatWithDesigner");
        uni.navigateTo({
          url: `/src/pages/contact/contactDetail?targetUserId=${designer.value.id}
    &targetUserName=${designer.value.username}&targetAvatarUrl=${designer.value.avatar}`
        });
      };
      const closeChatModal = () => {
        showChatModal.value = false;
      };
      const loadLayoutImages = async (layoutId2) => {
        try {
          const imgList = await getLayoutImages(layoutId2);
          const formatted = imgList.map((img) => ({
            id: img.imageId,
            url: BASE_URL + img.imageUrl
          }));
          layoutImages.value = formatted;
        } catch (error) {
          formatAppLog("error", "at src/pages/furniture/furniture.vue:388", "加载布局图片失败:", error);
        }
      };
      const loadAllLayoutImages = async () => {
        if (layoutDetail.value) {
          await loadLayoutImages(layoutDetail.value.layoutId);
        }
      };
      const previewImage = (imgObj) => {
        uni.previewImage({
          urls: [imgObj.url]
        });
      };
      const onImageError = (e) => {
        formatAppLog("error", "at src/pages/furniture/furniture.vue:408", "Image load error:", e);
      };
      const onImageLoad = (e) => {
        formatAppLog("log", "at src/pages/furniture/furniture.vue:412", "Image loaded successfully:", e);
      };
      const viewSchemes = async (room) => {
        try {
          const schemes = await getSchemesByRoom(room.roomId);
          currentRoomSchemes.value = schemes;
          currentRoom.value = room;
          showSchemeModal.value = true;
        } catch (error) {
          uni.showToast({
            title: "加载方案失败",
            icon: "none"
          });
          formatAppLog("error", "at src/pages/furniture/furniture.vue:428", error);
        }
      };
      const closeSchemeModal = () => {
        showSchemeModal.value = false;
        currentRoomSchemes.value = [];
        currentRoom.value = null;
      };
      const previewImageFromCache = (scheme) => {
        const imageUrl = BASE_URL + scheme.imageUrl;
        uni.previewImage({
          urls: [imageUrl]
        });
      };
      const getRoomStatus = (room) => {
        if (room.hasConfirmedScheme) {
          return { text: "已确定", class: "confirmed" };
        } else if (room.hasFurnitureScheme) {
          return { text: "有方案", class: "has-scheme" };
        } else {
          return { text: "无方案", class: "no-scheme" };
        }
      };
      const handleSelectDesigner = async (designer2) => {
        try {
          await assignFurnitureDesigner(layoutId.value, designer2.userId);
          selectedDesignerId.value = designer2.userId;
          layoutDetail.value.furnitureDesignerId = designer2.userId;
          uni.showToast({
            title: `已成功选择${designer2.name}`,
            icon: "success"
          });
          closeDesignerDialog();
          await loadLayoutDetail();
        } catch (error) {
          uni.showToast({
            title: "分配设计师失败",
            icon: "none"
          });
          formatAppLog("error", "at src/pages/furniture/furniture.vue:484", error);
        }
      };
      const payDeposit = async (billId) => {
        uni.showModal({
          title: "确认支付",
          content: "确认支付定金吗？支付后将进入家具设计阶段",
          success: (res) => {
            if (res.confirm) {
              performPayDeposit(billId);
            }
          }
        });
      };
      const performPayDeposit = async (billId) => {
        try {
          await payDepositRequest(billId);
          uni.showToast({
            title: "定金支付成功",
            icon: "success"
          });
          await loadLayoutDetail();
        } catch (e) {
          uni.showToast({
            title: "支付失败，请稍后重试",
            icon: "none"
          });
        }
      };
      const payFinalAmount = async (billId) => {
        uni.showModal({
          title: "确认支付",
          content: "确认支付尾款吗？支付后家具设计环节将完成",
          success: (res) => {
            if (res.confirm) {
              performPayFinalAmount(billId);
            }
          }
        });
      };
      const performPayFinalAmount = async (billId) => {
        try {
          await payFinalRequest(billId);
          uni.showToast({
            title: "尾款支付成功",
            icon: "success"
          });
          await loadLayoutDetail();
        } catch (e) {
          uni.showToast({
            title: "支付失败，请稍后重试",
            icon: "none"
          });
        }
      };
      const openDesignerDialog = () => {
        showDesignerDialog.value = true;
      };
      const closeDesignerDialog = () => {
        showDesignerDialog.value = false;
      };
      const confirmScheme = async (schemeId) => {
        uni.showModal({
          title: "确认方案",
          content: "确认此方案吗？确认后将不能再修改",
          success: (res) => {
            if (res.confirm) {
              performConfirmScheme(schemeId);
            }
          }
        });
      };
      const performConfirmScheme = async (schemeId) => {
        try {
          await confirmFurnitureScheme(schemeId);
          uni.showToast({
            title: "方案确认成功",
            icon: "success"
          });
          closeSchemeModal();
          await loadLayoutDetail();
        } catch (error) {
          uni.showToast({
            title: "确认失败",
            icon: "none"
          });
          formatAppLog("error", "at src/pages/furniture/furniture.vue:583", error);
        }
      };
      const closeImagePreview = () => {
        showImagePreview.value = false;
        if (previewImageUrl.value) {
          URL.revokeObjectURL(previewImageUrl.value);
          previewImageUrl.value = "";
        }
      };
      const closePreview = () => {
        showPreview.value = false;
        if (previewUrl.value) {
          URL.revokeObjectURL(previewUrl.value);
          previewUrl.value = "";
        }
      };
      vue.onMounted(() => {
        loadLayoutDetail();
      });
      const components = {
        DesignerSelector: vue.defineAsyncComponent(() => __vitePreload(() => Promise.resolve().then(() => DesignerSelector$1), false ? "__VITE_PRELOAD__" : void 0))
      };
      const __returned__ = { showChatModal, chatTargetUserId, layoutId, layoutDetail, layoutImages, designers, selectedDesignerId, showDesignerDialog, rooms, designer, showImagePreview, previewImageUrl, showPreview, previewUrl, showSchemeModal, currentRoomSchemes, currentRoom, loadLayoutDetail, loadRooms, formatDate, loadDesigners, openChatWithDesigner, closeChatModal, loadLayoutImages, loadAllLayoutImages, previewImage, onImageError, onImageLoad, viewSchemes, closeSchemeModal, previewImageFromCache, getRoomStatus, handleSelectDesigner, payDeposit, performPayDeposit, payFinalAmount, performPayFinalAmount, openDesignerDialog, closeDesignerDialog, confirmScheme, performConfirmScheme, closeImagePreview, closePreview, components, ref: vue.ref, onMounted: vue.onMounted, DesignerSelector, get getLayoutImages() {
        return getLayoutImages;
      }, get getDesignerList() {
        return getDesignerList;
      }, get payDepositRequest() {
        return payDepositRequest;
      }, get payFinalRequest() {
        return payFinalRequest;
      }, get BASE_URL() {
        return BASE_URL;
      }, get onLoad() {
        return onLoad;
      }, get assignFurnitureDesigner() {
        return assignFurnitureDesigner;
      }, get confirmFurnitureScheme() {
        return confirmFurnitureScheme;
      }, get getUserFurnitureLayoutById() {
        return getUserFurnitureLayoutById;
      }, get getRoomsByLayout() {
        return getRoomsByLayout;
      }, get getSchemesByRoom() {
        return getSchemesByRoom;
      }, defineAsyncComponent: vue.defineAsyncComponent };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "furniture-design-container" }, [
        vue.createElementVNode("view", { class: "furniture-design-content" }, [
          vue.createElementVNode("view", { class: "header" }, [
            vue.createElementVNode("text", { class: "title" }, "家具设计")
          ]),
          vue.createElementVNode("view", { class: "layout-and-rooms-container" }, [
            $setup.layoutDetail ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "layout-item user-layout"
            }, [
              vue.createElementVNode("view", { class: "layout-header" }, [
                vue.createElementVNode("text", { class: "subtitle" }, "家具设计方案")
              ]),
              $setup.layoutImages.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "images"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.layoutImages, (img, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: img.id ?? img.key ?? index,
                      class: "image-wrapper"
                    }, [
                      vue.createElementVNode("image", {
                        src: img.url,
                        class: "image",
                        onClick: ($event) => $setup.previewImage(img)
                      }, null, 8, ["src", "onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.createCommentVNode("v-if", true),
              $setup.layoutDetail.furnitureDesignerId ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "designer-info"
              }, [
                $setup.layoutDetail.furnitureDesignerId ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "designer-info"
                }, [
                  vue.createElementVNode("view", { class: "designer-info-content" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "designer-text" },
                      "设计师：" + vue.toDisplayString($setup.layoutDetail.designerUsername) + "（" + vue.toDisplayString($setup.layoutDetail.designerEmail) + "）",
                      1
                      /* TEXT */
                    )
                  ]),
                  $setup.layoutDetail.furnitureDesignerId ? (vue.openBlock(), vue.createElementBlock("button", {
                    key: 0,
                    class: "chat-btn",
                    onClick: $setup.openChatWithDesigner
                  }, " 💬 联系设计师 ")) : vue.createCommentVNode("v-if", true)
                ])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("text", { class: "status" }, "状态：设计师正在为您准备家具设计方案"),
                vue.createElementVNode("view", { class: "bill-box" }, [
                  vue.createElementVNode("text", { class: "bill-title" }, "💰 家具设计方案费用"),
                  $setup.layoutDetail.payStatus === "UNPAID" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                    vue.createElementVNode(
                      "text",
                      { class: "bill-text" },
                      "总价：¥" + vue.toDisplayString($setup.layoutDetail.billAmount),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "bill-text" },
                      "定金：¥" + vue.toDisplayString($setup.layoutDetail.depositAmount),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "bill-hint" }, "支付定金后，设计师将开始家具方案设计"),
                    vue.createElementVNode("button", {
                      class: "btn",
                      onClick: _cache[0] || (_cache[0] = ($event) => $setup.payDeposit($setup.layoutDetail.billId))
                    }, "支付定金")
                  ])) : $setup.layoutDetail.payStatus === "DEPOSIT_PAID" ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
                    vue.createElementVNode(
                      "text",
                      { class: "bill-text" },
                      "已支付定金：¥" + vue.toDisplayString($setup.layoutDetail.depositAmount),
                      1
                      /* TEXT */
                    ),
                    $setup.layoutDetail.furnitureStatus === "CONFIRMED" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                      vue.createElementVNode("text", { class: "bill-hint" }, "✅ 所有方案已确认，可支付尾款"),
                      vue.createElementVNode("button", {
                        class: "btn btn-primary",
                        onClick: _cache[1] || (_cache[1] = ($event) => $setup.payFinalAmount($setup.layoutDetail.billId))
                      }, "支付尾款")
                    ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
                      vue.createElementVNode("text", { class: "bill-hint" }, "设计师正在出方案，确认所有方案后需支付尾款")
                    ]))
                  ])) : $setup.layoutDetail.payStatus === "PAID" ? (vue.openBlock(), vue.createElementBlock("view", { key: 2 }, [
                    vue.createElementVNode(
                      "text",
                      { class: "bill-text" },
                      "总价：¥" + vue.toDisplayString($setup.layoutDetail.billAmount),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "bill-hint success" }, " ✅ 费用已全部结清 已完成家具方案设计 ")
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "no-designer-info"
              }, [
                vue.createElementVNode("text", { class: "warning-text" }, "⚠️ 尚未选择家具设计师"),
                vue.createElementVNode("button", {
                  class: "select-designer-btn",
                  onClick: $setup.openDesignerDialog
                }, " 选择设计师 ")
              ]))
            ])) : vue.createCommentVNode("v-if", true),
            $setup.rooms.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "rooms-container"
            }, [
              vue.createElementVNode("text", { class: "subtitle" }, "房间信息"),
              vue.createElementVNode("view", { class: "room-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.rooms, (room) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: room.roomId,
                      class: "room-item"
                    }, [
                      vue.createElementVNode("view", { class: "room-header" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "room-name" },
                          vue.toDisplayString(room.roomName) + " (" + vue.toDisplayString(room.roomType) + ")",
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          {
                            class: vue.normalizeClass(["room-status", $setup.getRoomStatus(room).class])
                          },
                          vue.toDisplayString($setup.getRoomStatus(room).text),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "room-details" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "room-detail" },
                          "面积：" + vue.toDisplayString(room.area) + "㎡",
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "room-detail" },
                          "楼层：" + vue.toDisplayString(room.floorNo),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "room-detail" },
                          "窗户：" + vue.toDisplayString(room.hasWindow ? "有" : "无"),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "room-detail" },
                          "阳台：" + vue.toDisplayString(room.hasBalcony ? "有" : "无"),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "detail-row" }, [
                          room.hasFurnitureScheme ? (vue.openBlock(), vue.createElementBlock("button", {
                            key: 0,
                            class: "view-scheme-btn",
                            onClick: ($event) => $setup.viewSchemes(room)
                          }, "查看方案", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                        ])
                      ])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : vue.createCommentVNode("v-if", true),
            !$setup.layoutDetail ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 2,
              class: "no-layout"
            }, " 还没有家具设计信息 ")) : vue.createCommentVNode("v-if", true)
          ]),
          $setup.showDesignerDialog ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "overlay",
            onClick: $setup.closeDesignerDialog
          }, [
            vue.createElementVNode("view", {
              class: "modal",
              onClick: _cache[3] || (_cache[3] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode("text", null, "选择家具设计师"),
                vue.createElementVNode("text", {
                  class: "close",
                  onClick: $setup.closeDesignerDialog
                }, "×")
              ]),
              vue.createElementVNode("view", { class: "modal-body" }, [
                vue.createVNode($setup["DesignerSelector"], {
                  designers: $setup.designers,
                  modelValue: $setup.selectedDesignerId,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.selectedDesignerId = $event),
                  onSelect: $setup.handleSelectDesigner
                }, null, 8, ["designers", "modelValue"])
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.showImagePreview ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "overlay image-preview-overlay",
            onClick: $setup.closeImagePreview
          }, [
            vue.createElementVNode("view", {
              class: "modal",
              onClick: _cache[4] || (_cache[4] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("image", {
                src: $setup.previewImageUrl,
                class: "preview-image"
              }, null, 8, ["src"])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.showPreview ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "overlay",
            onClick: $setup.closePreview
          }, [
            vue.createElementVNode("view", {
              class: "modal",
              onClick: _cache[5] || (_cache[5] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("image", {
                src: $setup.previewUrl,
                class: "preview-image"
              }, null, 8, ["src"])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.showSchemeModal ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "overlay",
            onClick: $setup.closeSchemeModal
          }, [
            vue.createElementVNode("view", {
              class: "modal scheme-modal",
              onClick: _cache[6] || (_cache[6] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString((_a = $setup.currentRoom) == null ? void 0 : _a.roomName) + " - 方案列表",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", {
                  class: "close",
                  onClick: $setup.closeSchemeModal
                }, "×")
              ]),
              vue.createElementVNode("view", { class: "modal-body scheme-modal-body" }, [
                $setup.currentRoomSchemes.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "scheme-list"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.currentRoomSchemes, (scheme) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: scheme.schemeId,
                        class: "scheme-item"
                      }, [
                        vue.createElementVNode("view", { class: "scheme-header" }, [
                          vue.createElementVNode("view", { class: "scheme-info" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "scheme-info-text" },
                              "版本: V" + vue.toDisplayString(scheme.schemeVersion),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "scheme-info-text" },
                              "状态: " + vue.toDisplayString(scheme.schemeStatus === "SUBMITTED" ? "已提交" : scheme.schemeStatus),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "scheme-info-text" },
                              "创建时间: " + vue.toDisplayString($setup.formatDate(scheme.createdAt)),
                              1
                              /* TEXT */
                            )
                          ]),
                          scheme.schemeStatus === "SUBMITTED" ? (vue.openBlock(), vue.createElementBlock("view", {
                            key: 0,
                            class: "scheme-actions"
                          }, [
                            vue.createElementVNode("button", {
                              class: "confirm-btn",
                              onClick: ($event) => $setup.confirmScheme(scheme.schemeId)
                            }, "确认方案", 8, ["onClick"])
                          ])) : vue.createCommentVNode("v-if", true)
                        ]),
                        vue.createElementVNode("view", { class: "scheme-materials" }, [
                          vue.createElementVNode("view", { class: "material-item" }, [
                            vue.createElementVNode("text", { class: "material-label" }, "地面材料:"),
                            vue.createElementVNode("text", { class: "material-value" }, [
                              vue.createTextVNode(
                                vue.toDisplayString(scheme.floorMaterial || "未设置") + " ",
                                1
                                /* TEXT */
                              ),
                              scheme.floorArea ? (vue.openBlock(), vue.createElementBlock(
                                "text",
                                { key: 0 },
                                "(" + vue.toDisplayString(scheme.floorArea) + "㎡)",
                                1
                                /* TEXT */
                              )) : vue.createCommentVNode("v-if", true)
                            ])
                          ]),
                          vue.createElementVNode("view", { class: "material-item" }, [
                            vue.createElementVNode("text", { class: "material-label" }, "墙面材料:"),
                            vue.createElementVNode("text", { class: "material-value" }, [
                              vue.createTextVNode(
                                vue.toDisplayString(scheme.wallMaterial || "未设置") + " ",
                                1
                                /* TEXT */
                              ),
                              scheme.wallArea ? (vue.openBlock(), vue.createElementBlock(
                                "text",
                                { key: 0 },
                                "(" + vue.toDisplayString(scheme.wallArea) + "㎡)",
                                1
                                /* TEXT */
                              )) : vue.createCommentVNode("v-if", true)
                            ])
                          ]),
                          vue.createElementVNode("view", { class: "material-item" }, [
                            vue.createElementVNode("text", { class: "material-label" }, "天花板材料:"),
                            vue.createElementVNode("text", { class: "material-value" }, [
                              vue.createTextVNode(
                                vue.toDisplayString(scheme.ceilingMaterial || "未设置") + " ",
                                1
                                /* TEXT */
                              ),
                              scheme.ceilingArea ? (vue.openBlock(), vue.createElementBlock(
                                "text",
                                { key: 0 },
                                "(" + vue.toDisplayString(scheme.ceilingArea) + "㎡)",
                                1
                                /* TEXT */
                              )) : vue.createCommentVNode("v-if", true)
                            ])
                          ]),
                          vue.createElementVNode("view", { class: "material-item" }, [
                            vue.createElementVNode("text", { class: "material-label" }, "柜体材料:"),
                            vue.createElementVNode("text", { class: "material-value" }, [
                              vue.createTextVNode(
                                vue.toDisplayString(scheme.cabinetMaterial || "未设置") + " ",
                                1
                                /* TEXT */
                              ),
                              scheme.cabinetArea ? (vue.openBlock(), vue.createElementBlock(
                                "text",
                                { key: 0 },
                                "(" + vue.toDisplayString(scheme.cabinetArea) + "㎡)",
                                1
                                /* TEXT */
                              )) : vue.createCommentVNode("v-if", true)
                            ])
                          ]),
                          vue.createElementVNode("view", { class: "material-item" }, [
                            vue.createElementVNode("text", { class: "material-label" }, "备注:"),
                            vue.createElementVNode(
                              "text",
                              { class: "material-value" },
                              vue.toDisplayString(scheme.remark || "无"),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        scheme.imageUrl ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "scheme-image"
                        }, [
                          vue.createElementVNode("image", {
                            src: $setup.BASE_URL + scheme.imageUrl,
                            class: "scheme-image-img",
                            onClick: ($event) => $setup.previewImageFromCache(scheme)
                          }, null, 8, ["src", "onClick"])
                        ])) : (vue.openBlock(), vue.createElementBlock("view", {
                          key: 1,
                          class: "no-image"
                        }, [
                          vue.createElementVNode("text", null, "暂无图片")
                        ]))
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "no-schemes"
                }, [
                  vue.createElementVNode("text", null, "暂无方案")
                ]))
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ]);
  }
  const SrcPagesFurnitureFurniture = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7], ["__file", "D:/CODE/mobile-app/src/pages/furniture/furniture.vue"]]);
  const _sfc_main$6 = {
    __name: "PostEditForm",
    props: {
      initialData: {
        type: Object,
        default: () => ({
          postId: null,
          title: "",
          content: "",
          images: []
        })
      }
    },
    emits: ["success", "cancel"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const store = usePostFormStore();
      const existingImages = vue.ref([]);
      const newImages = vue.ref([]);
      const removedImageIds = vue.ref([]);
      const postId = vue.ref(null);
      vue.watch(() => props.initialData, (newData) => {
        if (newData) {
          postId.value = newData.postId;
          store.form.title = newData.title || "";
          store.form.content = newData.content || "";
          existingImages.value = [...newData.images || []];
          newImages.value = [];
          removedImageIds.value = [];
        }
      }, { immediate: true });
      const chooseImages = () => {
        uni.chooseImage({
          count: 9 - (existingImages.value.length + newImages.value.length),
          // 最多9张图片
          sourceType: ["album", "camera"],
          success: (res) => {
            if (!res.tempFilePaths || res.tempFilePaths.length === 0)
              return;
            res.tempFilePaths.forEach((filePath) => {
              const key = Date.now() + "_" + Math.random().toString(36).substr(2, 9);
              newImages.value.push({
                key,
                url: filePath,
                file: { path: filePath }
                // 保存原始文件对象，用于上传
              });
            });
          },
          fail: (err) => {
            formatAppLog("error", "at src/components/PostEditForm.vue:137", "选择图片失败", err);
          }
        });
      };
      const removeExistingImage = (imageId) => {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除这张图片吗？",
          success: (res) => {
            if (res.confirm) {
              const index = existingImages.value.findIndex((img) => img.id === imageId);
              if (index !== -1) {
                existingImages.value.splice(index, 1);
                removedImageIds.value.push(imageId);
              }
            }
          }
        });
      };
      const removeNewImage = (key) => {
        const index = newImages.value.findIndex((img) => img.key === key);
        if (index !== -1) {
          newImages.value.splice(index, 1);
        }
      };
      async function handleSubmit(e) {
        e.preventDefault();
        store.errors.title = "";
        store.errors.content = "";
        if (!store.form.title.trim()) {
          store.errors.title = "请输入文章标题";
          uni.showToast({
            title: "请输入文章标题",
            icon: "none"
          });
          return;
        }
        if (!store.form.content.trim()) {
          store.errors.content = "请输入文章内容";
          uni.showToast({
            title: "请输入文章内容",
            icon: "none"
          });
          return;
        }
        try {
          await updatePost(postId.value, {
            title: store.form.title,
            content: store.form.content
          });
          for (const imageId of removedImageIds.value) {
            await deletePostImage(imageId);
          }
          if (newImages.value.length > 0) {
            for (const img of newImages.value) {
              await uploadPostImage(postId.value, img.file.path);
            }
            const updatedPost = await getPostSimple(postId.value);
            emit("success", updatedPost);
          } else {
            const updatedPost = await getPostSimple(postId.value);
            emit("success", updatedPost);
          }
          uni.showToast({
            title: "文章更新成功",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at src/components/PostEditForm.vue:227", "更新文章失败:", error);
          uni.showToast({
            title: error.message || "更新失败，请重试",
            icon: "none"
          });
        }
      }
      function handleCancel() {
        store.resetForm();
        emit("cancel");
      }
      const __returned__ = { props, emit, store, existingImages, newImages, removedImageIds, postId, chooseImages, removeExistingImage, removeNewImage, handleSubmit, handleCancel, ref: vue.ref, watch: vue.watch, get usePostFormStore() {
        return usePostFormStore;
      }, get BASE_URL() {
        return BASE_URL;
      }, get updatePost() {
        return updatePost;
      }, get getPostSimple() {
        return getPostSimple;
      }, get uploadPostImage() {
        return uploadPostImage;
      }, get deletePostImage() {
        return deletePostImage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "form-container" }, [
      vue.createElementVNode(
        "form",
        {
          onSubmit: $setup.handleSubmit,
          class: "article-form"
        },
        [
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                placeholder: "请输入文章标题",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.store.form.title = $event),
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.store.form.title]
            ]),
            $setup.store.errors.title ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.store.errors.title),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                placeholder: "请输入文章内容",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.store.form.content = $event),
                class: "form-textarea",
                rows: "4"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.store.form.content]
            ]),
            $setup.store.errors.content ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.store.errors.content),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("view", { class: "upload-section" }, [
              vue.createElementVNode("button", {
                onClick: $setup.chooseImages,
                class: "upload-btn"
              }, "选择图片"),
              vue.createElementVNode("view", { class: "preview" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.existingImages, (img) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: img.id,
                      class: "preview-item"
                    }, [
                      vue.createElementVNode("image", {
                        src: $setup.BASE_URL + img.imageUrl,
                        mode: "aspectFill",
                        class: "preview-img"
                      }, null, 8, ["src"]),
                      vue.createElementVNode("button", {
                        class: "remove-btn",
                        onClick: ($event) => $setup.removeExistingImage(img.id),
                        type: "button"
                      }, " × ", 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                )),
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.newImages, (img) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: img.key,
                      class: "preview-item"
                    }, [
                      vue.createElementVNode("image", {
                        src: img.url,
                        mode: "aspectFill",
                        class: "preview-img"
                      }, null, 8, ["src"]),
                      vue.createElementVNode("button", {
                        class: "remove-btn",
                        onClick: ($event) => $setup.removeNewImage(img.key),
                        type: "button"
                      }, " × ", 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-actions" }, [
            vue.createElementVNode("button", {
              "form-type": "submit",
              class: "submit-btn"
            }, "保存"),
            vue.createElementVNode("button", {
              type: "button",
              onClick: $setup.handleCancel,
              class: "cancel-btn"
            }, "取消")
          ])
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PostEditForm = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6], ["__scopeId", "data-v-1a86f8fb"], ["__file", "D:/CODE/mobile-app/src/components/PostEditForm.vue"]]);
  const _sfc_main$5 = {
    __name: "edit",
    setup(__props, { expose: __expose }) {
      __expose();
      const postId = vue.ref("");
      const initialData = vue.ref({
        postId: null,
        title: "",
        content: "",
        images: []
      });
      onLoad((options) => {
        postId.value = options.postId;
        loadPostForEdit();
      });
      const loadPostForEdit = async () => {
        try {
          const response = await getPostDetail(postId.value);
          const postData = response.data || response;
          initialData.value = {
            postId: postData.postId,
            title: postData.title,
            content: postData.content,
            images: [...postData.previewImages || []]
          };
        } catch (error) {
          formatAppLog("error", "at src/pages/post/edit.vue:57", "加载文章详情失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      };
      const onSubmitSuccess = (updatedPost) => {
        uni.showToast({
          title: "更新成功",
          icon: "success"
        });
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/post/detail?postId=${postId.value}`
          });
        }, 1500);
      };
      const submitForm = () => {
        const event = new CustomEvent("submit", { bubbles: true, cancelable: true });
        document.dispatchEvent(event);
      };
      const handleCancel = () => {
        goBack();
      };
      const goBack = () => {
        uni.navigateBack();
      };
      const __returned__ = { postId, initialData, loadPostForEdit, onSubmitSuccess, submitForm, handleCancel, goBack, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get getPostDetail() {
        return getPostDetail;
      }, PostEditForm };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "edit-post-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "title" }, "编辑文章"),
        vue.createElementVNode("view", {
          class: "save-btn",
          onClick: $setup.submitForm
        }, [
          vue.createElementVNode("text", { class: "save-text" }, "保存")
        ])
      ]),
      vue.createElementVNode("view", { class: "form-container" }, [
        vue.createVNode($setup["PostEditForm"], {
          "initial-data": $setup.initialData,
          onSuccess: $setup.onSubmitSuccess,
          onCancel: $setup.handleCancel
        }, null, 8, ["initial-data"])
      ])
    ]);
  }
  const SrcPagesPostEdit = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__scopeId", "data-v-b7f7c7b6"], ["__file", "D:/CODE/mobile-app/src/pages/post/edit.vue"]]);
  const _sfc_main$4 = {
    __name: "quotation",
    setup(__props, { expose: __expose }) {
      __expose();
      const quotationData = vue.ref(null);
      const houseId = vue.ref(null);
      const isLoading = vue.ref(true);
      const CATEGORY_MAP = {
        CEMENT: "水泥建材",
        PIPE: "管道",
        WIRE: "电线",
        ETC: "其他辅材"
      };
      const MATERIAL_TYPE_MAP = {
        floor: "地面",
        wall: "墙面",
        ceiling: "天花板",
        cabinet: "柜体"
      };
      const PAY_STATUS_MAP = {
        UNPAID: "待支付",
        PAID: "已支付",
        DEPOSIT_PAID: "定金已支付",
        PARTIALLY_PAID: "部分已支付"
      };
      onLoad((query) => {
        if (query.houseId) {
          houseId.value = Number(query.houseId);
        }
      });
      const loadQuotation = async () => {
        isLoading.value = true;
        try {
          const res = await getHouseQuotation(houseId.value);
          quotationData.value = res;
          formatAppLog("log", "at src/pages/quotation/quotation.vue:147", "报价数据加载成功", res);
        } catch (error) {
          formatAppLog("error", "at src/pages/quotation/quotation.vue:149", "加载报价失败:", error);
          uni.showToast({
            title: "加载报价失败",
            icon: "none"
          });
        } finally {
          isLoading.value = false;
        }
      };
      const payFull = async (billId) => {
        uni.showModal({
          title: "确认支付",
          content: "确认支付全款吗？支付后报价将生效并开始施工准备",
          success: (res) => {
            if (res.confirm) {
              performPayFull(billId);
            }
          }
        });
      };
      const performPayFull = async (billId) => {
        try {
          await payFullRequest(billId);
          uni.showToast({
            title: "支付成功",
            icon: "success"
          });
          setTimeout(() => {
            loadQuotation();
          }, 1e3);
        } catch (e) {
          uni.showToast({
            title: "支付失败，请稍后重试",
            icon: "none"
          });
          formatAppLog("error", "at src/pages/quotation/quotation.vue:188", "支付失败:", e);
        }
      };
      const getPaymentStatusText = (status) => {
        return PAY_STATUS_MAP[status] || status;
      };
      const formatNumber = (num) => {
        return parseFloat(num).toFixed(2);
      };
      const getCategoryText = (category) => {
        return CATEGORY_MAP[category] || category;
      };
      const getMaterialTypeText = (type) => {
        return MATERIAL_TYPE_MAP[type] || type;
      };
      vue.onMounted(() => {
        loadQuotation();
      });
      const __returned__ = { quotationData, houseId, isLoading, CATEGORY_MAP, MATERIAL_TYPE_MAP, PAY_STATUS_MAP, loadQuotation, payFull, performPayFull, getPaymentStatusText, formatNumber, getCategoryText, getMaterialTypeText, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get getHouseQuotation() {
        return getHouseQuotation;
      }, get payFullRequest() {
        return payFullRequest;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "quotation-container" }, [
      vue.createElementVNode("view", { class: "quotation-header" }, [
        vue.createElementVNode("text", { class: "title" }, "装修报价单")
      ]),
      $setup.quotationData ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
        vue.createElementVNode("view", { class: "rooms-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "房间主材明细"),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.quotationData.rooms, (room) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: room.roomId,
                class: "room-card"
              }, [
                vue.createElementVNode("view", { class: "room-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "room-name" },
                    vue.toDisplayString(room.roomName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "room-total" },
                    "小计：¥" + vue.toDisplayString($setup.formatNumber(room.totalCost)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "materials-list" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(Object.entries(room.mainMaterials || {}).filter(([key, value]) => key !== "totalCost" && value !== null), ([materialType, item]) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: `${room.roomId}-${materialType}`,
                        class: "material-item"
                      }, [
                        vue.createElementVNode("view", { class: "material-info" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "material-type" },
                            vue.toDisplayString($setup.getMaterialTypeText(materialType)),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "material-display-name" },
                            vue.toDisplayString(item.displayName),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "material-specs" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "spec-item" },
                            "面积：" + vue.toDisplayString(item.area) + "㎡",
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "spec-item" },
                            "单价：¥" + vue.toDisplayString(item.unitPrice) + "/㎡",
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "spec-item total" },
                            "小计：¥" + vue.toDisplayString($setup.formatNumber(item.cost)),
                            1
                            /* TEXT */
                          )
                        ])
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "auxiliary-materials-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "辅材明细"),
          vue.createElementVNode("view", { class: "materials-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.quotationData.auxiliaryMaterials, (material) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: material.name,
                  class: "material-card"
                }, [
                  vue.createElementVNode("view", { class: "material-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "material-name" },
                      vue.toDisplayString(material.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "material-category" },
                      vue.toDisplayString($setup.getCategoryText(material.category)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "material-details" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "detail-item" },
                      "单价：¥" + vue.toDisplayString(material.unitPrice) + "/" + vue.toDisplayString(material.unit),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "detail-item" },
                      "数量：" + vue.toDisplayString(material.quantity) + vue.toDisplayString(material.unit),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "detail-item total-cost" },
                      "小计：¥" + vue.toDisplayString($setup.formatNumber(material.cost)),
                      1
                      /* TEXT */
                    )
                  ]),
                  material.remark ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "material-remark"
                    },
                    vue.toDisplayString(material.remark),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "quotation-summary" }, [
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "主材费用："),
            vue.createElementVNode(
              "text",
              { class: "summary-value main-cost" },
              "¥" + vue.toDisplayString($setup.formatNumber($setup.quotationData.mainMaterialsCost)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "辅材费用："),
            vue.createElementVNode(
              "text",
              { class: "summary-value aux-cost" },
              "¥" + vue.toDisplayString($setup.formatNumber($setup.quotationData.auxiliaryMaterialsCost)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "人工费用："),
            vue.createElementVNode(
              "text",
              { class: "summary-value labor-cost" },
              "¥" + vue.toDisplayString($setup.formatNumber($setup.quotationData.laborCost)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "总费用："),
            vue.createElementVNode(
              "text",
              { class: "summary-value total-cost" },
              "¥" + vue.toDisplayString($setup.formatNumber($setup.quotationData.totalCost)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "payment-info" }, [
            vue.createElementVNode(
              "text",
              { class: "payment-status" },
              "状态：" + vue.toDisplayString($setup.getPaymentStatusText($setup.quotationData.payStatus)),
              1
              /* TEXT */
            ),
            $setup.quotationData.payStatus === "UNPAID" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
              vue.createElementVNode("text", { class: "payment-hint" }, "您可以一次性支付全款完成报价确认"),
              vue.createElementVNode("button", {
                class: "pay-btn",
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.payFull($setup.quotationData.billId))
              }, "立即支付全款")
            ])) : $setup.quotationData.payStatus === "PAID" ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
              vue.createElementVNode("text", { class: "payment-hint success" }, "✅ 您已完成支付，报价已确认")
            ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 2 }, [
              vue.createElementVNode(
                "text",
                { class: "payment-hint" },
                "当前支付状态：" + vue.toDisplayString($setup.getPaymentStatusText($setup.quotationData.payStatus)),
                1
                /* TEXT */
              )
            ]))
          ])
        ])
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading-container"
      }, [
        vue.createElementVNode("text", null, "正在加载报价数据...")
      ]))
    ]);
  }
  const SrcPagesQuotationQuotation = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__file", "D:/CODE/mobile-app/src/pages/quotation/quotation.vue"]]);
  function getStage(houseId) {
    return request({
      url: `/stage/${houseId}`,
      // 修改为正确的路径
      method: "GET"
    });
  }
  function getStageDetail(houseId, orderId) {
    return request({
      url: `/stage/${houseId}/${orderId}`,
      method: "GET"
    });
  }
  function updateStageSchedule(houseId, stageOrder, expectedStartAt) {
    return request({
      url: `/stage/${houseId}/${stageOrder}/schedule?expectedStartAt=${expectedStartAt}`,
      method: "POST"
    });
  }
  const _sfc_main$3 = {
    __name: "StageGantt",
    emits: ["change"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const houseId = vue.ref(null);
      onLoad(async (options) => {
        houseId.value = Number(options.houseId);
        const res = await getStage(houseId.value);
        stages.value = (res == null ? void 0 : res.stages) || [];
      });
      const emit = __emit;
      const weeks = ["一", "二", "三", "四", "五", "六", "日"];
      const currentMonth = vue.ref("2026-02");
      const stages = vue.ref([]);
      const selectedStage = vue.ref({});
      const selectedDate = vue.ref("");
      const datePickerPopup = vue.ref(null);
      const onDateChange = async (stage, e) => {
        const newDate = e.detail.value;
        try {
          await updateStageSchedule(houseId.value, stage.order, newDate);
          const updatedStage = stages.value.find((s) => s.order === stage.order);
          if (updatedStage) {
            const start = new Date(newDate);
            const days2 = updatedStage.estimatedDay;
            const end = new Date(start);
            end.setDate(end.getDate() + days2 - 1);
            updatedStage.expectedStartAt = start.toISOString().split("T")[0] + "T00:00:00";
            updatedStage.expectedEndAt = end.toISOString().split("T")[0] + "T00:00:00";
          }
          emit("change", { order: stage.order, expectedStartAt: newDate });
          uni.showToast({ title: "更新成功", icon: "success" });
        } catch (error) {
          formatAppLog("error", "at src/components/StageGantt.vue:129", "更新阶段计划失败:", error);
          uni.showToast({ title: "更新失败", icon: "error" });
        }
      };
      vue.watch(stages, () => {
      }, { deep: true });
      function onMonthChange(e) {
        currentMonth.value = e.detail.value;
      }
      function addDays(dateStr, days2) {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + days2 - 1);
        return d.toISOString().slice(0, 10);
      }
      function parseDate(dateStr) {
        if (!dateStr)
          return null;
        return new Date(dateStr);
      }
      const days = vue.computed(() => {
        if (!currentMonth.value || !stages.value || !Array.isArray(stages.value))
          return [];
        const [year, month] = currentMonth.value.split("-").map(Number);
        const firstDay = new Date(year, month - 1, 1).getDay();
        const adjustedFirstDay = firstDay === 0 ? 7 : firstDay;
        const total = new Date(year, month, 0).getDate();
        const result = [];
        for (let i = 1; i < adjustedFirstDay; i++) {
          result.push({
            day: "",
            date: null,
            expectedStage: null,
            actualStage: null
          });
        }
        for (let i = 1; i <= total; i++) {
          const date = `${currentMonth.value}-${String(i).padStart(2, "0")}`;
          const expectedStage = stages.value.find((s) => {
            const start = s.expectedStartAt.slice(0, 10);
            const end = addDays(start, s.estimatedDay);
            return date >= start && date <= end;
          });
          const actualStage = stages.value.find((s) => {
            if (!s.start_at)
              return false;
            const start = s.start_at.slice(0, 10);
            const end = s.end_at ? s.end_at.slice(0, 10) : start;
            return date >= start && date <= end;
          });
          result.push({
            day: i,
            date,
            expectedStage,
            actualStage
          });
        }
        return result;
      });
      const getStageShortName = (name) => {
        return name.substring(0, 2);
      };
      const formatDate = (dateString) => {
        if (!dateString)
          return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      };
      const getStatusClass = (status) => {
        switch (status) {
          case "已完成":
            return "status-completed";
          case "进行中":
            return "status-progress";
          case "待开始":
            return "status-pending";
          case "已验收":
            return "status-accepted";
          default:
            return "status-default";
        }
      };
      const showDatePicker = (stage) => {
        selectedStage.value = stage;
        const date = new Date(stage.expectedStartAt);
        selectedDate.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        datePickerPopup.value.open();
      };
      const onDateConfirm = async (e) => {
        selectedDate.value = e.detail.value;
        try {
          await updateStageSchedule(
            houseId.value,
            selectedStage.value.order,
            selectedDate.value
          );
          const res = await getStage(houseId.value);
          stages.value = (res == null ? void 0 : res.stages) || [];
          emit("change", {
            order: selectedStage.value.order,
            expectedStartAt: selectedDate.value
          });
          uni.showToast({ title: "更新成功", icon: "success" });
          closeDatePicker();
        } catch (error) {
          formatAppLog("error", "at src/components/StageGantt.vue:293", "更新阶段计划失败:", error);
          uni.showToast({ title: "更新失败", icon: "error" });
        }
      };
      const closeDatePicker = () => {
        datePickerPopup.value.close();
      };
      const __returned__ = { houseId, emit, weeks, currentMonth, stages, selectedStage, selectedDate, datePickerPopup, onDateChange, onMonthChange, addDays, parseDate, days, getStageShortName, formatDate, getStatusClass, showDatePicker, onDateConfirm, closeDatePicker, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, watch: vue.watch, get getStage() {
        return getStage;
      }, get updateStageSchedule() {
        return updateStageSchedule;
      }, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "gantt" }, [
      vue.createElementVNode(
        "picker",
        {
          mode: "date",
          fields: "month",
          onChange: $setup.onMonthChange
        },
        [
          vue.createElementVNode(
            "view",
            { class: "month-picker" },
            vue.toDisplayString($setup.currentMonth),
            1
            /* TEXT */
          )
        ],
        32
        /* NEED_HYDRATION */
      ),
      vue.createElementVNode("view", { class: "week-header" }, [
        (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.weeks, (w) => {
            return vue.createElementVNode(
              "text",
              { key: w },
              vue.toDisplayString(w),
              1
              /* TEXT */
            );
          }),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "calendar" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.days, (day) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: day.date || `empty-${day.day}`,
              class: vue.normalizeClass(["day", { active: day.expectedStage || day.actualStage }]),
              onClick: ($event) => day.expectedStage && $setup.showDatePicker(day.expectedStage)
            }, [
              vue.createElementVNode(
                "view",
                { class: "date" },
                vue.toDisplayString(day.day),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "progress-bars" }, [
                day.expectedStage ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "progress-bar expected",
                  style: { backgroundColor: "#1677ff" }
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "progress-text" },
                    vue.toDisplayString($setup.getStageShortName(day.expectedStage.stageName)),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true),
                day.actualStage ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "progress-bar actual",
                  style: { backgroundColor: "#ffa500" }
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "progress-text" },
                    vue.toDisplayString($setup.getStageShortName(day.actualStage.stageName)),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "legend" }, [
        vue.createElementVNode("view", { class: "legend-item" }, [
          vue.createElementVNode("view", { class: "legend-color expected" }),
          vue.createElementVNode("text", null, "预期进度")
        ]),
        vue.createElementVNode("view", { class: "legend-item" }, [
          vue.createElementVNode("view", { class: "legend-color actual" }),
          vue.createElementVNode("text", null, "实际进度")
        ])
      ]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "datePickerPopup",
          type: "dialog"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "date-picker-content" }, [
              vue.createElementVNode(
                "text",
                { class: "stage-title" },
                "修改阶段：" + vue.toDisplayString($setup.selectedStage.stageName),
                1
                /* TEXT */
              ),
              vue.createElementVNode("picker", {
                mode: "date",
                value: $setup.selectedDate,
                onChange: $setup.onDateConfirm
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "picker-display" },
                  vue.toDisplayString($setup.selectedDate),
                  1
                  /* TEXT */
                )
              ], 40, ["value"])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const StageGantt = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-efe352fa"], ["__file", "D:/CODE/mobile-app/src/components/StageGantt.vue"]]);
  const _sfc_main$2 = {
    __name: "stage",
    setup(__props, { expose: __expose }) {
      __expose();
      const stagesData = vue.ref({ stages: [] });
      const houseId = vue.ref(null);
      const viewMode = vue.ref("list");
      onLoad((query) => {
        if (query.houseId) {
          houseId.value = Number(query.houseId);
        }
      });
      const loadStages = async () => {
        try {
          const res = await getStage(houseId.value);
          formatAppLog("log", "at src/pages/stage/stage.vue:106", "原始API返回数据", res);
          if (res && res.stages) {
            stagesData.value = res;
          } else if (res && res.data && res.data.stages) {
            stagesData.value = res.data;
          } else {
            stagesData.value = { stages: [] };
            formatAppLog("warn", "at src/pages/stage/stage.vue:118", "API 返回数据格式不符合预期", res);
          }
          formatAppLog("log", "at src/pages/stage/stage.vue:121", "施工阶段数据加载成功", stagesData.value);
        } catch (error) {
          formatAppLog("error", "at src/pages/stage/stage.vue:123", "加载施工阶段失败:", error);
          uni.showToast({
            title: "加载施工阶段失败",
            icon: "none"
          });
        }
      };
      const onGanttChange = async ({ order, expectedStartAt }) => {
        try {
          await updateStageSchedule(houseId.value, order, expectedStartAt);
          await loadStages();
          uni.showToast({
            title: "排期更新成功",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at src/pages/stage/stage.vue:141", "排期更新失败:", error);
          uni.showToast({
            title: "排期更新失败",
            icon: "none"
          });
        }
      };
      const isStatusActive = (currentStatus, targetStatus) => {
        const statusOrder = ["待开始", "进行中", "已完成", "已验收"];
        const currentIdx = statusOrder.indexOf(currentStatus);
        const targetIdx = statusOrder.indexOf(targetStatus);
        return currentIdx >= targetIdx;
      };
      const getStatusClass = (status) => {
        switch (status) {
          case "进行中":
            return "status-progress";
          case "已完成":
            return "status-completed";
          case "已验收":
            return "status-accepted";
          default:
            return "status-pending";
        }
      };
      const enterStageDetail = (stageItem) => {
        uni.navigateTo({
          url: `/src/pages/stage/stage-detail?houseId=${houseId.value}&stageId=${stageItem.order}`
        });
      };
      const formatDate = (dateString) => {
        if (!dateString)
          return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      };
      vue.onMounted(() => {
        loadStages();
      });
      const __returned__ = { stagesData, houseId, viewMode, loadStages, onGanttChange, isStatusActive, getStatusClass, enterStageDetail, formatDate, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get getStage() {
        return getStage;
      }, get updateStageSchedule() {
        return updateStageSchedule;
      }, StageGantt };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "construction-container" }, [
      vue.createElementVNode("view", { class: "construction-header" }, [
        vue.createElementVNode("text", { class: "title" }, "施工阶段详情"),
        vue.createElementVNode("view", { class: "view-toggle" }, [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["toggle-item", $setup.viewMode === "list" && "active"]),
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.viewMode = "list")
            },
            " 阶段列表 ",
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["toggle-item", $setup.viewMode === "gantt" && "active"]),
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.viewMode = "gantt")
            },
            " 甘特图 ",
            2
            /* CLASS */
          )
        ])
      ]),
      $setup.viewMode === "list" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "stages-section"
      }, [
        vue.createElementVNode("text", { class: "section-title" }, "装修施工阶段"),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.stagesData.stages, (stageItem) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: stageItem.order,
              class: "stage-card"
            }, [
              vue.createElementVNode("view", { class: "stage-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stage-name" },
                  vue.toDisplayString(stageItem.stageName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "stage-actions" }, [
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["stage-status", $setup.getStatusClass(stageItem.status)])
                    },
                    vue.toDisplayString(stageItem.status),
                    3
                    /* TEXT, CLASS */
                  ),
                  stageItem.status === "待开始" ? (vue.openBlock(), vue.createElementBlock("button", {
                    key: 0,
                    class: "enter-btn",
                    onClick: ($event) => $setup.enterStageDetail(stageItem)
                  }, " 进入 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                ])
              ]),
              vue.createElementVNode("view", { class: "stage-details-grid" }, [
                vue.createElementVNode("view", { class: "detail-item" }, [
                  vue.createElementVNode("text", { class: "label" }, [
                    vue.createTextVNode("阶段序号："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(stageItem.order),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "detail-item" }, [
                  vue.createElementVNode("text", { class: "label" }, [
                    vue.createTextVNode("主要工种："),
                    vue.createElementVNode(
                      "text",
                      { class: "value worker-type" },
                      vue.toDisplayString(stageItem.mainWorkerType),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "detail-item" }, [
                  vue.createElementVNode("text", { class: "label" }, [
                    vue.createTextVNode("所需人数："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(stageItem.requiredCount) + "人",
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "detail-item" }, [
                  vue.createElementVNode("text", { class: "label" }, [
                    vue.createTextVNode("预计天数："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(stageItem.estimatedDay) + "天",
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                stageItem.start_at ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "detail-item"
                }, [
                  vue.createElementVNode("text", { class: "label" }, [
                    vue.createTextVNode("开始时间："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString($setup.formatDate(stageItem.start_at)),
                      1
                      /* TEXT */
                    )
                  ])
                ])) : vue.createCommentVNode("v-if", true),
                stageItem.end_at ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "detail-item"
                }, [
                  vue.createElementVNode("text", { class: "label" }, [
                    vue.createTextVNode("结束时间："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString($setup.formatDate(stageItem.end_at)),
                      1
                      /* TEXT */
                    )
                  ])
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", { class: "stage-progress-bar" }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(["待开始", "进行中", "已完成", "已验收"], (status, index) => {
                    return vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["progress-step", { active: $setup.isStatusActive(stageItem.status, status) }]),
                        key: index
                      },
                      [
                        vue.createElementVNode("view", { class: "step-dot" }),
                        vue.createElementVNode(
                          "text",
                          { class: "step-label" },
                          vue.toDisplayString(status),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    );
                  }),
                  64
                  /* STABLE_FRAGMENT */
                )),
                vue.createElementVNode("view", { class: "progress-line" })
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : $setup.viewMode === "gantt" ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
        vue.createVNode($setup["StageGantt"], {
          stages: $setup.stagesData.stages,
          onChange: $setup.onGanttChange
        }, null, 8, ["stages"])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const SrcPagesStageStage = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__file", "D:/CODE/mobile-app/src/pages/stage/stage.vue"]]);
  const _sfc_main$1 = {
    __name: "stage-detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const stageData = vue.ref({
        mainMaterials: [],
        auxiliaryMaterials: [],
        order: null,
        stageName: "",
        status: "",
        mainWorkerType: "",
        requiredCount: 0,
        estimatedDay: 0,
        start_at: null,
        end_at: null
      });
      const houseId = vue.ref(null);
      const stageId = vue.ref(null);
      const isLoading = vue.ref(true);
      const loadStageDetail = async () => {
        try {
          const res = await getStageDetail(houseId.value, stageId.value);
          stageData.value = {
            ...stageData.value,
            ...res
          };
          formatAppLog("log", "at src/pages/stage/stage-detail.vue:120", "阶段详情数据加载成功", stageData.value);
        } catch (error) {
          formatAppLog("error", "at src/pages/stage/stage-detail.vue:122", "加载阶段详情失败:", error);
          uni.showToast({
            title: "加载阶段详情失败",
            icon: "none"
          });
        } finally {
          isLoading.value = false;
        }
      };
      const CATEGORY_MAP = {
        CEMENT: "水泥建材",
        PIPE: "管道",
        WIRE: "电线",
        ETC: "其他辅材"
      };
      const MAIN_MATERIAL_TYPE_MAP = {
        FLOOR: "地面",
        WALL: "墙面",
        CEILING: "天花板",
        CABINET: "柜体"
      };
      onLoad((query) => {
        if (query.houseId) {
          houseId.value = Number(query.houseId);
        }
        if (query.stageId) {
          stageId.value = Number(query.stageId);
        }
      });
      const getStatusClass = (status) => {
        switch (status) {
          case "进行中":
            return "status-progress";
          case "已完成":
            return "status-completed";
          case "已验收":
            return "status-accepted";
          default:
            return "status-pending";
        }
      };
      const getCategoryText = (category) => {
        return CATEGORY_MAP[category] || category;
      };
      const getMainMaterialTypeText = (type) => {
        return MAIN_MATERIAL_TYPE_MAP[type] || type;
      };
      const formatDate = (dateString) => {
        if (!dateString)
          return "";
        const date = new Date(dateString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      };
      vue.onMounted(() => {
        loadStageDetail();
      });
      const __returned__ = { stageData, houseId, stageId, isLoading, loadStageDetail, CATEGORY_MAP, MAIN_MATERIAL_TYPE_MAP, getStatusClass, getCategoryText, getMainMaterialTypeText, formatDate, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get getStage() {
        return getStage;
      }, get getStageDetail() {
        return getStageDetail;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "stage-detail-container" }, [
      !$setup.stageData.order ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("text", null, "加载中...")
      ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
        vue.createElementVNode("view", { class: "stage-header" }, [
          vue.createElementVNode(
            "text",
            { class: "title" },
            vue.toDisplayString($setup.stageData.stageName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "stage-info" }, [
            vue.createElementVNode(
              "text",
              { class: "stage-order" },
              "第 " + vue.toDisplayString($setup.stageData.order) + " 阶段",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["stage-status", $setup.getStatusClass($setup.stageData.status)])
              },
              vue.toDisplayString($setup.stageData.status),
              3
              /* TEXT, CLASS */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "basic-info-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "阶段信息"),
          vue.createElementVNode("view", { class: "info-grid" }, [
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "label" }, "主要工种"),
              vue.createElementVNode(
                "text",
                { class: "value worker-type" },
                vue.toDisplayString($setup.stageData.mainWorkerType),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "label" }, "所需人数"),
              vue.createElementVNode(
                "text",
                { class: "value" },
                vue.toDisplayString($setup.stageData.requiredCount) + "人",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "label" }, "预计天数"),
              vue.createElementVNode(
                "text",
                { class: "value" },
                vue.toDisplayString($setup.stageData.estimatedDay) + "天",
                1
                /* TEXT */
              )
            ]),
            $setup.stageData.start_at ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "info-item"
            }, [
              vue.createElementVNode("text", { class: "label" }, "开始时间"),
              vue.createElementVNode(
                "text",
                { class: "value" },
                vue.toDisplayString($setup.formatDate($setup.stageData.start_at)),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $setup.stageData.end_at ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "info-item"
            }, [
              vue.createElementVNode("text", { class: "label" }, "结束时间"),
              vue.createElementVNode(
                "text",
                { class: "value" },
                vue.toDisplayString($setup.formatDate($setup.stageData.end_at)),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ]),
        $setup.stageData.mainMaterials && $setup.stageData.mainMaterials.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "materials-section"
        }, [
          vue.createElementVNode("text", { class: "section-title" }, "主材清单"),
          vue.createElementVNode("view", { class: "materials-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.stageData.mainMaterials, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: "material-item"
                }, [
                  vue.createElementVNode("view", { class: "material-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "material-type" },
                      vue.toDisplayString($setup.getMainMaterialTypeText(item.type)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "material-display-name" },
                      vue.toDisplayString(item.displayName),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "material-specs" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "spec-item" },
                      "面积：" + vue.toDisplayString(item.area) + "㎡",
                      1
                      /* TEXT */
                    )
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $setup.stageData.auxiliaryMaterials && $setup.stageData.auxiliaryMaterials.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "materials-section"
        }, [
          vue.createElementVNode("text", { class: "section-title" }, "辅材清单"),
          vue.createElementVNode("view", { class: "aux-materials-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.stageData.auxiliaryMaterials, (material, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: "aux-material-card"
                }, [
                  vue.createElementVNode("view", { class: "material-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "material-name" },
                      vue.toDisplayString(material.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "material-category" },
                      vue.toDisplayString($setup.getCategoryText(material.category)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "material-details" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "detail-item" },
                      "单位：" + vue.toDisplayString(material.unit),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "detail-item" },
                      "数量：" + vue.toDisplayString(material.quantity) + vue.toDisplayString(material.unit),
                      1
                      /* TEXT */
                    )
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        (!$setup.stageData.mainMaterials || $setup.stageData.mainMaterials.length === 0) && (!$setup.stageData.auxiliaryMaterials || $setup.stageData.auxiliaryMaterials.length === 0) ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "no-materials"
        }, [
          vue.createElementVNode("text", { class: "no-materials-text" }, "此阶段暂无材料清单")
        ])) : vue.createCommentVNode("v-if", true)
      ]))
    ]);
  }
  const SrcPagesStageStageDetail = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__file", "D:/CODE/mobile-app/src/pages/stage/stage-detail.vue"]]);
  __definePage("src/pages/post/index", SrcPagesPostIndex);
  __definePage("src/pages/project/project", SrcPagesProjectProject);
  __definePage("src/pages/post/detail", SrcPagesPostDetail);
  __definePage("src/pages/contact/contact", SrcPagesContactContact);
  __definePage("src/pages/profile/profile", SrcPagesProfileProfile);
  __definePage("src/pages/login/login", SrcPagesLoginLogin);
  __definePage("src/pages/register/register", SrcPagesRegisterRegister);
  __definePage("src/pages/contact/contactDetail", SrcPagesContactContactDetail);
  __definePage("src/pages/layout/layout", SrcPagesLayoutLayout);
  __definePage("src/pages/furniture/furniture", SrcPagesFurnitureFurniture);
  __definePage("src/pages/post/edit", SrcPagesPostEdit);
  __definePage("src/pages/quotation/quotation", SrcPagesQuotationQuotation);
  __definePage("src/pages/stage/stage", SrcPagesStageStage);
  __definePage("src/pages/stage/stage-detail", SrcPagesStageStageDetail);
  const _sfc_main = {
    __name: "App",
    setup(__props, { expose: __expose }) {
      __expose();
      onLaunch(async () => {
        const userStore = useUserStore();
        await userStore.init();
      });
      const __returned__ = { get onLaunch() {
        return onLaunch;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("text", null, "App 启动成功")
    ]);
  }
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "D:/CODE/mobile-app/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    const pinia = createPinia();
    app.use(pinia);
    return { app };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
