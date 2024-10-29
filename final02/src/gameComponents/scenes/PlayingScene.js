import Phaser from "phaser";
import Player, { Direction } from "../characters/player";
import ExpBar from "../ui/ExpBar";
import TopBar from "../ui/TopBar";
import Config from "../Config";
import { getRandomPosition } from "../utils/math";
import Enemy from "../characters/Enemy";
import level_pause from "../utils/levelup";
import global_pause from "../utils/pause";

export default class PlayingScene extends Phaser.Scene {
  constructor() {
    super("playGame");
  }
  create() {
    // sound 초기화
    this.sound.pauseOnBlur = false;
    this.m_beamSound = this.sound.add("audio_beam"); // 반드시 초기화

    // 다른 sound 객체들 초기화
    this.m_explosionSound = this.sound.add("audio_explosion");
    this.m_pickupSound = this.sound.add("audio_pickup");
    this.m_hurtSound = this.sound.add("audio_hurt");
    this.m_gameoverSound = this.sound.add("audio_gameover");
    this.m_pauseInSound = this.sound.add("pause_in");
    this.m_pauseOutSound = this.sound.add("pause_out");
    this.m_hitEnemySound = this.sound.add("hit_enemy");

    const width = 800; // Config.width 대신 직접 지정
    const height = 600; // Config.height 대신 직접 지정

    // pause
    this.createVeil(width, height);
    this.createPauseScreen(width, height);
    this.createLevelScreen(width, height);

    // background
    this.m_background = this.add.tileSprite(0, 0, width, height, "background");
    this.m_background.setOrigin(0, 0);

    // 경험치바
    this.m_expBar = new ExpBar(this, 50);
    // 상단바
    this.m_topBar = new TopBar(this);

    // player 생성
    this.m_player = new Player(this);
    this.cameras.main.startFollow(this.m_player);

    this.m_attacks = this.add.group();

    this.m_expUps = this.add.group();

        //적
        this.m_enemies = this.physics.add.group();
        this.m_enemies.add(new Enemy(this, Config.width / 2 - 200, Config.height / 2 - 200, "slime", "slime_anim", 10));
        this.addEnemy("slime", "slime_anim", 10, 0.9);

    this.physics.add.overlap(
        this.m_player, 
        this.m_expUps,
        this.pickExpUp, 
        null, 
        this
    );
    this.physics.add.overlap(
        this.m_player,
        this.m_enemies,
        () => this.m_player.hitByEnemy(10),
        null,
        this
    );
    this.physics.add.overlap(
        this.m_attacks, 
        this.m_enemies, 
        (attack, enemy) => {
        enemy.hit(attack, 10);
    }, null, this);


    //일시정지
    this.input.keyboard.on('keydown-ESC', () => {
        console.log("esc keydown");
        global_pause("playGame");
    }, this);


    // 방향키
    this.m_cursorKeys = this.input.keyboard.createCursorKeys();
    console.log(this.m_cursorKeys);

  }

  update() {
    this.handlePlayerMove();

    this.m_background.setX(this.m_player.x - Config.width / 2);
    this.m_background.setY(this.m_player.y - Config.height / 2);

    //무한 배경
    this.m_background.tilePositionX = this.m_player.x - Config.width/2;
    this.m_background.tilePositionY = this.m_player.y - Config.height/2;

    //가장 가까운 적 공격
    this.m_closest = this.physics.closest(this.m_player, this.m_enemies.getChildren());
}


     // function

     pickExpUp(player, expUp){
        expUp.disableBody(true, true);
        expUp.destroy();

        this.m_pickupSound.play();
        this.m_expBar.increase(expUp.m_exp);
        if(this.m_expBar.m_currentExp >= this.m_expBar.m_maxExp){
            level_pause(this);
        }
    }


    //레벨업시 몬스터 종류 추가
    afterLevelUp(){
        this.m_topBar.gainLevel();

        if(this.m_topBar.m_level == 2){
            this.addEnemy("orangeMush", "orangeMush_anim", 20, 0.6);
        } else if (this.m_topBar.m_level == 3){
            this.addEnemy("greenMush", "greenMush_anim", 30, 0.3);
        }
    }


    handlePlayerMove(){ //이동
        if(this.m_cursorKeys.left.isDown){
            this.m_player.move(Direction.Left);
        } else if (this.m_cursorKeys.right.isDown){
            this.m_player.move(Direction.Right);
        }

        if(this.m_cursorKeys.up.isDown){
            this.m_player.move(Direction.Up);
        } else if (this.m_cursorKeys.down.isDown){
            this.m_player.move(Direction.Down);
        }
    }

  addEnemy(enemyTexture, enemyAnim, enemyHp, enemyDropRate) {
    this.time.addEvent({
        delay: 1000, 
        callback: () => {
            const r = Math.sqrt(Config.width * Config.width + Config.height * Config.height) / 2;
            let [x, y] = getRandomPosition(this.m_player.x, this.m_player.y, r);
            this.m_enemies.add(new Enemy(this, x, y, enemyTexture, enemyAnim, enemyHp, enemyDropRate));
        },
        loop: true, 
    });
}


handlePause(){
    if(Phaser.Input.Keyboard.JustDown(this.m_spacebar)){
        this.m_isPaused = !this.m_Paused;
        if(this.m_isPaused){
            this.scene.pause('playGame');
        } else {
            this.scene.launch('playGame');
        }
        return;
    }
}

  createVeil(width, height) {
    this.m_veil = this.add.graphics({ x: 0, y: 0 });
    this.m_veil.fillStyle(0x000000, 0.3);
    this.m_veil.fillRect(0, 0, width, height);
    this.m_veil.setDepth(110);
    this.m_veil.setScrollFactor(0);
  }

  createPauseScreen(width, height) {
    this.m_textPause = this.add
      .text(width / 2, height / 2, "Pause", { fontSize: 50 })
      .setOrigin(0.5)
      .setDepth(120)
      .setScrollFactor(0);

    this.togglePauseScreen(false);
  }

  togglePauseScreen(isVisible) {
    // 일시정지 화면의 가시성을 조정하는 메서드
    if (this.m_veil) {
      this.m_veil.setVisible(isVisible);
    }
    if (this.m_textPause) {
      this.m_textPause.setVisible(isVisible);
    }
  }

  createLevelScreen(width, height) {
    const texts = [
      "You're on the Next Level!",
      "",
      "press Enter to Keep Playing",
    ];
    this.m_textLevel = this.add
      .text(width / 2, height / 2, texts, { fontSize: 40 })
      .setOrigin(0.5)
      .setDepth(120)
      .setScrollFactor(0);

    this.toggleLevelScreen(false);
  }
  toggleLevelScreen(isVisible) {
    // 레벨 화면의 가시성을 조정하는 메서드
    if (this.m_veil) {
      this.m_veil.setVisible(isVisible);
    }
    if (this.m_textLevel) {
      this.m_textLevel.setVisible(isVisible);
    }
  }
}
