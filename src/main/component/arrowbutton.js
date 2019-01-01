import { Shape, SHAPE_STATE } from "./shape";
import { PixiUtils as utils } from "./pixiutils";

const ARROW_COLOR = 0xE0E0E0
const ARROW_SIZE_PERCENT = 0.8
const ARROW_WIDTH = 40;
const ARROW_HEIGHT = 30;

/**
 * 箭头指向方向
 * @type {Object}
 */
export const ARROW_ROTATION = {
	UP: 0,
	DOWN: 180,
	LEFT: -90,
	RIGHT: 90
}

/**
 * 三角箭头按钮类
 * @class
 * @author David Tang<davidtang2018@163.com>
 * @extends Shape
 * @memberof DJ
 */
export class ArrowButton extends Shape  {
	constructor(arrowRotation, style) {
		super(style);

		this._arrowRotation = arrowRotation ? arrowRotation : ARROW_ROTATION.UP;
		this._height = ARROW_HEIGHT;
		this._width = ARROW_WIDTH;
        if (style != undefined) {
            // this.title.style = style.textStyle ? style.textStyle : this._textStyle;
            this._width = style.width ? style.width : this._width;
            this._height = style.height ? style.height : this._height;
        }
		this._arrowWidth = this._width*ARROW_SIZE_PERCENT
		this._arrowHeight = this._height*ARROW_SIZE_PERCENT

		if (arrowRotation==ARROW_ROTATION.LEFT || arrowRotation==ARROW_ROTATION.RIGHT) {
			let tmp = this._width;
			this._width = this._height;
			this._height = tmp;			
		}
		// //设置container容器原点
		// this.pivot.x = this._width / 2;
		// this.pivot.y = this._height / 2;
		this.redraw()
	}

	redraw() {
		super.redraw();

        //避免super调用redraw时未初始化的问题
		if (this._arrowRotation==undefined) return;

		//以中心点变换指定角度的坐标矩阵
        this.beginFill(ARROW_COLOR);
        let points = [new PIXI.Point(0, -this._arrowHeight / 2), new PIXI.Point(this._arrowWidth / 2, this._arrowHeight / 2), new PIXI.Point(-this._arrowWidth / 2, this._arrowHeight / 2)];
        utils.drawPoints(this, points, new PIXI.Point(this._width / 2, this._height / 2), this._arrowRotation);
        this.endFill();
	}
}
