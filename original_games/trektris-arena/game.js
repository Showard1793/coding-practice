let animationFrameId;
let rotationCollisionChecked = false;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//-------------------------------------------------------------------------------------
// Canvas Setup and Initialization
//-------------------------------------------------------------------------------------

// Fullscreen setup
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "black";

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  resizeCanvas();
  centerPlayer(); // Recenter player on resize
});

// Call it once to set the initial size
resizeCanvas();

// Constants
const TILE_SIZE = 20;
const ROTATION_DURATION = 150;

// Input handling
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

//-------------------------------------------------------------------------------------
// Visual Effects (Stars Background)
//-------------------------------------------------------------------------------------

const stars = Array.from({ length: 150 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  radius: Math.random() * 1.5 + 0.5  // radius between 0.5 and 2.0
}));

function drawStars() {
  ctx.fillStyle = "white";
  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

//-------------------------------------------------------------------------------------
// Player Configuration and Mechanics
//-------------------------------------------------------------------------------------

let player = {
  blocks: [{
    x: Math.floor(canvas.width / 2 / TILE_SIZE) * TILE_SIZE,
    y: Math.floor(canvas.height / 2 / TILE_SIZE) * TILE_SIZE
  }],
  color: "#666666",
  speed: 3
};

const normalSpeed = 3;
let playerRotation = 0;
let targetRotation = 0;
let rotating = false;
let rotationStartTime = 0;

function centerPlayer() {
  const centerX = Math.floor(canvas.width / 2 / TILE_SIZE) * TILE_SIZE;
  const centerY = Math.floor(canvas.height / 2 / TILE_SIZE) * TILE_SIZE;

  const offsetX = centerX - player.blocks[0].x;
  const offsetY = centerY - player.blocks[0].y;

  player.blocks.forEach(block => {
    block.x += offsetX;
    block.y += offsetY;
  });
}

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

//-------------------------------------------------------------------------------------
// Rotation Mechanics
//-------------------------------------------------------------------------------------

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

function updateRotation() {
  if (!rotating) return;
  const now = performance.now();
  const elapsed = now - rotationStartTime;
  const t = Math.min(elapsed / ROTATION_DURATION, 1);
  playerRotation = targetRotation * t;

  // Check for enemy collisions continuously during rotation
  checkRotationEnemyCollisions();

  if (t >= 1) {
    rotating = false;
    const pivot = player.blocks[0];
    
    // First calculate where blocks would end up
    const proposedBlocks = player.blocks.map(block => {
      const dx = block.x - pivot.x;
      const dy = block.y - pivot.y;
      return {
        x: targetRotation > 0 ? pivot.x - dy : pivot.x + dy,
        y: targetRotation > 0 ? pivot.y + dx : pivot.y - dx
      };
    });
    
    // Check if new positions would collide (ignore enemies)
    const wouldCollide = proposedBlocks.some(block => {
      // Temporarily store original position
      const originalX = block.x;
      const originalY = block.y;
      
      // Test collision at new position (ignore enemies during this check)
      block.x = proposedBlocks.find(b => b.x === originalX && b.y === originalY).x;
      block.y = proposedBlocks.find(b => b.x === originalX && b.y === originalY).y;
      const collision = isCollidingWithNonEnemies(block);
      
      // Restore original position
      block.x = originalX;
      block.y = originalY;
      
      return collision;
    });
    
    // Only apply rotation if it wouldn't cause collision with non-enemies
    if (!wouldCollide) {
      for (let i = 0; i < player.blocks.length; i++) {
        player.blocks[i].x = proposedBlocks[i].x;
        player.blocks[i].y = proposedBlocks[i].y;
      }
    }
    
    removeDisconnectedBlocks();
    playerRotation = 0;
    targetRotation = 0;
  }
}

function isCollidingWithNonEnemies(block) {
  // Boundary check
  if (block.x < 0 || block.y < 0 || 
      block.x + TILE_SIZE > canvas.width || 
      block.y + TILE_SIZE > canvas.height) {
    return true;
  }

  // Check against tetris pieces (white)
  for (let piece of tetrisPieces) {
    for (let tBlock of piece.blocks) {
      const buffer = piece.color === "white" ? 6 : 0;
      
      if (block.x < tBlock.x + TILE_SIZE - buffer &&
          block.x + TILE_SIZE > tBlock.x + buffer &&
          block.y < tBlock.y + TILE_SIZE - buffer &&
          block.y + TILE_SIZE > tBlock.y + buffer) {
        return true;
      }
    }
  }
  return false;
}

function checkRotationEnemyCollisions() {
  if (!rotating) return;

  const pivot = player.blocks[0];
  
  // Check all player blocks against all enemy blocks
  for (let i = enemyPieces.length - 1; i >= 0; i--) {
    const enemy = enemyPieces[i];
    let enemyHit = false;
    
    // Calculate rotation path for each player block
    for (let playerBlock of player.blocks) {
      const dx = playerBlock.x - pivot.x;
      const dy = playerBlock.y - pivot.y;
      
      // Calculate start and end angles
      const startAngle = Math.atan2(dy, dx);
      const endAngle = startAngle + (targetRotation > 0 ? Math.PI/2 : -Math.PI/2);
      
      // Calculate rotation path (simplified as a line segment)
      const startX = pivot.x + Math.cos(startAngle) * Math.sqrt(dx*dx + dy*dy);
      const startY = pivot.y + Math.sin(startAngle) * Math.sqrt(dx*dx + dy*dy);
      const endX = pivot.x + Math.cos(endAngle) * Math.sqrt(dx*dx + dy*dy);
      const endY = pivot.y + Math.sin(endAngle) * Math.sqrt(dx*dx + dy*dy);
      
      // Check against all enemy blocks
      for (let enemyBlock of enemy.blocks) {
        if (lineIntersectsRect(
          startX, startY, endX, endY,
          enemyBlock.x, enemyBlock.y, TILE_SIZE, TILE_SIZE
        )) {
          enemyHit = true;
          break;
        }
      }
      if (enemyHit) break;
    }
    
    if (enemyHit) {
      // Convert enemy to white piece
      tetrisPieces.push({
        blocks: enemy.blocks.map(b => ({
          x: Math.round(b.x / TILE_SIZE) * TILE_SIZE,
          y: Math.round(b.y / TILE_SIZE) * TILE_SIZE
        })),
        color: "white"
      });
      enemyPieces.splice(i, 1);
    }
  }
}

// Helper function to detect line-rectangle intersection
function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  // Check if either point is inside the rectangle
  if ((x1 >= rx && x1 <= rx+rw && y1 >= ry && y1 <= ry+rh) ||
      (x2 >= rx && x2 <= rx+rw && y2 >= ry && y2 <= ry+rh)) {
    return true;
  }
  
  // Check line segment against rectangle edges
  return lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx+rw, ry) || // top
         lineIntersectsLine(x1, y1, x2, y2, rx+rw, ry, rx+rw, ry+rh) || // right
         lineIntersectsLine(x1, y1, x2, y2, rx, ry+rh, rx+rw, ry+rh) || // bottom
         lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx, ry+rh); // left
}

