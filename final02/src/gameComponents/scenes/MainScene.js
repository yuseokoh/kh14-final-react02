import Phaser from 'phaser';
import Button from "../ui/Button";


export default class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        const width = 800;
        const height = 600;

        // 배경 설정
        const bg = this.add.graphics();
        bg.fillStyle(0xbbdefb);
        bg.fillRect(0, 0, width, height);
        bg.setScrollFactor(0);

        // 메인 화면 텍스트 추가
        this.add.bitmapText(width / 2, 150, 'pixelFont', 'KH - SURVIVORS', 40).setOrigin(0.5);
        this.add.image(width / 2, height / 2, 'qhshqhsh');

        // 버튼 생성
        const startButton = new Button(this, width / 2, height / 2 + 150, 'Start Game', () => {
            this.scene.start("playGame");
        });
    }
}