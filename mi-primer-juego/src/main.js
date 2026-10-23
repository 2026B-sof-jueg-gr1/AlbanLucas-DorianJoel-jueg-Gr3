import { config } from './game/config.js';

// Inicializar Phaser una vez cargado el DOM
window.addEventListener('DOMContentLoaded', () => {
    new Phaser.Game(config);
});
