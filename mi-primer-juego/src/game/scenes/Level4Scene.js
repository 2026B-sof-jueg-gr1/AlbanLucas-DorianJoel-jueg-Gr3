import { BaseLevelScene } from './BaseLevelScene.js';

export class Level4Scene extends BaseLevelScene {
    constructor() {
        super('Level4Scene', {
            title: '💀 NIVEL 4: CASTILLO DE LAVA (GOREFIELD) 💀',
            worldWidth: 2400,
            worldHeight: 450,
            nextLevelKey: 'Level5Scene', // Continúa al nivel apocalíptico
            customMusic: true,  // Gestiona music_castle y music_boss
            playerStart: { x: 70, y: 360 }
        });
    }

    buildLevel() {
        // Atmósfera tétrica de castillo de lava y horror
        this.cameras.main.setBackgroundColor('#150307');

        // Reproducir soundtrack del Castillo (hasta llegar al jefe)
        this.playLevelMusic('music_castle', 0.5);

        // Reset de estados del Boss (Dificultad Aumentada: 6 HP)
        this.bossHP = 6;
        this.maxBossHP = 6;
        this.bossActive = false;
        this.bossInvulnerable = false;
        this.bossDefeated = false;

        // Fosas de lava creadas por destrucción del suelo
        this.bossPits = [];

        // Puntos de teletransportación lejanos en la arena
        this.bossTeleportLocations = [
            { x: 1470, y: 350 }, // Suelo Izquierda
            { x: 1530, y: 190 }, // Plataforma Izquierda
            { x: 1820, y: 130 }, // Plataforma Central Alta
            { x: 1820, y: 350 }, // Suelo Centro
            { x: 2120, y: 190 }, // Plataforma Derecha
            { x: 2280, y: 350 }  // Suelo Derecha
        ];

        // Suelo de seguridad para que el jefe nunca caiga fuera del mundo al abrir fosas
        this.bossSafetyFloor = this.physics.add.staticGroup();
        for (let x = 1340; x < 2400; x += 32) {
            const seg = this.bossSafetyFloor.create(x + 16, 442, 'ground');
            seg.setVisible(false);
        }

        // Grupo de proyectiles de fuego y ondas sísmicas de Gorefield
        this.fireballs = this.physics.add.group();

        // --- 1. TRAMO DEL CALABOZO (El Camino a la Guarida) ---
        // Entrada
        this.createGround(0, 360);

        // Equipamiento de refuerzo: Pluma con Capa y Hongo
        this.createPlatform(180, 300, 3);
        this.createFeather(228, 255);

        this.add.text(40, 180, '🏰 CASTILLO DE GOREFIELD\n⚠️ Prepárate: al final del pasillo te espera la Pesadilla.\n¡Lleva la Capa 🪶 y el Hongo 🍄 al combate!', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ff9900',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 4 }
        });

        // Foso de lava 1 con plataformas estrechas
        this.createPlatform(430, 340, 2);
        this.createEnemy(445, 305, -45);

        this.createPlatform(570, 280, 2);
        this.createJumpingEnemy(585, 245, 40, -350, 1300); // Saltador

        this.createPlatform(720, 320, 3);
        this.createPowerup(768, 275); // Hongo de refuerzo (+250)

        // Foso de lava 2 con guardias de élite
        this.createPlatform(890, 280, 2);
        this.createEnemy(905, 245, -110, true); // Rojo veloz

        this.createPlatform(1040, 330, 2);
        this.createJumpingEnemy(1055, 295, -45, -350, 1400);

        // Plataforma previa que conecta suavemente con la entrada sin solaparse
        this.createPlatform(1130, 360, 2);

        // --- ZONA SECRETA EN EL TECHO DEL CASTILLO (Cáliz Sagrado & Bloque Oculto) ---
        this.createCastleSecretArea();

        // --- 2. LA ARENA DE GOREFIELD Y CHECKPOINT (1220 a 2400) ---
        // Suelo firme extendido desde el punto de control hasta la arena de combate
        this.createGround(1220, 2400);

