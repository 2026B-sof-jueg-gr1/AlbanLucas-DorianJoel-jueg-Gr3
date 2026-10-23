import { BaseLevelScene } from './BaseLevelScene.js';

export class Level2Scene extends BaseLevelScene {
    constructor() {
        super('Level2Scene', {
            title: 'NIVEL 2: EXPLORACIÓN NO LINEAL',
            worldWidth: 2000,
            worldHeight: 450,
            nextLevelKey: 'Level3Scene',
            playerStart: { x: 70, y: 360 }
        });
    }

    buildLevel() {
        // --- 1. Terreno con caminos alternativos (Ruta Inferior y Ruta Superior) ---
        this.createGround(0, 450);
        this.createGround(520, 1120);
        this.createGround(1220, 2000);

        // --- RUTA SUPERIOR (Exploración con Power-Ups) ---
        this.createPlatform(360, 340, 3);
        this.createPlatform(500, 270, 3);
        this.createPlatform(660, 210, 4); // Cima con el hongo
        this.createPlatform(880, 210, 3); // Plataforma alta con la pluma secreta
        this.createPlatform(1080, 280, 3);

        // Letrero orientativo
        this.add.text(390, 220, '⬆️ ¡Explora las alturas para encontrar\nel Hongo 🍄 y la Pluma con Capa 🪶!', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffd700',
            backgroundColor: '#00000077',
            padding: { x: 6, y: 3 }
        });

        // --- 2. Power-Ups ---
        // Hongo de crecimiento
        this.createPowerup(710, 170);

        // Pluma secreta con capa (Mario World Cape Feather)
        this.createFeather(920, 165);

        // --- 3. Enemigos patrullando ---
        this.createEnemy(650, 380, -60);
        this.createEnemy(530, 240, 45); // Enemigo patrullando la plataforma superior
        this.createJumpingEnemy(920, 380, -50, -320, 1800); // Enemigo saltador
        this.createEnemy(1600, 380, -90, true); // Enemigo rojo veloz en el tramo final

        // --- 4. Meta al final de la exploración ---
        this.createGoal(1850, 380);
    }
}
