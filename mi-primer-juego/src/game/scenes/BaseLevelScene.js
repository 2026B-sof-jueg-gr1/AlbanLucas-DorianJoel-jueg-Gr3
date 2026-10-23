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
            customMusic: false,
            playerStart: { x: 80, y: 350 }
        }, config);
    }

    init(data = {}) {
        // Persistencia de Vidas, Puntaje, Power-ups y Checkpoints entre niveles y muertes
        this.lives = data.lives !== undefined ? data.lives : 3;
        this.score = data.score !== undefined ? data.score : 0;
        this.isPoweredUp = data.isPoweredUp !== undefined ? data.isPoweredUp : false;
        this.hasCape = data.hasCape !== undefined ? data.hasCape : false;
        this.checkpoint = data.checkpoint || null;
        this.activeCheckpoint = data.checkpoint || null;
    }

    create() {
        const { worldWidth, worldHeight, title } = this.levelConfig;

        // Reset de estados locales del nivel (manteniendo vidas, puntaje y power-ups)
        this.isLevelFinished = false;
        this.isDead = false;
        this.isGliding = false;
        this.isInvulnerable = false;
        this.stompCombo = 0;
        this.prevVelocityY = 0;

        // Reproducir música de los niveles (Niveles 1 a 3)
        if (!this.levelConfig.customMusic) {
            this.playLevelMusic('music_levels', 0.45);
        }

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
        const spawnX = this.checkpoint ? this.checkpoint.x : this.levelConfig.playerStart.x;
        const spawnY = this.checkpoint ? this.checkpoint.y : this.levelConfig.playerStart.y;
        this.player = this.physics.add.sprite(spawnX, spawnY, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(false); // Permite caer al vacío
        this.player.body.setSize(22, 32);
        this.player.body.setOffset(5, 0);
        this.player.setDepth(20);

        // Si ya poseía el Hongo del nivel previo, aplicar tamaño
        if (this.isPoweredUp) {
            this.player.setScale(1.35);
            this.player.body.setSize(22, 32);
        }
    }

    setCheckpoint(x, y) {
        if (!this.activeCheckpoint || this.activeCheckpoint.x !== x || this.activeCheckpoint.y !== y) {
            this.activeCheckpoint = { x, y };
            this.checkpoint = { x, y };
            this.showFloatingText(x, y - 45, '🚩 ¡CHECKPOINT GUARDADO!', '#00ff88');
        }
    }

    createHUD(title) {
        this.hudText = this.add.text(16, 16, '', {
            fontSize: '13px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(100);
        this.updateHUD();
    }

    updateHUD() {
        if (!this.hudText) return;
        const hearts = '❤️'.repeat(Math.max(0, this.lives));
        const formattedScore = this.score.toString().padStart(6, '0');
        this.hudText.setText(`${hearts} x${this.lives} | 🏆 SCORE: ${formattedScore} | ${this.levelConfig.title}`);
    }

    addScore(points, x, y) {
        this.score += points;
        this.updateHUD();
        if (x !== undefined && y !== undefined) {
            this.showFloatingText(x, y, `+${points}`, '#ffd700');
        }
    }

    playLevelMusic(key, volume = 0.5) {
        try {
            if (!this.cache.audio.exists(key)) return;
            const current = this.sound.get(key);
            if (current && current.isPlaying) return; // Si ya se está reproduciendo, mantener fluidez
            this.sound.stopAll();
            this.sound.play(key, { volume: volume, loop: true });
        } catch (e) {}
    }

    playSFX(key, volume = 0.5) {
        try {
            if (this.cache.audio.exists(key)) {
                this.sound.play(key, { volume: volume });
            }
        } catch (e) {}
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
            this.playSFX('sfx_jump', 0.45);
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

        // Registrar velocidad vertical antes del paso de físicas
        if (this.player && this.player.body) {
            this.prevVelocityY = this.player.body.velocity.y;
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

        // Detección definitiva de pisotón (Stomp sobre enemigos menores):
        // 1. El jugador estaba descendiendo en el aire o planeando (NUNCA quieto o corriendo en el suelo)
        const wasFalling = (this.prevVelocityY > 0) || this.isGliding || (player.body.deltaY() > 0) || (player.body.prev.y < player.body.y);

        // 2. Los pies del jugador deben estar claramente por encima de la base del enemigo (mínimo 8 px arriba)
        const feetElevated = (enemy.body.bottom - player.body.bottom) >= 8;

        // 3. Los pies del jugador deben impactar sobre la parte superior del enemigo
        const landingOnTop = player.body.bottom <= enemy.body.top + 20;

        const isStomp = wasFalling && feetElevated && landingOnTop;

        if (isStomp) {
            this.stompCombo = (this.stompCombo || 0) + 1;
            const points = 100 * Math.pow(2, Math.min(this.stompCombo - 1, 3));
            this.addScore(points); // Sumar puntos del pisotón
            const comboText = this.stompCombo > 1 ? `+${points} ¡COMBO x${this.stompCombo}!` : `+${points}`;

            // Rebote del jugador tras pisar
            player.setVelocityY(-350);

            // Efecto aplastamiento del enemigo menor
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
        } else if (!this.isInvulnerable) {
            // Golpe lateral recibido: si tiene power-up pierde el poder, si está pequeño pierde vida
            this.handlePlayerHit(enemy, '¡Un enemigo te ha impactado lateralmente!');
        }
    }

    // --- Sistema de Daño Estilo Super Mario (Pérdida de Power-Up vs Pérdida de Vida) ---

    handlePlayerHit(source = null, reason = '') {
        if (this.isDead || this.isInvulnerable) return;

        // Si el jugador posee Capa o Hongo, pierde el power-up primero
        if (this.hasCape || this.isPoweredUp) {
            this.isInvulnerable = true;

            if (this.hasCape) {
                // Pierde la Capa primero (conserva Hongo si lo tenía)
                this.hasCape = false;
                this.isGliding = false;
                if (this.capeGfx) this.capeGfx.clear();
                this.showFloatingText(this.player.x, this.player.y - 35, '💔 ¡PIERDES LA CAPA! 🪶', '#ffd700');
            } else if (this.isPoweredUp) {
                // Pierde el Hongo y vuelve a Mario pequeño
                this.isPoweredUp = false;
                this.showFloatingText(this.player.x, this.player.y - 35, '💔 ¡PIERDES EL HONGO! 🍄', '#ff4444');
                this.tweens.add({
                    targets: this.player,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 180,
                    onComplete: () => {
                        if (this.player && this.player.active) {
                            this.player.body.setSize(22, 32);
                        }
                    }
                });
            }

            // Impulso de retroceso / escape para alejarse del peligro
            this.player.setVelocityY(-260);
            if (source && source.x !== undefined) {
                const recoilDir = this.player.x < source.x ? -150 : 150;
                this.player.setVelocityX(recoilDir);
            }

            this.cameras.main.shake(160, 0.012);

            // Período de invulnerabilidad con parpadeo transparente (1.5 segundos)
            this.tweens.add({
                targets: this.player,
                alpha: 0.25,
                tint: 0xff8888,
                duration: 90,
                yoyo: true,
                repeat: 8,
                onComplete: () => {
                    if (this.player && this.player.active) {
                        this.player.setAlpha(1);
                        this.player.clearTint();
                        this.isInvulnerable = false;
                    }
                }
            });
        } else {
            // Si está pequeño (sin ningún power-up), pierde 1 vida (Game Over al llegar a 0)
            this.handlePlayerDeath(reason);
        }
    }

    // --- Mecánica de Powerup (Hongo de crecimiento) ---

    handlePowerup(player, powerup) {
        powerup.destroy();
        this.isPoweredUp = true;
        this.playSFX('sfx_powerup', 0.6);
        this.addScore(250, player.x, player.y - 30);
        this.showFloatingText(player.x, player.y - 45, '¡HONGO POWER-UP! (+250)', '#00ff88');

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
        this.playSFX('sfx_cape', 0.6);
        this.addScore(300, player.x, player.y - 30);
        this.showFloatingText(player.x, player.y - 45, '🪶 ¡PLUMA CON CAPA! (+300)', '#ffd700');

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
            // Bonificación por superar el nivel y persistencia de power-ups
            this.addScore(1000);
            this.showFloatingText(player.x, player.y - 35, '¡NIVEL SUPERADO! +1000', '#00ff88');
            this.cameras.main.fade(600, 0, 0, 0);
            this.time.delayedCall(650, () => {
                this.scene.start(this.levelConfig.nextLevelKey, {
                    lives: this.lives,
                    score: this.score,
                    isPoweredUp: this.isPoweredUp,
                    hasCape: this.hasCape
                });
            });
        } else {
            // Pantalla final de la DEMO
            this.showDemoFinishedScreen();
        }
    }

    // --- Muerte / Reinicio con Sistema de 3 Vidas y Game Over ---

    handlePlayerDeath(reason = '') {
        if (this.isDead) return;
        this.isDead = true;
        this.hasCape = false;
        this.isPoweredUp = false;
        if (this.capeGfx) this.capeGfx.clear();

        // Descontar vida
        this.lives--;
        this.updateHUD();

        this.player.setTint(0xff3333);
        this.player.setVelocity(0, -320);
        this.player.body.checkCollision.none = true;

        this.cameras.main.shake(250, 0.015);

        this.time.delayedCall(800, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                if (this.lives > 0) {
                    // Reiniciar nivel con vidas restantes, puntaje acumulado y checkpoint guardado
                    this.scene.restart({
                        lives: this.lives,
                        score: this.score,
                        isPoweredUp: false,
                        hasCape: false,
                        checkpoint: this.activeCheckpoint || this.checkpoint || null
                    });
                } else {
                    // Transición a Game Over cuando se acaban las 3 vidas (preservando checkpoint al reintentar)
                    this.scene.start('GameOverScene', {
                        score: this.score,
                        fromLevel: this.scene.key,
                        checkpoint: this.activeCheckpoint || this.checkpoint || null
                    });
                }
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
