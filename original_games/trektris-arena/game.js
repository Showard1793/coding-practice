const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Fullscreen setup
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "black";

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
  blocks: [{
    x: Math.floor(canvas.width / 2 / TILE_SIZE) * TILE_SIZE,
    y: Math.floor(canvas.height / 2 / TILE_SIZE) * TILE_SIZE
  }],
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

  let proposedBlocks = player.blocks.map(block => ({
    x: block.x + dx,
    y: block.y + dy
  }));

  let collisionDetected = proposedBlocks.some(pb => isColliding(pb));

  if (!collisionDetected) {
    for (let block of player.blocks) {
      block.x += dx;
      block.y += dy;
    }
  } else if (dx !== 0 && dy !== 0) {
    let proposedX = player.blocks.map(block => ({ x: block.x + dx, y: block.y }));
    if (!proposedX.some(pb => isColliding(pb))) {
      for (let block of player.blocks) block.x += dx;
    } else {
      let proposedY = player.blocks.map(block => ({ x: block.x, y: block.y + dy }));
      if (!proposedY.some(pb => isColliding(pb))) {
        for (let block of player.blocks) block.y += dy;
      }
    }
  }
}

function isColliding(block) {
  // Boundary check
  if (
    block.x < 0 ||
    block.y < 0 ||
    block.x + TILE_SIZE > canvas.width ||
    block.y + TILE_SIZE > canvas.height
  ) {
    return true;
  }

  // Collision with tetris pieces
  return tetrisPieces.some(piece =>
    piece.blocks.some(tBlock =>
      block.x < tBlock.x + TILE_SIZE &&
      block.x + TILE_SIZE > tBlock.x &&
      block.y < tBlock.y + TILE_SIZE &&
      block.y + TILE_SIZE > tBlock.y
    )
  );
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
    length: 10
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
    const angle = Math.atan2(p.vy, p.vx);
    const x1 = p.x - Math.cos(angle) * p.length / 2;
    const y1 = p.y - Math.sin(angle) * p.length / 2;
    const x2 = p.x + Math.cos(angle) * p.length / 2;
    const y2 = p.y + Math.sin(angle) * p.length / 2;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pivot = player.blocks[0];
  ctx.save();
  ctx.translate(pivot.x + TILE_SIZE / 2, pivot.y + TILE_SIZE / 2);
  ctx.rotate(playerRotation);
  for (let i = 0; i < player.blocks.length; i++) {
    const block = player.blocks[i];
    const dx = block.x - pivot.x;
    const dy = block.y - pivot.y;
    drawBlock(dx - TILE_SIZE / 2, dy - TILE_SIZE / 2, player.color);

    if (i === 0) {
      ctx.beginPath();
      ctx.arc(dx, dy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
    }
  }
  ctx.restore();

  for (let piece of tetrisPieces) {
    for (let block of piece.blocks) {
      drawBlock(block.x, block.y, piece.color);
    }
  }

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
  const BUFFER = 4;

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
  player.blocks = player.blocks.map(block => ({
    x: Math.round(block.x / TILE_SIZE) * TILE_SIZE,
    y: Math.round(block.y / TILE_SIZE) * TILE_SIZE
  }));
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
