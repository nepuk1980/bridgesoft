import {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger
} from "./chunk-2D7GVEXT.js";
import "./chunk-DLYYKCDW.js";
import "./chunk-QSHKY2GG.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-OHNBXXH6.js";
import "./chunk-NLRJCLHE.js";
import "./chunk-UFPVG67W.js";
import "./chunk-AUHU6XYI.js";
import "./chunk-XBE2FGQS.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-C6AMCOKZ.js";
import "./chunk-TBYAXMQR.js";
import "./chunk-ROBZHSAU.js";
import "./chunk-WFI44RQT.js";
import "./chunk-UW7CF3D6.js";
import "./chunk-NGXG6E7N.js";
import "./chunk-DGIV2XWW.js";
import "./chunk-42FJBLFI.js";
import "./chunk-JXBCBRYI.js";
import "./chunk-AMWKQTNT.js";
import "./chunk-FMSWPIF3.js";
import "./chunk-QAXIITOP.js";
import "./chunk-STWRIDHW.js";
import "./chunk-2O4WY5GE.js";
import "./chunk-F7Z7VGTA.js";
import "./chunk-UX7RCZUA.js";
import "./chunk-ZX62EISZ.js";
import "./chunk-GISMJBQT.js";
import "./chunk-HYACTD6R.js";
import "./chunk-P36SKQWJ.js";
import "./chunk-YW4RGGYS.js";
import "./chunk-E522RDW6.js";
import "./chunk-DNOWJMKO.js";
import "./chunk-4SFH2INT.js";
import "./chunk-JTWMFPD7.js";
import "./chunk-MHZMD4Y4.js";
import "./chunk-PEBH6BBU.js";
import "./chunk-WPM5VTLQ.js";
import "./chunk-4S3KYZTJ.js";
import "./chunk-KBUIKKCC.js";

// node_modules/@angular/material/fesm2022/select.mjs
var matSelectAnimations = {
  // Represents
  // trigger('transformPanelWrap', [
  //   transition('* => void', query('@transformPanel', [animateChild()], {optional: true})),
  // ])
  /**
   * This animation ensures the select's overlay panel animation (transformPanel) is called when
   * closing the select.
   * This is needed due to https://github.com/angular/angular/issues/23302
   */
  transformPanelWrap: {
    type: 7,
    name: "transformPanelWrap",
    definitions: [{
      type: 1,
      expr: "* => void",
      animation: {
        type: 11,
        selector: "@transformPanel",
        animation: [{
          type: 9,
          options: null
        }],
        options: {
          optional: true
        }
      },
      options: null
    }],
    options: {}
  },
  // Represents
  // trigger('transformPanel', [
  //   state(
  //     'void',
  //     style({
  //       opacity: 0,
  //       transform: 'scale(1, 0.8)',
  //     }),
  //   ),
  //   transition(
  //     'void => showing',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1, 1)',
  //       }),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])
  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: {
    type: 7,
    name: "transformPanel",
    definitions: [{
      type: 0,
      name: "void",
      styles: {
        type: 6,
        styles: {
          opacity: 0,
          transform: "scale(1, 0.8)"
        },
        offset: null
      }
    }, {
      type: 1,
      expr: "void => showing",
      animation: {
        type: 4,
        styles: {
          type: 6,
          styles: {
            opacity: 1,
            transform: "scale(1, 1)"
          },
          offset: null
        },
        timings: "120ms cubic-bezier(0, 0, 0.2, 1)"
      },
      options: null
    }, {
      type: 1,
      expr: "* => void",
      animation: {
        type: 4,
        styles: {
          type: 6,
          styles: {
            opacity: 0
          },
          offset: null
        },
        timings: "100ms linear"
      },
      options: null
    }],
    options: {}
  }
};
export {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatOptgroup,
  MatOption,
  MatPrefix,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger,
  MatSuffix,
  matSelectAnimations
};
//# sourceMappingURL=@angular_material_select.js.map
