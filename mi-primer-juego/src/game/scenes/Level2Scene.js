import { BaseLevelScene } from './BaseLevelScene.js';

export class Level2Scene extends BaseLevelScene {
    constructor() {
        super('Level2Scene', {
            title: 'NIVEL 2: CAVERNAS Y ALTURAS (EXPLORACIÓN EXPERTA)',
            worldWidth: 2200,
            worldHeight: 450,
            nextLevelKey: 'Level3Scene',
            playerStart: { x: 70, y: 360 }
        });
    }

    buildLevel() {
        // --- 1. Terreno con Bifurcación Desafiante ---
        // Entrada
        this.createGround(0, 420);

        // Foso 1
        this.createGround(480, 1100);
        // Foso 2
        this.createGround(1240, 2200);

        // --- RUTA SUPERIOR DE PRECISIÓN (Power-ups: Hongo 🍄 y Pluma con Capa 🪶) ---
        this.createPlatform(340, 330, 2);
        this.createPlatform(460, 260, 2);
        this.createPlatform(600, 200, 3); // Plataforma alta con el hongo
        this.createPlatform(800, 230, 2);
        this.createPlatform(940, 170, 3); // Cima con la pluma secreta
        this.createPlatform(1120, 240, 2);
        this.createPlatform(1260, 310, 2);

        // Letrero de desafío
        this.add.text(370, 210, '⬆️ RUTA SUPERIOR:\n¡Mantén el equilibrio para conseguir el Hongo y la Capa!', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#ffd700',
            backgroundColor: '#00000088',
            padding: { x: 6, y: 4 }
        });

        // --- 2. Power-Ups persistentes ---
        this.createPowerup(648, 155);  // Hongo (+250)
        this.createFeather(988, 125);  // Pluma de la Capa (+300)

        // --- 3. Enemigos de la Ruta Baja y Alta (6 en total) ---
        // Enemigos en el suelo inferior
        this.createEnemy(620, 380, -65);
        this.createJumpingEnemy(850, 380, -45, -340, 1600); // Saltador inferior

        // Enemigo custodiando plataforma media
        this.createEnemy(820, 195, 40);

        // Enemigos custodiando el tramo largo hacia la meta
        this.createEnemy(1450, 380, -70);
        this.createEnemy(1680, 380, -110, true); // Rojo veloz
        this.createJumpingEnemy(1880, 380, -50, -350, 1500); // Saltador final

        // --- 4. Meta al final de la exploración ---
        this.createGoal(2050, 380);
    }
}
