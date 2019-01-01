import { ArrowButton, ARROW_ROTATION } from './arrowbutton';
import { Shape, SHAPE_TYPE, SHAPE_STATE } from './shape';

//滚动条宽度(使用奇数避免直线偏移)
const SCROLLBAR_WIDTH = 21;
//滚动条背景色
const BAR_BACKGROUND_COLOR = 0xC0C0C0;
const BAR_FOREGROUND_COLOR = 0xF0F0F0;
//滑动块的颜色设置
const BLOCK_HOVER_COLOR = 0xF8F8F8;
//箭头按钮偏移量
const UNIT_INCREMENT = 10;

/**
 * 滚动条方向
 * 选项：HORIZONTAL（横向）、VERTICAL（纵向）
 */
export const SCROLLBAR_ORIENTATION = {
	HORIZONTAL: 0,
	VERTICAL: 1
}

/**
 * 滚动条类
 * 包含：两个三角箭头按钮、滑动块，目前支持横向和纵向两种滚动条
 * @class
 * @author David Tang<davidtang2018@163.com>
 * @extends PIXI.Container
 * @memberof DJ
 */
export class ScrollBar extends PIXI.Container {
	constructor(style) {
		super()
        this.interactive = true;

		this._barWidth = SCROLLBAR_WIDTH;
		this._barLength = 100;
		this._contentLength = 100;
		this._value = 0;
		this._unitIncrement = UNIT_INCREMENT;
		this._blockIncrement = UNIT_INCREMENT;
		this._orientation = SCROLLBAR_ORIENTATION.HORIZONTAL;

		if (style!=undefined) {
			this._barWidth = style.barWidth!=undefined?style.barWidth:this._barWidth;
			this._barLength = style.barLength!=undefined?style.barLength:this._barLength;
			this._contentLength = style.contentLength!=undefined?style.contentLength:this._contentLength;
			this._unitIncrement = style.unitIncrement!=undefined?style.unitIncrement:this._unitIncrement;
			this._orientation = style.orientation!=undefined?style.orientation:this._orientation;
		}
		
        this._graphics = new PIXI.Graphics();
        this.addChild(this._graphics);

		//鼠标点击事件（在滑动块前后位置时变更）
		this.on("pointerdown", e => {
			//当前位置
			//console.log(this.toLocal(e.data.global));
			let pt = this.toLocal(e.data.global)
			const pos = this.isVertical ? pt.y : pt.x;
			const b = this._block
			const blockHead = this.isVertical ? b.y : b.x
			const blockTail = this.isVertical ? b.y + b.height : b.x + b.width
			if (pos < blockHead) {
			 	this.value = this._value - this._blockIncrement;
			}
			if (pos > blockTail) {
				this.value = this._value + this._blockIncrement;
			}
		 	//David: 阻止事件冒泡，触发其他控件干扰			 	
			e.stopPropagation();
		});

		if (this._orientation==SCROLLBAR_ORIENTATION.VERTICAL) {
			this._headArrow = new ArrowButton(ARROW_ROTATION.UP, {width: SCROLLBAR_WIDTH/1.15, height: SCROLLBAR_WIDTH/2, enableHover: true});
			this._tailArrow = new ArrowButton(ARROW_ROTATION.DOWN, {width: SCROLLBAR_WIDTH/1.15, height: SCROLLBAR_WIDTH/2, enableHover: true});
		} else {
			this._headArrow = new ArrowButton(ARROW_ROTATION.LEFT, {width: SCROLLBAR_WIDTH/1.15, height: SCROLLBAR_WIDTH/2, enableHover: true});				
			this._tailArrow = new ArrowButton(ARROW_ROTATION.RIGHT, {width: SCROLLBAR_WIDTH/1.15, height: SCROLLBAR_WIDTH/2, enableHover: true});			
		}

		this._headArrow.on("pointerdown", e => {
			this.value = this._value - this._unitIncrement;
		 	//David: 阻止事件冒泡，触发其他控件干扰			 	
			e.stopPropagation();
		})
		this._tailArrow.on("pointerdown", e => {
			this.value = this._value + this._unitIncrement;
		 	//David: 阻止事件冒泡，触发其他控件干扰			 	
			e.stopPropagation();
		})
		this.addChild(this._headArrow, this._tailArrow)
		
		//David: enableClick=false屏蔽Shape所有事件，自定义滑动块所有事件
		this._block = new Shape({enableClick: false});
		this._block.setBackgroundColor(SHAPE_STATE.NORMAL, BAR_FOREGROUND_COLOR);
		this._block.setOutlineColors(SHAPE_STATE.NORMAL, BAR_FOREGROUND_COLOR);
		this._block.on("pointerdown", e => {
		    this._block.alpha = 0.6;
		    this._dragging = true;
			let pt = this.toLocal(e.data.global);
			//记录鼠标按下位置及显示位置
			this._startPos = {
			 	x: pt.x,
			 	y: pt.y,
			 	value: this._value
			}
		 	//David: 阻止事件冒泡，触发其他控件干扰			 	
			e.stopPropagation();
		})
		this._block.on("pointerup", e => {
		    this._block.alpha = 1;
		    this._dragging = false;
		})
		this._block.on("pointerupoutside", e => {
		    this._block.alpha = 1;
		    this._dragging = false;
		})
		this._block.on("pointermove", e => {
		    if (this._dragging) {
				let pt = this.toLocal(e.data.global);;
			 	const delta = this.isVertical ? pt.y - this._startPos.y : pt.x - this._startPos.x
			 	this.value = this._startPos.value + this._positionToValue(delta);
			 	//David: 阻止事件冒泡，触发其他控件干扰			 	
		    	e.stopPropagation();
		    }
		})
		// David: 按下滑块只要不松开，将不失去拖动事件
		// this._block.on("pointerout", e=>{
		//     this._block.alpha = 1;
		// 	this._dragging = false;
		// })
		this.addChild(this._block);
		this._reCalcBlock();
		this.redraw();
	}
	get _maxPos() {
		return Math.max(0, this._barLength - this._blockLength - 2 * this._barWidth)
	}
	//位置偏移转化为实际变化值
	_positionToValue(pos) {
		return pos * this._contentLength / this._maxPos
	}

