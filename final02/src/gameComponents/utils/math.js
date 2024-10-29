import Config from "../Config";

export function clamp(value, lo, hi) {
    return Math.min(Math.max(value, lo), hi);
}

export function getRandomPosition(x, y, r){
    const randRad = Math.random() * Math.PI * 2;
    const _r = Math.sqrt(Config.width*Config.width + Config.height*Config.height) / 2;
    const _x = x + (_r * Math.cos(randRad));
    const _y = y + (_r * Math.sin(randRad));
    return [_x, _y];
}