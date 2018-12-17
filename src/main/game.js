//import * as PIXI from 'pixi.js';
import { KeyBoard } from './component/keyboard.js';
import { PixiUtils } from './component/pixiutils.js';

//采用类别名，降低PIXI框架变更影响
const 
	Application = PIXI.Application,
	Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;

/**
 * 夺宝游戏类
 */
export class GameApp extends Application {
	constructor(props) {
		super(props);
		loader
			.add("images/treasureHunter.json")
			.load(this.setup.bind(this));
	}

	setup() {
		//Make the game scene and add it to the stage
		this.gameScene = new Container();
		this.stage.addChild(this.gameScene);

		//Make the sprites and add them to the `gameScene`
		//Create an alias for the texture atlas frame ids
		this.id = resources["images/treasureHunter.json"].textures;

		//Dungeon
		this.dungeon = new Sprite(this.id["dungeon.png"]);
		this.gameScene.addChild(this.dungeon);

		//Door
		this.door = new Sprite(this.id["door.png"]); 
		this.door.position.set(32, 0);
		this.gameScene.addChild(this.door);

		//Explorer
		this.explorer = new Sprite(this.id["explorer.png"]);
		this.explorer.x = 68;
		this.explorer.y = this.gameScene.height / 2 - this.explorer.height / 2;
		this.explorer.vx = 0;
		this.explorer.vy = 0;
		this.gameScene.addChild(this.explorer);
	  
		//Treasure
		this.treasure = new Sprite(this.id["treasure.png"]);
		this.treasure.x = this.gameScene.width - this.treasure.width - 48;
		this.treasure.y = this.gameScene.height / 2 - this.treasure.height / 2;
		this.gameScene.addChild(this.treasure);

		this.initHealthBar();
		this.initBlobs();
		this.initKeyBoard();
		this.initGameOver();
		
		//Set the game state
		this.state = this.play;

		//Start the game loop 
		this.ticker.add(delta => this.gameLoop(delta));
	}

	initGameOver() {
		//Create the `gameOver` scene
		this.gameOverScene = new Container();
		this.stage.addChild(this.gameOverScene);

		//Make the `gameOver` scene invisible when the game first starts
		this.gameOverScene.visible = false;

		//Create the text sprite and add it to the `gameOver` scene
		let style = new TextStyle({
			fontFamily: "Futura",
			fontSize: 64,
			fill: "white"
		});
		this.message = new Text("The End!", style);
		this.message.x = 120;
		this.message.y = this.stage.height / 2 - 32;
		this.gameOverScene.addChild(this.message);		
	}

	initHealthBar() {
		//Create the health bar
		this.healthBar = new Container();
		this.healthBar.position.set(this.stage.width - 170, 4)
		this.gameScene.addChild(this.healthBar);
		//Create the black background rectangle
		let innerBar = new Graphics();
		innerBar.beginFill(0x000000);
		innerBar.drawRect(0, 0, 128, 8);
		innerBar.endFill();
		this.healthBar.addChild(innerBar);
		//Create the front red rectangle
		let outerBar = new Graphics();
		outerBar.beginFill(0xFF3300);
		outerBar.drawRect(0, 0, 128, 8);
		outerBar.endFill();
		this.healthBar.addChild(outerBar);

		this.healthBar.outer = outerBar;		
	}

	//初始化怪物
	initBlobs() {
		//Make the blobs
		let numberOfBlobs = 6,
		spacing = 48,
		xOffset = 150,
		speed = 2,
		direction = 1;

		//An array to store all the blob monsters
		this.blobs = [];

		//Make as many blobs as there are `numberOfBlobs`
		for (let i = 0; i < numberOfBlobs; i++) {
			//Make a blob
			let blob = new Sprite(this.id["blob.png"]);
			//Space each blob horizontally according to the `spacing` value.
			//`xOffset` determines the point from the left of the screen
			//at which the first blob should be added
			let x = spacing * i + xOffset;
			//Give the blob a random y position
			let y = PixiUtils.randomInt(0, this.stage.height - blob.height);
			//Set the blob's position
			blob.x = x;
			blob.y = y;
			//Set the blob's vertical velocity. `direction` will be either `1` or
			//`-1`. `1` means the enemy will move down and `-1` means the blob will
			//move up. Multiplying `direction` by `speed` determines the blob's
			//vertical direction
			blob.vy = speed * direction;
			//Reverse the direction for the next blob
			direction *= -1;
			//Push the blob into the `blobs` array
			this.blobs.push(blob);
			//Add the blob to the `gameScene`
			this.gameScene.addChild(blob);
		}

	}
	