// Helper function to detect line-line intersection
function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (y4-y3)*(x2-x1) - (x4-x3)*(y2-y1);
  if (denom === 0) return false; // parallel
  
  const ua = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / denom;
  const ub = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / denom;
  
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

//-------------------------------------------------------------------------------------
// Dash Mechanics
//-------------------------------------------------------------------------------------

let isDashing = false;
let dashCooldown = false;
let dashDuration = 150;
let dashCooldownDuration = 500;
let dashSpeed = 12;
let dashStartTime = 0;
let playerInvincible = false;

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !isDashing && !dashCooldown) {
    startDash();
  }
});

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

//-------------------------------------------------------------------------------------
// Projectile Mechanics
//-------------------------------------------------------------------------------------

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

//-------------------------------------------------------------------------------------
// Game Objects (Tetris Pieces)
//-------------------------------------------------------------------------------------

let tetrisPieces = [];

//-------------------------------------------------------------------------------------
// Enemy Pieces Configuration
//-------------------------------------------------------------------------------------

const enemyPieces = [];
const ENEMY_SPAWN_RATE = 500; // ms between spawns
let lastSpawnTime = 0;

// Enemy piece templates (same shapes as tetrisPieces)
const enemyTemplates = [
  // I-shape (3-5 variations)
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:40,y:0}], name: "I3" },
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:40,y:0}, {x:60,y:0}], name: "I4" },
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:40,y:0}, {x:60,y:0}, {x:80,y:0}], name: "I5" },
  
  // L-shape variations
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:40,y:0}, {x:0,y:20}], name: "L4a" },
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:40,y:0}, {x:40,y:20}], name: "L4b" },
  { blocks: [{x:0,y:0}, {x:0,y:20}, {x:0,y:40}, {x:20,y:40}], name: "L4c" },
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:0,y:20}, {x:0,y:40}], name: "L4d" },
  
  // T-shape variations
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:40,y:0}, {x:20,y:20}], name: "T4" },
  { blocks: [{x:20,y:0}, {x:0,y:20}, {x:20,y:20}, {x:40,y:20}], name: "T4v" },
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:40,y:0}, {x:20,y:20}, {x:20,y:40}], name: "T5" },
  
  // Z/S-shape variations
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:20,y:20}, {x:40,y:20}], name: "Z4" },
  { blocks: [{x:20,y:0}, {x:0,y:20}, {x:20,y:20}, {x:0,y:40}], name: "S4" },
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:20,y:20}, {x:40,y:20}, {x:40,y:40}], name: "Z5" },
  
  // Square variations
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:0,y:20}, {x:20,y:20}], name: "O4" },
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:40,y:0}, {x:0,y:20}, {x:20,y:20}, {x:40,y:20}], name: "O6" },
  
  // Miscellaneous shapes
  { blocks: [{x:0,y:0}, {x:20,y:0}, {x:0,y:20}], name: "tri3" },
  { blocks: [{x:20,y:0}, {x:0,y:20}, {x:20,y:20}, {x:40,y:20}, {x:20,y:40}], name: "plus5" }
];

