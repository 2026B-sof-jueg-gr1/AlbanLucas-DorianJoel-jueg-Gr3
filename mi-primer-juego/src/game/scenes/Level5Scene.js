import { BaseLevelScene } from './BaseLevelScene.js';

export class Level5Scene extends BaseLevelScene {
    constructor() {
        super('Level5Scene', {
            title: '🌋 NIVEL 5: MUNDO APOCALÍPTICO (JEFE BONZIBUDDY) 🌋',
            worldWidth: 3400,
            worldHeight: 450,
            nextLevelKey: null, // ¡Nivel culminante final!
            customMusic: true,  // Gestiona music_apocalypse, music_boss y music_victory
            playerStart: { x: 70, y: 360 }
        });
    }

    buildLevel() {
        // Fondo apocalíptico oscuro: ceniza, fuego y caos digital
        this.cameras.main.setBackgroundColor('#140612');

        // Reproducir el soundtrack esperanzador pero melancólico del apocalipsis
        this.playLevelMusic('music_apocalypse', 0.55);

        // Variables de estado del Jefe Final BonziBuddy (7 HP)
        this.bossHP = 7;
        this.maxBossHP = 7;
        this.bossActive = false;
        this.bossInvulnerable = false;
        this.bossDefeated = false;

        // Fosas radiactivas / corrupción creadas por destrucción del suelo
        this.bossPits = [];

        // Puntos de teletransportación lejanos en la arena
        this.bossTeleportLocations = [
            { x: 2700, y: 350 }, // Suelo Izquierda
            { x: 2750, y: 190 }, // Plataforma Izquierda
            { x: 2960, y: 110 }, // Plataforma Central Alta
            { x: 2960, y: 350 }, // Suelo Centro
            { x: 3210, y: 190 }, // Plataforma Derecha
            { x: 3320, y: 350 }  // Suelo Derecha
        ];

        // Suelo de seguridad para que el jefe nunca caiga fuera del mundo al abrir fosas
        this.bossSafetyFloor = this.physics.add.staticGroup();
        for (let x = 2620; x < 3400; x += 32) {
            const seg = this.bossSafetyFloor.create(x + 16, 442, 'ground');
            seg.setVisible(false);
        }

        // Grupo de proyectiles cibernéticos / bolas glitch de BonziBuddy
        this.bonziProjectiles = this.physics.add.group();

        // -------------------------------------------------------------
        // SECCIÓN 1: "ZONA CERO - RUINAS CALCINADAS" (0 a 700)
        // -------------------------------------------------------------
        this.createGround(0, 420);

        // Estación inicial de suministros para afrontar el apocalipsis
        this.createPlatform(160, 290, 3);
        this.createFeather(208, 245); // Pluma con Capa

        this.createPlatform(300, 230, 3);
        this.createPowerup(348, 185); // Hongo

        this.add.text(40, 140, '☢️ NIVEL 5: TIERRA CERO APOCALÍPTICA\n⚠️ El cielo arde y las ruinas se desmoronan.\nUsa la Capa 🪶 para planear sobre los abismos sin fondo.', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#f43f5e',
            backgroundColor: '#000000bb',
            padding: { x: 8, y: 5 }
        });

        // Foso de lava radiactiva 1
        this.createPlatform(470, 330, 2);
        this.createEnemy(485, 295, -70);

        this.createPlatform(590, 270, 2);
        this.createJumpingEnemy(605, 235, 50, -360, 1400);

        // -------------------------------------------------------------
        // SECCIÓN 2: "EL DESFILADERO DE LAVA TÓXICA" (700 a 1450)
        // -------------------------------------------------------------
        this.createPlatform(730, 320, 2);
        this.createEnemy(745, 285, -110, true); // Guardia veloz

        this.createPlatform(860, 260, 2);
        this.createJumpingEnemy(875, 225, -45, -370, 1300);

        // Plataforma alta de respiro con Pluma de refuerzo
        this.createPlatform(990, 200, 3);
        this.createFeather(1038, 155);

        this.createPlatform(1130, 270, 2);
        this.createEnemy(1145, 235, 110, true);

        this.createPlatform(1260, 330, 2);

        // Isla de tierra firme con Hongo de refuerzo
        this.createGround(1360, 1620);
        this.createPowerup(1450, 370);
        this.createEnemy(1530, 385, -60);

        // -------------------------------------------------------------
        // SECCIÓN 3: "LAS ESCALERAS DEL COLAPSO" (1620 a 2300)
        // -------------------------------------------------------------
        this.createPlatform(1680, 300, 2);
        this.createEnemy(1695, 265, -110, true);

        this.createPlatform(1800, 240, 2);
        this.createJumpingEnemy(1815, 205, 50, -380, 1200);

        this.createPlatform(1930, 180, 3);
        this.createFeather(1978, 135); // Refuerzo de Capa aérea

        this.createPlatform(2070, 250, 2);
        this.createEnemy(2085, 215, -110, true);

        this.createPlatform(2190, 310, 2);

        // -------------------------------------------------------------
        // SECCIÓN 4: "EL ATRIO ANTE LA ANOMALÍA Y CHECKPOINT" (2300 a 2600)
        // -------------------------------------------------------------
        this.createGround(2300, 3400); // Suelo continuo y seguro hasta la arena
        this.createPowerup(2420, 370);
        this.createFeather(2500, 320);

