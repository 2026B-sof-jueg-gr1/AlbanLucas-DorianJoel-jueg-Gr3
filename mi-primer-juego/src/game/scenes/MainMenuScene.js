export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fondo oscuro y tétrico (atmósfera de horror y apocalipsis)
        this.cameras.main.setBackgroundColor('#0b030b');

        // Siluetas de ruinas y rascacielos destruidos de fondo
        const ruinsGfx = this.add.graphics();
        ruinsGfx.fillStyle(0x130616, 0.85);
        for (let x = 0; x < width; x += 65) {
            const h = (x * 37) % 130 + 80;
            ruinsGfx.fillRect(x, height - 32 - h, 52, h);
            ruinsGfx.fillStyle(0x240a24, 0.5);
            ruinsGfx.fillRect(x + 8, height - 32 - h + 20, 10, 14);
            ruinsGfx.fillRect(x + 28, height - 32 - h + 45, 10, 14);
            ruinsGfx.fillStyle(0x130616, 0.85);
        }

        // Nubes oscuras de ceniza y humo tóxico
        this.add.image(130, 70, 'cloud').setScale(1.5).setAlpha(0.25).setTint(0x331024);
        this.add.image(430, 95, 'cloud').setScale(1.2).setAlpha(0.2).setTint(0x260c1d);
        this.add.image(690, 60, 'cloud').setScale(1.6).setAlpha(0.3).setTint(0x381428);

        // Suelo calcinado y oscuro
        for (let x = 0; x < width; x += 32) {
            this.add.image(x + 16, height - 16, 'ground').setTint(0x2a1422);
        }

        // Título del juego con estilo oscuro, sangriento y apocalíptico
        const titleShadow = this.add.text(width / 2 + 3, 118, 'SUPER MARIO DEMO', {
            fontSize: '36px',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#000000'
        }).setOrigin(0.5);

        const title = this.add.text(width / 2, 115, 'SUPER MARIO DEMO', {
            fontSize: '36px',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#991b1b',
            stroke: '#1a0306',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Animación de pulso siniestro en el título
        this.tweens.add({
            targets: [title, titleShadow],
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });


        // Decoraciones siniestras en el menú: Mario y los dos Jefes acechando en las sombras
        this.add.image(width / 2 - 170, height - 52, 'player').setScale(1.4);
        this.add.image(width / 2 + 130, height - 54, 'gorefield').setScale(0.08).setTint(0xcc4444);
        this.add.image(width / 2 + 200, height - 52, 'bonzi_red').setScale(0.24);

        // Música de fondo (Soundtrack de Menú)
        try {
            if (this.cache.audio.exists('music_menu')) {
                const current = this.sound.get('music_menu');
                if (!current || !current.isPlaying) {
                    this.sound.stopAll();
                    this.sound.play('music_menu', { volume: 0.4, loop: true });
                }
            }
        } catch (e) { }

        // Botón oscuro parpadeante para Jugar
        const startText = this.add.text(width / 2, 225, '👉 [ ENTER / CLIC ] ENTRAR A LA PESADILLA 👈', {
            fontSize: '15px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#ff4d4d',
            backgroundColor: '#26050b',
            padding: { x: 14, y: 7 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startText.setStyle({ stroke: '#660011', strokeThickness: 2 });

        this.tweens.add({
            targets: startText,
            alpha: 0.35,
            duration: 650,
            yoyo: true,
            repeat: -1
        });

        // Botón oscuro de Selección de Nivel
        const levelSelectText = this.add.text(width / 2, 272, '🗺️ [ S ] SELECCIÓN DE NIVEL (1 - 5)', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#c084fc',
            backgroundColor: '#160826',
            padding: { x: 12, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Controles y Power-ups en tonos cenizos oscuros
        this.add.text(width / 2, 345, 'CONTROLES:\n⬅️ ➡️ o [A / D] para correr | ⬆️, [W] o [ESPACIO] para saltar\n¡Pisa a los enemigos para eliminarlos | Los impactos laterales retiran Power-ups!\n🍄 Hongo: Crecer y resistir daño | 🪶 Pluma: Mantén SALTO para planear', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#8c7a88',
            align: 'center',
            lineSpacing: 4
        }).setOrigin(0.5);

        // Iniciar al presionar ENTER o ESPACIO o hacer clic
        this.input.keyboard.on('keydown-ENTER', () => this.startGame());
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
        this.input.keyboard.on('keydown-S', () => this.goToLevelSelect());
        startText.on('pointerdown', () => this.startGame());
        levelSelectText.on('pointerdown', () => this.goToLevelSelect());
    }

    startGame() {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('Level1Scene', {
                lives: 3,
                score: 0,
                isPoweredUp: false,
                hasCape: false
            });
        });
    }

    goToLevelSelect() {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('LevelSelectScene');
        });
    }
}