// Primary colors for enemies
const PRIMARY_COLORS = [
  "#FF0000", // red
  "#00FF00", // green
  "#0000FF", // blue
  "#FFFF00", // yellow
  "#FF00FF", // magenta
  "#00FFFF", // cyan
  "#FF8800", // orange
  "#8800FF"  // purple
];

//-------------------------------------------------------------------------------------
// Enemy Spawning and Movement
//-------------------------------------------------------------------------------------

function spawnEnemy() {
  const now = performance.now();
  if (now - lastSpawnTime < ENEMY_SPAWN_RATE) return;
  lastSpawnTime = now;

  // Select random template and color
  const template = enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)];
  const color = PRIMARY_COLORS[Math.floor(Math.random() * PRIMARY_COLORS.length)];
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 3 + 1; // Speed between 1 and 4

  // Spawn from edges
  let x, y;
  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? -100 : canvas.width + 100;
    y = Math.random() * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() < 0.5 ? -100 : canvas.height + 100;
  }

  const enemy = {
    blocks: JSON.parse(JSON.stringify(template.blocks)), // Deep copy
    color: color,
    speed: speed,
    angle: angle,
    centerX: x,
    centerY: y
  };

  // Position blocks relative to center
  enemy.blocks.forEach(block => {
    block.x += x;
    block.y += y;
  });

  enemyPieces.push(enemy);
}

function updateEnemies() {
  for (let i = 0; i < enemyPieces.length; i++) {
    const enemy = enemyPieces[i];
    const dx = Math.cos(enemy.angle) * enemy.speed;
    const dy = Math.sin(enemy.angle) * enemy.speed;

    enemy.centerX += dx;
    enemy.centerY += dy;

    for (let block of enemy.blocks) {
      block.x += dx;
      block.y += dy;
    }

    // Remove if off-screen
    if (enemy.centerX < -200 || enemy.centerX > canvas.width + 200 ||
        enemy.centerY < -200 || enemy.centerY > canvas.height + 200) {
      enemyPieces.splice(i, 1);
      i--;
    }
  }
}

//-------------------------------------------------------------------------------------
// Projectile Updates
//-------------------------------------------------------------------------------------
function updateProjectiles() {
  // Player projectiles
  for (let p of projectiles) {
    p.x += p.vx;
    p.y += p.vy;
  }
  
  // Enemy projectiles
  for (let i = enemyProjectiles.length-1; i >= 0; i--) {
    const p = enemyProjectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    
    // Remove if off-screen
    if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
      enemyProjectiles.splice(i, 1);
    }
  }
}

