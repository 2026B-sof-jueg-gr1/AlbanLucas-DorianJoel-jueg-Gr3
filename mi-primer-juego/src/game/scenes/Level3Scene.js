import { BaseLevelScene } from './BaseLevelScene.js';

export class Level3Scene extends BaseLevelScene {
    constructor() {
        super('Level3Scene', {
            title: '🔥 NIVEL 3: EL PUENTE AL CASTILLO OSCURO 🔥',
            worldWidth: 2500,
            worldHeight: 450,
            nextLevelKey: 'Level4Scene', // Conduce al Castillo de Gorefield
            customMusic: true,
            playerStart: { x: 70, y: 360 }
        });
    }

    buildLevel() {
        // Ambiente de castillo crepuscular desafiante
        this.cameras.main.setBackgroundColor('#261138');

        // Reproducir soundtrack del Castillo (music_castle.mp3)
        this.playLevelMusic('music_castle', 0.5);

        // --- 1. SECCIÓN INICIAL (Entrada y Equipamiento) ---
        this.createGround(0, 380);

        // Plataforma con la Pluma de la Capa (imprescindible para expertos)
        this.createPlatform(220, 310, 3);
        this.createFeather(268, 265);

        this.add.text(40, 185, '💀 ¡ZONA EXPERTA! 10 ENEMIGOS CUSTODIAN EL CASTILLO.\n🪶 Usa la Capa para planear sobre los abismos o\n👟 ¡Encadena pisotones (COMBOS) sobre los enemigos saltadores!', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffdd55',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 5 }
        });

        // --- 2. SECCIÓN 1: FOSO DE LOS SALTADORES ---
        // Plataformas estrechas con enemigos patrullando y saltando sobre el vacío
        this.createPlatform(440, 340, 2);
        this.createEnemy(455, 305, -45); // Enemigo 1

        this.createPlatform(590, 280, 2);
        this.createJumpingEnemy(605, 245, 40, -350, 1400); // Enemigo 2 (Saltador)

        this.createPlatform(740, 330, 2);
        this.createJumpingEnemy(755, 295, -40, -360, 1500); // Enemigo 3 (Saltador)

        // --- 3. SECCIÓN 2: LA ISLA DE LOS GUARDIAS VELOCES ---
        this.createGround(880, 1500);

        // Plataforma elevada con Hongo de recuperación
        this.createPlatform(1080, 240, 3);
        this.createPowerup(1128, 195);

        // 3 enemigos patrullando la isla a alta velocidad
        this.createEnemy(980, 380, -115, true);  // Enemigo 4 (Rojo veloz)
        this.createJumpingEnemy(1200, 380, 50, -340, 1600); // Enemigo 5 (Saltador)
        this.createEnemy(1400, 380, -115, true); // Enemigo 6 (Rojo veloz)

        // --- 4. SECCIÓN 3: EL GRAN ABISMO (Plataformas de Precisión o Vuelo con Capa) ---
        // Plataformas flotantes sobre el abismo más largo
        this.createPlatform(1570, 340, 2);
        this.createEnemy(1585, 305, -45); // Enemigo 7

        this.createPlatform(1720, 280, 2);
        this.createJumpingEnemy(1735, 245, 40, -360, 1300); // Enemigo 8 (Saltador)

        this.createPlatform(1870, 320, 2);
        this.createEnemy(1885, 285, -50); // Enemigo 9

        // --- 5. SECCIÓN 4: EL CORREDOR DE LA GUARDIA REAL ---
        this.createGround(1990, 2500);

        // Guardias de élite protegiendo el tramo final antes de la meta
        this.createEnemy(2140, 380, -120, true); // Enemigo 10 (Rojo veloz)
        this.createEnemy(2280, 380, -120, true); // Enemigo 11 (Rojo veloz)

        // Meta Final de la DEMO
        this.createGoal(2400, 380);
    }
}
