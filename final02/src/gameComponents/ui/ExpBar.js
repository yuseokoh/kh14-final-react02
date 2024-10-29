import Phaser from "phaser";
import { clamp } from "../utils/math";

export default class ExpBar extends Phaser.GameObjects.Graphics{
    static WIDTH = 800;
    static HEIGHT = 30;
    static BORDER = 4;

    constructor(scene, maxExp){
        super(scene);

        this.m_x = 0;
        this.m_y = 30;

        this.m_maxExp = maxExp;
        this.m_currentExp = 0;
        this.draw();
        this.setDepth(100);
        this.setScrollFactor(0);

        scene.add.existing(this);
    }

    increase(amount) {
        this.m_currentExp = clamp(this.m_currentExp + amount, 0, this.m_maxExp);
        this.draw();
    }

    reset() {
        this.m_currentExp = 0;
        this.draw();
    }

    draw(){
        this.clear();

        //background
        this.fillStyle(0x000000);
        this.fillRect(
            this.m_x + ExpBar.BORDER, 
            this.m_y + ExpBar.BORDER, 
            ExpBar.WIDTH - 2 * ExpBar.BORDER, 
            ExpBar.HEIGHT - 2 * ExpBar.BORDER
        );
        this.fillStyle(0x3665d5);

        let d = Math.floor(
            ((ExpBar.WIDTH - 2 * ExpBar.BORDER) / this.m_maxExp) * this.m_currentExp
        );
        this.fillRect(
            this.m_x + ExpBar.BORDER,
            this.m_y + ExpBar.BORDER, 
            d, 
            ExpBar.HEIGHT - 2 * ExpBar.BORDER
        );
    }
}
