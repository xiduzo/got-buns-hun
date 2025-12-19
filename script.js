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
  gameTimer: null,
  timeRemaining: 60, // 60 seconds = 1 minute
  isGameActive: false,
};

// Initialize game
function initGame() {
  gameState.gameArea = document.getElementById("gameArea");
  gameState.isGameActive = true;
  gameState.timeRemaining = 60;

  // Reset scores
  gameState.score = {
    hotdog: 0,
    taco: 0,
    burrito: 0,
    falafel: 0,
    sandwich: 0,
  };
  updateScore();

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

  // Start timer
  startTimer();

  // Start game loop
  gameLoop();
}

// Start the game timer
function startTimer() {
  updateTimerDisplay();
  gameState.gameTimer = setInterval(() => {
    gameState.timeRemaining--;
    updateTimerDisplay();

    if (gameState.timeRemaining <= 0) {
      endGame();
    }
  }, 1000);
}

// Update timer display
function updateTimerDisplay() {
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    timerElement.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}

// End the game
function endGame() {
  gameState.isGameActive = false;

  // Stop spawning items
  if (gameState.spawnInterval) {
    clearInterval(gameState.spawnInterval);
    gameState.spawnInterval = null;
  }

  // Stop timer
  if (gameState.gameTimer) {
    clearInterval(gameState.gameTimer);
    gameState.gameTimer = null;
  }

  // Calculate total score
  const totalScore = Object.values(gameState.score).reduce(
    (sum, val) => sum + val,
    0
  );

  // Show game over screen
  showGameOverScreen(totalScore);
}

// Store current game score for submission
let currentGameScore = 0;

// Show game over screen
function showGameOverScreen(totalScore) {
  const gameOverScreen = document.getElementById("gameOverScreen");
  const totalScoreElement = document.getElementById("totalScore");
  const nameInput = document.getElementById("playerName");

  currentGameScore = totalScore;
  totalScoreElement.textContent = totalScore;
  gameOverScreen.classList.remove("hidden");
  nameInput.value = ""; // Clear previous input
  nameInput.focus(); // Focus on input for better UX

  // Load and display highscores
  displayHighscores();
}

// Save highscore to localStorage
function saveHighscore(name, score) {
  let highscores = JSON.parse(localStorage.getItem("hotdogHighscores") || "[]");
  highscores.push({ name, score, date: new Date().toISOString() });

  // Sort by score (descending) and keep top 10
  highscores.sort((a, b) => b.score - a.score);
  highscores = highscores.slice(0, 10);

  localStorage.setItem("hotdogHighscores", JSON.stringify(highscores));
}

// Display highscores
function displayHighscores() {
  const highscoreList = document.getElementById("highscoreList");
  const highscores = JSON.parse(
    localStorage.getItem("hotdogHighscores") || "[]"
  );

  if (highscores.length === 0) {
    highscoreList.innerHTML =
      "<p class='no-highscores'>No highscores yet. Be the first!</p>";
    return;
  }

  highscoreList.innerHTML = highscores
    .map((entry, index) => {
      return `
        <div class="highscore-item">
          <span class="highscore-rank">${index + 1}.</span>
          <span class="highscore-name">${entry.name}</span>
          <span class="highscore-score">${entry.score}</span>
        </div>
      `;
    })
    .join("");
}

// Restart game
function restartGame() {
  const gameOverScreen = document.getElementById("gameOverScreen");
  gameOverScreen.classList.add("hidden");

  // Play oh yeah sound
  playOhYeahSound();

  // Clear all falling items
  gameState.fallingItems.forEach((item) => {
    if (item.element) item.element.remove();
  });
  gameState.fallingItems = [];

  // Reinitialize game
  initGame();
}

// Spawn a random falling item from a random side
function spawnFallingItem() {
  if (!gameState.isGameActive) return;

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
  if (!gameState.isGameActive) return;

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

  if (!gameState.draggedItem || !gameState.isGameActive) return;

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

// Play the oh_yeah sound when game starts
function playOhYeahSound() {
  const audio = new Audio("assets/sound/oh_yeah.mp3");
  audio.volume = 0.7; // Set volume to 70%
  audio.play().catch((error) => {
    // Ignore audio play errors
    console.log("Could not play oh_yeah sound:", error);
  });
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

// Show intro screen on page load
window.addEventListener("load", () => {
  const introScreen = document.getElementById("introScreen");
  const startButton = document.getElementById("startButton");
  const restartButton = document.getElementById("restartButton");
  const submitButton = document.getElementById("submitScore");
  const nameInput = document.getElementById("playerName");

  // Start game when button is clicked
  startButton.addEventListener("click", () => {
    playOhYeahSound();
    introScreen.classList.add("hidden");
    initGame();
  });

  // Set up restart button
  if (restartButton) {
    restartButton.addEventListener("click", () => {
      restartGame();
    });
  }

  // Set up submit score button
  if (submitButton) {
    submitButton.addEventListener("click", () => {
      const playerName = nameInput.value.trim() || "Anonymous";
      saveHighscore(playerName, currentGameScore);
      displayHighscores();
      nameInput.value = "";
    });
  }

  // Allow Enter key to submit
  if (nameInput) {
    nameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && submitButton) {
        submitButton.click();
      }
    });
  }
});
