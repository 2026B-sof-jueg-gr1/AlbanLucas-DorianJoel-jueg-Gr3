import { BaseLevelScene } from './BaseLevelScene.js';

export class Level1Scene extends BaseLevelScene {
    constructor() {
        super('Level1Scene', {
            title: 'NIVEL 1: PRADERAS DESAFIANTES',
            worldWidth: 1800,
            worldHeight: 450,
            nextLevelKey: 'Level2Scene',
            playerStart: { x: 70, y: 360 }
        });
    }

    buildLevel() {
        // --- 1. Terreno y Plataformas Rediseñadas ---
        // Tramo inicial seguro
        this.createGround(0, 520);

        // Foso 1 con plataforma intermedia
        this.createPlatform(540, 330, 2);

        // Tramo intermedio
        this.createGround(640, 1100);

        // Escalera hacia plataforma elevada con Hongo Power-up
        this.createPlatform(800, 320, 2);
        this.createPlatform(920, 260, 3);
        this.createPowerup(968, 215); // Hongo de bonificación inicial (+250 pts)

        // Foso 2 con plataforma estrecha
        this.createPlatform(1130, 320, 2);

        // Tramo final custodiado
        this.createGround(1240, 1800);

        // --- 2. Señales Tutoriales Dinámicas ---
        this.add.text(70, 260, '⬅️ ➡️ o [A / D] Correr | ⬆️ [ESPACIO] Saltar\n(¡Pisa a los enemigos para +100 puntos y combo!)', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 6, y: 4 }
        });

        this.add.text(870, 180, '🍄 ¡Hongo de poder! (Persiste al siguiente nivel)', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#ffd700',
            backgroundColor: '#00000088',
            padding: { x: 5, y: 3 }
        });

        // --- 3. Enemigos Variados y Desafiantes ---
        // 1 enemigo en el primer tramo
        this.createEnemy(420, 380, -50);
        // 1 enemigo saltador en el tramo medio
        this.createJumpingEnemy(740, 380, 50, -320, 1700);
        // 1 enemigo normal y 1 rojo veloz antes de la meta
        this.createEnemy(1380, 380, -60);
        this.createEnemy(1540, 380, -105, true); // Rojo veloz

        // --- 4. Bandera / Meta al final del nivel ---
        this.createGoal(1700, 380);
    }
}
