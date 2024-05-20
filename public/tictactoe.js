const { Graphics, GraphicsContext, Text } = PIXI;

export class TicTacToe {
  bgColor = "burlywood";
  invBgColor = "wheat";
  fgColor = "cornsilk";
  textColor = "saddlebrown";

  Layout = {
    rows: 3,
    cols: 3,
    gap: 10,
    cellSize: 100,
  };

  cells = [];
  score = [];

  isCross = true;

  constructor(app) {
    this.app = app;
    this.container = new Graphics();

    this.resetScore();
  }

  resetScore() {
    this.score = Array.from({ length: this.Layout.rows }, () =>
      Array.from({ length: this.Layout.cols }, () => undefined),
    );
  }

  calcScore() {
    const { rows, cols } = this.Layout;

    const points = {
      crosses: {
        rows: Array.from({ length: rows }, () => 0),
        cols: Array.from({ length: cols }, () => 0),
        diagonal: 0,
        reverseDiagonal: 0,
      },
      circles: {
        rows: Array.from({ length: rows }, () => 0),
        cols: Array.from({ length: cols }, () => 0),
        diagonal: 0,
        reverseDiagonal: 0,
      },
    };

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = this.score[row][col];

        if (cell === undefined) {
          continue;
        }

        const player = cell ? "crosses" : "circles";

        points[player].rows[row]++;
        points[player].cols[col]++;

        if (row === col) {
          points[player].diagonal++;
        }

        if (row + col === rows - 1) {
          points[player].reverseDiagonal++;
        }
      }
    }

    const crossesMaxValue = Math.max(
      ...points.crosses.rows,
      ...points.crosses.cols,
      points.crosses.diagonal,
      points.crosses.reverseDiagonal,
    );

    const circlesMaxValue = Math.max(
      ...points.circles.rows,
      ...points.circles.cols,
      points.circles.diagonal,
      points.circles.reverseDiagonal,
    );

    const winner =
      crossesMaxValue === rows
        ? true
        : circlesMaxValue === cols
          ? false
          : undefined;

    return [winner, crossesMaxValue, circlesMaxValue];
  }

  handleCellClick(cell, row, col) {
    if (this.score[row][col] !== undefined) {
      return;
    }

    this.drawCrossOrCircle(cell);

    this.score[row][col] = this.isCross;
    this.isCross = !this.isCross;

    this.drawScore();
  }

  drawScene() {
    const { rows, cols, cellSize, gap } = this.Layout;

    this.container.x =
      this.app.screen.width / 2 - (rows * cellSize + (rows - 1) * gap) / 2;

    this.container.y =
      this.app.screen.height / 2 - (cols * cellSize + (cols - 1) * gap) / 2;

    const context = new GraphicsContext()
      .roundRect(0, 0, cellSize, cellSize, 8)
      .fill(this.bgColor);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.container.addChild(this.createCell(context, row, col));
      }
    }

    this.app.stage.addChild(this.container);

    this.drawScore();
    this.drawResetButton();
    this.drawTitle();
  }

  drawCrossOrCircle(cell) {
    const cirlceOrCross = new Graphics();

    const cellSize = cell.width;
    const padding = this.Layout.gap;
    const stroke = { width: 5, color: this.fgColor };

    if (this.isCross) {
      cirlceOrCross
        .moveTo(padding, padding)
        .lineTo(cellSize - padding, cellSize - padding)
        .stroke(stroke);

      cirlceOrCross
        .moveTo(cellSize - padding, padding)
        .lineTo(padding, cellSize - padding)
        .stroke(stroke);
    } else {
      cirlceOrCross
        .circle(cellSize / 2, cellSize / 2, cellSize / 2 - padding)
        .stroke(stroke);
    }

    cell.addChild(cirlceOrCross);
  }

  createCell(context, row, col) {
    const { cellSize, gap } = this.Layout;

    const cell = new Graphics(context);

    cell.x = row * (cellSize + gap);
    cell.y = col * (cellSize + gap);

    cell.eventMode = "static";
    cell.cursor = "pointer";

    cell.on("pointerover", function() {
      cell.tint = 0xeeeeee;
    });

    cell.on("pointerout", function() {
      cell.tint = 0xffffff;
    });

    cell.on("click", () => this.handleCellClick(cell, row, col));

    this.cells.push(cell);
    return cell;
  }

  drawScore() {
    const [winner, crossesMaxValue, circlesMaxValue] = this.calcScore();

    const winnerText = this.cells.every((cell) => cell.children.length > 0)
      ? "Draw!"
      : winner === undefined
        ? "Score"
        : `Winner is ${winner ? "crosses" : "circles"}!`;

    const scoreText = `Crosses: ${crossesMaxValue} / Circles: ${circlesMaxValue}`;

    const commonTextStyle = {
      fill: this.textColor,
    };

    const textWinner = new Text({
      text: winnerText,
      style: {
        ...commonTextStyle,
        fontSize: 24,
      },
    });

    textWinner.position.set(this.Layout.gap * 2, this.Layout.gap);

    const textScore = new Text({
      text: scoreText,
      style: {
        ...commonTextStyle,
        fontSize: 16,
      },
    });

    textScore.position.set(
      this.Layout.gap * 2,
      textWinner.y + textWinner.height + this.Layout.gap / 2,
    );

    const [width, height] = [
      200 + this.Layout.gap * 4,
      textWinner.height + textScore.height + this.Layout.gap * 3,
    ];

    if (!this.scoreUI) {
      const textContainer = new Graphics();

      textContainer
        .roundRect(0, 0, width, height, 8)
        .fill(this.invBgColor)
        .position.set(
          this.container.width / 2 - textContainer.width / 2,
          this.container.height + this.Layout.gap * 4,
        );

      this.scoreUI = textContainer;
    }

    const winnerIsDefined = winner !== undefined;

    if (winnerIsDefined) {
      this.scoreUI.clear();
      this.scoreUI.roundRect(0, 0, width, height, 8).fill("lightgreen");
    }

    this.scoreUI.removeChildren();
    this.scoreUI.addChild(textWinner, textScore);

    this.container.addChild(this.scoreUI);
  }

  drawResetButton() {
    const button = new Graphics()
      .roundRect(0, 0, 100, 50, 8)
      .fill(this.invBgColor);

    button.eventMode = "static";
    button.cursor = "pointer";

    const text = new Text({
      text: "Reset",
      style: {
        fill: this.textColor,
        fontSize: 16,
      },
    });

    button.addChild(text);

    text.position.set(
      button.width / 2 - text.width / 2,
      button.height / 2 - text.height / 2,
    );

    button.on("click", () => {
      this.cells.forEach((cell) => cell.removeChildren());
      this.resetScore();
      this.drawScore();
    });

    button.position.set(
      this.container.width / 2 - button.width / 2,
      this.scoreUI.y + this.scoreUI.height + this.Layout.gap * 2,
    );

    this.container.addChild(button);
  }

  drawTitle() {
    const title = new Text({
      text: "Tic Tac Toe!",
      style: {
        fill: this.textColor,
        fontSize: 36,
        fontWeight: "bold",
        textAlign: "center",
      },
    });

    title.position.set(
      this.app.screen.width / 2 - title.width / 2,
      this.app.screen.height / 2 -
      (this.Layout.rows * this.Layout.cellSize) / 2 -
      title.height -
      this.Layout.gap * 6,
    );

    this.app.stage.addChild(title);
  }
}
