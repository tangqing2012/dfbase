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
 * @extends Cell
 * @memberof DF
 */
export class TextCell extends Cell {
	constructor(column, row, style) {
		super(column, row, style);

		this._textBaseLine = TEXT_BASE_LINE.TOP;
		this._textAlign = TEXT_ALIGN.LEFT;
        this._textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", 
            fontSize: 10,
            fill: "black"
        });
		this._text = new Array();

        if (style != undefined) {
            this._textBaseLine = style.textBaseLine || this._textBaseLine;
            this._textAlign = style.textAlign || this._textAlign;
            this._textStyle = style.textStyle || this._textStyle;
            this._data = style.data || this._data;

	        if (style.enableDrag) {
				this.on("pointerdown", e => {
				    this._dragging = true;
					let cell = super.getCurrentCell(e);
					let text = this._text[cell.row][cell.column];
					let pt = text.toLocal(e.data.global);
					//记录鼠标按下位置及显示位置
					this._startData = {
						point: pt,
					 	cell: cell
					}
				})
				this.on("pointerup", e => {
				    //this._block.alpha = 1;
				    if (this._dragging) {
				    	let startCell = this._startData.cell;
						let cell = super.getCurrentCell(e);
						if (startCell.column!=cell.column || startCell.row!=cell.row) {
							this.emit("dragCell", {start: startCell, end: cell})
						}
				    }
				    this._dragging = false;
				    this._startData = null;
					this.redraw();
				});
				this.on("pointerupoutside", e => {
				    //this._block.alpha = 1;
				    this._dragging = false;
				    this._startData = null;
				    this.redraw();
				});
				this.on("pointermove", e => {
				    if (this._dragging) {
						let startPt = this._startData.point;
						let c = this._startData.cell;
						let text = this._text[c.row][c.column];
						let pt = text.toLocal(e.data.global);
					 	let dY = pt.y - startPt.y;
					 	let dX = pt.x - startPt.x;
						//console.log(pt, startPt, dX, dY);
						text.x +=dX;
						text.y +=dY;
				    }
				});
	        }
        }
		       
		this.redraw();
	}

	redraw() {
		super.redraw();

		//避免super调用redraw时未初始化的问题
		if (this._text===undefined) return;

		//单元格中文本显示
		let h = this._cellHeight;
		let w = this._cellWidth;
		let cols = this._column;
		let rows = this._row;
		let data = this._data;
		for (let r = 0; r < rows; r++) {
			if (this._text[r]==undefined) {
				this._text[r] = new Array();				
			}					
			let y = r * h;
			for (let c = 0; c < cols; c++) {
				//let str = "[" + c + "," + r + "]";
				let str = "[" + c + "," + r + "]";
				str = data?data[r]?data[r][c]?data[r][c]:str:str:str;
				let txt = this._text[r][c];
				if (txt==undefined) {
					txt = new PIXI.Text(str, this._textStyle);
					this._text[r][c] = this.addChild(txt);
				} else {
					txt.text = str;
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
		}
	}

	/**
	 * 设置网格显示文本数据集
	 * @param  {[type]} value [description]
	 * @return {[type]}       [description]
	 */
	set text(value) {
		this._data = value;			
		this.redraw();
	}

	/**
	 * 设置指定单元格显示文本
	 * @param {String} value  显示文本字符串
	 * @param {integer} column 单元格所在列
	 * @param {integer} row    单元格所在行
	 */
	setText(value, column, row) {
		this._text[row][column].text = value;
		if (this._data==undefined) {
			this._data = new Array();
		}
		if (this._data[row]==undefined) {
			this._data[row] = new Array();
		}
		this._data[row][column] = value;
		this.redraw();
	}
	getText(column, row) {
		return this._text[row][column].text;
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
		let data = super.getCurrentCell(event);
		if (data!=undefined && event.currentTarget._text!=undefined) {
			data.text = event.currentTarget._text[data.row][data.column].text;
		}
		return data;
	}

}
