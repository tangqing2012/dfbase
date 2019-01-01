//import * as PIXI from "pixi.js";
import { PixiUtils as utils } from "./pixiutils";

const SHAPE_BACKGROUND_COLOR = 0xFFFFFF
const SHAPE_BACKGROUND_HOVER_COLOR = 0xF0F0F0
const SHAPE_BACKGROUND_FOCUS_COLOR = 0xE0E0E0
const SHAPE_BACKGROUND_DISABLED_COLOR = 0xA0A0A0
const SHAPE_OUTLINE_COLOR = 0xC0C0C0
const SHAPE_OUTLINE_HOVER_COLOR = 0x909090
const SHAPE_OUTLINE_FOCUS_COLOR = 0x606060
const SHAPE_OUTLINE_DISABLED_COLOR = 0xA0A0A0
const SHAPE_OUTLINE_RADIUS = 5
const SHAPE_HEIGHT = 20
const SHAPE_WIDTH = 50

const DBLCLICK_INTERVAL = 300

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
 * @author David Tang<davidtang2018@163.com>
 * @extends PIXI.Graphics
 * @memberof DJ
 */
export class Shape extends PIXI.Graphics {
    constructor(style) {
        super();
        this.interactive = true;
        this.mask = new PIXI.Graphics();
        this.addChild(this.mask);

        this._backgroundColors = [SHAPE_BACKGROUND_COLOR, SHAPE_BACKGROUND_HOVER_COLOR, SHAPE_BACKGROUND_FOCUS_COLOR, SHAPE_BACKGROUND_DISABLED_COLOR];
        this._outlineColors = [SHAPE_OUTLINE_COLOR, SHAPE_OUTLINE_HOVER_COLOR, SHAPE_OUTLINE_FOCUS_COLOR, SHAPE_OUTLINE_DISABLED_COLOR];
        this._state = SHAPE_STATE.NORMAL;
        this._shapeType = SHAPE_TYPE.RECT;
        this._radius = SHAPE_OUTLINE_RADIUS;
        this._width = SHAPE_WIDTH;
        this._height = SHAPE_HEIGHT;
        this._dblDown = false;
        this._dragging = false;
        this._autoFocus = true;
        this._enableFocus = false;
        this._enableHover = false;
        this._enableDrag = false;
        this._enableClick = true;
 
        if (style != undefined) {
            this._shapeType = style.type || this._shapeType;
            this._backgroundColors = style.backgroundColors!=undefined?style.backgroundColors:this._backgroundColors;
            this._outlineColors = style.outlineColors!=undefined?style.outlineColors:this._outlineColors;
            this._radius = style.radius!=undefined?style.radius:this._radius;
            this._width = style.width||this._width;
            this._height = style.height||this._height;
            this._enableHover = style.enableHover!=undefined?style.enableHover:this._enableHover;
            this._enableFocus = style.enableFocus!=undefined ? style.enableFocus : this._enableFocus;
            this._autoFocus = style.autoFocus!=undefined ? style.autoFocus : this._autoFocus;
            this._enableDrag =  style.enableDrag!=undefined ? style.enableDrag : this._enableDrag;
            this._enableClick =  style.enableClick!=undefined ? style.enableClick : this._enableClick;
        }

        if (this._enableClick || this._enableHover || this._enableDrag) {
            this.on("pointerdown", this.pointerDownEvent.bind(this));
            this.on("pointerout", this.pointerOutEvent.bind(this));             
        }
        if (this._enableHover || this._enableDrag) {
            this.on("pointerup", this.pointerUpEvent.bind(this));
            this.on("pointermove", this.pointerMoveEvent.bind(this));
            this.on("pointerupoutside", this.pointerUpOutsideEvent.bind(this));
        }           

        this.redraw();
    }

