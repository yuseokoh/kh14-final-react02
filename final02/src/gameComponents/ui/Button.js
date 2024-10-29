import Phaser from 'phaser';

export default class Button extends Phaser.GameObjects.Text {
    constructor(scene, x, y, label, callback) {
        if (!scene) {
            throw new Error('Scene is not provided to Button constructor.');
        }

        // Phaser.GameObjects.Text 생성자 호출
        super(scene, x, y, label, { backgroundColor: '#8aacc8' });

        // Button 설정
        this.setOrigin(0.5)
            .setPadding(10)
            .setStyle({ backgroundColor: '#8aacc8' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => callback())
            .on('pointerover', () => this.setStyle({ fill: '#000' }))
            .on('pointerout', () => this.setStyle({ fill: '#fff' }));

        // 씬에 추가
        scene.add.existing(this);
    }
}