function drawProjectiles() {
  // Player projectiles
  for (let p of projectiles) {
    drawLineProjectile(p.x, p.y, p.vx, p.vy, p.length, "red");
  }
  
  // Enemy projectiles
  for (let p of enemyProjectiles) {
    drawLineProjectile(p.x, p.y, p.vx, p.vy, p.length, "green");
  }
}

// Fix 1: Remove the duplicate drawing call from drawLineProjectile()
function drawLineProjectile(x, y, vx, vy, length, color, width = 5) {
  const angle = Math.atan2(vy, vx);
  const x1 = x - Math.cos(angle) * length/2;
  const y1 = y - Math.sin(angle) * length/2;
  const x2 = x + Math.cos(angle) * length/2;
  const y2 = y + Math.sin(angle) * length/2;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Fix 2: Update drawProjectiles() to properly handle both projectile types
function drawProjectiles() {
  // Player projectiles (red)
  for (let p of projectiles) {
    drawLineProjectile(p.x, p.y, p.vx, p.vy, p.length, "red", 3);
  }
  
  // Enemy projectiles (green)
  for (let p of enemyProjectiles) {
    drawLineProjectile(p.x, p.y, p.vx, p.vy, p.length, "lime", 5);
  }
}



//-------------------------------------------------------------------------------------
// Enemy Projectile Collisions
//-------------------------------------------------------------------------------------
function checkEnemyProjectileCollisions() {
  for (let i = enemyProjectiles.length-1; i >= 0; i--) {
    const proj = enemyProjectiles[i];
    
    // Check collision with player blocks
    for (let j = player.blocks.length-1; j >= 0; j--) {
      const block = player.blocks[j];
      
      if (isProjectileHittingBlock(proj, block)) {
        if (j === 0) { // Main player block
          if (!playerInvincible) { // Only game over if not invincible
            gameOver();
            return;
          }
        } else { // Connected block
          if (!playerInvincible) { // Only remove block if not invincible
            player.blocks.splice(j, 1);
            removeDisconnectedBlocks();
          }
        }
        enemyProjectiles.splice(i, 1);
        break;
      }
    }
  }
}

function isProjectileHittingBlock(proj, block) {
  return proj.x > block.x && proj.x < block.x + TILE_SIZE &&
         proj.y > block.y && proj.y < block.y + TILE_SIZE;
}

function gameOver() {
  alert("Game Over! Refresh to play again.");
  // Stop the game loop
  cancelAnimationFrame(animationFrameId);
}

//-------------------------------------------------------------------------------------
// Block Connection System
//-------------------------------------------------------------------------------------

function removeDisconnectedBlocks() {
  if (player.blocks.length <= 1) return; // Only core block remains
  
  const connectedBlocks = new Set();
  const queue = [player.blocks[0]]; // Start with core block
  connectedBlocks.add(player.blocks[0]);
  
  // Breadth-first search to find all connected blocks
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Check all 4 adjacent positions
    const directions = [
      {dx: TILE_SIZE, dy: 0},   // right
      {dx: -TILE_SIZE, dy: 0},  // left
      {dx: 0, dy: TILE_SIZE},    // down
      {dx: 0, dy: -TILE_SIZE}    // up
    ];
    
    for (const dir of directions) {
      const neighborPos = {
        x: current.x + dir.dx,
        y: current.y + dir.dy
      };
      
      // Find matching block
      const neighbor = player.blocks.find(b => 
        b.x === neighborPos.x && b.y === neighborPos.y
      );
      
      if (neighbor && !connectedBlocks.has(neighbor)) {
        connectedBlocks.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  // Remove any blocks not in connectedBlocks set
  player.blocks = player.blocks.filter(block => 
    connectedBlocks.has(block)
  );
}

//-------------------------------------------------------------------------------------
// Enemy Projectile Configuration
//-------------------------------------------------------------------------------------
const enemyProjectiles = [];
const ENEMY_FIRE_RATE = 300; // ms between shots
let lastEnemyFireTime = 0;

function spawnEnemyProjectile() {
  const now = performance.now();
  if (now - lastEnemyFireTime < ENEMY_FIRE_RATE) return;
  lastEnemyFireTime = now;

  // Find a random enemy to shoot from
  if (enemyPieces.length === 0) return;
  const shooter = enemyPieces[Math.floor(Math.random() * enemyPieces.length)];
  
  // Calculate center of shooter
  const shooterCenterX = shooter.blocks[0].x + TILE_SIZE/2;
  const shooterCenterY = shooter.blocks[0].y + TILE_SIZE/2;
  
  // Calculate direction to player
  const playerCenterX = player.blocks[0].x + TILE_SIZE/2;
  const playerCenterY = player.blocks[0].y + TILE_SIZE/2;
  const dx = playerCenterX - shooterCenterX;
  const dy = playerCenterY - shooterCenterY;
  const distance = Math.sqrt(dx*dx + dy*dy);
  
  // Add some randomness to aim
  const angleVariation = Math.PI/8; // 22.5 degrees variation
  const angle = Math.atan2(dy, dx) + (Math.random() * angleVariation * 2 - angleVariation);
  
  const speed = 7;
  enemyProjectiles.push({
    x: shooterCenterX,
    y: shooterCenterY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length: 12,
    color: "lime",
    width: 5 // Add this line - adjust number for thickness (original was 3)
  });
}

//-------------------------------------------------------------------------------------
// Projectile Collision with Enemies
//-------------------------------------------------------------------------------------

function checkProjectileCollisions() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    for (let j = enemyPieces.length - 1; j >= 0; j--) {
      const enemy = enemyPieces[j];
      let hit = false;

      for (let block of enemy.blocks) {
        if (Math.abs(proj.x - (block.x + TILE_SIZE/2)) < TILE_SIZE/2 &&
            Math.abs(proj.y - (block.y + TILE_SIZE/2)) < TILE_SIZE/2) {
          hit = true;
          break;
        }
      }

      if (hit) {
        // This will work even with empty tetrisPieces array
        tetrisPieces.push({
          blocks: enemy.blocks.map(block => ({
            x: Math.round(block.x / TILE_SIZE) * TILE_SIZE,
            y: Math.round(block.y / TILE_SIZE) * TILE_SIZE
          })),
          color: "white"
        });
        
        enemyPieces.splice(j, 1);
        projectiles.splice(i, 1);
        break;
      }
    }
  }
}


//-------------------------------------------------------------------------------------
// Collision Detection
//-------------------------------------------------------------------------------------

function isColliding(block) {
  // Boundary check (keep strict)
  if (block.x < 0 || block.y < 0 || 
      block.x + TILE_SIZE > canvas.width || 
      block.y + TILE_SIZE > canvas.height) {
    return true;
  }

  // More lenient collision with white pieces
  const COLLISION_BUFFER = 6;

  // Check against tetris pieces (white)
  for (let piece of tetrisPieces) {
    for (let tBlock of piece.blocks) {
      const buffer = piece.color === "white" ? COLLISION_BUFFER : 0;
      
      if (block.x < tBlock.x + TILE_SIZE - buffer &&
          block.x + TILE_SIZE > tBlock.x + buffer &&
          block.y < tBlock.y + TILE_SIZE - buffer &&
          block.y + TILE_SIZE > tBlock.y + buffer) {
        return true;
      }
    }
  }

  // Only check enemies when not rotating (they're handled separately during rotation)
  if (!rotating) {
    return enemyPieces.some(enemy =>
      enemy.blocks.some(eBlock =>
        block.x < eBlock.x + TILE_SIZE &&
        block.x + TILE_SIZE > eBlock.x &&
        block.y < eBlock.y + TILE_SIZE &&
        block.y + TILE_SIZE > eBlock.y
      )
    );
  }
  return false;
}

function checkCollisions() {
  const MERGE_BUFFER = 8; // Increased from 4

  for (let i = tetrisPieces.length - 1; i >= 0; i--) {
    const piece = tetrisPieces[i];
    let shouldMerge = false;

    // Only apply buffer to white pieces
    const buffer = piece.color === "white" ? MERGE_BUFFER : 0;

    for (let pBlock of player.blocks) {
      for (let tBlock of piece.blocks) {
        const dx = Math.abs(pBlock.x - tBlock.x);
        const dy = Math.abs(pBlock.y - tBlock.y);
        
        // More lenient alignment checks for white pieces
        const alignedVertically = dx < buffer && Math.abs(dy - TILE_SIZE) < buffer;
        const alignedHorizontally = dy < buffer && Math.abs(dx - TILE_SIZE) < buffer;

        if (alignedVertically || alignedHorizontally) {
          shouldMerge = true;
          break;
        }
      }
      if (shouldMerge) break;
    }

    if (shouldMerge) {
      player.blocks.push(...piece.blocks.map(b => ({
        x: Math.round(b.x / TILE_SIZE) * TILE_SIZE,
        y: Math.round(b.y / TILE_SIZE) * TILE_SIZE
      })));
      tetrisPieces.splice(i, 1);
      adjustPlayerShape();
      removeDisconnectedBlocks();
      return;
    }
  }
}

function adjustPlayerShape() {
  // First snap all blocks to grid
  player.blocks = player.blocks.map(block => ({
    x: Math.round(block.x / TILE_SIZE) * TILE_SIZE,
    y: Math.round(block.y / TILE_SIZE) * TILE_SIZE
  }));

  // Then check for any blocks that are very close but not perfectly aligned
  const POSITION_TOLERANCE = 6; // pixels
  
  for (let i = 1; i < player.blocks.length; i++) {
    const block = player.blocks[i];
    const core = player.blocks[0];
    
    // Calculate expected positions relative to core
    const dx = Math.abs(block.x - core.x);
    const dy = Math.abs(block.y - core.y);
    
    // If close to a multiple of TILE_SIZE but not exact, nudge into place
    if (dx % TILE_SIZE > 0 && dx % TILE_SIZE < POSITION_TOLERANCE) {
      block.x = core.x + Math.round(dx / TILE_SIZE) * TILE_SIZE;
    }
    if (dy % TILE_SIZE > 0 && dy % TILE_SIZE < POSITION_TOLERANCE) {
      block.y = core.y + Math.round(dy / TILE_SIZE) * TILE_SIZE;
    }
  }
  
  removeDisconnectedBlocks();
}


//-------------------------------------------------------------------------------------
// Rendering Functions
//-------------------------------------------------------------------------------------

function drawBlock(x, y, color = "black") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
}

