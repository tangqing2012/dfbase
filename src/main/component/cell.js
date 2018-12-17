import { PixiUtils as utils } from "./pixiutils";

const LINE_COLOR = 0xA0A0A0
const BACKGROUND_COLOR = 0xFDFDFD
const HOVER_CELL_COLOR = 0xE8E8E8
const FOCUS_CELL_COLOR = 0xE0E0E0
const FOCUS_OUTLINE_COLOR = 0x808080
const COLUMN_COLOR = 0xE0E0E0
const CELL_WIDTH = 60
const CELL_HEIGHT = 30

/**
 * 网格类
 * 提供鼠标焦点功能，获取当前光标位置的单元格
 * @class
 * @extends PIXI.Container
 * @memberof DF
 */
export class Cell extends PIXI.Container {
	constructor(column, row, style) {
		super();
        this.interactive = true;
		this._cellWidth = CELL_WIDTH;
		this._cellHeight = CELL_HEIGHT;
		this._column = column;
		this._row = row;
		this._lineColor = LINE_COLOR;
		this._backgroundColor = BACKGROUND_COLOR;
		this._autoFocus = true;
		this._focusCell = undefined;
		this._currentCell = undefined;
		this._columnColors = undefined;

        if (style != undefined) {
            this._cellWidth = style.cellWidth!=undefined ? style.cellWidth : this._cellWidth;
            this._cellHeight = style.cellHeight!=undefined ? style.cellHeight : this._cellHeight;
            this._backgroundColors = style.backgroundColors!=undefined ? style.backgroundColors : this._backgroundColors;
            this._lineColor = style.lineColor!=undefined ? style.lineColor : this._lineColor;
  			if (style.enableHover) {
		        this.on("pointermove", this.mouseHoverEvent);
		        this.on("pointerout", this.mouseHoverEvent);  				
		        //PIXI.ticker.shared.add(this.tickerEvent, this)
  			}
  			if (style.enableFoucs) {
  				this.on("pointerdown", this.clickEvent);
  			}
  			this._autoFocus = style.autoFocus!=undefined ? style.autoFocus : this._autoFocus;
        }

		this._graphics = new PIXI.Graphics();
        this.addChild(this._graphics);
        this.redraw();
	}
	// tickerEvent(deltaTime) {
	// 	if (this._currentCell && this._currentCell!=this._previousCell)
	// 		this.redraw();
	// }

	redraw() {
		this._width = this._cellWidth * this._column;
		this._height = this._cellHeight * this._row;
		let g = this._graphics;
		g.clear();
		//背景
		g.beginFill(this._backgroundColor);
		g.lineStyle(1, this._lineColor);
		g.drawRect(0.5, 0.5, this._width-0.5, this._height-0.5).endFill();
		//绘制列颜色
		if (this._columnColors && this._columnColors.length>0) {
			//console.log(this._columnColors);
			this._columnColors.forEach(x=>{
				g.beginFill(x.color!=undefined ? x.color : COLUMN_COLOR);
				g.lineStyle(0).drawRect(
					x.column * this.cellWidth+2,
					1,
					this.cellWidth - 3,
					this._row * this.cellHeight-2
				).endFill();
			})
		}
		//列
		g.lineStyle(1, this._lineColor);
		for (let i=0; i<=this._column; i++) {
			let x = i * this._cellWidth + 0.5;
			g.moveTo(x, 0).lineTo(x, this._height);
		}
		//行
		for (let i=0; i<=this._row; i++) {
			let y = i * this._cellHeight + 0.5;
			g.moveTo(0, y).lineTo(this._width, y);
		}
		//绘制当前鼠标所在单元
		if (this._currentCell) {
			//console.log(this._currentCell);
			g.beginFill(HOVER_CELL_COLOR);
			g.lineStyle(0).drawRect(
				this._currentCell.column * this.cellWidth + 1, 
				this._currentCell.row * this.cellHeight + 1, 
				this.cellWidth - 2, 
				this.cellHeight - 2
			).endFill();
		}
		//绘制当前聚焦单元
		if (this._focusCell) {
			g.beginFill(FOCUS_CELL_COLOR);
			g.lineStyle(2, FOCUS_OUTLINE_COLOR).drawRect(
				this._focusCell.column * this.cellWidth + 0.5, 
				this._focusCell.row * this.cellHeight + 0.5, 
				this.cellWidth, 
				this.cellHeight).endFill();
		}
	}

