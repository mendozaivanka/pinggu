const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const moodText = document.getElementById("moodText");
const heartMeter = document.getElementById("heartMeter");

const img = new Image();
img.src = "./images/Penguin SpriteSheet.png";

const clickSound = new Audio("./sounds/noot.mp3");

const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;
const SCALE = 1;
const SCALED_WIDTH = FRAME_WIDTH * SCALE;
const SCALED_HEIGHT = FRAME_HEIGHT * SCALE;

const animationLoops = {
  run: [0, 1, 0],
  walk: [0, 1, 2, 3, 0],
  jump: [0],
  slide: [0, 1, 2,0],
  hurt: [0],
};

const animationRows = {
  run: 0,
  walk: 1,
  jump: 2,
  slide: 4,
  hurt: 3,
};

let currentAnimation = "walk";
let loopIndex = 0;
let lastFrameTime = 0;
let FRAME_DURATION = 200;
let lastInteraction = Date.now();
let affection = 5;
let animationFrameId;

let posX = 1;
let direction = 1; // 1 = right, -1 = left
let runTimer = 0;
const hearts = [];
const sounds = [];
const texts = []; // floating text when running

function drawFrame(frameX, frameY, x, y) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  if (direction === -1) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    x = canvas.width - x - SCALED_WIDTH;
  }

  ctx.drawImage(
    img,
    frameX * FRAME_WIDTH,
    frameY * FRAME_HEIGHT,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    x,
    y,
    SCALED_WIDTH,
    SCALED_HEIGHT
  );

  ctx.restore();

  // Draw hearts
  hearts.forEach((heart) => {
    ctx.font = "9px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("❤️", heart.x, heart.y);
    heart.y -= 1;
    heart.life -= 1;
  });

  // Remove expired hearts
  for (let i = hearts.length - 1; i >= 0; i--) {
    if (hearts[i].life <= 0) hearts.splice(i, 1);
  }

  // Draw sound
  sounds.forEach((sound) => {
    ctx.font = "9px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("💢", sound.x, sound.y);
    sound.y -= 1;
    sound.life -= 1;
  });

  // Remove expired sounds
  for (let i = sounds.length - 1; i >= 0; i--) {
    if (sounds[i].life <= 0) sounds.splice(i, 1);
  }

  // Draw floating texts
  texts.forEach((txt) => {
    ctx.font = "6px Arial";
    ctx.fillStyle = "#444";
    ctx.fillText(txt.text, txt.x, txt.y);
    txt.y -= 0.5;
    txt.life -= 1;
  });

  for (let i = texts.length - 1; i >= 0; i--) {
    if (texts[i].life <= 0) texts.splice(i, 1);
  }
}

function step(timestamp) {
  animationFrameId = requestAnimationFrame(step);

  if (timestamp - lastFrameTime > FRAME_DURATION) {
    loopIndex = (loopIndex + 1) % animationLoops[currentAnimation].length;
    lastFrameTime = timestamp;

    const frameX = animationLoops[currentAnimation][loopIndex];
    const frameY = animationRows[currentAnimation];

    drawFrame(frameX, frameY, posX, 23);

    // Movement for walk/run
    if (currentAnimation === "walk" || currentAnimation === "run") {
      posX += direction * (currentAnimation === "run" ? 4 : 1);
      if (posX <= 0 || posX >= canvas.width - SCALED_WIDTH) direction *= -1;
    }
  }

  // // Trigger random run
  // if (Date.now() - runTimer > 15000 + Math.random() * 15000) {
  //   currentAnimation = "run";
  //   runTimer = Date.now();
  //   texts.push({ text: "noot noot", x: posX, y: 10, life: 40 });
  //   setTimeout(() => {
  //     if (currentAnimation === "run") currentAnimation = "walk";
  //   }, 2000);
  // }

  // Movement for slide
  if (currentAnimation === "slide") {
    posX += direction * 1;
    if (posX <= 0 || posX >= canvas.width - SCALED_WIDTH) direction *= -1;
  }


  // Handle loneliness
  if (Date.now() - lastInteraction > 30000) {
    if (affection > 0) {
      affection--;
      updateHearts();
      moodText.textContent = "Penguin feels lonely... 🥺";
    }
    currentAnimation = "hurt";
    lastInteraction = Date.now();
  }
}

function updateMood() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 6 && hour < 11) {
    moodText.textContent = "Good morning!!";
  } else if (hour >= 11 && hour < 17) {
    moodText.textContent = "I hope you have a great day!!";
  } else if (hour >= 17 && hour < 23) {
    moodText.textContent = "It's cake time!! 🎂";
  } else {
    moodText.textContent = "I'm sleepy... but I love you 🐧💤";
  }
}

function updateCountdown() {
  const today = new Date();
  const birthday = new Date(today.getFullYear(), 7, 20);
  if (today > birthday) birthday.setFullYear(today.getFullYear() + 1);

  const diffTime = birthday - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const countdownText = document.getElementById("countdownText");
  countdownText.textContent =
    daysLeft === 0
      ? "🎂 It's your birthday today!! 🎉"
      : `🎈 ${daysLeft} day${daysLeft > 1 ? "s" : ""} until your special day!`;
}

function updateHearts() {
  heartMeter.textContent = "❤️".repeat(affection);

  if (affection <= 0) {
    showDeathScreen();
  }
}

let isCake = false;
function feedCake() {
  if (!isCake) {
    isCake = true;
    currentAnimation = "run";
    affection = Math.min(affection + 1, 5);
    updateHearts();
    moodText.textContent = "kekek";
    lastInteraction = Date.now();
    setTimeout(() => {
      currentAnimation = "walk";
      isCake = false;
    }, 600);
  }
}

let isGift = false;
function openGift() {
  if (!isGift) {
    isGift = true;
    currentAnimation = "slide";
    affection = Math.min(affection + 1, 5);
    updateHearts();
    moodText.textContent = "forced to work, born to dilly dally 🐧”";
    lastInteraction = Date.now();
    setTimeout(() => {
      currentAnimation = "walk";
      isGift = false;
    }, 600);
  }
}

let isCuddle = false;
function cuddle() {
  if (!isCake) {
    isCuddle = true;
    currentAnimation = "jump";
    hearts.push({ x: posX + 30, y: 30, life: 10 });
    affection = Math.min(affection + 1, 5);
    updateHearts();
    moodText.textContent = "Kisses for you 💋";
    lastInteraction = Date.now();
    setTimeout(() => {
      currentAnimation = "walk";
      isCuddle = false;
    }, 600);
  }
}

let isJumping = false;
canvas.addEventListener("click", () => {
  clickSound.play(); // play sound when clicked

  if (!isJumping) {
    isJumping = true;
    currentAnimation = "hurt";
    affection--;
    updateHearts();
    sounds.push({ x: posX + 30, y: 30, life: 10 });
    lastInteraction = Date.now();
    setTimeout(() => {
      currentAnimation = "walk";
      isJumping = false;
    }, 600);
  }
});

function showDeathScreen() {
  currentAnimation = "hurt";
  moodText.textContent = "Your penguin is gone... 💔🐧";
  cancelAnimationFrame(animationFrameId); // stop the game loop
  document.getElementById("deathScreen").classList.remove("hidden");
}


img.onload = () => {
  updateMood();
  updateCountdown();
  updateHearts();
  requestAnimationFrame(step);
};
