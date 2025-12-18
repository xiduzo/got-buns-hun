// Game state
const gameState = {
  score: {
    hotdog: 0,
    taco: 0,
    burrito: 0,
    falafel: 0,
    sandwich: 0,
  },
  fallingItems: [],
  draggedItem: null,
  gameArea: null,
  spawnInterval: null,
};

// Initialize game
function initGame() {
  gameState.gameArea = document.getElementById("gameArea");

  // Set up drag and drop for bun items
  const bunItems = document.querySelectorAll(".bun-item");
  bunItems.forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
  });

  // Set up drop zone
  gameState.gameArea.addEventListener("dragover", handleDragOver);
  gameState.gameArea.addEventListener("drop", handleDrop);

  // Start spawning items
  spawnFallingItem();
  gameState.spawnInterval = setInterval(spawnFallingItem, 2000);

  // Start game loop
  gameLoop();
}

// Spawn a random falling item from a random side
function spawnFallingItem() {
  const types = ["hotdog", "taco", "burrito", "falafel", "sandwich"];
  const type = types[Math.floor(Math.random() * types.length)];

  const item = document.createElement("div");
  item.className = "falling-item";
  item.dataset.type = type;

  const img = document.createElement("img");
  // Handle filename typos
  const insideFileMap = {
    hotdog: "assets/dishes/hotdog/hotdog-inside.svg",
    taco: "assets/dishes/taco/taco-inside.svg",
    burrito: "assets/dishes/burrito/burrito-inside.svg",
    falafel: "assets/dishes/falafel/falafel-inside.svg",
    sandwich: "assets/dishes/sandwich/sandwhich-inside.svg", // Note: typo in filename
  };
  img.src = insideFileMap[type];
  img.alt = `${type} inside`;
  item.appendChild(img);

  // Random starting position from one of the four sides
  const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  const gameAreaRect = gameState.gameArea.getBoundingClientRect();

  let startX, startY, targetX, targetY;
  const size = 60;

  switch (side) {
    case 0: // Top
      startX = Math.random() * (gameAreaRect.width - size);
      startY = -size;
      targetX = Math.random() * (gameAreaRect.width - size);
      targetY = gameAreaRect.height + size;
      break;
    case 1: // Right
      startX = gameAreaRect.width + size;
      startY = Math.random() * (gameAreaRect.height - size);
      targetX = -size;
      targetY = Math.random() * (gameAreaRect.height - size);
      break;
    case 2: // Bottom
      startX = Math.random() * (gameAreaRect.width - size);
      startY = gameAreaRect.height + size;
      targetX = Math.random() * (gameAreaRect.width - size);
      targetY = -size;
      break;
    case 3: // Left
      startX = -size;
      startY = Math.random() * (gameAreaRect.height - size);
      targetX = gameAreaRect.width + size;
      targetY = Math.random() * (gameAreaRect.height - size);
      break;
  }

  item.style.left = `${startX}px`;
  item.style.top = `${startY}px`;

  const fallingItem = {
    element: item,
    type: type,
    x: startX,
    y: startY,
    targetX: targetX,
    targetY: targetY,
    speed: 0.5 + Math.random() * 0.5, // Random speed between 0.5 and 1.0
    active: true,
  };

  gameState.gameArea.appendChild(item);
  gameState.fallingItems.push(fallingItem);
}

// Game loop to animate falling items
function gameLoop() {
  const gameAreaRect = gameState.gameArea.getBoundingClientRect();

  gameState.fallingItems.forEach((item, index) => {
    if (!item.active) return;

    // Calculate direction vector
    const dx = item.targetX - item.x;
    const dy = item.targetY - item.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Item reached target, remove it
      item.element.remove();
      item.active = false;
      gameState.fallingItems.splice(index, 1);
      return;
    }

    // Move towards target
    const moveX = (dx / distance) * item.speed * 2;
    const moveY = (dy / distance) * item.speed * 2;

    item.x += moveX;
    item.y += moveY;

    item.element.style.left = `${item.x}px`;
    item.element.style.top = `${item.y}px`;
  });

  // Clean up inactive items
  gameState.fallingItems = gameState.fallingItems.filter((item) => item.active);

  requestAnimationFrame(gameLoop);
}

