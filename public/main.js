import { TicTacToe } from "./tictactoe.js";

const { Application } = PIXI;

const app = new Application();

await app.init({
  background: "cornsilk",
  resizeTo: window,
});

document.body.appendChild(app.canvas);

const tictactoe = new TicTacToe(app);

tictactoe.drawScene();
