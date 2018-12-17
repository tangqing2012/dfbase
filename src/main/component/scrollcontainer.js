import { ScrollBar, SCROLLBAR_ORIENTATION } from './scrollbar';

const BACKGROUND_COLOR = 0xF0F0F0

/**
 * 滚动容器类
 * @class
 * @extends PIXI.Container
 * @memberof DF
 */
export class ScrollContainer extends PIXI.Container {
	constructor(width, height, style) {
		super();

		this._width = width;
		this._height = height;

		//内容容器
		this._container = new PIXI.Container();
		this._masking = new PIXI.Graphics();
		this._container.addChild(this._masking);
		this._container.mask = this._masking;

		this._hScrollBar = new ScrollBar({orientation: SCROLLBAR_ORIENTATION.HORIZONTAL})
		this._hScrollBar.x = 0;
		this._hScrollBar.barLength = width;
		this._hScrollBar.y = height - this._hScrollBar.barWidth;
		this._vScrollBar = new ScrollBar({orientation: SCROLLBAR_ORIENTATION.VERTICAL})
		this._vScrollBar.y = 0;
		this._vScrollBar.x = width - this._vScrollBar.barWidth;

		this._graphics = new PIXI.Graphics();
		this._backgroundColor = (style&&style.backgroundColor)||BACKGROUND_COLOR
		this._graphics.beginFill(this._backgroundColor).drawRect(0,0,width,height).endFill();
		this.addChild(this._graphics, this._container);

		this._container.x = 0;
		this._container.y = 0;
		//this.addChild(this._container, this._vScrollBar, this._hScrollBar)
		//原有addChild/removeChild方法改名
		this.superAddChild = this.addChild
		this.superRemoveChild = this.removeChild
		//addChild/removeChild方法替换为显示容器的addChild
		this.addChild = child => {
			this._container.addChild(child)
		}
		this.removeChild = child => {
			this._container.removeChild(child)
		}

		this.contentSize = (style&&style.contentSize)||{width: this._width, height: this._height};

		//设置垂直滚动条响应事件（y轴位置变化）
		this._vScrollBar.on("change", (value) => {
			let os = Math.max(0, value.new - Math.floor(this._height * value.new / this._vScrollBar.contentLength));
			this._container.y =  -os;
			this._masking.y = os;
			//激发scroll事件
			this.emit("scrollY", -this._container.y);
		})
		//设置水平滚动条响应事件（x轴位置变化）
		this._hScrollBar.on("change", (value) => {
			let os = Math.max(0, value.new - Math.floor(this._width * value.new / this._hScrollBar.contentLength));
			this._container.x = -os;
			this._masking.x = os;
			this.emit("scrollX", -this._container.x);
		})
	}

	get scrollX() {
		return -this._container.x;
	}
	set scrollX(value) {
		//let os = Math.max(0, value-Math.floor(this._width*value/this._hScrollBar.contentLength));
		this._container.x = -value;
		this._masking.x = value;
		this._hScrollBar.value = Math.max(0, value*this._hScrollBar.contentLength/(this._hScrollBar.contentLength-this._width));
	}

	get scrollY() {
		return -this._container.y;
	}
	set scrollY(value) {
		//let os = Math.max(0, value-Math.floor(this._height*value/this._vScrollBar.contentLength));
		this._container.y = -value;
		this._masking.y = value;
		this._vScrollBar.value = Math.max(0, value*this._vScrollBar.contentLength/(this._vScrollBar.contentLength-this._height));
	}

	//设置内容尺寸
	set contentSize(size) {
		//垂直滚动条高度需要考虑横向滚动条是否显示
		let h = 0;
		let w = 0;
		this._contentSize = size;
		if (size.width>this.width) {
			this.superAddChild(this._hScrollBar);
			h = this._hScrollBar.barWidth;
		} else {
			this.superRemoveChild(this._hScrollBar);
		}
		if (size.height>this.height) {
			this.superAddChild(this._vScrollBar);
			w = this._vScrollBar.barWidth;
			this._vScrollBar.barLength = this._height - h;
		} else {
			this.superRemoveChild(this._vScrollBar)
		}
		this._vScrollBar.contentLength = size.height + h*1; 
		this._hScrollBar.contentLength = size.width + w*1;

		let g = this._masking;
		g.clear();
		g.beginFill(0xefefef).drawRect(0, 0, this._width - w, this._height - h).endFill();
		//this._container.width = size.width - w
		//this._container.height = size.height - h;
		//this._container.mask.graphics.clear().beginFill("#efefef").rect(0, 0, this.getBounds().width - w, this.getBounds().height - h)
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

