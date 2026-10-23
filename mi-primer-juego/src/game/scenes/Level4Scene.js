import { BaseLevelScene } from './BaseLevelScene.js';

export class Level4Scene extends BaseLevelScene {
    constructor() {
        super('Level4Scene', {
            title: '💀 NIVEL 4: EL CASTILLO DE GOREFIELD (JEFE FINAL) 💀',
            worldWidth: 2400,
            worldHeight: 450,
            nextLevelKey: null, // Nivel final definitivo
            playerStart: { x: 70, y: 360 }
        });
    }

    buildLevel() {
        // Atmósfera tétrica de castillo de lava y horror
        this.cameras.main.setBackgroundColor('#150307');

        // Reset de estados del Boss
        this.bossHP = 5;
        this.maxBossHP = 5;
        this.bossActive = false;
        this.bossInvulnerable = false;
        this.bossDefeated = false;

        // Grupo de proyectiles de fuego de Gorefield
        this.fireballs = this.physics.add.group();

        // --- 1. TRAMO INICIAL DEL CASTILLO (El Camino a la Guarida) ---
        // Entrada
        this.createGround(0, 360);

        // Equipamiento: Pluma con Capa y Hongo
        this.createPlatform(180, 300, 3);
        this.createFeather(228, 255);

        this.add.text(40, 180, '🏰 CASTILLO DE GOREFIELD\n⚠️ Prepárate: al final del pasillo te espera la Pesadilla.\n¡Lleva la Capa 🪶 y el Hongo 🍄 al combate!', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ff9900',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 4 }
        });

        // Foso de lava 1 con plataformas móviles/estrechas
        this.createPlatform(430, 340, 2);
        this.createEnemy(445, 305, -45); // Guardia patrullando sin caer

        this.createPlatform(570, 280, 2);
        this.createJumpingEnemy(585, 245, 40, -350, 1300); // Saltador

        this.createPlatform(720, 320, 3);
        this.createPowerup(768, 275); // Hongo de refuerzo

        // Foso de lava 2
        this.createPlatform(890, 280, 2);
        this.createEnemy(905, 245, -50);

        this.createPlatform(1040, 330, 2);
        this.createJumpingEnemy(1055, 295, -45, -350, 1400);

        this.createPlatform(1180, 290, 2);

        // --- 2. LA ARENA DE GOREFIELD (1320 a 2400) ---
        // Suelo firme de la arena de combate
        this.createGround(1320, 2400);

        // Puerta de entrada (se cerrará con un muro cuando el jugador entre)
        this.arenaGateX = 1340;