    redraw() {
        this.clear().beginFill(this._backgroundColors[this._state]);
        this.lineStyle(1, this._outlineColors[this._state]);
        switch (this._shapeType) {
            case SHAPE_TYPE.ROUND:
                // David: 偏移0.5避免画线不全
                this.drawRoundedRect(0.5, 0.5, this._width-1, this._height-1, this._radius);
                this.mask.clear().beginFill(0xFFFFFF).drawRoundedRect(0, 0, this._width, this._height, this._radius).endFill();
                break;
            case SHAPE_TYPE.ELLIPSE:
                this.drawEllipse(this._width/2, this._height/2, this._width/2-0.5, this._height/2-0.5);
                this.mask.clear().beginFill(0xFFFFFF).drawEllipse(this._width/2, this._height/2, this._width/2, this._height/2).endFill();
                break;
            case SHAPE_TYPE.CIRCLE:
                this.drawCircle(this._width/2, this._height/2, Math.max(this._width, this._height)/2-0.5);
                this.mask.clear().beginFill(0xFFFFFF).drawCircle(this._width/2, this._height/2, Math.max(this._width, this._height)/2).endFill();
                break;
            default:
                this.drawRect(0.5, 0.5, this._width-1, this._height-1);
                this.mask.clear().beginFill(0xFFFFFF).drawRect(0, 0, this._width, this._height).endFill();
                break;
        }
        this.endFill();
    }

    pointerDownEvent(event) {
        if (this.enabled) {
            setTimeout(()=>{
                this._dblDown = false;
            }, DBLCLICK_INTERVAL);
            if (this._dblDown) {
                this.emit("dblClick", this);
                this._dblDown = false;
            } else {
                this._dblDown = true;
            }
            //记录鼠标按下位置及显示位置
            let pt = this.toLocal(event.data.global);
            this._data = {
                startPt: pt
            }
            if (this._enableFocus) {
                if (!this.focus) {
                    utils.cancelFocus(this);
                }
                this.focus = true;
            }
            if (this._enableDrag) {
                this._dragging = true;
            }
            //David: 阻止事件冒泡，触发其他控件干扰                
            event.stopPropagation();
        }
    }
    
    pointerUpEvent(event) {
        if (this._data==undefined) return;

        this._dragging = false;
        this._data = undefined;
        this.redraw();
    }

    pointerMoveEvent(event) {
        // David: 不用范围判断避免光标过快丢失
        // if (this.hitArea.contains(pt.x, pt.y)) {
            if (this.enabled && this._enableHover && this.containsPoint(event.data.global)) {
                this.state = SHAPE_STATE.HOVER;
            }
            if (this._dragging) {
                let pt = this.toLocal(event.data.global);
                let dX = pt.x - this._data.startPt.x;
                let dY = pt.y - this._data.startPt.y;
                this.x += dX;
                this.y += dY;
                if (dX!=0 || dY!=0) {
                    this.emit("dragging", {ox: dX, oy: dY});                    
                }
                //David: 拖动时阻止事件冒泡，触发其他控件干扰                
                event.stopPropagation();
            }           
        //}
    }

    pointerUpOutsideEvent(event) {
        this._dragging = false;
        this._data = undefined;
        this._DblDown = false;
        this.redraw();
    }

    pointerOutEvent(event) {
        this._dblDown = false;
        if (this.enabled) {
            this.state = SHAPE_STATE.NORMAL;
        }
    }

    set state(value) {
        if (this.enabled && !this.focus) {
            this._state = value;
            this.redraw();
        }
    }

    set focus(value) {
        if (this.enabled && this._enableFocus) {
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
    setType(value) {
        this._shapeType = value;
        this.redraw();
    }

    /**
     * 提供修正控件原始尺寸方法，
     * 注：直接width/height赋值会按比例缩放控件
     * @param {[type]} value [description]
     */
    setWidth(value) {
        this._width = value;
        this.redraw();
    }

    setHeight(value) {
        this._height = value;
        this.redraw();
    }

}