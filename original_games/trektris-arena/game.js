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
let dashDuration = 150;
let dashCooldownDuration = 500;
let dashSpeed = 12;
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

  // Try full movement first
  let proposedBlocks = player.blocks.map(block => ({
    x: block.x + dx,
    y: block.y + dy
  }));

  let collisionDetected = false;
  for (let block of proposedBlocks) {
    for (let piece of tetrisPieces) {
      for (let tBlock of piece.blocks) {
        if (
          block.x < tBlock.x + TILE_SIZE &&
          block.x + TILE_SIZE > tBlock.x &&
          block.y < tBlock.y + TILE_SIZE &&
          block.y + TILE_SIZE > tBlock.y
        ) {
          collisionDetected = true;
        }
      }
    }
  }

  if (!collisionDetected) {
    for (let block of player.blocks) {
      block.x += dx;
      block.y += dy;
    }
  } else {
    // Fallback: try X-only and Y-only movement separately
    if (dx !== 0 && dy !== 0) {
      // Try horizontal only
      let proposedX = player.blocks.map(block => ({ x: block.x + dx, y: block.y }));
      let xBlocked = proposedX.some(pb => isColliding(pb));

      if (!xBlocked) {
        for (let block of player.blocks) block.x += dx;
      } else {
        // Try vertical only
        let proposedY = player.blocks.map(block => ({ x: block.x, y: block.y + dy }));
        if (!proposedY.some(pb => isColliding(pb))) {
          for (let block of player.blocks) block.y += dy;
        }
      }
    } else {
      // Original fallback logic if not diagonal
      if (dx !== 0) {
        proposedBlocks = player.blocks.map(block => ({ x: block.x + dx, y: block.y }));
        if (!proposedBlocks.some(pb => isColliding(pb))) {
          for (let block of player.blocks) block.x += dx;
        }
      } else if (dy !== 0) {
        proposedBlocks = player.blocks.map(block => ({ x: block.x, y: block.y + dy }));
        if (!proposedBlocks.some(pb => isColliding(pb))) {
          for (let block of player.blocks) block.y += dy;
        }
      }
    }
  }
}


function isColliding(block) {
  for (let piece of tetrisPieces) {
    for (let tBlock of piece.blocks) {
      if (
        block.x < tBlock.x + TILE_SIZE &&
        block.x + TILE_SIZE > tBlock.x &&
        block.y < tBlock.y + TILE_SIZE &&
        block.y + TILE_SIZE > tBlock.y
      ) {
        return true;
      }
    }
  }
  return false;
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

  const speed = 15;
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
  for (let i = 0; i < player.blocks.length; i++) {
    const block = player.blocks[i];
    const dx = block.x - pivot.x;
    const dy = block.y - pivot.y;
    const color = i === 0 ? "#d2b48c" : player.color; // Beige center block
    drawBlock(dx - TILE_SIZE / 2, dy - TILE_SIZE / 2, color);
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
  const BUFFER = 4; // pixels of forgiveness

  for (let i = tetrisPieces.length - 1; i >= 0; i--) {
    const piece = tetrisPieces[i];
    let shouldMerge = false;

    for (let pBlock of player.blocks) {
      for (let tBlock of piece.blocks) {
        const dx = Math.abs(pBlock.x - tBlock.x);
        const dy = Math.abs(pBlock.y - tBlock.y);

        const alignedVertically = dx < BUFFER && Math.abs(dy - TILE_SIZE) < BUFFER;
        const alignedHorizontally = dy < BUFFER && Math.abs(dx - TILE_SIZE) < BUFFER;

        if (alignedVertically || alignedHorizontally) {
          shouldMerge = true;
          break;
        }
      }
      if (shouldMerge) break;
    }

    if (shouldMerge) {
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