        // Cartel a la entrada de la arena
        this.add.text(1360, 280, '🚪 ENTRANDO AL SALÓN DEL TRONO...', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#ff3333',
            backgroundColor: '#000000aa',
            padding: { x: 6, y: 4 }
        });

        // Plataformas elevadas dentro de la arena (para esquivar ataques y pisar al jefe desde arriba)
        this.createPlatform(1520, 270, 3);
        this.createPlatform(1820, 220, 3);
        this.createPlatform(2120, 270, 3);

        // Colisión de proyectiles con plataformas
        this.physics.add.collider(this.fireballs, this.platforms, (fb) => fb.destroy());
        // Daño al jugador por proyectiles
        this.physics.add.overlap(this.player, this.fireballs, () => {
            this.handlePlayerDeath('¡Una bola de fuego de Gorefield te ha impactado!');
        }, null, this);

        // Crear el Sprite del Jefe Final GOREFIELD
        this.createGorefieldBoss(2150, 350);
    }

    createGorefieldBoss(x, y) {
        this.gorefield = this.physics.add.sprite(x, y, 'gorefield');
        this.gorefield.setScale(0.13); // Proporción gigante e imponente
        this.gorefield.body.setSize(620, 680);
        this.gorefield.body.setOffset(160, 180);
        this.gorefield.setCollideWorldBounds(true);
        this.gorefield.setBounce(0);
        this.gorefield.setDepth(25);

        // Colisión con suelo
        this.physics.add.collider(this.gorefield, this.platforms);

        // Colisión / Stomp contra Gorefield
        this.physics.add.collider(this.player, this.gorefield, this.handleGorefieldCollision, null, this);
    }

    createBackgroundDecorations() {
        // En el interior del castillo no dibujamos nubes celestes
    }

    // Activar combate cuando el jugador entra al salón
    startBossBattle() {
        if (this.bossActive) return;
        this.bossActive = true;

        // 1. Cerrar la arena: crear muro que bloquea la salida
        for (let y = 100; y < 450; y += 32) {
            this.platforms.create(this.arenaGateX, y, 'platform');
        }

        // 2. Delimitar la cámara a la arena de combate para no perder de vista al jugador ni al jefe
        this.cameras.main.setBounds(1320, 0, 1080, 450);
        this.cameras.main.shake(450, 0.015);

        // 3. Crear HUD de la Barra de Vida del Jefe
        this.createBossHealthBar();

        // 4. Iniciar bucle de ataques de Gorefield
        this.time.addEvent({
            delay: 2200,
            loop: true,
            callback: () => this.bossAttackRoutine()
        });

        // Diálogo espeluznante
        this.showFloatingText(1850, 100, '❝ ¡EL LUNES NUNCA TERMINARÁ, MARIO! ❞', '#ff2222');
    }

    createBossHealthBar() {
        const { width } = this.cameras.main;

        // Fondo y borde
        this.bossHudContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(200);

        this.bossTitle = this.add.text(width / 2, 45, '👹 GOREFIELD: LA PESADILLA DE LASAÑA 👹', {
            fontSize: '15px',
            fontFamily: 'monospace',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.hpBox = this.add.rectangle(width / 2, 70, 320, 18, 0x111111).setStrokeStyle(2, 0xffaa00);
        this.hpBar = this.add.rectangle(width / 2 - 156, 70, 312, 12, 0xd32f2f).setOrigin(0, 0.5);

        this.bossHudContainer.add([this.bossTitle, this.hpBox, this.hpBar]);
    }

    updateBossHealthBar() {
        if (!this.hpBar) return;
        const pct = Math.max(0, this.bossHP / this.maxBossHP);
        this.hpBar.width = 312 * pct;

        if (this.bossHP <= 2) {
            this.hpBar.setFillStyle(0xff0000); // Rojo furia
        }
    }

    bossAttackRoutine() {
        if (!this.bossActive || this.bossDefeated || !this.gorefield || !this.gorefield.active) return;

        // Fase 1: Disparo de fuego
        this.shootFireball();

        // Fase 2 (HP <= 3): Salto sísmico aplastante
        if (this.bossHP <= 3 && Math.random() > 0.35) {
            if (this.gorefield.body.blocked.down || this.gorefield.body.touching.down) {
                this.gorefield.setVelocityY(-420);
                this.cameras.main.shake(200, 0.01);
            }
        }

        // Fase 3 (HP <= 1): Furia total (disparo doble)
        if (this.bossHP <= 1) {
            this.time.delayedCall(400, () => this.shootFireball());
        }
    }

    shootFireball() {
        if (!this.gorefield || !this.gorefield.active) return;

        const spawnX = this.gorefield.x + (this.gorefield.flipX ? 40 : -40);
        const spawnY = this.gorefield.y - 10;

        const fb = this.fireballs.create(spawnX, spawnY, 'fireball');
        fb.setScale(1.4);

        // Disparo en dirección hacia el jugador
        const dir = this.player.x < this.gorefield.x ? -1 : 1;
        fb.setVelocity(dir * 240, -80);
        fb.setBounce(0.6);

        // Giro continuo de la bola de fuego
        this.tweens.add({
            targets: fb,
            angle: 360 * dir,
            duration: 500,
            repeat: -1
        });
    }

    handleGorefieldCollision(player, boss) {
        if (this.isDead || this.bossDefeated) return;

        // Detección de pisotón (Stomp en la cabeza de Gorefield)
        const isStomp = (player.body.velocity.y > 0 && player.body.bottom <= boss.body.top + 35) ||
                        (player.body.touching.down && boss.body.touching.up);

        if (isStomp && !this.bossInvulnerable) {
            // Dañar al Jefe
            this.damageGorefield();
            player.setVelocityY(-440); // Gran rebote hacia arriba para escapar
        } else if (!this.bossInvulnerable) {
            // Jugador tocado por el cuerpo o patas de Gorefield
            this.handlePlayerDeath('¡Gorefield te ha atrapado en sus fauces!');
        }
    }

    damageGorefield() {
        this.bossHP--;
        this.bossInvulnerable = true;
        this.updateBossHealthBar();

        this.cameras.main.shake(300, 0.02);
        this.showFloatingText(this.gorefield.x, this.gorefield.y - 60, '-1 HP (¡GOREFIELD HERIDO!)', '#ffdd00');

        // Efecto parpadeo de daño e invulnerabilidad
        this.tweens.add({
            targets: this.gorefield,
            alpha: 0.2,
            tint: 0xff0000,
            duration: 120,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.gorefield.setAlpha(1);
                this.gorefield.clearTint();
                this.bossInvulnerable = false;
            }
        });

        // Impulso de retroceso tras el golpe
        const recoilDir = this.gorefield.x < this.player.x ? -160 : 160;
        this.gorefield.setVelocityX(recoilDir);

        if (this.bossHP <= 0) {
            this.defeatGorefield();
        }
    }

    defeatGorefield() {
        this.bossDefeated = true;
        this.bossActive = false;

        // Detener movimiento y proyectiles
        this.gorefield.setVelocity(0, 0);
        this.gorefield.body.enable = false;
        this.fireballs.clear(true, true);

        // Animación épica de derrota de Gorefield
        this.cameras.main.flash(1000, 255, 255, 255);
        this.cameras.main.shake(1200, 0.03);

        this.tweens.add({
            targets: this.gorefield,
            angle: 720,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.gorefield.destroy();
                // Aparece la meta / bandera de victoria definitiva
                this.createGoal(2150, 380);
                this.showFloatingText(2150, 320, '⭐ ¡GOREFIELD HA SIDO DESTRUIDO! ⭐', '#ffd700');
            }
        });
    }

    update() {
        super.update();

        // 1. Activar jefe al cruzar la puerta de la arena
        if (!this.bossActive && !this.bossDefeated && this.player.x > 1420) {
            this.startBossBattle();
        }

        // 2. IA de persecución de Gorefield
        if (this.bossActive && !this.bossDefeated && this.gorefield && this.gorefield.active) {
            const baseBossSpeed = this.bossHP <= 2 ? 140 : 85;

            // Mira y avanza hacia el jugador
            if (this.player.x < this.gorefield.x - 10) {
                this.gorefield.setVelocityX(-baseBossSpeed);
                this.gorefield.setFlipX(false);
            } else if (this.player.x > this.gorefield.x + 10) {
                this.gorefield.setVelocityX(baseBossSpeed);
                this.gorefield.setFlipX(true);
            }
        }
    }

    // Pantalla de Gran Victoria tras derrotar a Gorefield y tocar la meta
    showDemoFinishedScreen() {
        const { width, height } = this.cameras.main;

        const modalBg = this.add.rectangle(width / 2, height / 2, 640, 290, 0x070914, 0.95)
            .setStrokeStyle(4, 0xffd700)
            .setScrollFactor(0)
            .setDepth(300);

        this.add.text(width / 2, height / 2 - 85, '👑 ¡VICTORIA ABSOLUTA! 👑', {
            fontSize: '34px',
            fontFamily: 'Impact, Arial Black',
            color: '#ffd700',
            stroke: '#b71c1c',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        this.add.text(width / 2, height / 2 - 25, '¡Has derrotado a GOREFIELD y superado los 4 niveles del juego!', {
            fontSize: '15px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        this.add.text(width / 2, height / 2 + 15, '❝ Al fin los lunes han terminado para siempre... ❞', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ff9800',
            fontStyle: 'italic'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        const restartPrompt = this.add.text(width / 2, height / 2 + 75, '👉 Presiona [ ENTER ] o Haz Clic para volver al Menú Principal 👈', {
            fontSize: '15px',
            fontFamily: 'monospace',
            color: '#4caf50',
            backgroundColor: '#1b2a1e',
            padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        this.tweens.add({
            targets: restartPrompt,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        const returnToMenu = () => {
            this.cameras.main.fade(400, 0, 0, 0);
            this.time.delayedCall(400, () => {
                this.scene.start('MainMenuScene');
            });
        };

        this.input.keyboard.once('keydown-ENTER', returnToMenu);
        this.input.keyboard.once('keydown-SPACE', returnToMenu);
        this.input.once('pointerdown', returnToMenu);
    }
}
