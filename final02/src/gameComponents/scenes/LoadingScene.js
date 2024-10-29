import Phaser from 'phaser';
import fontPng from "../assets/font/font.png";
import fontXml from "../assets/font/font.xml";
import bgImg from '../assets/images/background.png';
import catImg from '../assets/images/alscjf.png';
import mainImg from '../assets/images/qhshqhsh.png';
import beamImg from '../assets/images/beam.png';
import fireOgg from "../assets/sounds/fire.ogg";
import popOgg from "../assets/sounds/pop.ogg";
import pickOgg from "../assets/sounds/pickExpUp.ogg";
import hurtOgg from "../assets/sounds/hurt.ogg";
import gameoverOgg from "../assets/sounds/gameover.ogg";
import pauseIn from "../assets/sounds/pauseIn.ogg";
import pauseOut from "../assets/sounds/pauseOut.ogg";
import hitEnemyOgg from "../assets/sounds/hitEnemy.ogg";
import slimeImg from "../assets/spritesheets/slime.png";
import dogImg from "../assets/spritesheets/dog.png";
import orangeMushImg from "../assets/spritesheets/wnghkdqjtjt.png";
import greenMushImg from "../assets/spritesheets/greenMush.png";
import eyeballImg from "../assets/spritesheets/eyeball.png";
import expUpImg from '../assets/spritesheets/exp-up.png';
import explosionImg from '../assets/spritesheets/explosion.png';

export default class LoadingScene extends Phaser.Scene {
    
    constructor() {
        super("bootGame"); // bootGame: 이 scene의 identifier
    }

    preload() {
        // 이미지 리소스 로드
        this.load.image("background", bgImg);
        this.load.image("alscjf", catImg);
        this.load.image("beam", beamImg);
        this.load.image("qhshqhsh", mainImg);
        
        // 스프라이트 시트 로드
        this.load.spritesheet("slime", slimeImg, {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("dog", dogImg, {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("orangeMush", orangeMushImg, {
            frameWidth: 16, 
            frameHeight: 16
        });
        this.load.spritesheet("greenMush", greenMushImg, {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("eyeball", eyeballImg, {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("explosion", explosionImg, {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("exp-up", expUpImg, {
            frameWidth: 16,
            frameHeight: 16
        });

        // 폰트 및 오디오 로드
        this.load.bitmapFont("pixelFont", fontPng, fontXml);
        this.load.audio("audio_beam", fireOgg);
        this.load.audio("audio_explosion", popOgg);
        this.load.audio("audio_pickup", pickOgg);
        this.load.audio("audio_hurt", hurtOgg);
        this.load.audio("audio_gameover", gameoverOgg);
        this.load.audio("pause_in", pauseIn);
        this.load.audio("pause_out", pauseOut);
        this.load.audio("hit_enemy", hitEnemyOgg);
    }

    create() {
        // 로딩 중 표시
        this.add.text(20, 20, "Loading game...", {
            font: "25px Arial",
            fill: "#ffffff"
        });

        // 애니메이션 생성
        this.createAnimations();

        // 로딩 완료 후 다음 씬으로 전환
        console.log("Loading complete, starting main scene");
        this.scene.start("mainScene");
    }

    createAnimations() {
        // 슬라임 애니메이션
        this.anims.create({
            key: "slime_anim",
            frames: this.anims.generateFrameNumbers("slime"),
            frameRate: 6,
            repeat: -1
        });

        // 강아지 애니메이션
        this.anims.create({
            key: "dog_anim",
            frames: this.anims.generateFrameNumbers("dog"),
            frameRate: 12,
            repeat: -1
        });

        // 주황 버섯 애니메이션
        this.anims.create({
            key: "orangeMush_anim",
            frames: this.anims.generateFrameNumbers("orangeMush"),
            frameRate: 6,
            repeat: -1
        });

        // 초록 버섯 애니메이션
        this.anims.create({
            key: "greenMush_anim",
            frames: this.anims.generateFrameNumbers("greenMush"), 
            frameRate: 6,
            repeat: -1
        });

        // 눈알 애니메이션
        this.anims.create({
            key: "eyeball_anim",
            frames: this.anims.generateFrameNumbers("eyeball"),
            frameRate: 12,
            repeat: -1
        });

        // 폭발 애니메이션
        this.anims.create({
            key: "explode",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });

        // 경험치 업 애니메이션
        this.anims.create({
            key: "red",
            frames: this.anims.generateFrameNumbers("exp-up", {
                start: 0,
                end: 1
            }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "gray",
            frames: this.anims.generateFrameNumbers("exp-up", {
                start: 2,
                end: 3
            }),
            frameRate: 20,
            repeat: -1
        });
    }
}