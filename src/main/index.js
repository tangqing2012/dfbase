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

//1. Simple text
//let message = new Text(config.greetText);
let message = new DJ.Label("Hello World!", true);
message.click=()=>{alert("Click me!")};

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

var tw=undefined;
function showClick() {
    if (tw!=undefined) {
        tw.destroy();
        tw = undefined;
    } else {
        tw = new DJ.ToolWindow();
        tw.template = {height:150, width:300, elements:[{x:10,y:5,name:"ID"},{x:100,y:5,name:"id"},{x:10,y:30,name:"Name"},{x:100,y:30,name:"name"}]}
        app.stage.addChild(tw);        
    }
}

function setData() {
    if (tw==undefined) return;
    tw.data=[{name:"id",value:"P100001"}, {name:"name",value:"这是一个测试数据这是一个测试数据这是一个测试数据这是一个测试数据"}, , {name:"name2",value:"这是一个测试数据!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"}];
}

let btn = new DJ.Shape({enableHover: true, enableFocus: true});
btn.x = 1;
btn.y = 10;
btn.click=showClick;
app.stage.addChild(btn);

let btn2 = new DJ.Shape({enableHover: true, enableFocus: true, enableDrag:true, width: 60, height: 20});
btn2.x = 1;
btn2.y = btn.y + btn.height + 10;
btn2.on("dblClick", (event)=>{
    setData();
});
app.stage.addChild(btn2);

let add = new DJ.TextButton("添加", {enableHover:true, enableFocus: true, type: DJ.SHAPE_TYPE.ELLIPSE, canSpaceToClick: true});
add.x = 1;
add.y = styledMessage.y + styledMessage.height + 10;
add.click = ()=>{
    console.log("TextCell.column=" + cell.column);
    tcell.column=tcell.column+1;
    cell.column=cell.column+2;
    cell2.row=cell2.row+1;
    cell2.column=cell2.column+1;
};
app.stage.addChild(add);

let del = new DJ.TextButton("删除", {enableHover:true, enableFocus: true, type: DJ.SHAPE_TYPE.ROUND, canSpaceToClick: true});
del.x = 1;
del.y = add.y + add.height + 10;
del.click = ()=>{
    tcell.column=tcell.column-1;
    cell.column=cell.column-2;
    cell2.row=cell2.row-1;
    cell2.column=cell2.column-1;
};
app.stage.addChild(del);

let set = new DJ.TextButton("设置", {enableHover:true, enableFocus: true, type: DJ.SHAPE_TYPE.RECT, canSpaceToClick: true});
set.x = 1;
set.y = del.y + del.height + 10;
set.click = ()=>{
    tcell.textBaseLine = DJ.TEXT_BASE_LINE.MIDDLE;
    tcell.textAlign = DJ.TEXT_ALIGN.CENTER;
    tcell.text = [["a","b","c"]];
};
app.stage.addChild(set);

var tcell = new DJ.TextCell(5, 1, {enableDragCell: true, enableHoverCell: true, enableFocusCell: true});
tcell.y= styledMessage.y + styledMessage.height + 10;
tcell.x=60;
tcell.on("dragCell", event=>{
    //console.log(JSON.stringify(event));
    let s = tcell.getText(event.start.column, event.start.row); 
    let e = tcell.getText(event.end.column, event.end.row); 
    tcell.setText(e, event.start.column, event.start.row);
    tcell.setText(s, event.end.column, event.end.row);
})
tcell.on("dragging", (data)=>{
    console.log(data);
})
app.stage.addChild(tcell);

var cell = new DJ.Cell(10, 1, {enableHoverCell: true, enableFocusCell: true});
cell.y=tcell.height + tcell.y - 1;
cell.cellWidth = cell.cellWidth/2;
cell.x=60;
cell.click = (event)=> {
    let c = event.currentTarget._getCurrentCell(event);
    alert(JSON.stringify(c));
}
app.stage.addChild(cell);

var cell2 = new DJ.Cell(5, 1, {enableHoverCell: true, enableFocusCell: true});
cell2.y=cell.height + cell.y - 1;
cell2.x=60;
cell2.on("dblClickCell", (data)=>{
    alert(JSON.stringify(data));    
})
app.stage.addChild(cell2);

function buttonClick(value) {
    let t = $("#left").offset().top;
    let l = $("#left").offset().left;
    $("#left").css({"top":t+10*value, "left":l+10*value});
}

let up = new DJ.ArrowButton(DJ.ARROW_ROTATION.UP, {enableHover: true});
up.x = 10;
up.y = set.y + set.height + 10;
up.click =()=>{ buttonClick(1)};
app.stage.addChild(up);

let down = new DJ.ArrowButton(DJ.ARROW_ROTATION.DOWN, {enableHover: true});
down.x = up.x + up.width + 10;
down.y = up.y;
down.click = ()=>{ buttonClick(-1)};
app.stage.addChild(down);

