

const Config = {
    width: 800,
    height: 600,
    backgroundColor: 0x000000,
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        debug: process.env.DEBUG === "true",
      },
    },
  };
  
  export default Config;