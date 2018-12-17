/**
 * 工具类
 * @class
 * @memberof DF
 */
export class PixiUtils {

    /**
     * 限制精灵在矩形容器内
     * @param  { Pointer } 被限制对象坐标
     * @param  { Rect Area } 被限制容器区域{x,y,width,height}
     * @return { String } 返回：top|left|bottom|rigth
     */
    static contain(sprite, container) {
        let collision = undefined;

        //Left
        if (sprite.x < container.x) {
            sprite.x = container.x;
            collision = "left";
        }

        //Top
        if (sprite.y < container.y) {
            sprite.y = container.y;
            collision = "top";
        }

        //Right
        if (sprite.x + sprite.width > container.width) {
            sprite.x = container.width - sprite.width;
            collision = "right";
        }

        //Bottom
        if (sprite.y + sprite.height > container.height) {
            sprite.y = container.height - sprite.height;
            collision = "bottom";
        }

        //Return the `collision` value
        return collision;
    }

    /**
     * 检测两个矩形精灵是否接触
     * @param  { Sprite } 矩形精灵1
     * @param  { Sprite } 矩形精灵2
     * @return { Boolean } 返回true|false
     */
    static hitTestRectangle(r1, r2) {
        //Define the variables we'll need to calculate
        let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

        //hit will determine whether there's a collision
        hit = false;

        //Find the center points of each sprite
        r1.centerX = r1.x + r1.width / 2;
        r1.centerY = r1.y + r1.height / 2;
        r2.centerX = r2.x + r2.width / 2;
        r2.centerY = r2.y + r2.height / 2;

        //Find the half-widths and half-heights of each sprite
        r1.halfWidth = r1.width / 2;
        r1.halfHeight = r1.height / 2;
        r2.halfWidth = r2.width / 2;
        r2.halfHeight = r2.height / 2;

        //Calculate the distance vector between the sprites
        vx = r1.centerX - r2.centerX;
        vy = r1.centerY - r2.centerY;

        //Figure out the combined half-widths and half-heights
        combinedHalfWidths = r1.halfWidth + r2.halfWidth;
        combinedHalfHeights = r1.halfHeight + r2.halfHeight;

        //Check for a collision on the x axis
        if (Math.abs(vx) < combinedHalfWidths) {
            //A collision might be occuring. Check for a collision on the y axis
            if (Math.abs(vy) < combinedHalfHeights) {
                //There's definitely a collision happening
                hit = true;
            } else {
                //There's no collision on the y axis
                hit = false;
            }
        } else {
            //There's no collision on the x axis
            hit = false;
        }
        //`hit` will be either `true` or `false`
        return hit;
    }

    /**
     * 返回指定范围随机整数
     * @param  { Integer } 最小值
     * @param  { Integer } 最大值
     * @return { Integer } 随机整数
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 取消父类容器中其他同类型元素焦点
     * @return {[type]} [description]
     */
    static cancelFocus(element) {
        let c = element.parent;
        while (c) {
            for (let i = 0; i < c.children.length; i++) {
                let child = c.children[i];
                if (child.focus == true && child.autoFocus == true) {
                    child.focus = false;
                }
            }
            c = c.parent;
        }
    }

    /**
     * 绘制多点图形
     * @param  {[type]} g        [description]
     * @param  {[type]} points   [description]
     * @param  {[type]} origin   [description]
     * @param  {[type]} rotation [description]
     * @return {[type]}          [description]
     */
    static drawPoints(g, points, origin, rotation) {
        if (origin == undefined) {
            points.forEach((point, i) => {
                if (i == 0) {
                    g.moveTo(p.x, p.y)
                } else {
                    g.lineTo(p.x, p.y)
                }
            });
        } else {
            let mat = new PIXI.Matrix(1,0,0,1,origin.x,origin.y);
            if (rotation!=undefined) {
                let mat2 = new PIXI.Matrix();
                mat2.rotate(Math.PI / 180 * rotation);
                mat.append(mat2);                
            }
            points.forEach((point, i) => {
                let p = mat.apply(point);
                //p.x = Math.floor(p.x)
                //p.y = Math.floor(p.y)
                if (i == 0) {
                    g.moveTo(p.x, p.y)
                } else {
                    g.lineTo(p.x, p.y)
                }
            });
        }   
    }

}