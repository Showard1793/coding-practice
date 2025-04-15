const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 20;
const keys = {};
const speed = 2;

// Utility for primary colors
const PRIMARY_COLORS = ["blue", "green", "yellow", "cyan", "magenta", "orange"];

let playerRotation = 0;
let targetRotation = 0;
let rotating = false;
let rotationStartTime = 0;
const ROTATION_DURATION = 500; // in milliseconds


// Player object: made up of "blocks"
let player = {
  blocks: [{ x: 100, y: 100 }],
  color: "red"
};

// Tetris pieces (each has blocks and a color)
let tetrisPieces = [
  {
    blocks: [
      { x: 200, y: 200 },
      { x: 220, y: 200 },
      { x: 240, y: 200 },
      { x: 220, y: 220 }
    ],
    color: randomPrimaryColor()
  },
  {
    blocks: [
      { x: 300, y: 100 },
      { x: 300, y: 120 },
      { x: 320, y: 100 },
      { x: 320, y: 120 }
    ],
    color: randomPrimaryColor()
  }
];

// Random color picker
function randomPrimaryColor() {
  return PRIMARY_COLORS[Math.floor(Math.random() * PRIMARY_COLORS.length)];
}

// Handle input
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

function movePlayer() {
  let dx = 0, dy = 0;
  if (keys["w"]) dy = -speed;
  if (keys["s"]) dy = speed;
  if (keys["a"]) dx = -speed;
  if (keys["d"]) dx = speed;

  for (let block of player.blocks) {
    block.x += dx;
    block.y += dy;
  }
}

function rotatePlayer() {
  if (rotating) return; // Don't rotate if already rotating

  rotating = true;
  rotationStartTime = performance.now();
  targetRotation += Math.PI / 2; // 90 degrees in radians
}


document.addEventListener("wheel", (e) => {
  if (e.deltaY > 0) {
    rotatePlayer();
  }
});

function drawBlock(x, y, color = "black") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player with rotation
  const pivot = player.blocks[0];
  ctx.save();
  ctx.translate(pivot.x + TILE_SIZE / 2, pivot.y + TILE_SIZE / 2);
  ctx.rotate(playerRotation);
  for (let i = 0; i < player.blocks.length; i++) {
    const block = player.blocks[i];
    const dx = block.x - pivot.x;
    const dy = block.y - pivot.y;
    drawBlock(dx - TILE_SIZE / 2, dy - TILE_SIZE / 2, player.color);
  }
  ctx.restore();

  // Draw tetris pieces
  for (let piece of tetrisPieces) {
    for (let block of piece.blocks) {
      drawBlock(block.x, block.y, piece.color);
    }
  }
}

function updateRotation() {
  if (!rotating) return;

  const now = performance.now();
  const elapsed = now - rotationStartTime;
  const t = Math.min(elapsed / ROTATION_DURATION, 1);

  playerRotation = (targetRotation - Math.PI / 2) + t * (Math.PI / 2);

  if (t >= 1) {
    rotating = false;

    // Get pivot block
    const pivot = player.blocks[0];

    // Rotate every block (including the pivot itself) around the pivot
    for (let block of player.blocks) {
      const dx = block.x - pivot.x;
      const dy = block.y - pivot.y;

      const newX = pivot.x - dy;
      const newY = pivot.y + dx;

      block.x = newX;
      block.y = newY;
    }

    // Reset the visual rotation, since positions are now updated
    playerRotation = 0;
    targetRotation = 0;
  }
}




function checkCollisions() {
  for (let i = tetrisPieces.length - 1; i >= 0; i--) {
    let piece = tetrisPieces[i];
    for (let pBlock of player.blocks) {
      for (let tBlock of piece.blocks) {
        if (
          pBlock.x < tBlock.x + TILE_SIZE &&
          pBlock.x + TILE_SIZE > tBlock.x &&
          pBlock.y < tBlock.y + TILE_SIZE &&
          pBlock.y + TILE_SIZE > tBlock.y
        ) {
          // Collision! Merge the blocks
          player.blocks.push(...piece.blocks);
          tetrisPieces.splice(i, 1);
          return;
        }
      }
    }
  }
}

function gameLoop() {
  movePlayer();
  updateRotation();  // ← add this!
  checkCollisions();
  draw();
  requestAnimationFrame(gameLoop);
}


gameLoop();
