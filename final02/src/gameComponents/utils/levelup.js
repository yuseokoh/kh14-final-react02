import { getGame } from "../TestGame";

let level_scene_paused = false;
let level_time_paused = Date.now() - 100;

export default function level_pause(scene) {
    const game = getGame(); // 항상 최신의 game 객체를 가져옴

    // game이 초기화되지 않았으면 아무 작업도 하지 않음
    if (!game) {
        console.error("Game 객체가 아직 초기화되지 않았습니다.");
        return;
    }

    if (Date.now() - level_time_paused > 100 && game.scene.isActive(scene)) {
        game.scene.pause(scene);
        level_time_paused = Date.now();
        level_scene_paused = scene;

        game.scene.getScene(scene).toggleLevelScreen(true);
        game.scene.getScene(scene).m_pauseInSound.play({ volume: 0.2 });
    }
}

document.addEventListener("keydown", function (event) {
    const game = getGame(); // 항상 최신의 game 객체를 가져옴

    // game이 초기화되지 않았으면 아무 작업도 하지 않음
    if (!game) {
        console.error("Game 객체가 아직 초기화되지 않았습니다.");
        return;
    }

    if (
        (event.key === "Enter") &&
        Date.now() - level_time_paused > 100 &&
        level_scene_paused
    ) {
        const previousScene = game.scene.getScene(level_scene_paused);
        game.scene.resume(level_scene_paused);
        previousScene.toggleLevelScreen(false);
        previousScene.m_pauseOutSound.play({ volume: 0.2 });
        previousScene.afterLevelUp();
        level_scene_paused = false;
        level_time_paused = Date.now();
    }
});
