import { PreloaderScene } from './scenes/PreloaderScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { Level1Scene } from './scenes/Level1Scene.js';
import { Level2Scene } from './scenes/Level2Scene.js';
import { Level3Scene } from './scenes/Level3Scene.js';
import { Level4Scene } from './scenes/Level4Scene.js';

export const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 450,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: [
        PreloaderScene,
        MainMenuScene,
        Level1Scene,
        Level2Scene,
        Level3Scene,
        Level4Scene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
