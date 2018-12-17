//import * as PIXI from 'pixi.js';
import { GameApp } from './game.js';

var gameApp = new GameApp({
 width: 512,
 height: 512,                       
 antialias: true,
 transparent: false,
 resolution: 1
});
  
document.getElementById("right").appendChild(gameApp.view);

let Application = PIXI.Application,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;

let app = new Application({
    width: 550,
    height: 512,
    antialiasing: true,
    transparent: false,
    resolution: 1,
    backgroundColor: 0x6699ff
});

document.getElementById("left").appendChild(app.view);

function buttonClick(event) {
    if (event.currentTarget.enabled == undefined || event.currentTarget.enabled) {
        alert("Click");
    }
}

//1. Simple text
//let message = new Text(config.greetText);
let message = new DF.Label("Hello World!", true);
message.click = buttonClick;

//Position it and add it to the stage
message.position.set((app.view.width - message.width) / 2, 10);
app.stage.addChild(message);

//2. Styled text
let style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fill: "white",
    stroke: '#ff3300',
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
});

let styledMessage = new Text("Welcome to PIXI", style);

//Position it and add it to the stage
styledMessage.position.set((app.view.width - styledMessage.width) / 2, message.y + message.height + 10);
// styledMessage.position.set(0, message.y + message.height + 10);
// styledMessage.width = app.view.width;
// styledMessage.align = "middle";
// styledMessage.height = 50;
app.stage.addChild(styledMessage);

let btn = new DF.Shape({enableHover: true});
btn.x = 1;
btn.y = 10;
btn.click = buttonClick;
app.stage.addChild(btn);

let btn2 = new DF.Shape({enableHover: true, width: 60, height: 20});
btn2.x = 1;
btn2.y = btn.y + btn.height + 10;
btn2.click = buttonClick;
app.stage.addChild(btn2);

let add = new DF.TextButton("添加", {enableHover:true, type: DF.SHAPE_TYPE.ELLIPSE, canSpaceToClick: true});
add.x = 1;
add.y = styledMessage.y + styledMessage.height + 10;
add.click = ()=>{
    console.log("TextCell.column=" + cell.column);
    tcell.column=cell.column+1;
    cell.column=cell.column+1;
    cell2.row=cell2.row+1;
    cell2.column=cell2.column+1;
};
app.stage.addChild(add);

let del = new DF.TextButton("删除", {enableHover:true, type: DF.SHAPE_TYPE.ROUND, canSpaceToClick: true});
del.x = 1;
del.y = add.y + add.height + 10;
del.click = ()=>{
    tcell.column=cell.column-1;
    cell.column=cell.column-1;
    cell2.row=cell2.row-1;
    cell2.column=cell2.column-1;
};
app.stage.addChild(del);

let set = new DF.TextButton("设置", {enableHover:true, type: DF.SHAPE_TYPE.ROUND, canSpaceToClick: true});
set.x = 1;
set.y = del.y + del.height + 10;
set.click = ()=>{
    tcell.textBaseLine = DF.TEXT_BASE_LINE.MIDDLE;
    tcell.textAlign = DF.TEXT_ALIGN.CENTER;
    tcell.text = [["a","b","c"]];
};
app.stage.addChild(set);

var tcell = new DF.TextCell(5, 1, {enableDrag: true});
tcell.y= styledMessage.y + styledMessage.height + 10;
tcell.x=60;
tcell.click = (event)=> {
    //let c = event.currentTarget.getCurrentCell(event);
    //console.log(JSON.stringify(c));
}
tcell.on("dragCell", event=>{
    console.log(JSON.stringify(event));
    let s = tcell.getText(event.start.column, event.start.row); 
    let e = tcell.getText(event.end.column, event.end.row); 
    tcell.setText(e, event.start.column, event.start.row);
    tcell.setText(s, event.end.column, event.end.row);
})
app.stage.addChild(tcell);

var cell = new DF.Cell(5, 1, {enableHover: true, enableFoucs: true});
cell.y=tcell.height + tcell.y - 1;
cell.x=60;
cell.click = (event)=> {
    let c = event.currentTarget.getCurrentCell(event);
    alert(JSON.stringify(c));
    //console.log();
}
app.stage.addChild(cell);