// Drag and drop handlers
function handleDragStart(e) {
  gameState.draggedItem = {
    type: e.target.closest(".bun-item").dataset.type,
    element: e.target.closest(".bun-item"),
  };
  e.target.closest(".bun-item").classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.target.outerHTML);
}

function handleDragEnd(e) {
  e.target.closest(".bun-item").classList.remove("dragging");
  gameState.draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
  e.preventDefault();

  if (!gameState.draggedItem) return;

  const dropX = e.clientX - gameState.gameArea.getBoundingClientRect().left;
  const dropY = e.clientY - gameState.gameArea.getBoundingClientRect().top;

  // Check for collision with falling items
  let matched = false;
  let matchedItem = null;

  gameState.fallingItems.forEach((item) => {
    if (!item.active) return;

    const itemRect = item.element.getBoundingClientRect();
    const gameAreaRect = gameState.gameArea.getBoundingClientRect();
    const itemX = itemRect.left - gameAreaRect.left + itemRect.width / 2;
    const itemY = itemRect.top - gameAreaRect.top + itemRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(dropX - itemX, 2) + Math.pow(dropY - itemY, 2)
    );

    // Check if drop is close enough and types match
    if (distance < 50 && item.type === gameState.draggedItem.type) {
      matched = true;
      matchedItem = item;
    }
  });

  if (matched && matchedItem) {
    // Match successful!
    handleMatch(matchedItem);
  }
}

// Play a random munch sound occasionally
function playMunchSound() {
  // 40% chance to play a munch sound
  if (Math.random() < 0.4) {
    const munchSounds = [
      "assets/sound/munch_1.mp3",
      "assets/sound/munch_2.mp3",
      "assets/sound/munch_3.mp3",
      "assets/sound/munch_4.mp3",
    ];
    const randomSound =
      munchSounds[Math.floor(Math.random() * munchSounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch((error) => {
      // Ignore audio play errors (e.g., user hasn't interacted with page yet)
      console.log("Could not play munch sound:", error);
    });
  }
}

function handleMatch(item) {
  // Update score
  gameState.score[item.type]++;
  updateScore();

  // Play munch sound occasionally
  playMunchSound();

  // Create match effect
  const matchEffect = document.createElement("div");
  matchEffect.className = "match-effect";
  matchEffect.style.position = "absolute";
  matchEffect.style.left = `${item.x}px`;
  matchEffect.style.top = `${item.y}px`;
  matchEffect.style.width = "60px";
  matchEffect.style.height = "60px";
  matchEffect.style.pointerEvents = "none";

  const img = document.createElement("img");
  // Map dish types to their full SVG files
  const fullFileMap = {
    hotdog: "assets/dishes/hotdog/hotdog-full.svg",
    taco: "assets/dishes/taco/taco-full.svg",
    burrito: "assets/dishes/burrito/burrito-full.svg",
    falafel: "assets/dishes/falafel/falafel-full.svg",
    sandwich: "assets/dishes/sandwich/sandwich-full.svg",
  };
  img.src = fullFileMap[item.type];
  matchEffect.appendChild(img);
  gameState.gameArea.appendChild(matchEffect);

  // Remove the matched item
  item.active = false;
  item.element.remove();

  // Remove effect after animation
  setTimeout(() => {
    matchEffect.remove();
  }, 500);
}

function updateScore() {
  document.getElementById(
    "hotdog-score"
  ).textContent = `x${gameState.score.hotdog}`;
  document.getElementById(
    "taco-score"
  ).textContent = `x${gameState.score.taco}`;
  document.getElementById(
    "burrito-score"
  ).textContent = `x${gameState.score.burrito}`;
  document.getElementById(
    "falafel-score"
  ).textContent = `x${gameState.score.falafel}`;
  document.getElementById(
    "sandwich-score"
  ).textContent = `x${gameState.score.sandwich}`;
}

// Initialize when page loads
window.addEventListener("load", initGame);
