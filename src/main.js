import kaplay from "kaplay";
import "kaplay/global";
import { loadPlayer, loadPlayerSprites} from "./player";

kaplay({
	scale: 4,
	font: 'monospace'
});

//sprites cant be loaded before kaplay is initialized.
loadPlayerSprites();
const player = loadPlayer();

player.play('idleDown');

const getInfo = () => `
Equip: ${player.equip}
`.trim();

// Add some text to show the current animation
const label = add([text(getInfo(), { size: 12 }), color(0, 0, 0), pos(4)]);

label.onUpdate(() => {
	label.text = getInfo();
});