        this.checkpointText = this.add.text(2410, 180, '🚩 CHECKPOINT: ANTE LA ANOMALÍA DIGITAL\nEquípate con el Hongo y la Pluma y cruza la puerta.', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#c084fc',
            backgroundColor: '#000000bb',
            padding: { x: 6, y: 4 }
        });

        // -------------------------------------------------------------
        // SECCIÓN 5: "LA ARENA DEL JUICIO: BONZIBUDDY" (2600 a 3400)
        // -------------------------------------------------------------
        this.arenaGateX = 2620;

        // Plataformas elevadas para combate vertical contra BonziBuddy
        this.createPlatform(2750, 260, 3);
        this.createPlatform(2960, 180, 4); // Plataforma central alta ideal para Stomp
        this.createPlatform(3210, 260, 3);

        // Colisión de proyectiles con plataformas
        this.physics.add.collider(this.bonziProjectiles, this.platforms, (p, tile) => {
            if (p.isShockwave) return;
            if (p.isCraterBomb) {
                this.handleGlitchCraterBombImpact(p, tile);
                return;
            }
            p.destroy();
        });

        // Daño al jugador por proyectiles
        this.physics.add.overlap(this.player, this.bonziProjectiles, (player, p) => {
            if (this.isInvulnerable || this.isDead) return;
            if (!p.isShockwave) p.destroy();
            this.handlePlayerHit(p, '¡Un pulso de virus de BonziBuddy te ha alcanzado!');
        }, null, this);

        // Crear al Jefe Final: BonziBuddy con Ojos Rojos
        this.createBonziBoss(3150, 340);
    }

    createBackgroundDecorations(worldWidth) {
        // Siluetas de rascacielos y pilares en ruinas a lo largo del nivel
        const ruinsGfx = this.add.graphics().setDepth(-5);
        ruinsGfx.fillStyle(0x0a030c, 0.7);

        for (let x = 0; x < worldWidth; x += 140) {
            const h = Phaser.Math.Between(120, 280);
            const w = Phaser.Math.Between(60, 110);
            ruinsGfx.fillRect(x, 450 - h, w, h);

            // Ventanas rotas / luces titilantes en los edificios destruidos
            ruinsGfx.fillStyle(0x3a0d2a, 0.6);
            for (let wy = 450 - h + 20; wy < 430; wy += 35) {
                for (let wx = x + 10; wx < x + w - 10; wx += 25) {
                    if (Math.random() > 0.4) {
                        ruinsGfx.fillRect(wx, wy, 12, 16);
                    }
                }
            }
            ruinsGfx.fillStyle(0x0a030c, 0.7);
        }

        // Nubes de humo y ceniza volcánica
        for (let x = 60; x < worldWidth; x += 320) {
            const y = Phaser.Math.Between(40, 120);
            const cloud = this.add.image(x, y, 'cloud')
                .setScale(Phaser.Math.FloatBetween(1.2, 1.8))
                .setAlpha(0.35)
                .setTint(0x442233);
        }
    }

    createBonziBoss(x, y) {
        // Sprite de BonziBuddy con Ojos Rojos
        this.bonzi = this.physics.add.sprite(x, y, 'bonzi_red');
        this.bonzi.setScale(0.35); // Tamaño imponente
        this.bonzi.body.setSize(220, 260, true); // true centra exactamente el hitbox respecto al sprite
        this.bonzi.setCollideWorldBounds(true);
        this.bonzi.setBounce(0);
        this.bonzi.setDepth(25);

        // Colisión con suelo y plataformas
        this.physics.add.collider(this.bonzi, this.platforms, (boss) => {
            if (this.bossActive && !this.bossDefeated && boss.body.velocity.y === 0 && boss.wasInAir) {
                boss.wasInAir = false;
                this.triggerBonziShockwaves();
            }
        });

        // Colisión de seguridad con suelo base para no caer fuera de la pantalla
        this.physics.add.collider(this.bonzi, this.bossSafetyFloor);

        // Colisión / Stomp contra BonziBuddy
        this.physics.add.collider(this.player, this.bonzi, this.handleBonziCollision, null, this);
    }

    createRedMoonArenaBackground() {
        // Cielo carmesí oscuro que reemplaza el fondo únicamente en la arena del jefe
        this.arenaRedSky = this.add.rectangle(3000, 225, 800, 450, 0x1a0208, 0.95).setDepth(-25);

        // Resplandor ardiente de eclipse carmesí detrás de la luna
        this.redMoonGlow = this.add.circle(3000, 165, 175, 0xff0022, 0.35).setDepth(-22);
        this.tweens.add({
            targets: this.redMoonGlow,
            scaleX: 1.15,
            scaleY: 1.15,
            alpha: 0.18,
            duration: 2200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // La Luna Roja (Rinne Sharingan apocalíptico de BonziBuddy)
        this.redMoon = this.add.image(3000, 165, 'red_moon')
            .setScale(0.44)
            .setDepth(-20)
            .setAlpha(0);

        // Entrada dramática de la Luna Roja
        this.tweens.add({
            targets: this.redMoon,
            alpha: 1,
            duration: 2200,
            ease: 'Power2'
        });

        // Rotación sutil y pulsación cósmica continua
        this.tweens.add({
            targets: this.redMoon,
            scaleX: 0.47,
            scaleY: 0.47,
            duration: 3500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: this.redMoon,
            angle: 360,
            duration: 180000,
            repeat: -1
        });
    }

    startBossBattle() {
        if (this.bossActive) return;
        this.bossActive = true;
        this.bossInvulnerable = true;

        // Limpiar texto de checkpoint previo para que no aparezca en la arena
        if (this.checkpointText) {
            this.checkpointText.destroy();
            this.checkpointText = null;
        }

        // 1. Cambiar al Soundtrack intenso del Jefe
        this.playLevelMusic('music_boss', 0.65);

        // 2. Cerrar la arena con muro indestructible
        for (let y = 80; y < 450; y += 32) {
            this.platforms.create(this.arenaGateX, y, 'platform');
        }

        // 3. Delimitar la cámara a la arena de combate
        this.cameras.main.setBounds(2600, 0, 800, 450);
        this.cameras.main.shake(600, 0.025);

        // 4. Activar el fondo especial de la Luna Roja (únicamente en la arena del jefe)
        this.createRedMoonArenaBackground();

        // 5. Cinemática y Presentación de 5 Segundos antes de enfrentar a BonziBuddy
        this.playBossPresentationCinematic({
            title: '⚠️ ¡ALERTA DE ENTIDAD CORRUPTA! ⚠️',
            name: '🟣 BONZIBUDDY — VIRUS DEL APOCALIPSIS 🟣',
            quote: '❝ Bajo la Luna de Sangre, tu sistema será purgado sin piedad... ❞',
            accentColor: 0xa855f7,
            onComplete: () => {
                // Pasados los 5 segundos exactos:
                this.bossInvulnerable = false;
                this.createBossHealthBar();
                this.showFloatingText(2950, 100, '🔥 ¡A LUCHAR! 🔥', '#c084fc');

                // Iniciar bucle de ataques de BonziBuddy
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

        this.bossTitle = this.add.text(width / 2, 45, '🟣 BONZIBUDDY — LA ENTIDAD CORRUPTA (7 HP) 🟣', {
            fontSize: '14px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#c084fc',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.hpBox = this.add.rectangle(width / 2, 70, 320, 18, 0x111111).setStrokeStyle(2, 0xa855f7);
        this.hpBar = this.add.rectangle(width / 2 - 156, 70, 312, 12, 0xa855f7).setOrigin(0, 0.5);

        this.bossHudContainer.add([this.bossTitle, this.hpBox, this.hpBar]);
    }

    updateBossHealthBar() {
        if (!this.hpBar) return;
        const pct = Math.max(0, this.bossHP / this.maxBossHP);
        this.hpBar.width = 312 * pct;

        if (this.bossHP <= 2) {
            this.hpBar.setFillStyle(0xff0033);
            if (this.bossTitle) this.bossTitle.setText('⚠️ BONZIBUDDY SOBRECARGADO (¡DESESPERACIÓN PURA!) ⚠️');
        } else if (this.bossHP <= 4) {
            this.hpBar.setFillStyle(0xf59e0b);
            if (this.bossTitle) this.bossTitle.setText('🔥 BONZIBUDDY CORROMPIDO (FASE DE FURIA) 🔥');
        }
    }

    bossAttackRoutine() {
        if (!this.bossActive || this.bossDefeated || !this.bonzi || !this.bonzi.active || this.bossInvulnerable) return;

        const rand = Math.random();

        // Ataque 1: Bomba glitch de desintegración que destruye el piso (30% de probabilidad)
        if (rand < 0.3) {
            this.shootGlitchCraterBomb();
        }
        // Ataque 2: Salto sísmico devastador con ondas terrestres cibernéticas (35%)
        else if (rand < 0.65) {
            if (this.bonzi.body.blocked.down || this.bonzi.body.touching.down) {
                this.bonzi.wasInAir = true;
                this.bonzi.setVelocityY(-480);
                this.cameras.main.shake(220, 0.015);
            }
        }
        // Ataque 3: Ráfaga de proyectiles cibernéticos glitch en abanico (35%)
        else {
            this.shootGlitchProjectiles();
        }

        // Si está en fase furia (HP <= 2), ataque consecutivo de alta velocidad
        if (this.bossHP <= 2) {
            this.time.delayedCall(500, () => {
                if (this.bossActive && !this.bossDefeated && this.bonzi && this.bonzi.active && !this.bossInvulnerable) {
                    if (Math.random() < 0.5) {
                        this.shootGlitchProjectiles();
                    } else {
                        this.shootGlitchCraterBomb();
                    }
                }
            });
        }
    }

    shootGlitchCraterBomb() {
        if (!this.bonzi || !this.bonzi.active) return;
        const spawnX = this.bonzi.x + (this.bonzi.flipX ? 35 : -35);
        const spawnY = this.bonzi.y - 15;

        const targetX = Phaser.Math.Clamp(this.player.x, 2660, 3360);
        const bomb = this.bonziProjectiles.create(spawnX, spawnY, 'fireball');
        bomb.setScale(2.1);
        bomb.setTint(0xa855f7); // Púrpura de sobrecarga corrupta
        bomb.isCraterBomb = true;

        const dist = targetX - spawnX;
        bomb.setVelocity(dist * 0.9, -390);

        this.tweens.add({
            targets: bomb,
            angle: -720,
            duration: 750,
            repeat: -1
        });
    }

    handleGlitchCraterBombImpact(bomb, tile) {
        this.cameras.main.shake(300, 0.025);
        this.createGlitchExplosion(bomb.x, bomb.y);

        // Si impacta una baldosa del suelo en la arena, la desintegra al vacío radiactivo
        if (tile && tile.y > 400 && tile.x > 2650 && tile.x < 3380) {
            this.destroySpecificFloorTile(tile);
        }
        bomb.destroy();
    }

    destroySpecificFloorTile(tile) {
        if (!tile || !tile.active || !tile.body) return;
        const tileX = tile.x;
        tile.body.enable = false; // Sin colisión inmediatamente: caída mortal

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

        this.add.rectangle(tileX, 442, 32, 16, 0x4a044e, 0.85).setDepth(1);
        this.showFloatingText(tileX, 390, '👾 ¡MEMORIA BORRADA!', '#c084fc');
    }

    corruptAndDestroyFloor(targetCenterX, warningMsg) {
        if (warningMsg) {
            this.showFloatingText(targetCenterX, 340, warningMsg, '#e11d48');
        }

        const telegraph = this.add.rectangle(targetCenterX, 420, 96, 36, 0xa855f7, 0.45)
            .setStrokeStyle(3, 0x06b6d4)
            .setDepth(15);

        this.tweens.add({
            targets: telegraph,
            alpha: 0.1,
            duration: 140,
            yoyo: true,
            repeat: 7,
            onComplete: () => {
                telegraph.destroy();
                this.executeFloorCorruption(targetCenterX);
            }
        });
    }

    executeFloorCorruption(targetCenterX) {
        this.cameras.main.shake(500, 0.035);
        this.createGlitchExplosion(targetCenterX, 425);

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

        this.add.rectangle(targetCenterX, 442, 100, 20, 0x3b0764, 0.9).setDepth(1);
        this.add.rectangle(targetCenterX, 448, 96, 10, 0x7c3aed, 1).setDepth(2);
    }

    summonCyberMinions(count = 2) {
        this.showFloatingText(this.bonzi.x, this.bonzi.y - 70, '👾 ¡AGENTES VIRALES INVOCADOS! 👾', '#a855f7');
        const spawnPoints = [2720, 3320];
        for (let i = 0; i < count; i++) {
            const x = spawnPoints[i % spawnPoints.length];
            const minion = this.createEnemy(x, 340, i === 0 ? 110 : -110, true);
            minion.setTint(0xd946ef); // Tinte ciber-glitch fucsia
            this.createGlitchBurst(x, 340);
        }
    }

    fireRadialGlitchRing(originX, originY, count = 8) {
        this.cameras.main.shake(250, 0.02);
        for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI) / count;
            const speed = 270;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const p = this.bonziProjectiles.create(originX, originY, 'fireball');
            p.setScale(1.3);
            p.setTint(0xcc00ff); // Púrpura cibernético
            p.body.setAllowGravity(false);
            p.setVelocity(vx, vy);

            this.tweens.add({
                targets: p,
                angle: -360,
                duration: 300,
                repeat: -1
            });

            this.time.delayedCall(2500, () => {
                if (p && p.active) p.destroy();
            });
        }
    }

    playGlitchSound() {
        try {
            const ctx = this.sound && this.sound.context;
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            // Frecuencias erráticas y caóticas típicas de fallo de memoria / virus informático
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.setValueAtTime(220, now + 0.04);
            osc.frequency.setValueAtTime(1400, now + 0.08);
            osc.frequency.setValueAtTime(180, now + 0.12);
            osc.frequency.setValueAtTime(1750, now + 0.16);
            osc.frequency.setValueAtTime(90, now + 0.20);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.29);
        } catch (e) {
            // Manejo silencioso en caso de restricciones de audio
        }
    }

    triggerBonziSpriteGlitch(onComplete) {
        if (!this.bonzi || !this.bonzi.active) {
            if (onComplete) onComplete();
            return;
        }

        // Sonido sintético de bitcrush / fallo digital de virus
        this.playGlitchSound();

        // Detener movimiento y congelar para el efecto de impacto
        this.bonzi.setVelocity(0, 0);

        const baseX = this.bonzi.x;
        const baseY = this.bonzi.y;
        const baseScaleX = this.bonzi.scaleX;
        const baseScaleY = this.bonzi.scaleY;
        const isFlipped = this.bonzi.flipX;

        const glitchObjects = [];

        // 1. Clones de aberración cromática RGB (Ghost Sprites del propio BonziBuddy)
        const cyanGhost = this.add.image(baseX - 16, baseY, 'bonzi_red')
            .setScale(Math.abs(baseScaleX), baseScaleY)
            .setFlipX(isFlipped)
            .setTint(0x00ffff)
            .setAlpha(0.75)
            .setDepth(this.bonzi.depth - 1);

        const magentaGhost = this.add.image(baseX + 16, baseY, 'bonzi_red')
            .setScale(Math.abs(baseScaleX), baseScaleY)
            .setFlipX(isFlipped)
            .setTint(0xff007f)
            .setAlpha(0.75)
            .setDepth(this.bonzi.depth - 1);

        const whiteGhost = this.add.image(baseX, baseY - 6, 'bonzi_red')
            .setScale(Math.abs(baseScaleX), baseScaleY)
            .setFlipX(isFlipped)
            .setTint(0xffffff)
            .setAlpha(0.55)
            .setDepth(this.bonzi.depth - 2);

        glitchObjects.push(cyanGhost, magentaGhost, whiteGhost);

        // 2. Tiras y franjas horizontales de corte digital (Scanline Slices sobre el sprite)
        const sliceColors = [0x00ffff, 0xff00ff, 0x22c55e, 0xffffff, 0xffff00];
        const slices = [];
        for (let i = 0; i < 9; i++) {
            const offsetY = Phaser.Math.Between(-45, 45);
            const sliceWidth = Phaser.Math.Between(45, 100);
            const sliceHeight = Phaser.Math.Between(2, 6);
            const slice = this.add.rectangle(
                baseX + Phaser.Math.Between(-15, 15),
                baseY + offsetY,
                sliceWidth,
                sliceHeight,
                Phaser.Utils.Array.GetRandom(sliceColors),
                0.85
            ).setDepth(this.bonzi.depth + 1);
            slices.push(slice);
            glitchObjects.push(slice);
        }

        // 3. Glifos de error y código binario que escapan del sprite
        const virusGlyphs = ['01', 'ERR', '404', 'VIRUS', 'NULL', '#!%', '0x7F', '>_<'];
        for (let i = 0; i < 5; i++) {
            const glyphText = Phaser.Utils.Array.GetRandom(virusGlyphs);
            const glyphColor = Phaser.Utils.Array.GetRandom(['#00ffff', '#ff00ff', '#22c55e', '#ffd700']);
            const glyph = this.add.text(
                baseX + Phaser.Math.Between(-30, 30),
                baseY + Phaser.Math.Between(-30, 20),
                glyphText,
                {
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: glyphColor,
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setDepth(this.bonzi.depth + 2);

            this.tweens.add({
                targets: glyph,
                x: glyph.x + Phaser.Math.Between(-35, 35),
                y: glyph.y - Phaser.Math.Between(25, 55),
                alpha: 0,
                duration: Phaser.Math.Between(320, 480),
                ease: 'Power1',
                onComplete: () => glyph.destroy()
            });
        }

        // 4. Franjas de interferencia en pantalla completa (CRT glitch scanlines)
        const screenLines = [];
        for (let i = 0; i < 3; i++) {
            const line = this.add.rectangle(
                this.cameras.main.scrollX + 400,
                Phaser.Math.Between(80, 380),
                800,
                Phaser.Math.Between(2, 5),
                Phaser.Utils.Array.GetRandom([0x00ffff, 0xff00ff, 0xffffff]),
                0.35
            ).setDepth(450);
            screenLines.push(line);
            glitchObjects.push(line);
        }

        // 5. Bucle espasmódico de glitch sobre el sprite de Bonzi (380 ms)
        let step = 0;
        const totalSteps = 10;
        const stepInterval = 38;

        const glitchTimer = this.time.addEvent({
            delay: stepInterval,
            repeat: totalSteps - 1,
            callback: () => {
                if (!this.bonzi || !this.bonzi.active) {
                    glitchTimer.remove();
                    glitchObjects.forEach(o => o && o.destroy && o.destroy());
                    if (onComplete) onComplete();
                    return;
                }

                step++;

                // Jitter aleatorio de posición y ángulo del sprite
                this.bonzi.x = baseX + Phaser.Math.Between(-14, 14);
                this.bonzi.y = baseY + Phaser.Math.Between(-8, 8);
                this.bonzi.angle = Phaser.Math.Between(-12, 12);

                // Alternancia de escala y deformación horizontal (glitch de estiramiento)
                const scaleWarp = Phaser.Utils.Array.GetRandom([0.38, -0.35, 0.31, 0.42, 0.35]);
                this.bonzi.scaleX = scaleWarp * (isFlipped ? -1 : 1);
                this.bonzi.scaleY = baseScaleY * Phaser.Math.FloatBetween(0.85, 1.15);

                // Tintes corruptos y parpadeo de canal
                const corruptedTint = Phaser.Utils.Array.GetRandom([
                    0x00ffff, // Cian eléctrico
                    0xff00ff, // Magenta glitch
                    0xffffff, // Flash blanco estático
                    0x00ff66, // Verde matriz
                    0xffff00, // Amarillo error
                    0x7c3aed, // Púrpura virus
                    0xff0033  // Rojo crítico
                ]);
                this.bonzi.setTint(corruptedTint);

                // Mover clones RGB en direcciones opuestas
                if (cyanGhost && cyanGhost.active) {
                    cyanGhost.setPosition(this.bonzi.x - Phaser.Math.Between(10, 26), this.bonzi.y + Phaser.Math.Between(-6, 6));
                    cyanGhost.angle = -this.bonzi.angle;
                }
                if (magentaGhost && magentaGhost.active) {
                    magentaGhost.setPosition(this.bonzi.x + Phaser.Math.Between(10, 26), this.bonzi.y + Phaser.Math.Between(-6, 6));
                    magentaGhost.angle = this.bonzi.angle * 1.5;
                }
                if (whiteGhost && whiteGhost.active) {
                    whiteGhost.setPosition(this.bonzi.x + Phaser.Math.Between(-6, 6), this.bonzi.y - Phaser.Math.Between(4, 12));
                }

                // Desplazar tiras horizontales aleatoriamente
                slices.forEach(s => {
                    if (s && s.active) {
                        s.x = baseX + Phaser.Math.Between(-24, 24);
                        s.width = Phaser.Math.Between(35, 110);
                        s.alpha = Phaser.Math.FloatBetween(0.4, 0.95);
                    }
                });

                // Mover líneas de pantalla
                screenLines.forEach(l => {
                    if (l && l.active) {
                        l.y = Phaser.Math.Between(60, 400);
                        l.alpha = Phaser.Math.FloatBetween(0.2, 0.5);
                    }
                });

                // Al completar los pasos del glitch
                if (step >= totalSteps) {
                    // Limpiar artefactos y clones
                    glitchObjects.forEach(o => o && o.destroy && o.destroy());

                    if (this.bonzi && this.bonzi.active) {
                        this.bonzi.setPosition(baseX, baseY);
                        this.bonzi.setScale(Math.abs(baseScaleX) * (isFlipped ? -1 : 1), baseScaleY);
                        this.bonzi.angle = 0;

                        // Tinte según la fase de vida
                        if (this.bossHP <= 2) {
                            this.bonzi.setTint(0xff0033);
                        } else if (this.bossHP <= 4) {
                            this.bonzi.setTint(0xff88aa);
                        } else {
                            this.bonzi.clearTint();
                        }
                    }

                    if (onComplete) onComplete();
                }
            }
        });
    }

    teleportBonzi() {
        if (!this.bonzi || !this.bonzi.active || this.bossDefeated) return;

        this.bossInvulnerable = true;
        this.createGlitchBurst(this.bonzi.x, this.bonzi.y);

        this.tweens.add({
            targets: this.bonzi,
            alpha: 0,
            scaleX: 0.04,
            scaleY: 0.04,
            duration: 170,
            onComplete: () => {
                if (!this.bonzi || !this.bonzi.active || this.bossDefeated) return;

                // Elegir un punto distante del jugador (mínimo 260px)
                const spots = this.bossTeleportLocations.filter(s => Math.abs(s.x - this.player.x) > 260);
                const chosen = spots.length > 0
                    ? Phaser.Utils.Array.GetRandom(spots)
                    : Phaser.Utils.Array.GetRandom(this.bossTeleportLocations);

                this.bonzi.setPosition(chosen.x, chosen.y);
                this.bonzi.setVelocity(0, 0);

                this.createGlitchBurst(chosen.x, chosen.y);

                this.tweens.add({
                    targets: this.bonzi,
                    alpha: 1,
                    scaleX: 0.35,
                    scaleY: 0.35,
                    duration: 210,
                    onComplete: () => {
                        this.tweens.add({
                            targets: this.bonzi,
                            alpha: 0.3,
                            duration: 90,
                            yoyo: true,
                            repeat: 3,
                            onComplete: () => {
                                if (this.bonzi && this.bonzi.active) {
                                    this.bonzi.setAlpha(1);
                                    if (this.bossHP <= 2) {
                                        this.bonzi.setTint(0xff0033);
                                    } else if (this.bossHP <= 4) {
                                        this.bonzi.setTint(0xff88aa);
                                    } else {
                                        this.bonzi.clearTint();
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

    createGlitchBurst(x, y) {
        for (let i = 0; i < 9; i++) {
            const p = this.add.circle(
                x + Phaser.Math.Between(-35, 35),
                y + Phaser.Math.Between(-35, 35),
                Phaser.Math.Between(4, 9),
                Math.random() > 0.5 ? 0x06b6d4 : 0xd946ef
            );
            this.tweens.add({
                targets: p,
                y: p.y - Phaser.Math.Between(20, 60),
                alpha: 0,
                scale: 0.1,
                duration: Phaser.Math.Between(280, 480),
                onComplete: () => p.destroy()
            });
        }
    }

    createGlitchExplosion(x, y) {
        const blast = this.add.circle(x, y, 14, 0xa855f7, 0.9).setDepth(30);
        this.tweens.add({
            targets: blast,
            scale: 4.8,
            alpha: 0,
            duration: 350,
            ease: 'Cubic.easeOut',
            onComplete: () => blast.destroy()
        });
    }

    shootGlitchProjectiles() {
        if (!this.bonzi || !this.bonzi.active) return;

        const spawnX = this.bonzi.x + (this.bonzi.flipX ? 35 : -35);
        const spawnY = this.bonzi.y - 10;
        const dir = this.player.x < this.bonzi.x ? -1 : 1;

        const count = this.bossHP <= 2 ? 3 : 2;
        const vyList = count === 3 ? [-140, -70, 0] : [-120, -40];

        vyList.forEach((vy) => {
            const p = this.bonziProjectiles.create(spawnX, spawnY, 'fireball');
            p.setScale(1.4);
            p.setTint(0xcc00ff); // Tinte púrpura digital
            p.setVelocity(dir * (this.bossHP <= 2 ? 290 : 230), vy);
            p.setBounce(0.6);

            this.tweens.add({
                targets: p,
                angle: 360 * dir,
                duration: 350,
                repeat: -1
            });
        });
    }

    triggerBonziShockwaves() {
        if (!this.bonzi || !this.bonzi.active) return;

        this.cameras.main.shake(350, 0.025);

        // Ondas de choque en ambas direcciones
        [-1, 1].forEach((dir) => {
            const shock = this.bonziProjectiles.create(this.bonzi.x + dir * 35, 410, 'fireball');
            shock.setScale(1.2, 0.8);
            shock.setTint(0xff0044);
            shock.isShockwave = true;
            shock.body.setAllowGravity(false);
            shock.setVelocityX(dir * 240);

            // Destrucción tras recorrer la arena
            this.time.delayedCall(2200, () => {
                if (shock && shock.active) shock.destroy();
            });
        });
    }

    handleBonziCollision(player, boss) {
        if (this.bossDefeated || this.isDead || this.inBossCinematic) return;

        // Detección definitiva de pisotón (Stomp sobre la cabeza de BonziBuddy):
        // 1. Debe estar descendiendo en el aire o planeando (nunca quieto o corriendo en el suelo)
        const wasFalling = (this.prevVelocityY > 0) || this.isGliding || (player.body.deltaY() > 0) || (player.body.prev.y < player.body.y);

        // 2. Pies claramente elevados respecto al suelo / base de Bonzi (mínimo 28 px)
        const feetElevated = (boss.body.bottom - player.body.bottom) >= 28;

        // 3. Impacto en la cabeza o parte superior
        const landingOnTop = player.body.bottom <= boss.body.top + 34;

        const isStomp = wasFalling && feetElevated && landingOnTop;

        if (isStomp && !this.bossInvulnerable) {
            this.damageBonzi();
            player.setVelocityY(-480); // Gran impulso aéreo tras pisar
        } else if (isStomp && this.bossInvulnerable) {
            // Durante la invulnerabilidad tras un golpe, el jugador rebota seguro para no quedar atrapado
            player.setVelocityY(-380);
        } else if (!this.bossInvulnerable && !this.isInvulnerable) {
            this.handlePlayerHit(boss, '¡BonziBuddy te ha atrapado con su código corrupto!');
        }
    }

    damageBonzi() {
        this.bossHP--;
        this.bossInvulnerable = true;
        this.addScore(600); // 600 puntos por golpe
        this.updateBossHealthBar();

        this.cameras.main.shake(250, 0.02);
        this.showFloatingText(this.bonzi.x, this.bonzi.y - 60, '-1 HP (¡BONZI CORRUPTO! +600)', '#ffd700');

        // 1. ANILLO RADIAL DE BOMBAS EN 360° (evita que el jugador rebote en el mismo lugar)
        const ringCount = this.bossHP <= 3 ? 12 : 8;
        this.fireRadialGlitchRing(this.bonzi.x, this.bonzi.y, ringCount);

        // 2. EFECTO DE GLITCH VISUAL EN EL SPRITE DE BONZIBUDDY (VIRUS)
        this.triggerBonziSpriteGlitch(() => {
            if (this.bossHP <= 0) {
                this.defeatBonzi();
            } else {
                // 3. TELETRANSPORTACIÓN TRAS EL GLITCH
                this.teleportBonzi();

                // 4. EVENTOS DE FASE (Corrupción de piso e invocación de agentes virales)
                if (this.bossHP === 5) {
                    this.time.delayedCall(300, () => {
                        this.corruptAndDestroyFloor(2860, '👾 ¡ERROR 404: SECTOR DE MEMORIA BORRADO! 👾');
                        this.summonCyberMinions(2);
                    });
                } else if (this.bossHP === 3) {
                    this.time.delayedCall(300, () => {
                        this.corruptAndDestroyFloor(3120, '⚠️ CORRUPCIÓN CRÍTICA: COLAPSO DEL SISTEMA ⚠️');
                        this.summonCyberMinions(2);
                    });
                }
            }
        });
    }

    defeatBonzi() {
        this.bossDefeated = true;
        this.bossActive = false;
        this.addScore(10000); // 10000 puntos por victoria definitiva

        if (this.bossAttackTimer) this.bossAttackTimer.remove();

        // Detener música de combate
        this.sound.stopAll();

        // Congelar a Bonzi y limpiar proyectiles y esbirros
        this.bonzi.setVelocity(0, 0);
        this.bonzi.body.enable = false;
        this.bonziProjectiles.clear(true, true);
        this.enemies.children.iterate((enemy) => {
            if (enemy && enemy.active && enemy.x > this.arenaGateX) {
                enemy.destroy();
            }
        });

        // Desactivar controles del jugador durante la cinemática
        this.player.setVelocity(0, 0);
        this.player.body.enable = false;

        // Ocultar / destruir elementos de HUD y checkpoint para dejar la escena completamente limpia
        if (this.bossHudContainer) {
            this.bossHudContainer.destroy();
            this.bossHudContainer = null;
        }
        if (this.hudText) {
            this.hudText.setVisible(false);
        }
        if (this.pauseBtn) {
            this.pauseBtn.setVisible(false);
        }
        if (this.checkpointText) {
            this.checkpointText.destroy();
            this.checkpointText = null;
        }

        // Bajar suavemente al jugador hacia el suelo seguro para que no quede flotando frente a la Luna
        if (this.player) {
            this.tweens.add({
                targets: this.player,
                y: 405,
                duration: 700,
                ease: 'Power2'
            });
        }

        // Sacudida dramática
        this.cameras.main.shake(1500, 0.035);

        // Mensaje requerido: "I always come back"
        const dialogBox = this.add.rectangle(this.bonzi.x, this.bonzi.y - 80, 280, 50, 0x000000, 0.9)
            .setStrokeStyle(3, 0xff0044)
            .setDepth(300);

        const quote = this.add.text(this.bonzi.x, this.bonzi.y - 80, '❝ I always come back ❞', {
            fontSize: '18px',
            fontFamily: 'Impact, Arial Black',
            color: '#ff2222',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(301);

        this.tweens.add({
            targets: quote,
            scaleX: 1.15,
            scaleY: 1.15,
            yoyo: true,
            duration: 300,
            repeat: 3
        });

        // Tras el mensaje, implosión y música de victoria
        this.time.delayedCall(2200, () => {
            dialogBox.destroy();
            quote.destroy();

            // Flash y reproducción del nuevo Soundtrack cinematográfico (Teaser Akatsuki)
            this.cameras.main.flash(1200, 255, 255, 255);
            try {
                this.sound.stopAll();
                if (this.cache.audio.exists('music_akatsuki')) {
                    this.sound.play('music_akatsuki', { volume: 0.85, loop: true });
                } else if (this.cache.audio.exists('music_victory')) {
                    this.sound.play('music_victory', { volume: 0.8, loop: false });
                }
            } catch (e) { }

            // Desintegrar y eliminar todos los bloques de plataforma en la arena para ver la Luna Roja en todo su esplendor
            this.disintegrateArenaPlatforms();

            // La Luna Roja permanece imponente y visible en el cielo revelando la sombra de los Akatsuki
            if (this.redMoon) {
                this.tweens.add({
                    targets: this.redMoon,
                    alpha: 1.0,
                    duration: 1500
                });
            }

            this.tweens.add({
                targets: this.bonzi,
                angle: 1080,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 1800,
                ease: 'Cubic.easeIn',
                onComplete: () => {
                    this.bonzi.destroy();
                    // Mostrar pantalla de victoria y teaser de la siguiente demo sin tapar la Luna Roja
                    this.showGrandVictoryScreen();
                }
            });
        });
    }

    disintegrateArenaPlatforms() {
        // Seleccionar todos los bloques de plataformas en la arena (pared de entrada y plataformas elevadas)
        const arenaTiles = this.platforms.getChildren().filter(tile => {
            return tile && tile.active && tile.x >= 2580 && (tile.texture.key === 'platform' || tile.y < 415);
        });

        arenaTiles.forEach((tile, index) => {
            if (tile.body) tile.body.enable = false;

            // Partículas de desintegración glitch carmesí y púrpura
            for (let i = 0; i < 3; i++) {
                const p = this.add.circle(
                    tile.x + Phaser.Math.Between(-14, 14),
                    tile.y + Phaser.Math.Between(-14, 14),
                    Phaser.Math.Between(3, 6),
                    Math.random() > 0.5 ? 0xdc2626 : 0x7c3aed
                ).setDepth(30);

                this.tweens.add({
                    targets: p,
                    y: p.y - Phaser.Math.Between(25, 55),
                    alpha: 0,
                    scale: 0.1,
                    duration: Phaser.Math.Between(400, 700),
                    onComplete: () => p.destroy()
                });
            }

            // Desvanecimiento suave y eliminación de cada bloque
            this.tweens.add({
                targets: tile,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                y: tile.y + 20,
                duration: 650,
                delay: (index % 8) * 50,
                ease: 'Power2',
                onComplete: () => {
                    this.platforms.remove(tile, true, true);
                }
            });
        });
    }

    showGrandVictoryScreen() {
        const { width, height } = this.cameras.main;

        // 0. Eliminación definitiva de cualquier bloque de plataforma restante en la arena para despejar totalmente la Luna Roja
        const leftoverTiles = this.platforms.getChildren().filter(tile => {
            return tile && tile.active && tile.x >= 2580 && (tile.texture.key === 'platform' || tile.y < 415);
        });
        leftoverTiles.forEach(tile => {
            this.platforms.remove(tile, true, true);
        });

        // Asegurar que el HUD y textos previos no interfieran
        if (this.hudText) this.hudText.setVisible(false);
        if (this.pauseBtn) this.pauseBtn.setVisible(false);
        if (this.bossHudContainer) {
            this.bossHudContainer.destroy();
            this.bossHudContainer = null;
        }
        if (this.checkpointText) {
            this.checkpointText.destroy();
            this.checkpointText = null;
        }

        // --- ENCUADRE CINEMATOGRÁFICO: LA LUNA ROJA Y EL ESCENARIO PERMANECEN 100% VISIBLES EN EL CENTRO ---

        // 1. Franja Superior Cinemática (Título del Epílogo)
        this.add.rectangle(width / 2, 38, width, 72, 0x050106, 0.9)
            .setStrokeStyle(1, 0xb91c1c)
            .setScrollFactor(0)
            .setDepth(400);

        this.add.text(width / 2, 24, '👁️ ¡BONZIBUDDY HA SIDO EXPULSADO! 👁️', {
            fontSize: '22px',
            fontFamily: 'Impact, Arial Black',
            color: '#ffd700',
            stroke: '#b91c1c',
            strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        this.add.text(width / 2, 52, 'El virus ha caído... pero la Luna Roja en el firmamento continúa ardiendo sin piedad.', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#fca5a5'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        // --- (La franja central Y: 74 a 310 queda completamente libre y transparente para admirar la Luna Roja en todo su esplendor) ---

        // 2. Franja Inferior Cinemática (Teaser Akatsuki, Estadísticas y Opciones)
        this.add.rectangle(width / 2, height - 70, width, 140, 0x050106, 0.88)
            .setStrokeStyle(1, 0xdc2626)
            .setScrollFactor(0)
            .setDepth(400);

        this.add.text(width / 2, height - 124, '❝ BonziBuddy no era más que un peón... El mundo conocerá el verdadero dolor. ❞', {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontStyle: 'italic',
            color: '#ef4444'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        // Recuadro Teaser de los Akatsuki
        const teaserTitle = this.add.text(width / 2, height - 100, '☁️ SIGUIENTE DEMO: ☁️', {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#ffd700'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        const teaserDesc = this.add.text(width / 2, height - 80, 'Sombras con túnicas negras y nubes rojas descienden.', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        this.tweens.add({
            targets: [teaserTitle, teaserDesc],
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Estadísticas de la partida
        const formattedScore = this.score.toString().padStart(6, '0');
        this.add.text(width / 2, height - 52, `🎖️ PUNTAJE: ${formattedScore} PTS | VIDAS RESTANTES: ${'❤️'.repeat(this.lives)} (${this.lives}) | JEFES VENCIDOS: 2/2`, {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#22c55e',
            backgroundColor: '#0c2314',
            padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        // Opciones de reinicio o volver al menú
        const playAgainBtn = this.add.text(width / 2 - 160, height - 20, '🔄 [ R ] JUGAR DE NUEVO', {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#1b5e20',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401).setInteractive({ useHandCursor: true });

        const menuBtn = this.add.text(width / 2 + 160, height - 20, '🏠 [ ENTER ] MENÚ PRINCIPAL', {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#1e3a8a',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401).setInteractive({ useHandCursor: true });

        const restartGame = () => {
            this.cameras.main.fade(400, 0, 0, 0);
            this.time.delayedCall(450, () => {
                this.scene.start('Level1Scene', { lives: 3, score: 0, isPoweredUp: false, hasCape: false });
            });
        };

        const goToMenu = () => {
            this.cameras.main.fade(400, 0, 0, 0);
            this.time.delayedCall(450, () => {
                this.scene.start('MainMenuScene');
            });
        };

        playAgainBtn.on('pointerdown', restartGame);
        this.input.keyboard.on('keydown-R', restartGame);

        menuBtn.on('pointerdown', goToMenu);
        this.input.keyboard.on('keydown-ENTER', goToMenu);
        this.input.keyboard.on('keydown-SPACE', goToMenu);
    }

    update() {
        super.update();

        // 1. Guardar checkpoint al llegar ante la puerta
        if (!this.activeCheckpoint && this.player.x >= 2420) {
            this.setCheckpoint(2500, 360);
        }

        // 2. Activar jefe al traspasar la puerta de la arena
        if (!this.bossActive && !this.bossDefeated && this.player.x > 2630) {
            this.setCheckpoint(2500, 360);
            this.startBossBattle();
        }

        // 3. IA de persecución y orientación de BonziBuddy
        if (this.bossActive && !this.bossDefeated && this.bonzi && this.bonzi.active && !this.bossInvulnerable) {
            const baseSpeed = this.bossHP <= 2 ? 190 : (this.bossHP <= 4 ? 140 : 95);

            if (this.player.x < this.bonzi.x - 15) {
                this.bonzi.setVelocityX(-baseSpeed);
                this.bonzi.setFlipX(false);
            } else if (this.player.x > this.bonzi.x + 15) {
                this.bonzi.setVelocityX(baseSpeed);
                this.bonzi.setFlipX(true);
            }

            // Salto o evasión inteligente si se aproxima a un foso de corrupción abierto
            this.bossPits.forEach(pit => {
                if (Math.abs(this.bonzi.x - pit.centerX) < 65 && (this.bonzi.body.blocked.down || this.bonzi.body.touching.down)) {
                    this.bonzi.setVelocityY(-460);
                }
            });
        }
    }
}
