import { PixiUtils as utils } from "./pixiutils";

const LINE_COLOR = 0xA0A0A0
const BACKGROUND_COLOR = 0xFDFDFD
const HOVER_CELL_COLOR = 0xF0F0F0
const FOCUS_CELL_COLOR = 0xE0E0E0
const FOCUS_OUTLINE_COLOR = 0x808080
const COLUMN_COLOR = 0xE8E8E8
const CELL_WIDTH = 60
const CELL_HEIGHT = 30

const DBLCLICK_INTERVAL = 300

/**
 * 网格类
 * 提供鼠标焦点功能，获取当前光标位置的单元格
 * @class
 * @author David Tang<davidtang2018@163.com>
 * @extends PIXI.Graphics
 * @memberof DJ
 */
export class Cell extends PIXI.Graphics {
	constructor(column, row, style) {
		super();
        this.interactive = true;

		this._cellWidth = CELL_WIDTH;
		this._cellHeight = CELL_HEIGHT;
		this._column = column;
		this._row = row;
		this._lineColor = LINE_COLOR;
		this._backgroundColor = BACKGROUND_COLOR;
		this._focusCell = undefined;
		this._currentCell = undefined;
		this._columnColors = undefined;
		this._data = undefined;
		this._autoFocus = true;
		this._enableFocusCell = false;
		this._enableHoverCell = false;
		this._enableDragCell = false;
        this._DblDown = false

        if (style != undefined) {
            this._cellWidth = style.cellWidth!=undefined ? style.cellWidth : this._cellWidth;
            this._cellHeight = style.cellHeight!=undefined ? style.cellHeight : this._cellHeight;
            this._backgroundColors = style.backgroundColors!=undefined ? style.backgroundColors : this._backgroundColors;
            this._lineColor = style.lineColor!=undefined ? style.lineColor : this._lineColor;

 			this._autoFocus = style.autoFocus!=undefined ? style.autoFocus : this._autoFocus;
  			this._enableFocusCell = style.enableFocusCell!=undefined ? style.enableFocusCell : this._enableFocusCell;
  			this._enableHoverCell = style.enableHoverCell!=undefined ? style.enableHoverCell : this._enableHoverCell;
  			this._enableDragCell =  style.enableDragCell!=undefined ? style.enableDragCell : this._enableDragCell;
        }

        this.on("pointerdown", this.pointerDownEvent.bind(this));
        this.on("pointerout", this.pointerOutEvent.bind(this));

        if (this._enableDragCell || this._enableHoverCell) {
	        this.on("pointerup", this.pointerUpEvent.bind(this));
			this.on("pointermove", this.pointerMoveEvent.bind(this));
	        this.on("pointerupoutside", this.pointerUpOutsideEvent.bind(this));
        }

        this.redraw();
	}

	redraw() {
		// David: 避免边界线条显示不完整
		this._width = this._cellWidth * this._column + 1;
		this._height = this._cellHeight * this._row + 1;
		// David: 避免并列网格时干扰pointermove事件
   		// this.hitArea = new PIXI.Rectangle(1,1,this._width-1,this._height-1);

		//背景
		this.clear().beginFill(this._backgroundColor).lineStyle(0, this._lineColor);
		this.drawRect(0, 0, this._width, this._height).endFill();
		//绘制列颜色
		if (this._columnColors && this._columnColors.length>0) {
			//console.log(this._columnColors);
			this._columnColors.forEach(x=>{
				this.beginFill(x.color!=undefined ? x.color : COLUMN_COLOR);
				this.lineStyle(0).drawRect(
					x.column * this.cellWidth+2,
					1,
					this.cellWidth - 3,
					this._row * this.cellHeight-2
				).endFill();
			})
		}
		//列
		this.lineStyle(1, this._lineColor);
		for (let i=0; i<=this._column; i++) {
			let x = i * this._cellWidth+0.5;
			this.moveTo(x, 0).lineTo(x, this._height);
		}
		//行
		for (let i=0; i<=this._row; i++) {
			let y = i * this._cellHeight+0.5;
			this.moveTo(0, y).lineTo(this._width, y);
		}
		//绘制当前鼠标所在单元
		if (this._enableHoverCell && this._currentCell) {
			//console.log(this._currentCell);
			this.beginFill(HOVER_CELL_COLOR);
			this.lineStyle(0).drawRect(
				this._currentCell.column * this.cellWidth + 1, 
				this._currentCell.row * this.cellHeight + 1, 
				this.cellWidth - 2, 
				this.cellHeight - 2
			).endFill();
		}
		//绘制当前聚焦单元
		if (this._enableFocusCell && this._focusCell) {
			this.beginFill(FOCUS_CELL_COLOR);
			this.lineStyle(1, FOCUS_OUTLINE_COLOR).drawRect(
				this._focusCell.column*this.cellWidth, 
				this._focusCell.row*this.cellHeight, 
				this.cellWidth, 
				this.cellHeight).endFill();
		}
	}

