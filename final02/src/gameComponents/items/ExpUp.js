import Phaser from "phaser";

export default class ExpUp extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, enemy){
        const x = enemy.x;
        const y = enemy.y;

        super(scene, x, y, "exp-up");
        this.scale = 1.5;

        //종류에 따라 경험치를 다르게 설정
        switch (enemy.texture.key){
            case 'slime' : 
                this.m_exp = 10;
                this.play("red");
                break;
            case 'orangeMush' :
                this.m_exp = 20;
                this.play("gray");
                break;
            case 'greenMush' : 
                this.m_exp = 30;
                this.play("red");
                break;
            default:
                this.m_exp = 10;
                this.play("gray");
        }

        scene.add.existing(this);
        scene.physics.world.enableBody(this);

    }
}