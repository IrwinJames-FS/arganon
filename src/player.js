import "kaplay";
import "kaplay/global";
String.prototype.capitalize = function(){ return this[0].toUpperCase()+this.slice(1); }
/**
 * The base name and the number of frames. the name will be suffixed with Left, Down, Right, Up
 * @typedef ActionDefinition
 * @type {[string, number, import("kaplay").SpriteAnim | undefined]}
 */
/**
 * The HanaCaraka sprite offer specialized animations in each direction because the directions are in the same order I can automate a lot of the declaration.
 * @param {number} maxX - The max columns expected
 * @param  {...ActionDefinition} opts - The actions being supported. these should be declared in the order they occure in the sprite grid.
 * @returns { import("kaplay").LoadSpriteOpt } - The arguments with the sliceX and sliceY as well as the animations. 
 */
export const directionalAnimations = (...opts) => {
	const maxX = Math.max(...opts.map(v=>v[1]))+1;
	const options = {
		sliceX: maxX,
		sliceY: opts.length*4,
		anims: opts.reduce((o,[name,x, op={}],i)=>{
			const y = i*4*maxX;
			['Right', 'Left', 'Down', 'Up'].forEach((d,j)=>{
				const my = y + maxX*j
				o[name+d] = {
					from: my,
					to: my+x,
					...op
				}
			});
			return o;
		},{})
	};
	return options;
}

const anims = [
	['idle', 3, {loop: true}],
	['walk', 7, {loop: true}],
	['run', 7, {loop: true}],
	['jump', 5],
	['damage', 3],
	['death', 5],
	['sword', 5],
	['spear', 5],
	['axe', 5],
	['hammer', 5],
	['pickaxe', 5],
	['planting', 3],
	['sickle', 5],
	['water', 5]
];
const colors = ['white', 'blue', 'green', 'orange', 'pink', 'red', 'yellow'];
const dirs = ["Right", "Left", "Down", "Up"];
const equips = ["sword", "pickaxe", "axe", "sickle", "spear"];

export const loadPlayerSprites = () => {
	for(let i = 0; i<colors.length; i++){
		const color = colors[i];
		loadSprite(`hana${color ? '-'+color:''}`, `assets/hana${color ? '-'+color:''}.png`, directionalAnimations(...anims));
	}
}

export const loadPlayer = (color="white") => {
	
	//loadSprite('hana', `assets/hana${color ? '-'+color:''}.png`, directionalAnimations(...anims));
	//some animations should not be haltable like jumping or swinging a sword. funny enough these are also not the non looping animations
	
	const statics = new Set(anims.filter(([,,{loop}={}])=>!loop).flatMap(([n])=>dirs.map(d=>n+d)));
	//create the sprite.
	const player = add([
		sprite('hana-'+color),
		pos(center()),
		{
			speed: 100,
			health: 100,
			armor: 0,
			strength: 100,
			equip: 'sword',
			dir: 'Down',
			lazyPlay: (cmd) => {
				const c = cmd+player.dir;
				const n = player.getCurAnim()?.name
				if(!statics.has(n) && c !== n) player.play(c);
			}
		}
	]);
	//the list the directions appears will be used to index other objects
	const vectors = {
		left: [-1, 0],
		right: [1,0],
		down: [0,1],
		up: [0,-1]
	}

	player.onAnimEnd(()=>{
		switch (player.getCurAnim()?.name){
			default: player.lazyPlay("idle");
		}
	})
	//pretty sure this is unecessary as .use can swap sprites without making a new game objects... however this might be necessary to remove and replace a player and reset them upon death. 
	const evts = [
		//handle directional keys
		onKeyDown(Object.keys(vectors), k=>{
			
			player.dir = k.capitalize();
			let speed = 1;
			let cmd = 'walk'
			if(isKeyDown('shift')){
				speed = 1.5
				cmd = 'run'
			}
			player.move(...vectors[k].map(v=>v*player.speed*speed))
			player.lazyPlay(cmd);
		}),

		//Jump
		onKeyPress("space", ()=>{
			player.lazyPlay("jump");
		}),

		/** Attack with current equip */
		onMouseDown("left", ()=>{
			player.lazyPlay(player.equip)
		}),
		onKeyPress("e", ()=>{
			const i = (equips.indexOf(player.equip)+1)%equips.length;
			player.equip = equips[i]
		}),
		//Swap color... for funsies
		onKeyPress("c", ()=>{
			const i = (colors.indexOf(player.sprite.slice(5))+1)%colors.length;
			const ns = `hana-${colors[i]}`;
			player.use(sprite(ns));
		})
	]
	return player;
}