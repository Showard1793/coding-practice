const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 20;
const keys = {};
const PRIMARY_COLORS = ["white"];
const speed = 2;

let playerRotation = 0;
let targetRotation = 0;
let rotating = false;
let rotationStartTime = 0;
const ROTATION_DURATION = 150;

let isDashing = false;
let dashCooldown = false;
let dashDuration = 300;
let dashCooldownDuration = 500;
let dashSpeed = 8;
let normalSpeed = 3;
let dashStartTime = 0;
let playerInvincible = false;

let player = {
  blocks: [{ x: 100, y: 100 }],
  color: "#666666",
  speed: normalSpeed
};

let tetrisPieces = [
  {
    blocks: [
      { x: 100, y: 200 },
      { x: 120, y: 200 },
      { x: 140, y: 200 },
      { x: 160, y: 200 }
    ],
    color: "white"
  },
  {
    blocks: [
      { x: 300, y: 300 },
      { x: 320, y: 300 },
      { x: 340, y: 300 },
      { x: 360, y: 300 }
    ],
    color: "white"
  },
  {
    blocks: [
      { x: 200, y: 100 },
      { x: 220, y: 100 },
      { x: 240, y: 100 },
      { x: 240, y: 120 }
    ],
    color: "white"
  },
  {
    blocks: [
      { x: 400, y: 100 },
      { x: 420, y: 100 },
      { x: 400, y: 120 },
      { x: 420, y: 120 }
    ],
    color: "white"
  },
  {
    blocks: [
      { x: 500, y: 200 },
      { x: 520, y: 200 },
      { x: 540, y: 200 },
      { x: 520, y: 220 }
    ],
    color: "white"
  }
];

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !isDashing && !dashCooldown) {
    startDash();
  }
});

function movePlayer() {
  let dx = 0, dy = 0;
  if (keys["w"]) dy = -player.speed;
  if (keys["s"]) dy = player.speed;
  if (keys["a"]) dx = -player.speed;
  if (keys["d"]) dx = player.speed;

  for (let block of player.blocks) {
    block.x += dx;
    block.y += dy;
  }
}

function startDash() {
  isDashing = true;
  dashCooldown = true;
  dashStartTime = performance.now();
  player.speed = dashSpeed;
  playerInvincible = true;
  player.originalColor = player.color;
  player.color = "white";

  setTimeout(() => {
    isDashing = false;
    player.speed = normalSpeed;
    playerInvincible = false;
    player.color = player.originalColor;
  }, dashDuration);

  setTimeout(() => {
    dashCooldown = false;
  }, dashCooldownDuration);
}

function rotatePlayer() {
  if (rotating) return;
  rotating = true;
  rotationStartTime = performance.now();
  targetRotation += Math.PI / 2;
}

function rotatePlayerCounterclockwise() {
  if (rotating) return;
  rotating = true;
  rotationStartTime = performance.now();
  targetRotation -= Math.PI / 2;
}

document.addEventListener("wheel", (e) => {
  if (e.deltaY > 0) rotatePlayer();
  else rotatePlayerCounterclockwise();
});

function drawBlock(x, y, color = "black") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
}

// === Projectile logic ===
const projectiles = [];
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const playerCenterX = player.blocks[0].x + TILE_SIZE / 2;
  const playerCenterY = player.blocks[0].y + TILE_SIZE / 2;

  const dx = mouseX - playerCenterX;
  const dy = mouseY - playerCenterY;
  const length = Math.sqrt(dx * dx + dy * dy);

  const speed = 5;
  const vx = (dx / length) * speed;
  const vy = (dy / length) * speed;

  projectiles.push({
    x: playerCenterX,
    y: playerCenterY,
    vx,
    vy,
    radius: 5
  });
});

function updateProjectiles() {
  for (let p of projectiles) {
    p.x += p.vx;
    p.y += p.vy;
  }
}

function drawProjectiles() {
  for (let p of projectiles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }
}
// === End projectile logic ===

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  const pivot = player.blocks[0];
  ctx.save();
  ctx.translate(pivot.x + TILE_SIZE / 2, pivot.y + TILE_SIZE / 2);
  ctx.rotate(playerRotation);
  for (let block of player.blocks) {
    const dx = block.x - pivot.x;
    const dy = block.y - pivot.y;
    drawBlock(dx - TILE_SIZE / 2, dy - TILE_SIZE / 2, player.color);
  }
  ctx.restore();

  // Draw Tetris pieces
  for (let piece of tetrisPieces) {
    for (let block of piece.blocks) {
      drawBlock(block.x, block.y, piece.color);
    }
  }

  // Draw projectiles
  drawProjectiles();
}

function updateRotation() {
  if (!rotating) return;
  const now = performance.now();
  const elapsed = now - rotationStartTime;
  const t = Math.min(elapsed / ROTATION_DURATION, 1);
  playerRotation = targetRotation * t;

  if (t >= 1) {
    rotating = false;
    const pivot = player.blocks[0];
    for (let block of player.blocks) {
      const dx = block.x - pivot.x;
      const dy = block.y - pivot.y;
      const newX = targetRotation > 0 ? pivot.x - dy : pivot.x + dy;
      const newY = targetRotation > 0 ? pivot.y + dx : pivot.y - dx;
      block.x = newX;
      block.y = newY;
    }
    playerRotation = 0;
    targetRotation = 0;
  }
}

function checkCollisions() {
  for (let i = tetrisPieces.length - 1; i >= 0; i--) {
    let piece = tetrisPieces[i];
    let bestGap = null;
    let bestDirection = null;
    for (let pBlock of player.blocks) {
      for (let tBlock of piece.blocks) {
        if (
          pBlock.x < tBlock.x + TILE_SIZE &&
          pBlock.x + TILE_SIZE > tBlock.x &&
          pBlock.y < tBlock.y + TILE_SIZE &&
          pBlock.y + TILE_SIZE > tBlock.y
        ) {
          const dx = tBlock.x - pBlock.x;
          const dy = tBlock.y - pBlock.y;
          const xOverlap = TILE_SIZE - Math.abs(dx);
          const yOverlap = TILE_SIZE - Math.abs(dy);
          if (xOverlap < yOverlap) {
            bestGap = dx > 0 ? -xOverlap : xOverlap;
            bestDirection = 'x';
          } else {
            bestGap = dy > 0 ? -yOverlap : yOverlap;
            bestDirection = 'y';
          }
          break;
        }
      }
      if (bestGap !== null) break;
    }

    if (bestGap !== null) {
      for (let block of piece.blocks) {
        if (bestDirection === 'x') block.x += bestGap;
        else block.y += bestGap;
      }

      for (let block of piece.blocks) {
        block.x = Math.round(block.x / TILE_SIZE) * TILE_SIZE;
        block.y = Math.round(block.y / TILE_SIZE) * TILE_SIZE;
      }

      player.blocks.push(...piece.blocks);
      tetrisPieces.splice(i, 1);
      adjustPlayerShape();
      return;
    }
  }
}

function adjustPlayerShape() {
  let newBlocks = [];
  for (let block of player.blocks) {
    let snappedX = Math.round(block.x / TILE_SIZE) * TILE_SIZE;
    let snappedY = Math.round(block.y / TILE_SIZE) * TILE_SIZE;
    newBlocks.push({ x: snappedX, y: snappedY });
  }
  player.blocks = newBlocks;
}

function gameLoop() {
  movePlayer();
  updateRotation();
  updateProjectiles();
  checkCollisions();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();