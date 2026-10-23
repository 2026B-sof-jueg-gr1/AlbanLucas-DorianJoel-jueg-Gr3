export class BaseLevelScene extends Phaser.Scene {
    /**
     * @param {string} key Identificador de la escena
     * @param {object} config Opciones del nivel (título, ancho del mundo, siguiente nivel)
     */
    constructor(key, config = {}) {
        super({ key });
        this.levelConfig = Object.assign({
            title: 'NIVEL',
            worldWidth: 1600,
            worldHeight: 450,
            nextLevelKey: null,
            playerStart: { x: 80, y: 350 }
        }, config);
    }

    create() {
        const { worldWidth, worldHeight, title } = this.levelConfig;

        // Reset de estados
        this.isLevelFinished = false;
        this.isDead = false;
        this.isPoweredUp = false;
        this.hasCape = false;
        this.isGliding = false;

        // 1. Configurar límites de física y cámara
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBackgroundColor('#5c94fc');

        // 2. Fondo decorativo con nubes
        this.createBackgroundDecorations(worldWidth);

        // 3. Grupos de físicas
        this.platforms = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.feathers = this.physics.add.group();

        // Gráficos dinámicos para la capa (dibujados detrás del jugador)
        this.capeGfx = this.add.graphics().setDepth(15);

        // 4. Crear el Jugador primero para que esté disponible en buildLevel()
        this.createPlayer();

        // 5. Hook para que la escena hija construya su terreno y elementos
        this.buildLevel();

        // 6. Configurar cámara con seguimiento suave
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setFollowOffset(0, 30);

        // 7. Colisiones y Overlaps
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.powerups, this.platforms);
        this.physics.add.collider(this.feathers, this.platforms);

        // Overlap con Powerup (Hongo) y Pluma (Capa)
        this.physics.add.overlap(this.player, this.powerups, this.handlePowerup, null, this);
        this.physics.add.overlap(this.player, this.feathers, this.handleFeather, null, this);

        // Colisión con Enemigos (Mecánica de Stomp o Muerte)
        this.physics.add.collider(this.player, this.enemies, this.handleEnemyCollision, null, this);

        // Overlap con la Meta / Bandera
        if (this.goal) {
            this.physics.add.overlap(this.player, this.goal, this.handleReachGoal, null, this);
        }

        // 8. Controles de teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
            ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER
        });

        // 9. HUD Fijo en Pantalla
        this.createHUD(title);

        // Limpiar cualquier efecto de desvanecimiento previo y hacer Fade In
        this.cameras.main.resetFX();
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    createBackgroundDecorations(worldWidth) {
        // Nubes espaciadas a lo largo del nivel
        for (let x = 100; x < worldWidth; x += 350) {
            const y = Phaser.Math.Between(50, 140);
            const scale = Phaser.Math.FloatBetween(1.0, 1.6);
            this.add.image(x, y, 'cloud').setScale(scale).setAlpha(0.85);
        }
    }

    createPlayer() {
        const { x, y } = this.levelConfig.playerStart;
        this.player = this.physics.add.sprite(x, y, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(false); // Permite caer al vacío
        this.player.body.setSize(22, 32);
        this.player.body.setOffset(5, 0);
        this.player.setDepth(20);
    }

    createHUD(title) {
        this.hudText = this.add.text(16, 16, title, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 8, y: 4 }
        }).setScrollFactor(0).setDepth(100);
    }

    // --- Métodos utilitarios para que los niveles construyan bloques fácilmente ---

    createGround(startX, endX, y = 434) {
        for (let x = startX; x < endX; x += 32) {
            this.platforms.create(x + 16, y, 'ground');
        }
    }

    createPlatform(startX, y, tilesCount = 3) {
        for (let i = 0; i < tilesCount; i++) {
            this.platforms.create(startX + i * 32 + 16, y, 'platform');
        }
    }

    createEnemy(x, y, speed = -60, isFast = false) {
        const enemy = this.enemies.create(x, y, 'enemy');
        const actualSpeed = isFast ? (speed < 0 ? -110 : 110) : speed;
        enemy.setVelocityX(actualSpeed);
        enemy.setBounce(1, 0); // Rebota horizontalmente contra paredes
        enemy.setCollideWorldBounds(true); // Evita que caiga fuera de los límites del nivel
        enemy.body.setSize(24, 28);
        enemy.body.setOffset(4, 4);
        enemy.patrolSpeed = Math.abs(actualSpeed);
        if (isFast) {
            enemy.setTint(0xff3b3b); // Variante roja agresiva y rápida
        }
        return enemy;
    }

    createJumpingEnemy(x, y, speed = -50, jumpForce = -350, interval = 1600) {
        const enemy = this.createEnemy(x, y, speed);
        enemy.setTint(0xff9900); // Variante naranja saltadora (Paragoomba)
        this.time.addEvent({
            delay: interval,
            loop: true,
            callback: () => {
                if (enemy && enemy.active && (enemy.body.blocked.down || enemy.body.touching.down)) {
                    enemy.setVelocityY(jumpForce);
                }
            }
        });
        return enemy;
    }

    createPowerup(x, y) {
        const mushroom = this.powerups.create(x, y, 'mushroom');
        mushroom.setBounce(0.2);
        mushroom.body.setSize(20, 20);
        // Pequeño flotado o animación
        this.tweens.add({
            targets: mushroom,
            y: y - 6,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
        return mushroom;
    }

    createFeather(x, y) {
        const feather = this.feathers.create(x, y, 'feather');
        feather.setBounce(0.2);
        feather.body.setSize(20, 20);
        // Animación suave oscilante de la pluma estilo Mario World
        this.tweens.add({
            targets: feather,
            y: y - 8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        return feather;
    }

    createGoal(x, y = 370) {
        this.goal = this.physics.add.staticSprite(x, y, 'flag');
        this.goal.body.setSize(24, 64);
        this.goal.body.setOffset(4, 0);
        if (this.player) {
            this.physics.add.overlap(this.player, this.goal, this.handleReachGoal, null, this);
        }
        return this.goal;
    }

    // --- Ciclo de actualización ---

    update() {
        if (this.isDead || this.isLevelFinished) return;

        const baseSpeed = this.isPoweredUp ? 230 : 200;
        const jumpSpeed = this.isPoweredUp ? -550 : -500;

        // Movimiento Horizontal
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setVelocityX(-baseSpeed);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setVelocityX(baseSpeed);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        // Salto (con verificación de suelo o plataforma)
        const canJump = this.player.body.blocked.down || this.player.body.touching.down;
        const jumpPressed = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown;

        if (canJump) {
            this.stompCombo = 0; // Reinicia el combo al tocar el suelo
        }

        if (jumpPressed && canJump) {
            this.player.setVelocityY(jumpSpeed);
        }

        // Salto variable estilo Mario: soltar el botón corta la subida para mayor control
        if (!jumpPressed && this.player.body.velocity.y < -120) {
            this.player.setVelocityY(this.player.body.velocity.y * 0.7);
        }

        // Planeo con la Capa (Super Mario World)
        const isFalling = this.player.body.velocity.y > 0;
        const canGlide = this.hasCape && !canJump && jumpPressed && isFalling;

        if (canGlide) {
            this.isGliding = true;
            // Descenso suave de planeo (slow-fall)
            this.player.setVelocityY(65);
            // Agilidad horizontal ampliada durante el planeo
            if (this.cursors.left.isDown || this.keys.A.isDown) {
                this.player.setVelocityX(-220);
            } else if (this.cursors.right.isDown || this.keys.D.isDown) {
                this.player.setVelocityX(220);
            }
        } else {
            this.isGliding = false;
        }

        // Dibujar dinámicamente la capa
        this.renderCape();

        // Caída al vacío
        if (this.player.y > 470) {
            this.handlePlayerDeath('¡Te has caído al vacío!');
        }

        // Actualizar patrulla inteligente de los enemigos (permanecen en sus plataformas sin caer al vacío)
        const platformTiles = this.platforms.getChildren();
        this.enemies.children.iterate((enemy) => {
            if (!enemy || !enemy.active) return;

            if (enemy.y > 470) {
                enemy.destroy();
                return;
            }

            const isOnGround = enemy.body.blocked.down || enemy.body.touching.down;
            const movingRight = enemy.body.velocity.x > 0;

            // 1. Choque contra paredes o límites del mundo
            if (enemy.body.blocked.left) {
                enemy.setVelocityX(enemy.patrolSpeed || 60);
                enemy.setFlipX(true);
            } else if (enemy.body.blocked.right) {
                enemy.setVelocityX(-(enemy.patrolSpeed || 60));
                enemy.setFlipX(false);
            } else if (isOnGround && Math.abs(enemy.body.velocity.x) > 5) {
                // 2. Detección de borde de plataforma: si no hay suelo adelante, da la vuelta
                const checkX = movingRight ? enemy.body.right + 6 : enemy.body.left - 6;
                const checkY = enemy.body.bottom + 8;

                let hasFloorAhead = false;
                for (let i = 0; i < platformTiles.length; i++) {
                    const p = platformTiles[i];
                    if (checkX >= p.x - 16 && checkX <= p.x + 16 &&
                        checkY >= p.y - 16 && checkY <= p.y + 16) {
                        hasFloorAhead = true;
                        break;
                    }
                }

                if (!hasFloorAhead) {
                    if (movingRight) {
                        enemy.setVelocityX(-(enemy.patrolSpeed || 60));
                        enemy.setFlipX(false);
                    } else {
                        enemy.setVelocityX(enemy.patrolSpeed || 60);
                        enemy.setFlipX(true);
                    }
                }
            }
        });
    }

    // --- Mecánica de Enemigos (Stomp pisando arriba vs daño de lado) ---

    handleEnemyCollision(player, enemy) {
        if (this.isDead || this.isLevelFinished) return;

        // Detección precisa de pisotón (Stomp):
        // El jugador debe estar cayendo (velocidad Y > 0) y su parte inferior debe golpear la parte superior del enemigo
        const isStomp = (player.body.velocity.y > 0 && player.body.bottom <= enemy.body.top + 16) ||
                        (player.body.touching.down && enemy.body.touching.up);

        if (isStomp) {
            this.stompCombo = (this.stompCombo || 0) + 1;
            const points = 100 * Math.pow(2, Math.min(this.stompCombo - 1, 3));
            const comboText = this.stompCombo > 1 ? `+${points} ¡COMBO x${this.stompCombo}!` : `+${points}`;

            // Rebote del jugador tras pisar
            player.setVelocityY(-340);

            // Efecto aplastamiento del enemigo
            enemy.setVelocity(0, 0);
            enemy.body.enable = false;
            this.showFloatingText(enemy.x, enemy.y - 12, comboText, this.stompCombo > 1 ? '#00e5ff' : '#ffd700');

            this.tweens.add({
                targets: enemy,
                scaleY: 0.15,
                alpha: 0,
                duration: 200,
                onComplete: () => enemy.destroy()
            });
        } else {
            // Golpe recibido por el jugador
            this.handlePlayerDeath('¡Un enemigo te ha atrapado!');
        }
    }

    // --- Mecánica de Powerup (Hongo de crecimiento) ---

    handlePowerup(player, powerup) {
        powerup.destroy();
        this.isPoweredUp = true;
        this.showFloatingText(player.x, player.y - 30, '¡HONGO POWER-UP! (CRECES)', '#00ff88');

        // Animación de crecimiento estilo Mario
        this.tweens.add({
            targets: player,
            scaleX: 1.45,
            scaleY: 1.45,
            duration: 150,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                player.setScale(1.35);
                player.body.setSize(22, 32);
            }
        });
    }

    // --- Mecánica de Powerup (Pluma con Capa estilo Super Mario World) ---

    handleFeather(player, feather) {
        feather.destroy();
        this.hasCape = true;
        this.showFloatingText(player.x, player.y - 30, '🪶 ¡PLUMA CON CAPA! Mantén SALTO en el aire para PLANEAR', '#ffd700');

        // Giro 360 estilo Mario World al adquirir la capa
        this.tweens.add({
            targets: player,
            angle: 360,
            duration: 300,
            onComplete: () => {
                player.setAngle(0);
            }
        });
    }

    renderCape() {
        this.capeGfx.clear();
        if (!this.hasCape || this.isDead || !this.player || !this.player.active) return;

        const facingLeft = this.player.flipX;
        const neckX = facingLeft ? this.player.x + 6 : this.player.x - 6;
        const neckY = this.player.y - 4;

        const capeColor = 0xffd700; // Amarillo característico de la capa de Mario
        const capeBorder = 0xd35400; // Borde oscuro

        this.capeGfx.fillStyle(capeColor, 0.95);
        this.capeGfx.lineStyle(1.5, capeBorder, 1);

        if (this.isGliding) {
            // Capa totalmente abierta flameando horizontalmente al planear
            const flutter = Math.sin(this.time.now / 50) * 4;
            const flareX = facingLeft ? neckX + 26 : neckX - 26;
            const flareY = neckY + flutter;

            this.capeGfx.beginPath();
            this.capeGfx.moveTo(neckX, neckY);
            this.capeGfx.lineTo(flareX, flareY - 4);
            this.capeGfx.lineTo(flareX + (facingLeft ? 4 : -4), flareY + 12);
            this.capeGfx.lineTo(neckX, neckY + 14);
            this.capeGfx.closePath();
            this.capeGfx.fillPath();
            this.capeGfx.strokePath();
        } else if (Math.abs(this.player.body.velocity.x) > 15) {
            // Capa ondeando hacia atrás en carrera
            const wave = Math.sin(this.time.now / 70) * 3;
            const tailX = facingLeft ? neckX + 16 : neckX - 16;
            const tailY = neckY + 4 + wave;

            this.capeGfx.beginPath();
            this.capeGfx.moveTo(neckX, neckY);
            this.capeGfx.lineTo(tailX, tailY);
            this.capeGfx.lineTo(tailX, tailY + 14);
            this.capeGfx.lineTo(neckX, neckY + 16);
            this.capeGfx.closePath();
            this.capeGfx.fillPath();
            this.capeGfx.strokePath();
        } else {
            // Capa en reposo cayendo por la espalda
            const hangX = facingLeft ? neckX + 7 : neckX - 7;
            this.capeGfx.beginPath();
            this.capeGfx.moveTo(neckX, neckY);
            this.capeGfx.lineTo(hangX, neckY + 18);
            this.capeGfx.lineTo(neckX, neckY + 18);
            this.capeGfx.closePath();
            this.capeGfx.fillPath();
            this.capeGfx.strokePath();
        }
    }

    // --- Meta y Transición de Escena ---

    handleReachGoal(player, goal) {
        if (this.isLevelFinished) return;
        this.isLevelFinished = true;

        // Detener jugador
        player.setVelocity(0, 0);
        player.body.enable = false;

        if (this.levelConfig.nextLevelKey) {
            // Transición a siguiente nivel
            this.showFloatingText(player.x, player.y - 35, '¡NIVEL SUPERADO!', '#ffffff');
            this.cameras.main.fade(600, 0, 0, 0);
            this.time.delayedCall(650, () => {
                this.scene.start(this.levelConfig.nextLevelKey);
            });
        } else {
            // Pantalla final de la DEMO (Nivel 3)
            this.showDemoFinishedScreen();
        }
    }

    // --- Muerte / Reinicio ---

    handlePlayerDeath(reason = '') {
        if (this.isDead) return;
        this.isDead = true;
        this.hasCape = false;
        if (this.capeGfx) this.capeGfx.clear();

        this.player.setTint(0xff3333);
        this.player.setVelocity(0, -320);
        this.player.body.checkCollision.none = true;

        this.cameras.main.shake(250, 0.015);

        this.time.delayedCall(800, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.restart();
            });
        });
    }

    // --- Pantalla final de la Demo (Nivel 3) ---

    showDemoFinishedScreen() {
        const { width, height } = this.cameras.main;

        // Contenedor HUD centrado
        const modalBg = this.add.rectangle(width / 2, height / 2, 580, 260, 0x0a0d1a, 0.92)
            .setStrokeStyle(3, 0xffd700)
            .setScrollFactor(0)
            .setDepth(200);

        this.add.text(width / 2, height / 2 - 70, '🏆 ¡FELICIDADES! 🏆', {
            fontSize: '32px',
            fontFamily: 'Impact, Arial Black',
            color: '#ffd700'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        this.add.text(width / 2, height / 2 - 15, '¡Has completado con éxito la DEMO de 3 niveles!', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        const restartPrompt = this.add.text(width / 2, height / 2 + 55, '👉 Presiona [ ENTER ] o Haz Clic para volver al Menú 👈', {
            fontSize: '15px',
            fontFamily: 'monospace',
            color: '#4caf50',
            backgroundColor: '#1b2a1e',
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        this.tweens.add({
            targets: restartPrompt,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        const returnToMenu = () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('MainMenuScene');
            });
        };

        this.input.keyboard.once('keydown-ENTER', returnToMenu);
        this.input.keyboard.once('keydown-SPACE', returnToMenu);
        this.input.once('pointerdown', returnToMenu);
    }

    // --- Efecto de texto flotante ---

    showFloatingText(x, y, message, color = '#ffffff') {
        const text = this.add.text(x, y, message, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => text.destroy()
        });
    }

    /**
     * Método que deben implementar las subclases para definir el diseño del nivel.
     */
    buildLevel() {
        // Implementado por cada escena de nivel
    }
}
