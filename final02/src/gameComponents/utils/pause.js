import { getGame } from "../TestGame";

let global_scene_paused = false;
let global_time_paused = (Date.now() - 100);

export default function global_pause(scene){
    const game = getGame();
    // game이 초기화되지 않았으면 아무 작업도 하지 않음
    if (!game) {
        console.error("Game 객체가 아직 초기화되지 않았습니다.");
        return;
    }
    if (Date.now() - global_time_paused > 100 && game.scene.isActive(scene)){
        game.scene.pause(scene);
        global_time_paused = Date.now();
        global_scene_paused = scene;

        game.scene.getScene(scene).togglePauseScreen(true);
        game.scene.getScene(scene).m_pauseInSound.play({ volume: 0.2 });
    }
}

document.addEventListener('keydown', function(event){
    const game = getGame();
    // game이 초기화되지 않았으면 아무 작업도 하지 않음
    if (!game) {
        console.error("Game 객체가 아직 초기화되지 않았습니다.");
        return;
    }
    if(event.key === 'Escape' && Date.now() - global_time_paused > 100 
                                                                                && global_scene_paused){
        game.scene.resume(global_scene_paused);
        game.scene.getScene(global_scene_paused).togglePauseScreen(false);
        game.scene.getScene(global_scene_paused).m_pauseOutSound.play({ volum : 0.2});
        global_scene_paused = false;
        global_time_paused = Date.now();
    }
})