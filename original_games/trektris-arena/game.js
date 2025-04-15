const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 20;
const keys = {};
const speed = 2;

// Utility for primary colors
//const PRIMARY_COLORS = ["blue", "green", "yellow", "cyan", "magenta", "orange"];
const PRIMARY_COLORS = ["white"];

let playerRotation = 0;
let targetRotation = 0;
let rotating = false;
let rotationStartTime = 0;
const ROTATION_DURATION = 150; // in milliseconds

let isDashing = false;
let dashCooldown = false;
let dashDuration = 300; // milliseconds
let dashCooldownDuration = 500; // milliseconds
let dashSpeed = 8;
let normalSpeed = 3;
let dashStartTime = 0;
let playerInvincible = false;


// Player object: made up of "blocks"
let player = {
  blocks: [{ x: 100, y: 100 }],
  color: "#666666", // dark gray
  speed: normalSpeed
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
  player.color = "white"

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

function lightenColor(color, percent) {
  const colorMap = {
    red: "rgb(255, 150, 150)",
    blue: "rgb(150, 150, 255)",
    green: "rgb(150, 255, 150)",
    yellow: "rgb(255, 255, 200)",
    cyan: "rgb(200, 255, 255)",
    magenta: "rgb(255, 200, 255)",
    orange: "rgb(255, 200, 150)"
  };
  return colorMap[color] || color;
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

//new code
// Counterclockwise rotation logic
function rotatePlayerCounterclockwise() {
  if (rotating) return; // Prevent rotation if already rotating

  rotating = true;
  rotationStartTime = performance.now();
  targetRotation -= Math.PI / 2; // Rotate 90 degrees counterclockwise (negative angle)
}

// Update the mouse wheel event listener to handle both clockwise and counterclockwise rotations
document.addEventListener("wheel", (e) => {
  if (e.deltaY > 0) { // Scroll Down
    rotatePlayer(); // Clockwise rotation (your existing logic)
  } else { // Scroll Up
    rotatePlayerCounterclockwise(); // Counterclockwise rotation
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

  // Check if the rotation is clockwise or counterclockwise
  if (playerRotation >= 0) {
    // Clockwise rotation
    ctx.rotate(playerRotation);
    for (let i = 0; i < player.blocks.length; i++) {
      const block = player.blocks[i];
      const dx = block.x - pivot.x;
      const dy = block.y - pivot.y;
      drawBlock(dx - TILE_SIZE / 2, dy - TILE_SIZE / 2, player.color);
    }
  } else {
    // Counterclockwise rotation
    ctx.rotate(playerRotation);
    for (let i = 0; i < player.blocks.length; i++) {
      const block = player.blocks[i];
      const dx = block.x - pivot.x;
      const dy = block.y - pivot.y;
      drawBlock(dx - TILE_SIZE / 2, dy - TILE_SIZE / 2, player.color); // Invert dx and dy for counterclockwise
    }
  }

  ctx.restore();

  // Draw tetris pieces
  for (let piece of tetrisPieces) {
    for (let block of piece.blocks) {
      drawBlock(block.x, block.y, piece.color);
    }
  }
}



// Rotation update function that smoothly interpolates the rotation
function updateRotation() {
  if (!rotating) return;

  const now = performance.now();
  const elapsed = now - rotationStartTime;
  const t = Math.min(elapsed / ROTATION_DURATION, 1);

  playerRotation = targetRotation * t;

  if (t >= 1) {
    rotating = false;

    // Get pivot block (the center of rotation)
    const pivot = player.blocks[0];

    // Rotate every block (including the pivot itself) around the pivot
    for (let block of player.blocks) {
      const dx = block.x - pivot.x;
      const dy = block.y - pivot.y;

      // Check the direction of rotation (clockwise or counterclockwise)
      if (playerRotation >= 0) {  // Clockwise
        const newX = pivot.x - dy;
        const newY = pivot.y + dx;
        block.x = newX;
        block.y = newY;
      } else {  // Counterclockwise
        const newX = pivot.x + dy;
        const newY = pivot.y - dx;
        block.x = newX;
        block.y = newY;
      }
    }

    // Reset the visual rotation, since positions are now updated
    playerRotation = 0;
    targetRotation = 0;
  }
}



function checkCollisions() {
  for (let i = tetrisPieces.length - 1; i >= 0; i--) {
    let piece = tetrisPieces[i];
    let bestGap = null;
    let bestDirection = null;

    // Track the minimal gap for collision resolution
    for (let pBlock of player.blocks) {
      for (let tBlock of piece.blocks) {
        if (
          pBlock.x < tBlock.x + TILE_SIZE &&
          pBlock.x + TILE_SIZE > tBlock.x &&
          pBlock.y < tBlock.y + TILE_SIZE &&
          pBlock.y + TILE_SIZE > tBlock.y
        ) {
          // Collision detected, calculate the gap
          const dx = tBlock.x - pBlock.x;
          const dy = tBlock.y - pBlock.y;

          // Calculate the overlaps on the x and y axis
          const xOverlap = TILE_SIZE - Math.abs(dx);
          const yOverlap = TILE_SIZE - Math.abs(dy);

          // Determine which axis has the smallest overlap (which axis to adjust)
          if (xOverlap < yOverlap) {
            bestGap = dx > 0 ? -xOverlap : xOverlap;
            bestDirection = 'x';
          } else {
            bestGap = dy > 0 ? -yOverlap : yOverlap;
            bestDirection = 'y';
          }

          // Break out once we find the smallest gap
          if (bestGap !== null) break;
        }
      }
      if (bestGap !== null) break;
    }

    // If a gap was found, move the entire piece to close it
    if (bestGap !== null) {
      // Move all blocks of the Tetris piece to close the gap
      for (let block of piece.blocks) {
        if (bestDirection === 'x') {
          block.x += bestGap;
        } else {
          block.y += bestGap;
        }
      }

      // Snap the pieces to the grid after adjustment
      for (let block of piece.blocks) {
        block.x = Math.round(block.x / TILE_SIZE) * TILE_SIZE;
        block.y = Math.round(block.y / TILE_SIZE) * TILE_SIZE;
      }

      // Merge the piece into the player and remove it from the array
      player.blocks.push(...piece.blocks);
      tetrisPieces.splice(i, 1);

      // After the merge, adjust the player blocks to ensure no gaps are present
      adjustPlayerShape();

      return; // Exit after handling one collision
    }
  }
}

// Adjust the player shape by recalculating its bounding block positions
function adjustPlayerShape() {
  // We will take all the merged player blocks and make sure they align properly without gaps
  let newBlocks = [];

  for (let block of player.blocks) {
    // Snap each block to the grid to avoid any gaps
    let snappedX = Math.round(block.x / TILE_SIZE) * TILE_SIZE;
    let snappedY = Math.round(block.y / TILE_SIZE) * TILE_SIZE;
    
    // Store snapped blocks
    newBlocks.push({ x: snappedX, y: snappedY });
  }

  // Update the player's blocks with the new snapped blocks
  player.blocks = newBlocks;
}





function gameLoop() {
  movePlayer();
  updateRotation();  // ← add this!
  checkCollisions();
  draw();
  requestAnimationFrame(gameLoop);
}


gameLoop();
