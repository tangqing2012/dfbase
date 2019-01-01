/**
 * 标签类
 * @class
 * @author David Tang<davidtang2018@163.com>
 * @extends PIXI.Text
 * @memberof DJ
 */
export class Label extends PIXI.Text {
	constructor(text, enableHover) {
		super(text);
		this.style = new PIXI.TextStyle({
			fontFamily: "Arial", 
			fontSize: 20,
			fill: "black"
		});
		let hover = enableHover?enableHover:false;
		if (hover) {
			this.interactive = true;
			this.on("mousemove", this.HandleMouseEvent);
			this.on("mouseout", this.HandleMouseEvent);
		}
	}
	
	HandleMouseEvent(event) {
		if (event.type=="mousemove" && this.containsPoint(event.data.global)) {
			event.currentTarget.alpha = 0.6;
			event.currentTarget.cursor = "pointer";
		}
		if (event.type=="mouseout" && !this.containsPoint(event.data.global)) {
			event.currentTarget.alpha = 1;
			event.currentTarget.cursor = "auto";
		}

	}
}