	pointerDownEvent(event) {
		let cell = this._getCurrentCell(event);
		//设置双击间隔
        setTimeout(()=>{
            this._DblDown = false;
        }, DBLCLICK_INTERVAL);
        if (this._DblDown) {
            this._DblDown = false;
            //间隔内再次点击触发双击
			this.emit("dblClickCell", {column: cell.column, row: cell.row});
        } else {
        	this._DblDown = true;
        }
        //触发单击
		this.emit("clickCell", {column: cell.column, row: cell.row});
		let pt = new PIXI.Point(event.data.global.x, event.data.global.y);
		//记录鼠标按下位置及显示位置
		this._data = {
			startPt: pt,
		 	startCell: cell
		}
		if (this._enableFocusCell) {
			if (!this.focus) {
				utils.cancelFocus(this);
			}
			if (cell!=this._focusCell) {
				this._focusCell = cell;
				this.redraw();
			}
		}
		if (this._enableDragCell) {
		    this._dragging = true;
		}
	}

    pointerUpEvent(event) {
    	if (this._data==undefined) return;

		let cell = this._getCurrentCell(event);
    	let startCell = this._data.startCell;
	    if (this._dragging) {
			if (startCell.column!=cell.column || startCell.row!=cell.row) {
				this.emit("dragCell", {start: startCell, end: cell})
			}
			if (this._enableFocusCell) {
				if (!this.focus) {
					utils.cancelFocus(this);
				}
				if (cell!=this._focusCell) {
					this._focusCell = cell;
					this.redraw();
				}
			}
	    }
	    this._dragging = false;
	    this._data = undefined;
	    this.redraw();
    }

    pointerMoveEvent(event) {
    	let pt = this.toLocal(event.data.global);
    	// David: 观察是否会出现无法切换情况
    	//if (this.hitArea.contains(pt.x, pt.y)) {
    	if (this.containsPoint(event.data.global)) {
			if (this._enableHoverCell) {
				let cell = this._getCurrentCell(event);
	            if (this._currentCell==undefined || cell.column!=this._currentCell.column || cell.row!=this._currentCell.row) {
	            	this._currentCell = cell;
	            	this.redraw();
	            }
	        } 
	        if (this._dragging) {
		    	// console.log("cell", this.hitArea, pt);
				let p = new PIXI.Point(event.data.global.x, event.data.global.y);
			 	this.emit("dragging", {ox: p.x-this._data.startPt.x, oy: p.y-this._data.startPt.y});
		    }   		
            //David: 此处不能阻止事件冒泡，需要触发网格上其他控件相应                
            //event.stopPropagation();
    	}
    }

    pointerOutEvent(event) {
        this._currentCell = undefined;
        this._dragging = false;
        this._data = undefined;
        this._DblDown = false;
        this.redraw();
    }

    pointerUpOutsideEvent(event) {
        this._currentCell = undefined;
        this._focusCell = undefined;
        this._dragging = false;
        this._data = undefined;
        this._DblDown = false;
        this.redraw();
    }

	/**
	 * 获取当前光标位置的单元格
	 * @param  {Event} event 事件对象
	 * @return {column:..., row:...}  网格位置
	 */
	_getCurrentCell(event) {
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
		if (value!=this._column) {
			this._column = value;
			if (this._focusCell!=undefined && this._focusCell.column>=value) {
				this._focusCell = undefined;
			}
			this._currentCell = undefined;
			this.redraw();			
		}
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
		if (value!=this._row) {
			this._row = value;
			if (this._focusCell!=undefined && this._focusCell.row>=value) {
				this._focusCell = undefined;
			}
			this._currentCell = undefined;
			this.redraw();
		}
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
