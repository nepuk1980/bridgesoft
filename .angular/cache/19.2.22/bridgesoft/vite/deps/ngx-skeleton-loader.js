import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Input,
  NgModule,
  computed,
  inject,
  input,
  isDevMode,
  makeEnvironmentProviders,
  numberAttribute,
  setClassMetadata,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵdeclareLet,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵreadContextLet,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵstoreLet,
  ɵɵstyleMap,
  ɵɵtemplate
} from "./chunk-MHZMD4Y4.js";
import "./chunk-PEBH6BBU.js";
import "./chunk-WPM5VTLQ.js";
import "./chunk-4S3KYZTJ.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-KBUIKKCC.js";

// node_modules/ngx-skeleton-loader/fesm2022/ngx-skeleton-loader.mjs
var _c0 = ["*"];
function NgxSkeletonLoaderComponent_For_3_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵprojection(0);
  }
}
function NgxSkeletonLoaderComponent_For_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 1);
    ɵɵtemplate(1, NgxSkeletonLoaderComponent_For_3_Conditional_1_Template, 1, 0);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    const appearanceValue_r2 = ɵɵreadContextLet(0);
    const animationValue_r3 = ɵɵreadContextLet(1);
    ɵɵstyleMap(ctx_r0.styles());
    ɵɵclassProp("custom-content", appearanceValue_r2 === "custom-content")("circle", appearanceValue_r2 === "circle")("square", appearanceValue_r2 === "square")("progress", animationValue_r3 === "progress")("progress-dark", animationValue_r3 === "progress-dark")("pulse", animationValue_r3 === "pulse")("pulse-dark", animationValue_r3 === "pulse-dark");
    ɵɵattribute("aria-label", ctx_r0.ariaLabel())("aria-valuetext", ctx_r0.loadingText());
    ɵɵadvance();
    ɵɵconditional(appearanceValue_r2 === "custom-content" ? 1 : -1);
  }
}
var NGX_SKELETON_LOADER_CONFIG = new InjectionToken("ngx-skeleton-loader.config");
var NgxSkeletonLoaderComponent = class _NgxSkeletonLoaderComponent {
  constructor() {
    this.#config = inject(NGX_SKELETON_LOADER_CONFIG, {
      optional: true
    });
    this.count = input(this.#config?.count || 1, __spreadProps(__spreadValues({}, ngDevMode ? {
      debugName: "count"
    } : {}), {
      transform: numberAttribute
    }));
    this.loadingText = input(this.#config?.loadingText || "Loading...", __spreadValues({}, ngDevMode ? {
      debugName: "loadingText"
    } : {}));
    this.appearance = input(this.#config?.appearance || "line", __spreadValues({}, ngDevMode ? {
      debugName: "appearance"
    } : {}));
    this.animation = input(this.#config?.animation || "progress", __spreadValues({}, ngDevMode ? {
      debugName: "animation"
    } : {}));
    this.ariaLabel = input(this.#config?.ariaLabel || "loading", __spreadValues({}, ngDevMode ? {
      debugName: "ariaLabel"
    } : {}));
    this.theme = input(this.#config?.theme || null, __spreadValues({}, ngDevMode ? {
      debugName: "theme"
    } : {}));
    this.size = input(this.#config?.size || null, __spreadValues({}, ngDevMode ? {
      debugName: "size"
    } : {}));
    this.measureUnit = input(this.#config?.measureUnit || "px", __spreadValues({}, ngDevMode ? {
      debugName: "measureUnit"
    } : {}));
    this.items = computed(() => {
      let count = this.count() || 1;
      if (this.appearance() === "custom-content") {
        if (isDevMode() && count !== 1) {
          console.error(`\`NgxSkeletonLoaderComponent\` enforces elements with "custom-content" appearance as DOM nodes. Forcing "count" to "1".`);
          count = 1;
        }
      }
      return [...Array(count)].map((_, index) => index);
    }, __spreadValues({}, ngDevMode ? {
      debugName: "items"
    } : {}));
    this.squareSize = computed(() => {
      const size = this.size();
      if (this.appearance() !== "square" || typeof size !== "number" && typeof size !== "string") {
        return null;
      }
      const sizeValueInNumbersOnly = Number(size.toString().trim().replace(/\D/g, ""));
      if (!Number.isInteger(sizeValueInNumbersOnly)) {
        return null;
      }
      return `${sizeValueInNumbersOnly}${this.measureUnit()}`;
    }, __spreadValues({}, ngDevMode ? {
      debugName: "squareSize"
    } : {}));
    this.styles = computed(() => {
      const theme = this.theme();
      const size = this.squareSize();
      if (this.#config?.theme?.extendsFromRoot) {
        return __spreadValues(__spreadValues(__spreadValues({}, this.#config?.theme), theme), size && {
          width: size,
          height: size
        });
      }
      return __spreadValues(__spreadValues({}, theme), size && {
        width: size,
        height: size
      });
    }, __spreadValues({}, ngDevMode ? {
      debugName: "styles"
    } : {}));
  }
  /**
   * Injects the `NgxSkeletonLoaderConfig` configuration object, which is optional.
   * This configuration object provides various options for customizing the behavior
   * and appearance of the `NgxSkeletonLoaderComponent`.
   */
  #config;
  static {
    this.ɵfac = function NgxSkeletonLoaderComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _NgxSkeletonLoaderComponent)();
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _NgxSkeletonLoaderComponent,
      selectors: [["ngx-skeleton-loader"]],
      inputs: {
        count: [1, "count"],
        loadingText: [1, "loadingText"],
        appearance: [1, "appearance"],
        animation: [1, "animation"],
        ariaLabel: [1, "ariaLabel"],
        theme: [1, "theme"],
        size: [1, "size"],
        measureUnit: [1, "measureUnit"]
      },
      ngContentSelectors: _c0,
      decls: 4,
      vars: 2,
      consts: [["aria-busy", "true", "aria-valuemin", "0", "aria-valuemax", "100", "role", "progressbar", "tabindex", "-1", 1, "skeleton-loader", 3, "custom-content", "circle", "square", "progress", "progress-dark", "pulse", "pulse-dark", "style"], ["aria-busy", "true", "aria-valuemin", "0", "aria-valuemax", "100", "role", "progressbar", "tabindex", "-1", 1, "skeleton-loader"]],
      template: function NgxSkeletonLoaderComponent_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵprojectionDef();
          ɵɵdeclareLet(0)(1);
          ɵɵrepeaterCreate(2, NgxSkeletonLoaderComponent_For_3_Template, 2, 19, "div", 0, ɵɵrepeaterTrackByIdentity);
        }
        if (rf & 2) {
          ɵɵstoreLet(ctx.appearance());
          ɵɵadvance();
          ɵɵstoreLet(ctx.animation());
          ɵɵadvance();
          ɵɵrepeater(ctx.items());
        }
      },
      styles: ['.skeleton-loader[_ngcontent-%COMP%]{--ngx-skeleton-loader-base-color: rgb(239, 241, 246);--ngx-skeleton-loader-light-mode-color: rgba(255, 255, 255, .6);--ngx-skeleton-loader-light-mode-color-to: rgba(255, 255, 255, 0);--ngx-skeleton-loader-dark-mode-color: rgba(0, 0, 0, .2);--ngx-skeleton-loader-dark-mode-color-to: transparent;--ngx-skeleton-loader-animation-duration: 2s;--ngx-skeleton-loader-background-image-light-mode: linear-gradient( 90deg, var(--ngx-skeleton-loader-light-mode-color-to), var(--ngx-skeleton-loader-light-mode-color), var(--ngx-skeleton-loader-light-mode-color-to) );--ngx-skeleton-loader-background-image-dark-mode: linear-gradient( 90deg, var(--ngx-skeleton-loader-dark-mode-color-to), var(--ngx-skeleton-loader-dark-mode-color), var(--ngx-skeleton-loader-dark-mode-color-to) );box-sizing:border-box;overflow:hidden;position:relative;background:var(--ngx-skeleton-loader-base-color) no-repeat;border-radius:4px;width:100%;height:20px;display:inline-block;margin-bottom:10px;will-change:transform}.skeleton-loader[_ngcontent-%COMP%]:after, .skeleton-loader[_ngcontent-%COMP%]:before{box-sizing:border-box}.skeleton-loader.circle[_ngcontent-%COMP%]{width:40px;height:40px;margin:5px;border-radius:50%}.skeleton-loader.square[_ngcontent-%COMP%]{width:40px;height:40px;margin:5px}.skeleton-loader.progress[_ngcontent-%COMP%]:after, .skeleton-loader.progress[_ngcontent-%COMP%]:before, .skeleton-loader.progress-dark[_ngcontent-%COMP%]:after, .skeleton-loader.progress-dark[_ngcontent-%COMP%]:before{box-sizing:border-box}.skeleton-loader.progress[_ngcontent-%COMP%], .skeleton-loader.progress-dark[_ngcontent-%COMP%]{transform:translateZ(0)}.skeleton-loader.progress[_ngcontent-%COMP%]:before, .skeleton-loader.progress-dark[_ngcontent-%COMP%]:before{animation:_ngcontent-%COMP%_progress var(--ngx-skeleton-loader-animation-duration) ease-in-out infinite;background-size:200px 100%;position:absolute;z-index:1;top:0;left:0;width:200px;height:100%;content:""}.skeleton-loader.progress[_ngcontent-%COMP%]:before{background-image:var(--ngx-skeleton-loader-background-image-light-mode)}.skeleton-loader.progress-dark[_ngcontent-%COMP%]:before{background-image:var(--ngx-skeleton-loader-background-image-dark-mode)}.skeleton-loader.pulse[_ngcontent-%COMP%]{animation:_ngcontent-%COMP%_pulse var(--ngx-skeleton-loader-animation-duration) cubic-bezier(.4,0,.2,1) infinite;animation-delay:.5s}.skeleton-loader.pulse-dark[_ngcontent-%COMP%]{background:var(--ngx-skeleton-loader-dark-mode-color);animation:_ngcontent-%COMP%_pulse var(--ngx-skeleton-loader-animation-duration) cubic-bezier(.4,0,.2,1) infinite;animation-delay:.5s}.skeleton-loader.custom-content[_ngcontent-%COMP%]{height:100%;background:none}@media(prefers-reduced-motion:reduce){.skeleton-loader.pulse[_ngcontent-%COMP%], .skeleton-loader.progress-dark[_ngcontent-%COMP%], .skeleton-loader.pulse-dark[_ngcontent-%COMP%], .skeleton-loader.custom-content[_ngcontent-%COMP%], .skeleton-loader.progress[_ngcontent-%COMP%]:before{animation:none}.skeleton-loader.progress[_ngcontent-%COMP%]:before, .skeleton-loader.progress-dark[_ngcontent-%COMP%], .skeleton-loader.pulse-dark[_ngcontent-%COMP%], .skeleton-loader.custom-content[_ngcontent-%COMP%]{background-image:none}}@media screen and (min-device-width:1200px){.skeleton-loader[_ngcontent-%COMP%]{-webkit-user-select:none;user-select:none;cursor:wait}}@keyframes _ngcontent-%COMP%_progress{0%{transform:translate3d(-200px,0,0)}to{transform:translate3d(calc(200px + 100vw),0,0)}}@keyframes _ngcontent-%COMP%_pulse{0%{opacity:1}50%{opacity:.4}to{opacity:1}}'],
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgxSkeletonLoaderComponent, [{
    type: Component,
    args: [{
      selector: "ngx-skeleton-loader",
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true,
      template: `@let appearanceValue = appearance();
@let animationValue = animation();
@for (item of items(); track item) {
  <div
    class="skeleton-loader"
    [attr.aria-label]="ariaLabel()"
    aria-busy="true"
    aria-valuemin="0"
    aria-valuemax="100"
    [attr.aria-valuetext]="loadingText()"
    role="progressbar"
    tabindex="-1"
    [class.custom-content]="appearanceValue === 'custom-content'"
    [class.circle]="appearanceValue === 'circle'"
    [class.square]="appearanceValue === 'square'"
    [class.progress]="animationValue === 'progress'"
    [class.progress-dark]="animationValue === 'progress-dark'"
    [class.pulse]="animationValue === 'pulse'"
    [class.pulse-dark]="animationValue === 'pulse-dark'"
    [style]="styles()"
    >
    @if (appearanceValue  === 'custom-content') {
      <ng-content></ng-content>
    }
  </div>
}
`,
      styles: ['.skeleton-loader{--ngx-skeleton-loader-base-color: rgb(239, 241, 246);--ngx-skeleton-loader-light-mode-color: rgba(255, 255, 255, .6);--ngx-skeleton-loader-light-mode-color-to: rgba(255, 255, 255, 0);--ngx-skeleton-loader-dark-mode-color: rgba(0, 0, 0, .2);--ngx-skeleton-loader-dark-mode-color-to: transparent;--ngx-skeleton-loader-animation-duration: 2s;--ngx-skeleton-loader-background-image-light-mode: linear-gradient( 90deg, var(--ngx-skeleton-loader-light-mode-color-to), var(--ngx-skeleton-loader-light-mode-color), var(--ngx-skeleton-loader-light-mode-color-to) );--ngx-skeleton-loader-background-image-dark-mode: linear-gradient( 90deg, var(--ngx-skeleton-loader-dark-mode-color-to), var(--ngx-skeleton-loader-dark-mode-color), var(--ngx-skeleton-loader-dark-mode-color-to) );box-sizing:border-box;overflow:hidden;position:relative;background:var(--ngx-skeleton-loader-base-color) no-repeat;border-radius:4px;width:100%;height:20px;display:inline-block;margin-bottom:10px;will-change:transform}.skeleton-loader:after,.skeleton-loader:before{box-sizing:border-box}.skeleton-loader.circle{width:40px;height:40px;margin:5px;border-radius:50%}.skeleton-loader.square{width:40px;height:40px;margin:5px}.skeleton-loader.progress:after,.skeleton-loader.progress:before,.skeleton-loader.progress-dark:after,.skeleton-loader.progress-dark:before{box-sizing:border-box}.skeleton-loader.progress,.skeleton-loader.progress-dark{transform:translateZ(0)}.skeleton-loader.progress:before,.skeleton-loader.progress-dark:before{animation:progress var(--ngx-skeleton-loader-animation-duration) ease-in-out infinite;background-size:200px 100%;position:absolute;z-index:1;top:0;left:0;width:200px;height:100%;content:""}.skeleton-loader.progress:before{background-image:var(--ngx-skeleton-loader-background-image-light-mode)}.skeleton-loader.progress-dark:before{background-image:var(--ngx-skeleton-loader-background-image-dark-mode)}.skeleton-loader.pulse{animation:pulse var(--ngx-skeleton-loader-animation-duration) cubic-bezier(.4,0,.2,1) infinite;animation-delay:.5s}.skeleton-loader.pulse-dark{background:var(--ngx-skeleton-loader-dark-mode-color);animation:pulse var(--ngx-skeleton-loader-animation-duration) cubic-bezier(.4,0,.2,1) infinite;animation-delay:.5s}.skeleton-loader.custom-content{height:100%;background:none}@media(prefers-reduced-motion:reduce){.skeleton-loader.pulse,.skeleton-loader.progress-dark,.skeleton-loader.pulse-dark,.skeleton-loader.custom-content,.skeleton-loader.progress:before{animation:none}.skeleton-loader.progress:before,.skeleton-loader.progress-dark,.skeleton-loader.pulse-dark,.skeleton-loader.custom-content{background-image:none}}@media screen and (min-device-width:1200px){.skeleton-loader{-webkit-user-select:none;user-select:none;cursor:wait}}@keyframes progress{0%{transform:translate3d(-200px,0,0)}to{transform:translate3d(calc(200px + 100vw),0,0)}}@keyframes pulse{0%{opacity:1}50%{opacity:.4}to{opacity:1}}\n']
    }]
  }], null, {
    count: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "count",
        required: false
      }]
    }],
    loadingText: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "loadingText",
        required: false
      }]
    }],
    appearance: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "appearance",
        required: false
      }]
    }],
    animation: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "animation",
        required: false
      }]
    }],
    ariaLabel: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "ariaLabel",
        required: false
      }]
    }],
    theme: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "theme",
        required: false
      }]
    }],
    size: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "size",
        required: false
      }]
    }],
    measureUnit: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "measureUnit",
        required: false
      }]
    }]
  });
})();
var NgxSkeletonLoaderModule = class _NgxSkeletonLoaderModule {
  static forRoot(config) {
    return {
      ngModule: _NgxSkeletonLoaderModule,
      providers: [{
        provide: NGX_SKELETON_LOADER_CONFIG,
        useValue: config
      }]
    };
  }
  static {
    this.ɵfac = function NgxSkeletonLoaderModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _NgxSkeletonLoaderModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _NgxSkeletonLoaderModule,
      imports: [NgxSkeletonLoaderComponent],
      exports: [NgxSkeletonLoaderComponent]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({});
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgxSkeletonLoaderModule, [{
    type: NgModule,
    args: [{
      imports: [NgxSkeletonLoaderComponent],
      exports: [NgxSkeletonLoaderComponent]
    }]
  }], null, null);
})();
function provideNgxSkeletonLoader(config) {
  return makeEnvironmentProviders([{
    provide: NGX_SKELETON_LOADER_CONFIG,
    useValue: config
  }]);
}
export {
  NGX_SKELETON_LOADER_CONFIG,
  NgxSkeletonLoaderComponent,
  NgxSkeletonLoaderModule,
  provideNgxSkeletonLoader
};
//# sourceMappingURL=ngx-skeleton-loader.js.map
