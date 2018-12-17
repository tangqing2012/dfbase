//import * as PIXI from "pixi.js";
import { PixiUtils as utils } from "./pixiutils";

const SHAPE_BACKGROUND_COLOR = 0xF0F0F0
const SHAPE_BACKGROUND_HOVER_COLOR = 0xF8F8F8
const SHAPE_BACKGROUND_FOCUS_COLOR = 0xE0E0E0
const SHAPE_BACKGROUND_DISABLED_COLOR = 0xA0A0A0
const SHAPE_OUTLINE_COLOR = 0xA0A0A0
const SHAPE_OUTLINE_HOVER_COLOR = 0x888888
const SHAPE_OUTLINE_FOCUS_COLOR = 0x808080
const SHAPE_OUTLINE_DISABLED_COLOR = 0x808080
const SHAPE_OUTLINE_RADIUS = 5
const SHAPE_HEIGHT = 20
const SHAPE_WIDTH = 50

/**
 * 控件状态
 * @type {Object}
 */
export const SHAPE_STATE = {
    NORMAL: 0,
    HOVER: 1,
    FOCUS: 2,
    DISABLE: 3
}

/**
 * 控件外观形状
 * @type {Object}
 */
export const SHAPE_TYPE = {
	RECT: 0,
	ROUND: 1,
	ELLIPSE: 2,
	CIRCLE: 3
}

/**
 * 基类
 * 提供鼠标滑动、聚焦功能
 * @class
 * @extends PIXI.Container
 * @memberof DF
 */
export class Shape extends PIXI.Container {
    constructor(style) {
        super();

        this._backgroundColors = [SHAPE_BACKGROUND_COLOR, SHAPE_BACKGROUND_HOVER_COLOR, SHAPE_BACKGROUND_FOCUS_COLOR, SHAPE_BACKGROUND_DISABLED_COLOR];
        this._outlineColors = [SHAPE_OUTLINE_COLOR, SHAPE_OUTLINE_HOVER_COLOR, SHAPE_OUTLINE_FOCUS_COLOR, SHAPE_OUTLINE_DISABLED_COLOR];
        this._state = SHAPE_STATE.NORMAL;
        this._type = SHAPE_TYPE.RECT;
        this._radius = SHAPE_OUTLINE_RADIUS;
        this._width = SHAPE_WIDTH;
        this._height = SHAPE_HEIGHT;
        this._autoFocus = true;
 
        this.on("pointerdown", this.mouseDownEvent);
        this.interactive = true;

        this._graphics = new PIXI.Graphics();

        if (style != undefined) {
            this._type = style.type || this._type;
            this._backgroundColors = style.backgroundColors || this._backgroundColors;
            this._outlineColors = style.outlineColors || this._outlineColors;
            this._radius = style.radius || this._radius;
            this._width = style.width || this._width;
            this._height = style.height || this._height;
  			if (style.enableHover) {
		        this.on("pointermove", this.mouseHoverEvent);
		        this.on("pointerout", this.mouseHoverEvent);  				
  			}
            this._autoFocus = style.autoFocus!=undefined ? style.autoFocus : this._autoFocus;
        }

        this.addChild(this._graphics);
        this.redraw();
    }

    redraw() {
        let g = this._graphics.clear();
        g.beginFill(this._backgroundColors[this._state]);
        let i = 1;
        switch (this._state) {
            case SHAPE_STATE.FOCUS:
                i = 2;
                break;
            case SHAPE_STATE.HOVER:
                i = 2;
                break;
            default:
                i = 1;
                break;
        }
        g.lineStyle(i, this._outlineColors[this._state]);
        switch (this._type) {
            case SHAPE_TYPE.ROUND:
                g.drawRoundedRect(0, 0, this._width, this._height, this._radius);
                break;
            case SHAPE_TYPE.ELLIPSE:
                g.drawEllipse(this._width / 2, this._height / 2, this._width / 2, this._height / 2);
                break;
            case SHAPE_TYPE.CIRCLE:
                g.drawCircle(this._width / 2, this._height / 2, Math.max(this._width, this._height) / 2);
                break;
            default:
                g.drawRect(0, 0, this._width, this._height);
                break;
        }
        g.endFill();
    }

    mouseDownEvent(event) {
        if (event.currentTarget.enabled) {
            event.currentTarget.focus = true;
        }
    }
    
    mouseHoverEvent(event) {
        if (event.type == "pointermove"  && event.currentTarget._graphics.containsPoint(event.data.global)) {
            event.currentTarget.state = SHAPE_STATE.HOVER;
            event.currentTarget.cursor = "pointer";
        }
        else if (event.type == "pointerout") {
            event.currentTarget.state = SHAPE_STATE.NORMAL;
            event.currentTarget.cursor = "auto";
        }
    }

    set state(value) {
        if (this.enabled && !this.focus) {
            this._state = value;
            this.redraw();
        }
    }

    set focus(value) {
        if (this.enabled) {
            value && utils.cancelFocus(this);
            this._state = value ? SHAPE_STATE.FOCUS : SHAPE_STATE.NORMAL;
            this.redraw();
        }
    }
    get focus() {
        return this._state == SHAPE_STATE.FOCUS;
    }

    get autoFocus() {
        return this._autoFocus;
    }

    set enabled(value) {
        this._state = value ? SHAPE_STATE.NORMAL : SHAPE_STATE.DISABLE;
        this.redraw();
    }
    get enabled() {
        return this._state != SHAPE_STATE.DISABLE;
    }

    setOutlineColors(state, color) {
        this._outlineColors[state] = color
        this.redraw()
    }

    setBackgroundColor(state, color) {
        this._backgroundColors[state] = color
        this.redraw()
    }

    set height(value) {
        this._height = value;
        this.redraw();
    }
    get height() {
        return this._height;
    }

    set width(value) {
        this._width = value;
        this.redraw();
    }
    get width() {
        return this._width
    }
}