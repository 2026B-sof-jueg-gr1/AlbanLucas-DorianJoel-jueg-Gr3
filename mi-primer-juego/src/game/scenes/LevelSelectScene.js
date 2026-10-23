export class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#141c2b');
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Música suave en el menú
        try {
            if (this.cache.audio.exists('music_menu')) {
                const current = this.sound.get('music_menu');
                if (!current || !current.isPlaying) {
                    this.sound.stopAll();
                    this.sound.play('music_menu', { volume: 0.4, loop: true });
                }
            }
        } catch (e) {}

        // Título
        this.add.text(width / 2, 35, '🗺️ SELECCIÓN DE NIVEL 🗺️', {
            fontSize: '28px',
            fontFamily: 'Impact, Arial Black',
            color: '#ffd700',
            stroke: '#1e3a8a',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(width / 2, 65, 'Elige cualquier nivel para jugar o probar directamente (1 al 5)', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#94a3b8'
        }).setOrigin(0.5);

        // Definición de niveles
        const levels = [
            {
                key: 'Level1Scene',
                num: '1',
                title: 'NIVEL 1: PRADERAS (TUTORIAL DESAFIANTE)',
                desc: 'Mecánicas básicas, plataformas y pisotón Stomp',
                color: '#22c55e',
                bgColor: '#0f291e',
                y: 104
            },
            {
                key: 'Level2Scene',
                num: '2',
                title: 'NIVEL 2: EXPLORACIÓN NO LINEAL',
                desc: 'Rutas alternativas con Hongo 🍄 y Pluma con Capa 🪶',
                color: '#38bdf8',
                bgColor: '#0c2738',
                y: 158
            },
            {
                key: 'Level3Scene',
                num: '3',
                title: 'NIVEL 3: EL PUENTE DEL ABISMO (EXPERTO)',
                desc: 'Fosos profundos, 11 enemigos de élite y combos aéreos',
                color: '#f59e0b',
                bgColor: '#2b1f0c',
                y: 212
            },
            {
                key: 'Level4Scene',
                num: '4',
                title: 'NIVEL 4: CASTILLO DE LAVA (JEFE GOREFIELD)',
                desc: 'Arena cerrada contra la pesadilla eldritch (6 HP y 3 fases)',
                color: '#ef4444',
                bgColor: '#2d0f14',
                y: 266
            },
            {
                key: 'Level5Scene',
                num: '5',
                title: 'NIVEL 5: MUNDO APOCALÍPTICO (JEFE BONZIBUDDY)',
                desc: 'Tierra devastada, trampas infernales y BonziBuddy de ojos rojos (7 HP)',
                color: '#c084fc',
                bgColor: '#250e33',
                y: 320
            }
        ];

        levels.forEach((lvl) => {
            const container = this.add.container(width / 2, lvl.y);

            const card = this.add.rectangle(0, 0, 680, 46, Phaser.Display.Color.HexStringToColor(lvl.bgColor).color, 0.9)
                .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(lvl.color).color)
                .setInteractive({ useHandCursor: true });

            const title = this.add.text(-320, -13, `[ ${lvl.num} ] ${lvl.title}`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: lvl.color
            });

            const desc = this.add.text(-320, 5, lvl.desc, {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#cbd5e1'
            });

            container.add([card, title, desc]);

            // Efecto Hover
            card.on('pointerover', () => {
                card.setScale(1.02);
                card.setStrokeStyle(3, 0xffffff);
            });
            card.on('pointerout', () => {
                card.setScale(1.0);
                card.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(lvl.color).color);
            });

            // Al hacer clic, lanza el nivel
            card.on('pointerdown', () => this.startLevel(lvl.key));

            // Tecla rápida numérica
            this.input.keyboard.on(`keydown-${lvl.num}`, () => this.startLevel(lvl.key));
        });

        // Botón Volver
        const backBtn = this.add.text(width / 2, 385, '🔙 [ ESC / M ] VOLVER AL MENÚ PRINCIPAL', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#f1f5f9',
            backgroundColor: '#334155',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => this.returnToMenu());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMenu());
        this.input.keyboard.on('keydown-M', () => this.returnToMenu());
    }

    startLevel(levelKey) {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start(levelKey, {
                lives: 3,
                score: 0,
                isPoweredUp: false,
                hasCape: false
            });
        });
    }

    returnToMenu() {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('MainMenuScene');
        });
    }
}
