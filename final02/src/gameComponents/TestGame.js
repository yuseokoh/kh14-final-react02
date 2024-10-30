import { useEffect, useRef } from "react";
import Phaser from 'phaser';
import Config from './Config';
import { useRecoilValue } from "recoil";
import { memberIdState, memberLoadingState } from "../utils/recoil";

let game;
export const getGame = ()=> game;

const TestGame = () => {
  const memberId = useRecoilValue(memberIdState);
  const memberLoading = useRecoilValue(memberLoadingState);
  const gameContainer = useRef(null);

  useEffect(() => {
    if(memberLoading === false) return;
    const loadScenesAndStartGame = async () => {
      try {
        // 동적으로 씬을 import
        const { default: LoadingScene } = await import('./scenes/LoadingScene');
        const { default: PlayingScene } = await import('./scenes/PlayingScene');
        const { default: MainScene } = await import('./scenes/MainScene');
        const { default: GameoverScene } = await import('./scenes/GameOver');

        // Config에 씬을 추가하여 Phaser 설정 구성
        const config = {
          ...Config, // Config 기본 설정 사용
          scene: [LoadingScene, PlayingScene, MainScene, GameoverScene], // 씬 설정 추가
          parent: gameContainer.current,
          callbacks: {
            preBoot: (game) => {
              game.registry.set('memberId', memberId);
            }
          }
        };

        // Phaser 게임 생성
        game = new Phaser.Game(config);
      } catch (error) {
        console.error("Error loading scenes: ", error);
      }
    };

    loadScenesAndStartGame();

    // Clean-up 작업을 위해 useEffect 리턴에 정리 작업 넣기
    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, [memberId]);

  return <div ref={gameContainer}></div>;
};

export default TestGame;