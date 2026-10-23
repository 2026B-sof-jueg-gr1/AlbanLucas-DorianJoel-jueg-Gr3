export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fondo azul cielo Mario
        this.cameras.main.setBackgroundColor('#5c94fc');

        // Nubes decorativas de fondo
        this.add.image(120, 80, 'cloud').setScale(1.5).setAlpha(0.9);
        this.add.image(450, 120, 'cloud').setScale(1.2).setAlpha(0.8);
        this.add.image(700, 60, 'cloud').setScale(1.6).setAlpha(0.9);

        // Suelo decorativo inferior
        for (let x = 0; x < width; x += 32) {
            this.add.image(x + 16, height - 16, 'ground');
        }

        // Título del juego con estilo retro
        const titleShadow = this.add.text(width / 2 + 3, 133, 'SUPER PHASER DEMO', {
            fontSize: '42px',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#000000'
        }).setOrigin(0.5);

        const title = this.add.text(width / 2, 130, 'SUPER PHASER DEMO', {
            fontSize: '42px',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#ffd700',
            stroke: '#d32f2f',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Subtítulo
        this.add.text(width / 2, 185, 'PROTOTIPO DE PLATAFORMAS (4 NIVELES + JEFE GOREFIELD)', {
            fontSize: '15px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#111111',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Decoraciones: Mario y Goomba en el menú
        this.add.image(width / 2 - 120, height - 52, 'player').setScale(1.5);
        this.add.image(width / 2 + 120, height - 52, 'enemy').setScale(1.5);

        // Botón / Instrucción parpadeante
        const startText = this.add.text(width / 2, 260, '👉 PRESIONA [ ENTER ] O HAZ CLIC PARA JUGAR 👈', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#1b5e20',
            padding: { x: 12, y: 8 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0.2,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        // Controles y Power-ups en pantalla
        this.add.text(width / 2, 335, 'CONTROLES:\n⬅️ ➡️ o [A / D] para correr | ⬆️, [W] o [ESPACIO] para saltar\n¡Pisa a los enemigos para vencerlos!\n🍄 Hongo: Creces en tamaño | 🪶 Pluma: Mantén SALTO en el aire para PLANEAR con la CAPA', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#f0f0f0',
            align: 'center',
            lineSpacing: 4
        }).setOrigin(0.5);

        // Iniciar al presionar ENTER o ESPACIO o hacer clic
        this.input.keyboard.on('keydown-ENTER', () => this.startGame());
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
        this.input.on('pointerdown', () => this.startGame());
    }

    startGame() {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('Level1Scene');
        });
    }
}