var cell2 = new DF.Cell(5, 1, {enableHover: true, enableFoucs: true});
cell2.y=cell.height + cell.y - 1;
cell2.x=60;
cell2.click = (event)=> {
    let c = event.currentTarget.getCurrentCell(event);
    alert(JSON.stringify(c));
    //console.log();
}
app.stage.addChild(cell2);

let up = new DF.ArrowButton(DF.ARROW_ROTATION.UP, {enableHover: true});
up.x = 10;
up.y = set.y + set.height + 10;
up.click = buttonClick;
app.stage.addChild(up);

let down = new DF.ArrowButton(DF.ARROW_ROTATION.DOWN, {enableHover: true});
down.x = up.x + up.width + 10;
down.y = up.y;
down.click = buttonClick;
app.stage.addChild(down);

let left = new DF.ArrowButton(DF.ARROW_ROTATION.LEFT, {enableHover: true});
left.x = down.x + down.width + 10;
left.y = up.y;
left.click = buttonClick;
app.stage.addChild(left);

let right = new DF.ArrowButton(DF.ARROW_ROTATION.RIGHT, {enableHover: true});
right.x = left.x + left.width + 10;
right.y = up.y;
right.click = buttonClick;
app.stage.addChild(right);

let val = new PIXI.Text("0");
val.x = 10;
val.y = left.y + left.height + 10;
app.stage.addChild(val);

let scrollbar = new DF.ScrollBar();
scrollbar.x = 80;
scrollbar.y = left.y + left.height + 20;
scrollbar.barLength = 100;
scrollbar.contentLength = 200;
app.stage.addChild(scrollbar);
scrollbar.on("change", ()=>{
    val.text = scrollbar.value;
});
scrollbar.value = 49;

let val2 = new PIXI.Text("0");
val2.x = 300;
val2.y = left.y;
app.stage.addChild(val2);

let vscrollbar = new DF.ScrollBar({orientation: DF.SCROLLBAR_ORIENTATION.VERTICAL});
vscrollbar.x = 250;
vscrollbar.y = left.y;
vscrollbar.barLength = 100;
vscrollbar.contentLength = 50;
app.stage.addChild(vscrollbar);
vscrollbar.on("change", (value)=>{
    val2.text = value.new;
});
vscrollbar.value = 49;

let addBar = new DF.TextButton("添加", {enableHover:true, type: DF.SHAPE_TYPE.ELLIPSE});
addBar.x = 10;
addBar.y = vscrollbar.y + vscrollbar.barLength + 30;
addBar.click = ()=>{
    let t = sc.contentSize;
    sc.contentSize = {width: t.width+50, height: t.height+50};
};
app.stage.addChild(addBar);

let addBtn = new DF.TextButton("Test", {enableHover:true, type: DF.SHAPE_TYPE.ELLIPSE});
addBtn.x = 10;
addBtn.y = addBar.y + addBtn.height + 10;
let xs = 0, ys = 0 , i=0;
addBtn.click = ()=>{
    let t = new DF.TextButton("Test");
    t.x = xs;
    t.y = ys;
    t.height = t.height+2*i;
    t.width = t.width + 10*i;
    sc.addChild(t);
    xs = xs + 40;
    ys = ys + 30;
    i += 1
};
app.stage.addChild(addBtn);

let set45 = new DF.TextButton("90", {enableHover:true, type: DF.SHAPE_TYPE.ELLIPSE});
set45.x = 10;
set45.y = addBtn.y + addBtn.height + 10;
set45.click = ()=>{
    sc.scrollX = 45;
    sc.scrollY = 45;
};
app.stage.addChild(set45);

let sc = new DF.ScrollContainer(400, 150, {contentSize:{width: 300, height: 150}});
sc.x = 60;
sc.y = addBar.y;
app.stage.addChild(sc);
sc.on("scrollX", (value)=>{
    val.text = value;
});
sc.on("scrollY", (value)=>{
    val2.text = value;
});