function draw() {
  // Clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background stars
  drawStars();

  // Draw player with rotation
  const pivot = player.blocks[0];
  ctx.save();
  ctx.translate(pivot.x + TILE_SIZE / 2, pivot.y + TILE_SIZE / 2);
  ctx.rotate(playerRotation);
  
  // Draw player blocks
  for (let i = 0; i < player.blocks.length; i++) {
    const block = player.blocks[i];
    const dx = block.x - pivot.x;
    const dy = block.y - pivot.y;
    
    // Main block drawing
    drawBlock(dx - TILE_SIZE / 2, dy - TILE_SIZE / 2, player.color);

    // Draw center indicator on core block
    if (i === 0) {
      ctx.beginPath();
      ctx.arc(dx, dy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
    }
  }
  ctx.restore();

  // Draw static tetris pieces (white)
  for (let piece of tetrisPieces) {
    for (let block of piece.blocks) {
      drawBlock(block.x, block.y, piece.color);
    }
  }

  // Draw enemy pieces (colored)
  for (let enemy of enemyPieces) {
    for (let block of enemy.blocks) {
      drawBlock(block.x, block.y, enemy.color);
      
      // Optional: Draw enemy center point
      if (block === enemy.blocks[0]) {
        ctx.beginPath();
        ctx.arc(block.x + TILE_SIZE/2, block.y + TILE_SIZE/2, 4, 0, Math.PI * 2); // Changed radius from 3 to 6
        ctx.fillStyle = "black";
        ctx.fill();
      }
    }
  }

  // Draw all projectiles
  drawProjectiles();

}

//-------------------------------------------------------------------------------------
// Game Loop and Initialization
//-------------------------------------------------------------------------------------

function gameLoop() {
  spawnEnemy();
  spawnEnemyProjectile();
  updateEnemies();
  updateProjectiles();
  checkProjectileCollisions();
  checkEnemyProjectileCollisions();
  movePlayer();
  updateRotation();
  checkCollisions();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function init() {
  resizeCanvas(); // set size first
  centerPlayer(); // then center the player
  animationFrameId = requestAnimationFrame(gameLoop); // Changed this line
}

init();