	/**
	 * 返回内容的实际值
	 * @return {integer} [description]
	 */
	get value() {
		return this._value;
	}
	set value(data) {
		const oldValue = this._value;
		//let d = (data!=undefined)?data:0;
		const newValue = Math.max(0,Math.floor(Math.min(data, this._contentLength)));
		if (oldValue != newValue) {
			this._value = newValue;
			this.redraw()
			this.emit("change", {old: oldValue, new: newValue});
		}
	}
	/**
	 * 计算滑动块相关内部参数
	 */
	_reCalcBlock() {
		const h = Math.max(0,this._barLength - this._barWidth * 2);
		this._blockIncrement = Math.max(this._unitIncrement, Math.min(this._contentLength / 2, this._barLength));
		//David 2018-12-26：滑动块最大占高度2/3，最小为宽度滚动条
		this._blockLength =  Math.max(this._barWidth,h * Math.max(0, Math.min(2/3, h / this._contentLength)));
	}

	/**
	 * 滚动条内容长度
	 */
	get contentLength() {
		return this._contentLength
	}
	set contentLength(length) {
		this._contentLength = length;
		if (this._contentLength < this.value) {
			this.value = this._contentLength
		}
		this._reCalcBlock();
		this.redraw()
	}

	/**
	 * 滚动条宽度（粗细尺寸）
	 */
	get barWidth() {
		return this._barWidth
	}
	set barWidth(width) {
		this._barWidth = width
		this.isVertical ? this._height = this._barWidth : this._width = this._barWidth;		
		this._reCalcBlock();
		this.redraw()
	}

	/**
	 * 外部调用滚动条长度
	 */
	get barLength() {
		return this._barLength
	}
	set barLength(length) {
		(length<this._barWidth*3) ? this._barLength=this._barWidth*3 : this._barLength=length;
		this.isVertical ? this._height = this._barLength : this._width = this._barLength;
		this._reCalcBlock();
		this.redraw();			
	}

	/**
	 * 是否为垂直方向滚动条
	 * @return {Boolean} [description]
	 */
	get isVertical() {
		return this._orientation == SCROLLBAR_ORIENTATION.VERTICAL;
	}

	redraw() {
		//David：避免没有添加到父类容器，重绘报错！
		if (!this.parent) {
			return;
		}
		let g = this._graphics.clear()
		g.beginFill(BAR_BACKGROUND_COLOR).lineStyle(0);
		if (this.isVertical) {
			g.drawRect(0, 0, this.barWidth, this.barLength);
		} else {
			g.drawRect(0, 0, this.barLength, this.barWidth)
		}
		g.endFill();
		
		this._drawBlock();
		this._drawArrows();
	}

	/**
	 * 绘制滑动块
	 */
	_drawBlock() {
		const pos = this._maxPos*this._value/this._contentLength+this._barWidth;
		if (this.isVertical) {
			this._block._width = this._barWidth-4;
			this._block.x = 2;
			this._block.y = pos;
			this._block._height = this._blockLength-1;
		} else {
			this._block._height = this._barWidth-4;
			this._block.y = 2;
			this._block.x = pos;
			this._block._width = this._blockLength;
		}
		this._block.redraw()
	}

	/**
	 * 设置箭头按钮显示状态
	 */
	_setArrowsState() {
		this._tailArrow.enabled = true;
		this._headArrow.enabled = true;
		if (this.value == this.contentLength) {
			this._tailArrow.enabled = false
		}
		if (this.value == 0) {
			this._headArrow.enabled = false
		}
		
	}
	
	/**
	 * 绘制三角按钮
	 */
	_drawArrows() {
		const pos = this.barLength - this._barWidth;
		// this._headArrow.setBounds(0, 0, this._barWidth, this._barWidth)
		// this._tailArrow.setBounds(0, 0, this._barWidth, this._barWidth)
		this._headArrow._width = this._barWidth;
		this._headArrow._height = this._barWidth;
		this._tailArrow._width = this._barWidth;
		this._tailArrow._height = this._barWidth;
		if (this.isVertical) {
			this._tailArrow.y = pos				
		} else {				
			this._tailArrow.x = pos				
		}
		this._setArrowsState();
		this._headArrow.redraw()
		this._tailArrow.redraw()
	}
}
