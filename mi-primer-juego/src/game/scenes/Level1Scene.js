import { BaseLevelScene } from './BaseLevelScene.js';

export class Level1Scene extends BaseLevelScene {
    constructor() {
        super('Level1Scene', {
            title: 'NIVEL 1: TUTORIAL BÁSICO',
            worldWidth: 1600,
            worldHeight: 450,
            nextLevelKey: 'Level2Scene',
            playerStart: { x: 70, y: 360 }
        });
    }

    buildLevel() {
        // --- 1. Suelo y Plataformas reubicadas a alturas accesibles ---
        // Tramo inicial seguro
        this.createGround(0, 600);

        // Plataforma sobre el primer foso (altura 340: muy fácil de alcanzar desde el suelo)
        this.createPlatform(630, 340, 3);

        // Tramo posterior
        this.createGround(760, 1600);

        // Escalera de plataformas progresivas (alturas 330 -> 260)
        this.createPlatform(880, 330, 3);
        this.createPlatform(1040, 260, 3);
        this.createPlatform(1180, 200, 2);

        // --- 2. Textos tutoriales integrados en el escenario ---
        this.add.text(80, 280, '⬅️ ➡️ o [A / D] para correr\n⬆️ o [ESPACIO] para saltar\n(Mantén presionado para saltar más alto)', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#00000066',
            padding: { x: 6, y: 4 }
        });

        this.add.text(820, 240, '⬇️ ¡Salta sobre el enemigo\npara pisarlo y vencerlo!', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#ffff00',
            backgroundColor: '#00000066',
            padding: { x: 6, y: 4 }
        });

        this.add.text(1330, 280, '🏁 Toca la bandera\npara pasar al Nivel 2', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#00ff88',
            backgroundColor: '#00000066',
            padding: { x: 6, y: 4 }
        });

        // --- 3. Enemigos Patrullando (Tutorial) ---
        this.createEnemy(960, 380, -50);
        this.createEnemy(1240, 380, -60);

        // --- 4. Bandera / Meta al final del nivel ---
        this.createGoal(1480, 380);
    }
}
