//import * as PIXI from "pixi.js";
import { Shape, SHAPE_STATE, SHAPE_TYPE } from './shape';

const BACKGROUND_COLOR = 0xFFFFFF
const OUTLINE_COLOR = 0xA0A0A0
const WINDOW_TYPE = SHAPE_TYPE.ROUND

/**
 * 提供显示窗体基础类
 * @class
 * @author David Tang<davidtang2018@163.com>
 * @extends Shape
 * @memberof DJ
 */
export class ToolWindow extends Shape {
    constructor() {
        super({enableDrag: true, enableHover: true});

        this._defaultStyle = {
            fontFamily: "Arial", 
            fontSize: 11
        };
        this._elements = new Array();
    }

    clearElements() {
        if (this._elements) {
            this._elements.forEach(e=>{
                e.destroy();
            });
            this._elements=[];            
        }
        return this;
    }

    /**
     * 窗体显示要素模板
     * @param  {Object}  模板描述对象{height:..., width:...,elements:[{name:..., style:..., x:..., y:...},...]}
     */
    set template(templ) {
    	if (templ) {
    		this.clearElements();
    		templ.elements.forEach(e=>{
    			let element = new PIXI.Text(e.name, e.style ? e.style : this._defaultStyle);
    			element.x = e.x;
    			element.y = e.y;
                element.name = e.name;
    			this.addChild(element);
    			this._elements.push(element);
    		});
    		this._height = templ.height;
    		this._width = templ.width;
    		let bgColor = (templ.backgroundColor!=undefined)?templ.backgroundColor:BACKGROUND_COLOR;
    		let windowType = (templ.windowType!=undefined)?templ.windowType:WINDOW_TYPE;
    		this.setType(windowType);
    		this.setBackgroundColor(SHAPE_STATE.NORMAL, bgColor);
    	}
    }

    set data(value) {
    	value.forEach(x=>{
    		let element = this._elements.find(e=>{return e.name==x.name});
    		if (element) {
    			element.text = x.value;
    		}
    	});
    }
}
