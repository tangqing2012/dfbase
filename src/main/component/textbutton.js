//import * as PIXI from "pixi.js";
import { Shape, SHAPE_STATE } from './shape';
import { KeyBoard } from './keyboard.js';

const DEFAULT_TEXT = "Button"

/**
 * 按钮类
 * @class
 * @author David Tang<davidtang2018@163.com>
 * @extends Shape
 * @memberof DJ
 */
export class TextButton extends Shape {
    constructor(text, style) {
        super(style);

        this._textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", 
            fontSize: 12
        });
 
        let t = text?text:DEFAULT_TEXT;
        this.title = new PIXI.Text(t, this._textStyle);

        if (style != undefined) {
            this.title.style = style.textStyle || this._textStyle;
            if (style.canSpaceToClick) {
                this._space = new KeyBoard(32);
                this._space.press = ()=>{
                    if (this.focus) {
                        this.click();                        
                    }
                }
            }
        }

        this._width = this.title.width + 12 * 2;
        this._height = this.title.height + 6 * 2;

        this.addChild(this.title);
        this.redraw();
    }

    redraw() {
        //避免super调用redraw时未初始化的问题
       if (this.title===undefined) return;

        super.redraw();
        
        if (this._state==SHAPE_STATE.HOVER){
            this.title.x = this.title.x + 1;
            this.title.y = this.title.y + 1;
        }
        else if (this._state==SHAPE_STATE.FOCUS){
            this.title.style.fontWeight = "bold";
        } else {
            this.title.style.fontWeight = "normal";            
        }
        this.title.x = (this._width - this.title.width) / 2;
        this.title.y = (this._height - this.title.height) / 2;            
    }

    /**
     * 显示文本内容
     * @param  {String} value 显示字符串
     */
    set text(value) {
        this.title.text = value;
        this.redraw();
    }

}