	clickEvent(event) {
		let self = event.currentTarget;
		let focusCell = self.getCurrentCell(event);
		if (!self.focus) {
			utils.cancelFocus(self);
		}
		if (focusCell != self._focusCell) {
			self._focusCell = focusCell;
			self.redraw();
		}
		this.emit("clickCell", {column: focusCell.column, row: focusCell.row});
	}

    mouseHoverEvent(event) {
    	let self = event.currentTarget
        if (event.type == "pointermove"  && event.currentTarget._graphics.containsPoint(event.data.global)) {   	
            //self._isHover = true;
            self.cursor = "pointer";
            let currentCell = self.getCurrentCell(event);
            if (currentCell != self._currentCell) {
            	self._currentCell = currentCell;
            	this.redraw();
            }
        }
        else if (event.type == "pointerout") {
            self._currentCell = undefined;
            self.cursor = "auto";
        }
    }

	/**
	 * 获取当前光标位置的单元格
	 * @param  {Event} event 事件对象
	 * @return {column:..., row:...}  网格位置
	 */
	getCurrentCell(event) {
		let self = event.currentTarget;
		let lp = event.data.getLocalPosition(self);
		//console.log(lp);
		let c = Math.floor(lp.x / self.cellWidth);
		let r = Math.floor(lp.y / self.cellHeight);
		if (c >= self.column || c < 0 || r >= self.row || r < 0)
			return undefined;
		return {"column": c, "row": r}
	}

	/**
	 * 设置网格列数
	 * @param  {integer} value 列数
	 * @return {integer} 当前网格的列数   
	 */
	set column(value) {
		this._column = value;
		this.redraw();
	}
	get column() {
		return this._column;
	}

	/**
	 * 设置网格行数
	 * @param  {integer} value 数量
	 * @return {integer} 当前网格的行数   
	 */
	set row(value) {
		this._row = value;
		this.redraw();
	}
	get row() {
		return this._row;
	}

	/**
	 * 设置网格宽度
	 * @param  {integer} value 宽度值
	 * @return {integer} 当前网格宽度   
	 */
	set cellWidth(value) {
		this._cellWidth = value;
		this.redraw();
	}
	get cellWidth() {
		return this._cellWidth;
	}

	/**
	 * 设置网格行高度
	 * @param  {integer} value 高度值
	 * @return {integer} 当前网格行高度   
	 */
	set cellHeight(value) {
		this._cellHeight = value;
		this.redraw();
	}
	get cellHeight() {
		return this._cellHeight;
	}

	/**
	 * 返回整个网格的宽度
	 */
	get width() {
		return this._width;
	}
	/**
	 * 返回整个网格的高度
	 */
	get height() {
		return this._height;
	}
	
	/**
	 * 设置网格线绘制颜色
	 * @param  {string|integer} value '#00FF00'
	 */
	set lineColor(value) {
		this._lineColor = value;
		this.redraw()
	}

	/**
	 * 设置网格背景颜色
	 * @param  {string|integer} value '#00FF00'
	 */
	set backgroundColor(value) {
		this._backgroundColor = value;
		this.redraw()
	}

	/**
	 * 设置特殊列的背景颜色
	 * @param  {Object} value [{column:..., color:...}, {...}, ...]
	 */
	set columnColors(value) {
		this._columnColors = value;
		this.redraw();
	}

	/**
	 * 设置网格是否成为输入焦点
	 * @param  {Boolean} value true|false
	 * @return {integer} 当前网格是否为输入焦点   
	 */
    set focus(value) {
    	if (value) {
    		let focusCell = this._focusCell ? this._focusCell : {"column": 0, "row": 0};
			utils.cancelFocus(this);
			this._focusCell = focusCell;
    	} else {
      		this._focusCell = undefined;    			
   		}
        this.redraw();
    }
    get focus() {
        return this._focusCell != undefined;
    }

    get autoFocus() {
    	return this._autoFocus;
    }
	
}