function testClick(value) {
    tcell.cellWidth=tcell.cellWidth+10*value;
    cell.cellWidth=cell.cellWidth+5*value;
    cell2.cellWidth=cell2.cellWidth+10*value;    
}
let left = new DJ.ArrowButton(DJ.ARROW_ROTATION.LEFT, {enableHover: true});
left.x = down.x + down.width + 10;
left.y = up.y;
left.click=()=>{ testClick(1)};
app.stage.addChild(left);

let right = new DJ.ArrowButton(DJ.ARROW_ROTATION.RIGHT, {enableHover: true});
right.x = left.x + left.width + 10;
right.y = up.y;
right.click =()=>{ testClick(-1)};
app.stage.addChild(right);

let val = new PIXI.Text("0");
val.x = right.x + right.width + 30;
// val.y = left.y + left.height + 10;
val.y = up.y
app.stage.addChild(val);

let val2 = new PIXI.Text("0");
val2.x = 420;
val2.y = val.y;
app.stage.addChild(val2);

let scrollbar = new DJ.ScrollBar();
scrollbar.x = val.x + 60;
// scrollbar.y = left.y + left.height + 20;
scrollbar.y = val.y;
scrollbar.barLength = 100;
scrollbar.contentLength = 1200;
app.stage.addChild(scrollbar);
scrollbar.on("change", ()=>{
    val.text = scrollbar.value;
});
scrollbar.value = 49;

let vscrollbar = new DJ.ScrollBar({orientation: DJ.SCROLLBAR_ORIENTATION.VERTICAL});
vscrollbar.x = scrollbar.x + scrollbar.width + 10;
vscrollbar.y = scrollbar.y;
//vscrollbar.barLength = 100;
app.stage.addChild(vscrollbar);
vscrollbar.contentLength = 100;
vscrollbar.value = 49;
vscrollbar.on("change", (value)=>{
    val2.text = value.new;
});
vscrollbar.contentLength = 40;

let addBar = new DJ.TextButton("添加", {enableHover:true, type: DJ.SHAPE_TYPE.ELLIPSE});
addBar.x = 10;
addBar.y = vscrollbar.y + vscrollbar.barLength + 30;
addBar.click = ()=>{
    let t = sc.contentSize;
    sc.contentSize = {width: t.width+50, height: t.height+50};
};
app.stage.addChild(addBar);

let scCell;
function setCell(value) {
    if (scCell!=undefined) {
        scCell.row = value;
        scCell.column = value;
        sc.contentSize = {width: scCell.width, height: scCell.height};
        // sc.row = 10;
        // sc.column = 10;
        // sc.refresh();
    } else {
        scCell = new DJ.TextCell(value, value, {lineColor: 0xE0E0E0});
        sc.addChild(scCell);        
    }
}
let addCell = new DJ.TextButton("10行", {enableHover:true, type: DJ.SHAPE_TYPE.ELLIPSE});
addCell.x = 475;
addCell.y = addBar.y;
addCell.click = ()=>{
    setCell(10);
};
app.stage.addChild(addCell);

let delCell = new DJ.TextButton("40行", {enableHover:true, type: DJ.SHAPE_TYPE.ELLIPSE});
delCell.x = 475;
delCell.y = addCell.y + addCell.height + 10;
delCell.click = ()=>{
    setCell(40);
};
app.stage.addChild(delCell);

let addBtn = new DJ.TextButton("Test", {enableHover:true, type: DJ.SHAPE_TYPE.ELLIPSE});
addBtn.x = 10;
addBtn.y = addBar.y + addBtn.height + 10;
let xs = 0, ys = 0 , i=0;
addBtn.click = ()=>{
    let t = new DJ.TextButton("Test"+i, {enableDrag: true});
    // David： 按比例放大
    // t.height = (t.height+2*i);
    // t.width = (t.width+2*i);
    
    // let t = new Bar("test");
    // t.bottomPercent = Utils.randomInt(0, 100)/100;
    // t.topPercent = Utils.randomInt(0, 100)/100;
    // t.locked = Utils.randomInt(0,3)==2;

    t.setHeight(t.height+2*i);
    t.setWidth(t.width+2*i);

    t.x = xs;
    t.y = ys;
    t.on("dblClick",()=>{sc.removeChild(t);});
    sc.addChild(t);
    xs = xs + 40;
    ys = ys + 30;
    i += 1
};
app.stage.addChild(addBtn);

let set45 = new DJ.TextButton("45", {enableHover:true, type: DJ.SHAPE_TYPE.ELLIPSE});
set45.x = 10;
set45.y = addBtn.y + addBtn.height + 10;
set45.click = ()=>{
    sc.scrollX = 45;
    sc.scrollY = 45;
};
app.stage.addChild(set45);

let sc = new DJ.ScrollContainer(400, 150, {enableDrag:true});
//let sc = new Board(400, 150, {enableDrag:true});
sc.x = 65;
sc.y = addBar.y;
app.stage.addChild(sc);
sc.on("scrollX", (value)=>{
    val.text = value;
});
sc.on("scrollY", (value)=>{
    val2.text = value;
});
sc.on("dragging", (value)=>{
    console.log(value);
});


