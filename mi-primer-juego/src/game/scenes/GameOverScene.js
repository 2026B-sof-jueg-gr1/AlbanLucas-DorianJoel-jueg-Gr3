export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.fromLevel = data.fromLevel || 'Level1Scene';
        this.checkpoint = data.checkpoint || null;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#09030c');
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Detener música previa y reproducir soundtrack de Game Over
        try {
            this.sound.stopAll();
            if (this.cache.audio.exists('music_gameover')) {
                this.sound.play('music_gameover', { volume: 0.6, loop: false });
            }
        } catch (e) {
            // Manejo silencioso de restricciones de audio
        }

        // Título Game Over con sombra y brillo
        const titleShadow = this.add.text(width / 2 + 3, 113, 'GAME OVER', {
            fontSize: '52px',
            fontFamily: 'Impact, Arial Black',
            color: '#000000'
        }).setOrigin(0.5);

        const title = this.add.text(width / 2, 110, 'GAME OVER', {
            fontSize: '52px',
            fontFamily: 'Impact, Arial Black',
            color: '#ff2222',
            stroke: '#7f0000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [title, titleShadow],
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Subtítulo
        this.add.text(width / 2, 175, '¡Te has quedado sin vidas!', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffd700'
        }).setOrigin(0.5);

        // Puntaje Final
        this.add.text(width / 2, 225, `🏆 PUNTAJE FINAL: ${this.finalScore.toString().padStart(6, '0')}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#2b0c16',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Opciones de interacción
        const retryBtn = this.add.text(width / 2, 290, '👉 [ R ] REINTENTAR NIVEL', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#00ff88',
            backgroundColor: '#112918',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const selectBtn = this.add.text(width / 2, 335, '🗺️ [ S ] SELECCIÓN DE NIVEL', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#38bdf8',
            backgroundColor: '#0c2338',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const menuBtn = this.add.text(width / 2, 380, '🏠 [ ENTER ] MENÚ PRINCIPAL', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#f43f5e',
            backgroundColor: '#2d101a',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Eventos de teclado
        this.input.keyboard.on('keydown-R', () => this.retryLevel());
        this.input.keyboard.on('keydown-S', () => this.goToLevelSelect());
        this.input.keyboard.on('keydown-ENTER', () => this.goToMainMenu());

        // Eventos de clic
        retryBtn.on('pointerdown', () => this.retryLevel());
        selectBtn.on('pointerdown', () => this.goToLevelSelect());
        menuBtn.on('pointerdown', () => this.goToMainMenu());
    }

    retryLevel() {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start(this.fromLevel, {
                lives: 3,
                score: 0,
                isPoweredUp: false,
                hasCape: false,
                checkpoint: this.checkpoint || null
            });
        });
    }

    goToLevelSelect() {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('LevelSelectScene');
        });
    }

    goToMainMenu() {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('MainMenuScene');
        });
    }
}