        // Estación y Checkpoint accesible a ras de suelo justo antes de Gorefield
        this.createPowerup(1240, 380);
        this.createFeather(1290, 335);

        this.add.text(1210, 220, '🚩 CHECKPOINT: ANTE LA SALA DE GOREFIELD\nEquípate y avanza hacia la derecha para entrar.', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#00ff88',
            backgroundColor: '#000000bb',
            padding: { x: 6, y: 4 }
        });

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

        // Plataformas elevadas dentro de la arena (claves para esquivar las ondas de choque y atacar por arriba)
        this.createPlatform(1520, 260, 3);
        this.createPlatform(1820, 200, 3);
        this.createPlatform(2120, 260, 3);

        // Colisión de proyectiles con plataformas
        this.physics.add.collider(this.fireballs, this.platforms, (fb, tile) => {
            if (fb.isShockwave) return; // Ondas siguen corriendo por el suelo
            if (fb.isCraterBomb) {
                this.handleCraterBombImpact(fb, tile);
                return;
            }
            fb.destroy();
        });

        // Daño al jugador por proyectiles
        this.physics.add.overlap(this.player, this.fireballs, (player, fb) => {
            if (this.isInvulnerable || this.isDead) return;
            if (!fb.isShockwave) fb.destroy();
            this.handlePlayerHit(fb, '¡Un ataque de fuego de Gorefield te ha impactado!');
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

        // Colisión con suelo y plataformas
        this.physics.add.collider(this.gorefield, this.platforms, (boss) => {
            // Al aterrizar de un salto alto, genera onda sísmica
            if (this.bossActive && !this.bossDefeated && boss.body.velocity.y === 0 && boss.wasInAir) {
                boss.wasInAir = false;
                this.triggerEarthquakeShockwaves();
            }
        });

        // Colisión de Gorefield con su piso de seguridad (para no caer fuera del mapa al destruir el piso)
        this.physics.add.collider(this.gorefield, this.bossSafetyFloor);

        // Colisión / Stomp contra Gorefield
        this.physics.add.collider(this.player, this.gorefield, this.handleGorefieldCollision, null, this);
    }

    createCastleSecretArea() {
        // --- BÓVEDA SECRETA EN EL TECHO DEL CASTILLO (X: 500 a 860, Y: 40 a 90) ---
        // Pista visual misteriosa en el camino inferior
        this.add.text(480, 260, '✨ [?] ¿Secretos en el techo? Vuela alto con la Capa 🪶', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#ffd700',
            backgroundColor: '#00000099',
            padding: { x: 5, y: 3 }
        });

        // 1. Bloque misterioso oculto a mitad de altura (x=520, y=175)
        const hiddenBlock = this.platforms.create(520, 175, 'platform');
        hiddenBlock.setAlpha(0); // Invisible al inicio
        hiddenBlock.isSecretRevealed = false;

        // Detector de golpe con la cabeza (Head bonk de Mario por debajo)
        this.physics.add.overlap(this.player, hiddenBlock, (player, block) => {
            if (!block.isSecretRevealed && (this.prevVelocityY < 0 || player.body.velocity.y < 0) && player.body.top <= block.body.bottom + 10) {
                block.isSecretRevealed = true;
                block.setAlpha(1);
                block.setTint(0xffd700); // Dorado resplandeciente
                this.playSFX('sfx_powerup', 0.5);
                this.showFloatingText(block.x, block.y - 25, '✨ ¡BLOQUE SECRETO REVELADO! ✨', '#ffd700');
                this.cameras.main.shake(120, 0.008);
            }
        });

        // 2. Plataformas doradas secretas suspendidas en el techo
        this.createPlatform(660, 85, 3);
        this.createPlatform(780, 60, 3);

        // Estilizar con tinte dorado místico las baldosas de la bóveda
        this.platforms.getChildren().forEach(tile => {
            if (tile.y <= 90 && tile.x >= 650 && tile.x <= 880) {
                tile.setTint(0xffd700);
            }
        });

        // 3. El Gran Cáliz Sagrado de Inmortalidad (Reliquia Secreta)
        const relic = this.physics.add.sprite(740, 42, 'feather');
        relic.setScale(1.5);
        relic.setTint(0xffd700);
        relic.body.setAllowGravity(false);
        relic.body.setSize(24, 24);

        // Halo de luz dorada pulsante
        const halo = this.add.circle(740, 42, 22, 0xffd700, 0.35);
        this.tweens.add({
            targets: [relic, halo],
            scaleX: 1.8,
            scaleY: 1.8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Cartel secreto dentro de la bóveda
        this.add.text(670, 110, '🏆 BÓVEDA SECRETA DE LASAÑA DORADA 🏆', {
            fontSize: '11px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#ffd700',
            backgroundColor: '#000000aa',
            padding: { x: 6, y: 3 }
        });

        // Al recoger la reliquia secreta
        this.physics.add.overlap(this.player, relic, () => {
            if (relic.collected) return;
            relic.collected = true;

            // SFX de celebración doble
            this.playSFX('sfx_powerup', 0.8);
            this.time.delayedCall(200, () => this.playSFX('sfx_cape', 0.8));

            // Premios colosales: +1 Vida, +5000 Puntos, Poder Máximo (Hongo + Capa)
            this.lives++;
            this.updateHUD();
            this.addScore(5000, 740, 20);

            this.isPoweredUp = true;
            this.hasCape = true;
            this.player.setScale(1.35);

            // Destello dorado en toda la pantalla
            this.cameras.main.flash(800, 255, 215, 0);
            this.cameras.main.shake(300, 0.02);

            // Mensaje épico de recompensa
            this.showFloatingText(740, 10, '🌟 ¡BÓVEDA SECRETA RECLAMADA! (+1 VIDA ❤️ | +5000 PTS) 🌟', '#00ff88');

            // Explosión de partículas doradas
            for (let i = 0; i < 14; i++) {
                const spark = this.add.circle(740 + Phaser.Math.Between(-25, 25), 42 + Phaser.Math.Between(-25, 25), Phaser.Math.Between(3, 7), 0xffd700);
                this.tweens.add({
                    targets: spark,
                    x: spark.x + Phaser.Math.Between(-60, 60),
                    y: spark.y + Phaser.Math.Between(-60, 60),
                    alpha: 0,
                    scale: 0.1,
                    duration: 600,
                    onComplete: () => spark.destroy()
                });
            }

            halo.destroy();
            relic.destroy();
        }, null, this);
    }

    createBackgroundDecorations() {
        // En el interior del castillo no dibujamos nubes celestes
    }

    // Activar combate cuando el jugador entra al salón
    startBossBattle() {
        if (this.bossActive) return;
        this.bossActive = true;
        this.bossInvulnerable = true;

        // 1. Cambiar al Soundtrack intenso del Jefe Final
        this.playLevelMusic('music_boss', 0.6);

        // 2. Cerrar la arena: crear muro que bloquea la salida
        for (let y = 100; y < 450; y += 32) {
            this.platforms.create(this.arenaGateX, y, 'platform');
        }

        // 3. Delimitar la cámara a la arena de combate para no perder de vista al jugador ni al jefe
        this.cameras.main.setBounds(1320, 0, 1080, 450);
        this.cameras.main.shake(500, 0.02);

        // 4. Cinemática de presentación de 5 segundos antes de comenzar la batalla
        this.playBossPresentationCinematic({
            title: '⚠️ ¡ALERTA DE JEFE FINAL! ⚠️',
            name: '👹 GOREFIELD: LA PESADILLA DE LASAÑA 👹',
            quote: '❝ ¡El lunes nunca terminará para ti, Mario! ❞',
            accentColor: 0xff3b30,
            onComplete: () => {
                // Pasados los 5 segundos exactos:
                this.bossInvulnerable = false;
                this.createBossHealthBar();
                this.showFloatingText(1850, 100, '🔥 ¡A LUCHAR! 🔥', '#ffdd00');

                // Iniciar bucle de ataques de Gorefield (cadencia de 2 segundos)
                this.bossAttackTimer = this.time.addEvent({
                    delay: 2000,
                    loop: true,
                    callback: () => this.bossAttackRoutine()
                });
            }
        });
    }

    createBossHealthBar() {
        const { width } = this.cameras.main;

        this.bossHudContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(200);

        this.bossTitle = this.add.text(width / 2, 45, '👹 GOREFIELD: LA PESADILLA DE LASAÑA (6 HP) 👹', {
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
            if (this.bossTitle) this.bossTitle.setText('🔥 GOREFIELD ENFURECIDO (¡FASE FINAL!) 🔥');
        }
    }

    bossAttackRoutine() {
        if (!this.bossActive || this.bossDefeated || !this.gorefield || !this.gorefield.active || this.bossInvulnerable) return;

        const rand = Math.random();

        // Ataque 1: Bomba de cráter que destruye el suelo donde cae (30% de probabilidad)
        if (rand < 0.3) {
            this.shootFloorCraterBomb();
        }
        // Ataque 2: Salto sísmico devastador con terremoto y ondas terrestres (35%)
        else if (rand < 0.65) {
            if (this.gorefield.body.blocked.down || this.gorefield.body.touching.down) {
                this.gorefield.wasInAir = true;
                this.gorefield.setVelocityY(-460);
                this.cameras.main.shake(250, 0.015);
            }
        }
        // Ataque 3: Ráfaga de proyectiles de fuego en abanico (35%)
        else {
            this.shootFireballBarrage();
        }

        // Si está en fase furia (HP <= 2), segundo ataque rápido
        if (this.bossHP <= 2) {
            this.time.delayedCall(550, () => {
                if (this.bossActive && !this.bossDefeated && this.gorefield && this.gorefield.active && !this.bossInvulnerable) {
                    if (Math.random() < 0.5) {
                        this.shootFireballBarrage();
                    } else {
                        this.shootFloorCraterBomb();
                    }
                }
            });
        }
    }

    shootFloorCraterBomb() {
        if (!this.gorefield || !this.gorefield.active) return;
        const spawnX = this.gorefield.x + (this.gorefield.flipX ? 40 : -40);
        const spawnY = this.gorefield.y - 20;

        const targetX = Phaser.Math.Clamp(this.player.x, 1420, 2300);
        const bomb = this.fireballs.create(spawnX, spawnY, 'fireball');
        bomb.setScale(2.0);
        bomb.setTint(0xff1100);
        bomb.isCraterBomb = true;

        const dist = targetX - spawnX;
        bomb.setVelocity(dist * 0.9, -380);

        this.tweens.add({
            targets: bomb,
            angle: 720,
            duration: 800,
            repeat: -1
        });
    }

    handleCraterBombImpact(bomb, tile) {
        this.cameras.main.shake(300, 0.025);
        this.createExplosionEffect(bomb.x, bomb.y, 0xff2200);

        // Si impactó una baldosa del suelo en la arena, la destruye abriendo un foso
        if (tile && tile.y > 400 && tile.x > 1400 && tile.x < 2350) {
            this.destroySpecificFloorTile(tile);
        }
        bomb.destroy();
    }

    destroySpecificFloorTile(tile) {
        if (!tile || !tile.active || !tile.body) return;
        const tileX = tile.x;
        tile.body.enable = false; // Sin colisión inmediatamente: caída al abismo

        this.bossPits.push({ centerX: tileX, minX: tileX - 20, maxX: tileX + 20 });

        this.tweens.add({
            targets: tile,
            y: tile.y + 120,
            angle: Phaser.Math.Between(-35, 35),
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.platforms.remove(tile, true, true);
            }
        });

        this.add.rectangle(tileX, 442, 32, 16, 0xb71c1c, 0.85).setDepth(1);
        this.showFloatingText(tileX, 390, '💥 ¡CRÁTER DE FUEGO!', '#ff4400');
    }

    destroyFloorSection(targetCenterX, warningMsg) {
        if (warningMsg) {
            this.showFloatingText(targetCenterX, 340, warningMsg, '#ff2222');
        }

        const telegraph = this.add.rectangle(targetCenterX, 420, 96, 36, 0xff0000, 0.45)
            .setStrokeStyle(3, 0xffdd00)
            .setDepth(15);

        this.tweens.add({
            targets: telegraph,
            alpha: 0.1,
            duration: 150,
            yoyo: true,
            repeat: 7,
            onComplete: () => {
                telegraph.destroy();
                this.executeFloorCollapse(targetCenterX);
            }
        });
    }

    executeFloorCollapse(targetCenterX) {
        this.cameras.main.shake(500, 0.035);
        this.createExplosionEffect(targetCenterX, 425, 0xff2200);

        const tilesToCollapse = this.platforms.getChildren().filter(tile => {
            return tile.active && tile.body && tile.y > 400 && Math.abs(tile.x - targetCenterX) <= 55;
        });

        tilesToCollapse.forEach(tile => {
            tile.body.enable = false;
            this.tweens.add({
                targets: tile,
                y: tile.y + 130,
                angle: Phaser.Math.Between(-50, 50),
                alpha: 0,
                duration: 650,
                onComplete: () => {
                    this.platforms.remove(tile, true, true);
                }
            });
        });

        this.bossPits.push({ centerX: targetCenterX, minX: targetCenterX - 55, maxX: targetCenterX + 55 });

        this.add.rectangle(targetCenterX, 442, 100, 20, 0xb71c1c, 0.9).setDepth(1);
        this.add.rectangle(targetCenterX, 448, 96, 10, 0xff5722, 1).setDepth(2);
    }

    summonDemonicMinions(count = 2) {
        this.showFloatingText(this.gorefield.x, this.gorefield.y - 70, '👹 ¡ESBIRROS DE LAVA INVOCADOS! 👹', '#ff4444');
        const spawnPoints = [1480, 2220];
        for (let i = 0; i < count; i++) {
            const x = spawnPoints[i % spawnPoints.length];
            const minion = this.createJumpingEnemy(x, 340, i === 0 ? 60 : -60, -360, 1400);
            minion.setTint(0xff2200);
            this.createTeleportBurst(x, 340, 0xff3300);
        }
    }

    fireRadialFireballRing(originX, originY, count = 8) {
        this.cameras.main.shake(250, 0.02);
        for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI) / count;
            const speed = 260;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const fb = this.fireballs.create(originX, originY, 'fireball');
            fb.setScale(1.3);
            fb.setTint(0xff3300);
            fb.body.setAllowGravity(false);
            fb.setVelocity(vx, vy);

            this.tweens.add({
                targets: fb,
                angle: 360,
                duration: 350,
                repeat: -1
            });

            this.time.delayedCall(2500, () => {
                if (fb && fb.active) fb.destroy();
            });
        }
    }

    teleportGorefield() {
        if (!this.gorefield || !this.gorefield.active || this.bossDefeated) return;

        this.bossInvulnerable = true;
        this.createTeleportBurst(this.gorefield.x, this.gorefield.y, 0xff4400);

        this.tweens.add({
            targets: this.gorefield,
            alpha: 0,
            scaleX: 0.02,
            scaleY: 0.02,
            duration: 180,
            onComplete: () => {
                if (!this.gorefield || !this.gorefield.active || this.bossDefeated) return;

                // Elegir un punto distante del jugador (mínimo 260px)
                const spots = this.bossTeleportLocations.filter(s => Math.abs(s.x - this.player.x) > 260);
                const chosen = spots.length > 0
                    ? Phaser.Utils.Array.GetRandom(spots)
                    : Phaser.Utils.Array.GetRandom(this.bossTeleportLocations);

                this.gorefield.setPosition(chosen.x, chosen.y);
                this.gorefield.setVelocity(0, 0);

                this.createTeleportBurst(chosen.x, chosen.y, 0xff1100);

                this.tweens.add({
                    targets: this.gorefield,
                    alpha: 1,
                    scaleX: 0.13,
                    scaleY: 0.13,
                    duration: 220,
                    onComplete: () => {
                        this.tweens.add({
                            targets: this.gorefield,
                            alpha: 0.3,
                            duration: 90,
                            yoyo: true,
                            repeat: 3,
                            onComplete: () => {
                                if (this.gorefield && this.gorefield.active) {
                                    this.gorefield.setAlpha(1);
                                    if (this.bossHP <= 2) {
                                        this.gorefield.setTint(0xff2222);
                                    } else {
                                        this.gorefield.clearTint();
                                    }
                                    this.bossInvulnerable = false;
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    createTeleportBurst(x, y, tint = 0xff3300) {
        for (let i = 0; i < 8; i++) {
            const p = this.add.circle(x + Phaser.Math.Between(-30, 30), y + Phaser.Math.Between(-30, 30), Phaser.Math.Between(4, 9), tint);
            this.tweens.add({
                targets: p,
                y: p.y - Phaser.Math.Between(20, 60),
                alpha: 0,
                scale: 0.1,
                duration: Phaser.Math.Between(300, 500),
                onComplete: () => p.destroy()
            });
        }
    }

    createExplosionEffect(x, y, tint = 0xff3300) {
        const blast = this.add.circle(x, y, 12, tint, 0.9).setDepth(30);
        this.tweens.add({
            targets: blast,
            scale: 4.5,
            alpha: 0,
            duration: 350,
            ease: 'Cubic.easeOut',
            onComplete: () => blast.destroy()
        });
    }

    shootFireballBarrage() {
        if (!this.gorefield || !this.gorefield.active) return;

        const spawnX = this.gorefield.x + (this.gorefield.flipX ? 40 : -40);
        const spawnY = this.gorefield.y - 15;
        const dir = this.player.x < this.gorefield.x ? -1 : 1;

        // Disparo en abanico (2 o 3 proyectiles)
        const angles = this.bossHP <= 2 ? [-140, -80, -20] : [-120, -50];

        angles.forEach((vy) => {
            const fb = this.fireballs.create(spawnX, spawnY, 'fireball');
            fb.setScale(1.4);
            fb.setVelocity(dir * 250, vy);
            fb.setBounce(0.5);

            this.tweens.add({
                targets: fb,
                angle: 360 * dir,
                duration: 400,
                repeat: -1
            });
        });
    }

    triggerEarthquakeShockwaves() {
        if (!this.gorefield || !this.gorefield.active) return;

        this.cameras.main.shake(350, 0.02);

        // 2 bolas de fuego que corren por el suelo a izquierda y derecha
        [-200, 200].forEach((vx) => {
            const shock = this.fireballs.create(this.gorefield.x, 410, 'fireball');
            shock.setScale(1.5);
            shock.isShockwave = true;
            shock.setVelocityX(vx);
            shock.body.setAllowGravity(false);

            this.tweens.add({
                targets: shock,
                scaleX: 1.7,
                scaleY: 1.7,
                duration: 200,
                yoyo: true,
                repeat: -1
            });

            // Se disuelve a los 3.5 segundos
            this.time.delayedCall(3500, () => shock.destroy());
        });
    }

    handleGorefieldCollision(player, boss) {
        if (this.isDead || this.bossDefeated || this.inBossCinematic) return;

        // Detección definitiva de pisotón (Stomp sobre la cabeza de Gorefield):
        // 1. Debe estar descendiendo en el aire o planeando (nunca quieto o corriendo en el suelo)
        const wasFalling = (this.prevVelocityY > 0) || this.isGliding || (player.body.deltaY() > 0) || (player.body.prev.y < player.body.y);

        // 2. Pies claramente elevados respecto al suelo / base de Gorefield (mínimo 28 px)
        const feetElevated = (boss.body.bottom - player.body.bottom) >= 28;

        // 3. Impacto en la cabeza o parte superior
        const landingOnTop = player.body.bottom <= boss.body.top + 34;

        const isStomp = wasFalling && feetElevated && landingOnTop;

        if (isStomp && !this.bossInvulnerable) {
            // Dañar al Jefe y sumar puntaje
            this.damageGorefield();
            player.setVelocityY(-460); // Gran rebote hacia arriba para escapar
        } else if (isStomp && this.bossInvulnerable) {
            // Rebote seguro durante invulnerabilidad tras ser dañado
            player.setVelocityY(-380);
        } else if (!this.bossInvulnerable && !this.isInvulnerable) {
            // Jugador tocado lateralmente por el cuerpo o patas de Gorefield
            this.handlePlayerHit(boss, '¡Gorefield te ha atrapado en sus fauces!');
        }
    }

    damageGorefield() {
        this.bossHP--;
        this.bossInvulnerable = true;
        this.addScore(500); // 500 puntos por golpe
        this.updateBossHealthBar();

        this.cameras.main.shake(350, 0.025);
        this.showFloatingText(this.gorefield.x, this.gorefield.y - 60, '-1 HP (¡GOREFIELD HERIDO! +500)', '#ffdd00');

        // 1. ANILLO RADIAL DE BOMBAS EN 360° (evita que el jugador rebote en el mismo lugar)
        const ringCount = this.bossHP <= 2 ? 12 : 8;
        this.fireRadialFireballRing(this.gorefield.x, this.gorefield.y, ringCount);

        // 2. TELETRANSPORTACIÓN INMEDIATA A OTRO LUGAR DE LA ARENA
        this.teleportGorefield();

        // 3. EVENTOS DE FASE (Destrucción de piso e invocación de esbirros)
        if (this.bossHP === 4) {
            this.time.delayedCall(400, () => {
                this.destroyFloorSection(1680, '🔥 ¡GOREFIELD HUNDE EL SUELO EN LAVA! 🔥');
                this.summonDemonicMinions(2);
            });
        } else if (this.bossHP === 2) {
            this.time.delayedCall(400, () => {
                this.destroyFloorSection(1980, '🌋 ¡EL ABISMO SE ABRE! ¡FASE FINAL! 🌋');
                this.summonDemonicMinions(2);
            });
        }

        if (this.bossHP <= 0) {
            this.defeatGorefield();
        }
    }

    defeatGorefield() {
        this.bossDefeated = true;
        this.bossActive = false;
        if (this.bossAttackTimer) this.bossAttackTimer.remove();
        this.addScore(5000); // 5000 puntos por derrotar al jefe

        // Detener música de combate y reproducir el soundtrack de victoria
        try {
            this.sound.stopAll();
            if (this.cache.audio.exists('music_victory')) {
                this.sound.play('music_victory', { volume: 0.7, loop: false });
            }
        } catch (e) {}

        // Detener movimiento y proyectiles
        this.gorefield.setVelocity(0, 0);
        this.gorefield.body.enable = false;
        this.fireballs.clear(true, true);

        // Eliminar esbirros de la arena
        this.enemies.children.iterate((enemy) => {
            if (enemy && enemy.active && enemy.x > this.arenaGateX) {
                enemy.destroy();
            }
        });

        // Animación épica de derrota de Gorefield
        this.cameras.main.flash(1000, 255, 255, 255);
        this.cameras.main.shake(1200, 0.03);

        this.tweens.add({
            targets: this.gorefield,
            angle: 720,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 2200,
            ease: 'Power2',
            onComplete: () => {
                this.gorefield.destroy();
                // Aparece la meta / bandera de victoria definitiva
                this.createGoal(2150, 380);
                this.showFloatingText(2150, 320, '⭐ ¡GOREFIELD DESTRUIDO! +5000 ⭐', '#ffd700');
            }
        });
    }

    update() {
        super.update();

        // 1. Guardar checkpoint al llegar ante la puerta
        if (!this.activeCheckpoint && this.player.x >= 1220) {
            this.setCheckpoint(1270, 360);
        }

        // 2. Activar jefe al cruzar la puerta de la arena
        if (!this.bossActive && !this.bossDefeated && this.player.x > 1420) {
            this.setCheckpoint(1270, 360);
            this.startBossBattle();
        }

        // 3. IA de persecución agresiva de Gorefield
        if (this.bossActive && !this.bossDefeated && this.gorefield && this.gorefield.active && !this.bossInvulnerable) {
            const baseBossSpeed = this.bossHP <= 2 ? 160 : 105;

            // Mira y avanza hacia el jugador
            if (this.player.x < this.gorefield.x - 12) {
                this.gorefield.setVelocityX(-baseBossSpeed);
                this.gorefield.setFlipX(false);
            } else if (this.player.x > this.gorefield.x + 12) {
                this.gorefield.setVelocityX(baseBossSpeed);
                this.gorefield.setFlipX(true);
            }

            // Salto ágil inteligente si se aproxima a un foso de lava destruido
            this.bossPits.forEach(pit => {
                if (Math.abs(this.gorefield.x - pit.centerX) < 65 && (this.gorefield.body.blocked.down || this.gorefield.body.touching.down)) {
                    this.gorefield.setVelocityY(-440);
                }
            });
        }
    }

    // Al tocar la meta tras vencer a Gorefield: pantalla de nivel finalizado y continuación
    handleReachGoal(player) {
        if (this.isLevelFinished) return;
        this.isLevelFinished = true;

        player.setVelocity(0, 0);
        player.body.enable = false;
        this.addScore(1000);
        this.showGorefieldDefeatedScreen();
    }

    showGorefieldDefeatedScreen() {
        const { width, height } = this.cameras.main;

        this.add.rectangle(width / 2, height / 2, 660, 320, 0x070914, 0.95)
            .setStrokeStyle(4, 0xffd700)
            .setScrollFactor(0)
            .setDepth(300);

        this.add.text(width / 2, height / 2 - 105, '👑 ¡GOREFIELD DERROTADO! 👑', {
            fontSize: '32px',
            fontFamily: 'Impact, Arial Black',
            color: '#ffd700',
            stroke: '#b71c1c',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        this.add.text(width / 2, height / 2 - 50, 'Los lunes han terminado... pero el mundo exterior ha caído en ruinas.', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        this.add.text(width / 2, height / 2 - 10, `🏆 PUNTAJE ACTUAL: ${this.score.toString().padStart(6, '0')} PUNTOS`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#00ff88',
            backgroundColor: '#0c2718',
            padding: { x: 12, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        this.add.text(width / 2, height / 2 + 40, '☠️ Una nueva amenaza te espera entre los escombros: NIVEL 5 — APOCALIPSIS', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#ff9800'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        const prompt = this.add.text(width / 2, height / 2 + 100, '👉 Presiona [ ENTER ] o Haz Clic para continuar 👈', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#38bdf8',
            backgroundColor: '#0f2742',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        this.tweens.add({ targets: prompt, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });

        let proceeding = false;
        const proceed = () => {
            if (proceeding) return;
            proceeding = true;
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(550, () => {
                this.scene.start(this.levelConfig.nextLevelKey, {
                    lives: this.lives,
                    score: this.score,
                    isPoweredUp: this.isPoweredUp,
                    hasCape: this.hasCape
                });
            });
        };

        this.input.keyboard.once('keydown-ENTER', proceed);
        this.input.keyboard.once('keydown-SPACE', proceed);
        this.input.once('pointerdown', proceed);
    }
}