	initKeyBoard() {
		//Capture the keyboard arrow keys
		this.left = new KeyBoard(37);
		this.up = new KeyBoard(38);
		this.right = new KeyBoard(39);
		this.down = new KeyBoard(40);

		//Left arrow key `press` method
		this.left.press = ()=> {
			//Change the explorer's velocity when the key is pressed
			this.explorer.vx = -5;
			this.explorer.vy = 0;
		};

		//Left arrow key `release` method
		this.left.release = ()=> {
			//If the left arrow has been released, and the right arrow isn't down,
			//and the explorer isn't moving vertically:
			//Stop the explorer
			if (!this.right.isDown && this.explorer.vy === 0) {
				this.explorer.vx = 0;
			}
		};

		//Up
		this.up.press = ()=> {
			this.explorer.vy = -5;
			this.explorer.vx = 0;
		};
		this.up.release = ()=> {
			if (!this.down.isDown && this.explorer.vx === 0) {
				this.explorer.vy = 0;
			}
		};

		//Right
		this.right.press = ()=> {
			this.explorer.vx = 5;
			this.explorer.vy = 0;
		};
		this.right.release = ()=> {
			if (!this.left.isDown && this.explorer.vy === 0) {
			  this.explorer.vx = 0;
			}
		};

		//Down
		this.down.press = ()=> {
			this.explorer.vy = 5;
			this.explorer.vx = 0;
		};
		this.down.release = ()=> {
			if (!this.up.isDown && this.explorer.vx === 0) {
				this.explorer.vy = 0;
			}
		};		
	}
	
	gameLoop(delta){
		//Update the current game state:
		this.state(delta);
	}

	play(delta) {
		//use the explorer's velocity to make it move
		this.explorer.x += this.explorer.vx;
		this.explorer.y += this.explorer.vy;

		//Contain the explorer inside the area of the dungeon
		PixiUtils.contain(this.explorer, {x: 28, y: 10, width: 488, height: 480});
		//contain(explorer, stage);

		//Set `explorerHit` to `false` before checking for a collision
		this.explorerHit = false;

		//Loop through all the sprites in the `enemies` array
		this.blobs.forEach((blob)=>{
			//Move the blob
			blob.y += blob.vy;

			//Check the blob's screen boundaries
			let blobHitsWall = PixiUtils.contain(blob, {x: 28, y: 10, width: 488, height: 480});

			//If the blob hits the top or bottom of the stage, reverse
			//its direction
			if (blobHitsWall === "top" || blobHitsWall === "bottom") {
				blob.vy *= -1;
			}

			//Test for a collision. If any of the enemies are touching
			//the explorer, set `explorerHit` to `true`
			if(PixiUtils.hitTestRectangle(this.explorer, blob)) {
				this.explorerHit = true;
			}
		});

		//If the explorer is hit...
		if(this.explorerHit) {
			//Make the explorer semi-transparent
			this.explorer.alpha = 0.5;

			//Reduce the width of the health bar's inner rectangle by 1 pixel
			this.healthBar.outer.width -= 1;
		} else {
			//Make the explorer fully opaque (non-transparent) if it hasn't been hit
			this.explorer.alpha = 1;
		}

		//Check for a collision between the explorer and the treasure
		if (PixiUtils.hitTestRectangle(this.explorer, this.treasure)) {
			//If the treasure is touching the explorer, center it over the explorer
			this.treasure.x = this.explorer.x + 8;
			this.treasure.y = this.explorer.y + 8;
		}

		//Does the explorer have enough health? If the width of the `innerBar`
		//is less than zero, end the game and display "You lost!"
		if (this.healthBar.outer.width < 0) {
			this.state = this.end;
			this.message.text = "You lost!";
		}

		//If the explorer has brought the treasure to the exit,
		//end the game and display "You won!"
		if (PixiUtils.hitTestRectangle(this.treasure, this.door)) {
			this.state = this.end;
			this.message.text = "You won!";
		} 
	}

	end() {
		this.gameScene.visible = false;
		this.gameOverScene.visible = true;
	}
	
}

