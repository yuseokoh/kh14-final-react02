import Explosion from "../effects/Explosion";
import ExpUp from "../items/ExpUp";
import Phaser from 'phaser';


export default class Enemy extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, animKey, initHp, dropRate){
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scale = 2;
        this.m_speed = 50;
        this.m_hp = initHp;
        this.m_dropRate = dropRate;

        
        if(animKey){
            this.play(animKey);
        }
        
        this.on("overlapstart", (attack) => {
            this.height(attack, 10);
        });

        //player방향으로 이동하는 명령
        this.m_events = [];
        this.m_events.push(this.scene.time.addEvent({
            delay: 100, 
            callback: () =>{
                scene.physics.moveToObject(this, scene.m_player, this.m_speed);
            },
            loop: true,
        }));
        scene.events.on("update", (time, delta) => {
            this.update(time, delta);
        });
    };
        
    
    update(time, delta) {
        if (!this.body) return;
    
        // 오른쪽으로 향할 때는 오른쪽을, 왼쪽으로 향할 때는 왼쪽을 바라보도록 해줍니다.
        if (this.body.velocity.x > 0) this.flipX = true;
        else this.flipX = false;
      }
    
    hit(attack, damage){
        attack.destroy();
        this.m_hp -= damage;
        this.scene.m_hitEnemySound.play();

        if(this.m_hp <= 0) {
            new Explosion(this.scene, this.x, this.y);
            this.scene.m_explosionSound.play();

            if(Math.random() < this.m_dropRate) {
                const expUp = new ExpUp(this.scene, this);
                this.scene.m_expUps.add(expUp);
            }

            this.scene.m_topBar.gainScore();

            this.scene.time.removeEvent(this.m_events);

           
            // this.scene.m_scoreLabel.text = `ENEMY KILLED ${this.scene.m_score.toString().padStart(6, '0')}`;

            this.destroy();
        }
    }
}