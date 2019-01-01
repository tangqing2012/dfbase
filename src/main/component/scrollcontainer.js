import { ScrollBar, SCROLLBAR_ORIENTATION } from './scrollbar';

const BACKGROUND_COLOR = 0xF0F0F0
const ENABLE_DRAG = false

/**
 * 滚动容器类
 * @class
 * @author David Tang<davidtang2018@163.com>
 * @extends PIXI.Container
 * @memberof DJ
 */
export class ScrollContainer extends PIXI.Container {
	constructor(width, height, style) {
		super();
        this.interactive = true;

		this._width = width;
		this._height = height;

		//内容容器
		this._container = new PIXI.Container();
        this._container.interactive = true;
		this._masking = new PIXI.Graphics();
		this._container.addChild(this._masking);
		this._container.mask = this._masking;
		this._backgroundColor = BACKGROUND_COLOR
		this._enableDrag = ENABLE_DRAG;
		this._contentSize = {width:0, height:0};

		if (style) {
			this._backgroundColor = (style.backgroundColor!=undefined)?style.backgroundColor:this._backgroundColor
			this._enableDrag = (style.enableDrag!=undefined)?style.enableDrag:this._enableDrag;
		}

		this._hScrollBar = new ScrollBar({orientation: SCROLLBAR_ORIENTATION.HORIZONTAL})
		this._hScrollBar.x = 0;
		this._hScrollBar.barLength = width;
		this._hScrollBar.y = height - this._hScrollBar.barWidth;
		this._vScrollBar = new ScrollBar({orientation: SCROLLBAR_ORIENTATION.VERTICAL})
		this._vScrollBar.y = 0;
		this._vScrollBar.x = width - this._vScrollBar.barWidth;

		this._graphics = new PIXI.Graphics();
		this._graphics.beginFill(this._backgroundColor).drawRect(0,0,width,height).endFill();
		this.addChild(this._graphics, this._container, this._hScrollBar, this._vScrollBar);


        // this._container.width = width;
        // this._container.height = height;
		// this.addChild(this._container, this._vScrollBar, this._hScrollBar)
		
		//原有addChild/removeChild方法改名
		this.superAddChild = this.addChild
		this.superRemoveChild = this.removeChild
		//addChild/removeChild方法替换为显示容器的addChild
		this.addChild = child => {
			this._container.addChild(child);
			this.contentSize = {width: this._container.width, height: this._container.height}
		}
		this.removeChild = child => {
			this._container.removeChild(child)
			this.contentSize = {width: this._container.width, height: this._container.height}
		}

		this.contentSize = {width: this._width, height: this._height};

		//设置垂直滚动条响应事件（y轴位置变化）
		this._vScrollBar.on("change", (value) => {
			//if (this.contentSize.height<=this.height) return;
			let os = Math.max(0, value.new - Math.floor(this._height * value.new / this._vScrollBar.contentLength));
			this._container.y =  -os;
			this._masking.y = os;
			//激发scroll事件
			this.emit("scrollY", this.scrollY);
		})
		//设置水平滚动条响应事件（x轴位置变化）
		this._hScrollBar.on("change", (value) => {
			//if (this.contentSize.width<=this.width) return;
			let os = Math.max(0, value.new - Math.floor(this._width * value.new / this._hScrollBar.contentLength));
			this._container.x = -os;
			this._masking.x = os;
			this.emit("scrollX", this.scrollX);
		})

		this.on("pointerdown", (event)=>{
			if (this._enableDrag) {
				// console.log("ScrollContainer pointerdown")
			    this._dragging = true;
				let pt = new PIXI.Point(event.data.global.x, event.data.global.y);
				//记录鼠标按下位置及显示位置
				this._data = {
					startPt: pt,
					startScroll: {x: this.scrollX, y: this.scrollY}
				}
			}			
		});

		this.on("pointermove",(event)=>{
	        if (this._dragging) {
				// console.log("ScrollContainer pointermove", event);
				let p = new PIXI.Point(event.data.global.x, event.data.global.y);
			    let x = this._data.startScroll.x - p.x + this._data.startPt.x;
			    let y = this._data.startScroll.y - p.y + this._data.startPt.y;
			 	x = Math.max(0,Math.min(x, this.maxScrollX));
			 	y = Math.max(0,Math.min(y, this.maxScrollY));
				this.scrollX = x;
				this.scrollY = y;
			 	this.emit("dragging", {sx: x, sy: y, ox: p.x-this._data.startPt.x, oy: p.y-this._data.startPt.y});
		    }    		
		});
		this.on("pointerup", (event)=>{
			this._dragging = false;
		})
		this.on("pointerout", (event)=>{
			this._dragging = false;
		})
	}

	redraw() {
		// David: 避免继承类调用时未初始化
		if (!this._contentSize) return;

		this._hScrollBar.visible = this._contentSize.width>this.viewWidth;
		this._vScrollBar.visible = this._contentSize.height>this.viewHeight;

		this._vScrollBar.contentLength = this._hScrollBar.visible?this._contentSize.height+this._hScrollBar.barWidth:this._contentSize.height; 
		this._vScrollBar.barLength = this._hScrollBar.visible?this._height-this._hScrollBar.barWidth:this._height;
		this._hScrollBar.contentLength = this._vScrollBar.visible?this._contentSize.width+this._vScrollBar.barWidth:this._contentSize.width;
		// this._hScrollBar.barLength = this._width;

		this._masking.clear().lineStyle(0).beginFill(0xFFFFFF).drawRect(0, 0, this.viewWidth, this.viewHeight).endFill();		
	}

	get viewWidth() {
		return this._contentSize.height>this._height?this._width-this._vScrollBar.barWidth:this._width;
	}

	get viewHeight() {
		return this._contentSize.width>this._width?this._height-this._hScrollBar.barWidth:this._height;
	}

	get scrollX() {
		return -this._container.x;
	}
	get maxScrollX() {
		return Math.max(1, (this._hScrollBar.contentLength-this._width));
	}
	set scrollX(value) {
		this._container.x = -value;
		this._masking.x = value;
		this._hScrollBar.value = Math.max(0, value*this._hScrollBar.contentLength/this.maxScrollX);
	}

	get scrollY() {
		return -this._container.y;
	}
	get maxScrollY() {
		return Math.max(1, (this._vScrollBar.contentLength-this._height));
	}
	set scrollY(value) {
		//let os = Math.max(0, value-Math.floor(this._height*value/this._vScrollBar.contentLength));
		this._container.y = -value;
		this._masking.y = value;
		this._vScrollBar.value = Math.max(0, value*this._vScrollBar.contentLength/this.maxScrollY);
	}

	//设置内容尺寸
	set contentSize(size) {
		if (size.height!=this._contentSize.height || size.width!=this._contentSize.width) {
			this._contentSize = size;
			this.redraw();					

			this.scrollX = Math.min(size.width, this.scrollX)
			this.scrollY = Math.min(size.height, this.scrollY)


			// let x = Math.min(this._hScrollBar._positionToValue(size.width), this._hScrollBar.value)
			// let y = Math.min(this._vScrollBar._positionToValue(size.height), this._vScrollBar.value)
			// //this._vScrollBar.value = x;
			// //this._hScrollBar.value = y;
			// this.scrollX=x;
			// this.scrollY=y;
		}
	}

	get contentSize() {
		return this._contentSize;
	}

	get height() {
		return this._height;
	}

	get width() {
		return this._width;
	}
}

