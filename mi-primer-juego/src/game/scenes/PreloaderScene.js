export class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
    }

    preload() {
        const { width, height } = this.cameras.main;

        // --- Barra de progreso visual ---
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 20, 320, 40, 6);

        const loadingText = this.add.text(width / 2, height / 2 - 40, 'Cargando recursos...', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x4caf50, 1);
            progressBar.fillRoundedRect(width / 2 - 155, height / 2 - 15, 310 * value, 30, 4);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // --- Carga de imágenes usando rutas relativas seguras para GitHub Pages ---
        this.load.image('ground', './assets/images/ground.png');
        this.load.image('platform', './assets/images/platform.png');
        this.load.image('mushroom', './assets/images/mushroom.png');
        this.load.image('feather', './assets/images/feather.png');
        this.load.image('flag', './assets/images/flag.png');
        this.load.image('cloud', './assets/images/cloud.png');
        this.load.image('player', './assets/sprites/player.png');
        this.load.image('enemy', './assets/sprites/enemy.png');
        this.load.image('gorefield', './assets/sprites/gorefield.png');
        this.load.image('fireball', './assets/images/fireball.png');
        this.load.image('bonzi', './assets/sprites/bonzi.png');
        this.load.image('bonzi_red', './assets/sprites/bonzi_red.png');

        // --- Carga de Soundtracks (con rutas relativas para GitHub Pages) ---
        this.load.audio('music_menu', './assets/sounds/music_menu.mp3');
        this.load.audio('music_levels', './assets/sounds/music_levels.mp3');
        this.load.audio('music_castle', './assets/sounds/music_castle.mp3');
        this.load.audio('music_boss', './assets/sounds/music_boss.mp3');
        this.load.audio('music_gameover', './assets/sounds/music_gameover.mp3');
        this.load.audio('music_victory', './assets/sounds/music_victory.mp3');
        this.load.audio('music_apocalypse', './assets/sounds/music_apocalypse.mp3');

        // --- Carga de Efectos de Sonido (SFX) ---
        this.load.audio('sfx_jump', './assets/sounds/sfx_jump.mp3');
        this.load.audio('sfx_powerup', './assets/sounds/sfx_powerup.mp3');
        this.load.audio('sfx_cape', './assets/sounds/sfx_cape.mp3');
    }

    create() {
        // Asegurar texturas de reserva (fallback) por si algún recurso no existiera
        this.createFallbackTextures();

        // Pasar al menú principal
        this.scene.start('MainMenuScene');
    }

    createFallbackTextures() {
        // Genera texturas simples si alguna imagen falló al cargar
        if (!this.textures.exists('player')) {
            const g = this.make.graphics().fillStyle(0xe02020).fillRect(0, 0, 32, 32);
            g.generateTexture('player', 32, 32);
        }
        if (!this.textures.exists('enemy')) {
            const g = this.make.graphics().fillStyle(0xb44b19).fillRect(0, 0, 32, 32);
            g.generateTexture('enemy', 32, 32);
        }
        if (!this.textures.exists('ground')) {
            const g = this.make.graphics().fillStyle(0x4caf50).fillRect(0, 0, 32, 32);
            g.generateTexture('ground', 32, 32);
        }
        if (!this.textures.exists('platform')) {
            const g = this.make.graphics().fillStyle(0xc37332).fillRect(0, 0, 32, 32);
            g.generateTexture('platform', 32, 32);
        }
        if (!this.textures.exists('mushroom')) {
            const g = this.make.graphics().fillStyle(0xff2222).fillCircle(12, 12, 12);
            g.generateTexture('mushroom', 24, 24);
        }
        if (!this.textures.exists('feather')) {
            const g = this.make.graphics().fillStyle(0xffd700).fillTriangle(4, 20, 20, 4, 12, 22);
            g.generateTexture('feather', 24, 24);
        }
        if (!this.textures.exists('flag')) {
            const g = this.make.graphics().fillStyle(0xffee00).fillRect(14, 0, 18, 20).fillStyle(0xaaaaaa).fillRect(10, 0, 4, 64);
            g.generateTexture('flag', 32, 64);
        }
        if (!this.textures.exists('gorefield')) {
            const g = this.make.graphics().fillStyle(0xff8c00).fillRect(0, 0, 64, 64);
            g.generateTexture('gorefield', 64, 64);
        }
        if (!this.textures.exists('fireball')) {
            const g = this.make.graphics().fillStyle(0xff3300).fillCircle(8, 8, 8);
            g.generateTexture('fireball', 16, 16);
        }
        if (!this.textures.exists('bonzi')) {
            const g = this.make.graphics().fillStyle(0x7c3f9c).fillRect(0, 0, 64, 64);
            g.generateTexture('bonzi', 64, 64);
        }
        if (!this.textures.exists('bonzi_red')) {
            const g = this.make.graphics().fillStyle(0x7c3f9c).fillRect(0, 0, 64, 64).fillStyle(0xff0000).fillCircle(20, 20, 6).fillCircle(44, 20, 6);
            g.generateTexture('bonzi_red', 64, 64);
        }
    }
}
