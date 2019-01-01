import { Cell } from './cell';

/**
 * 文本在单元格的上中下位置
 * @type {Object}
 */
export const TEXT_BASE_LINE = {
	TOP: 0,
	MIDDLE: 1,
	RIGHT: 2
}

/**
 * 文本在单元格的靠左居中靠右位置
 * @type {Object}
 */
export const TEXT_ALIGN = {
	LEFT: 0,
	CENTER: 1,
	RIGHT: 2
}

/**
 * 文字网格类
 * @class
 * @author David Tang<davidtang2018@163.com>
 * @extends Cell
 * @memberof DJ
 */
export class TextCell extends Cell {
	constructor(column, row, style) {
		super(column, row, style);
		// this._cell = new Cell(column, row, style);
		// this.addChild(this._cell);

		this._textBaseLine = TEXT_BASE_LINE.TOP;
		this._textAlign = TEXT_ALIGN.LEFT;
        this._textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", 
            fontSize: 10
        });
		this._text = new Array();

        if (style != undefined) {
            this._textBaseLine = (style.textBaseLine!=undefined)?style.textBaseLine:this._textBaseLine;
            this._textAlign = (style.textAlign!=undefined)?style.textAlign:this._textAlign;
            this._textStyle = (style.textStyle!=undefined)?style.textStyle:this._textStyle;
        }
		       
		this.redraw();
	}

	pointerDownEvent(event) {
		super.pointerDownEvent(event);
        if (this._enableDragCell) {
			let c = this._data.startCell;
			let text = this._text[c.row][c.column];
			text.style = text.style.clone();
			text.style.fontWeight = "bold";
			this._data.txtPt = text.toLocal(event.data.global)
		}
	}

	pointerMoveEvent(event) {
		super.pointerMoveEvent(event);
	    if (this._dragging) {
			let startPt = this._data.txtPt;
			let c = this._data.startCell;
			let text = this._text[c.row][c.column];
			let pt = text.toLocal(event.data.global);
		 	let dY = pt.y - startPt.y;
		 	let dX = pt.x - startPt.x;
			//console.log(pt, startPt, dX, dY);
			text.x +=dX;
			text.y +=dY;
	    }
	}

	pointerUpEvent(event) {
		if (this._dragging) {
			let c = this._data.startCell;
			this._text[c.row][c.column].style=this._textStyle;			
		}
		super.pointerUpEvent(event)
	}

    pointerOutEvent(event) {
		if (this._dragging) {
			let c = this._data.startCell;
			this._text[c.row][c.column].style=this._textStyle;			
		}
		super.pointerOutEvent(event)
    }

    pointerUpOutsideEvent(event) {
		if (this._dragging) {
			let c = this._data.startCell;
			this._text[c.row][c.column].style=this._textStyle;			
		}
		super.pointerUpOutsideEvent(event)
    }

	redraw() {
		//避免super调用redraw时未初始化的问题
		if (this._text===undefined) return;

		// this._cell.redraw();
		super.redraw();

		//单元格中文本显示
		let h = this._cellHeight;
		let w = this._cellWidth;
		let cols = this._column;
		let rows = this._row;
		let data = this._txtData;
		for (let r = 0; r < rows; r++) {
			if (this._text[r]==undefined) {
				this._text[r] = new Array();				
			}					
			let y = r * h;
			for (let c = 0; c < cols; c++) {
				let str = this.getText(c,r);
				let txt = this._text[r][c];
				if (txt==undefined) {
					txt = new PIXI.Text(str, this._textStyle);
					this._text[r][c] = this.addChild(txt);
				} else {
					txt.text = str;
					txt.style = this._textStyle;
				}

				let x = c * w;
				switch (this._textBaseLine) {
					case TEXT_BASE_LINE.TOP:
						txt.y = y + 1
						break;
					case TEXT_BASE_LINE.MIDDLE:
						txt.y = y + (h - txt.height) / 2
						break;
					case TEXT_BASE_LINE.BOTTOM:
						txt.y = y + h - txt.height;
						break;
				}				
				switch (this._textAlign) {
					case TEXT_ALIGN.LEFT:
						txt.x = x + 1
						break;
					case TEXT_ALIGN.CENTER:
						txt.x = x + (w - txt.width) / 2
						break;
					case TEXT_ALIGN.RIGHT:
						txt.x = x + w - txt.width;
						break;
				}
			}
			//绘制当前聚焦单元文本加粗
			if (this._enableFocusCell && this._focusCell) {
				let text = this._text[this._focusCell.row][this._focusCell.column];
				text.style = text.style.clone();
				text.style.fontWeight = "bold";
			}

		}
	}

	/**
	 * 设置网格显示文本数据集
	 * @param  {[type]} value [description]
	 * @return {[type]}       [description]
	 */
	set text(value) {
		this._txtData = value;			
		this.redraw();
	}

	_setTextData(value, column, row) {
		if (this._txtData==undefined) {
			this._txtData = new Array();
		}
		if (this._txtData[row]==undefined) {
			this._txtData[row] = new Array();
		}
		this._txtData[row][column] = value;
	}

	/**
	 * 设置指定单元格显示文本
	 * @param {String} value  显示文本字符串
	 * @param {integer} column 单元格所在列
	 * @param {integer} row    单元格所在行
	 */
	setText(value, column, row) {
		this._text[row][column].text = value;
		this._setTextData(value, column, row)
		this.redraw();
	}
	getText(column, row) {
		let s = "[" + column + "," + row + "]"
		return this._txtData?this._txtData[row]?this._txtData[row][column]?this._txtData[row][column]:s:s:s;
	}

	/**
	 * 设置显示文本的垂直对齐方式
	 * @param  {TEXT_BASE_LINE} value 上、中、下
	 */
	set textBaseLine(value) {
		this._textBaseLine = value;
		this.redraw();
	}

	/**
	 * 设置显示文本的水平对齐方式
	 * @param  {TEXT_ALIGN} value 左、中、右
	 */
	set textAlign(value) {
		this._textAlign = value;
		this.redraw();
	}

	/**
	 * 设置网格列数
	 * @param  {integer} value 列数
	 * @return {integer}  网格列数
	 */
	set column(value) {
		//删除多余显示对象
		if (value<this._column) {
			for (let r = 0; r < this._row; r++) {
				for (let c = value; c < this._column; c++) {
					//自动从父类删除
					this._text[r][c].destroy();
				}
				this._text[r].length = value;				
			}
		}
		this._column = value;
		this.redraw();
	}
	get column() {
		return this._column;
	}

	/**
	 * 设置网格行数
	 * @param  {integer} value 行数
	 * @return {integer}  网格行数
	 */
	set row(value) {
		//删除多余显示对象
		if (value<this._row) {
			for (let r = value; r < this._row; r++) {
				for (let c = 0; c < this._column; c++) {
					//this.removeChild(this._text[r][c]);
					this._text[r][c].destroy();
				}				
			}
			this._text.length = value;
		}
		this._row = value;
		this.redraw();
	}
	get row() {
		return this._row;
	}
	
	/**
	 * 获取当前光标位置的单元格相关信息
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	getCurrentCell(event) {
		let data = super._getCurrentCell(event);
		if (data!=undefined && event.currentTarget._text!=undefined) {
			data.text = event.currentTarget._text[data.row][data.column].text;
		}
		return data;
	}

}
