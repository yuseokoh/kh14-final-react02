import Phaser from 'phaser';
import Button from "../ui/Button";
import axios from "axios";


export default class GameoverScene extends Phaser.Scene {
    constructor() {
        super("gameoverScene");
    }

    init(data) {
        this.m_enemyKilled = data.enemyKilled;
        this.m_level = data.level;
        this.sendGameData = data.sendGameData;
    }

    create() {
        const width = 800; // Config.width 대신 직접 사용
        const height = 600; // Config.height 대신 직접 사용

        // 배경 생성
        const bg = this.add.graphics();
        bg.fillStyle(0x5c6bc0);
        bg.fillRect(0, 0, width, height);
        bg.setScrollFactor(0);

        // 게임 오버 텍스트 추가
        this.add.bitmapText(width / 2, height / 2 - 100, "pixelFont", 'Game Over', 40).setOrigin(0.5);
        this.add.bitmapText(width / 2, height / 2, "pixelFont", `Enemy Killed : ${this.m_enemyKilled}, Level : ${this.m_level}`, 30).setOrigin(0.5);

        // 버튼 추가
        const startButton = new Button(this, width / 2, height / 2 + 100, 'Go to Main', () => {
            this.scene.start("mainScene");
        });
        // startButton.addToScene(this);


        //데이터 전송
        if(this.sendGameData){
            this.sendGameData({
                enemyKilled: this.m_enemyKilled, 
                level: this.m_level
            });
        }


        // 백엔드로 데이터 전송
        const token = localStorage.getItem('token');
        axios.post('http://localhost:8080/play', { enemyKilled: this.m_enemyKilled, level: this.m_level }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                console.log('데이터 전송 성공:', response.data);
            })
            .catch(error => {
                console.error('데이터 전송 실패:', error);
            });
    }
}