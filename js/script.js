const steps = [
  {
    title: "Tekenen",
    text: "Leg de aluminiumfolie glad op tafel. Teken met een vet krijt of lithostift je lijnen stevig op het oppervlak.",
    vimeoId: "1198796187",
    vimeoHash: "6168f2996e",
    duration: 34
  },
  {
    title: "Etsen",
    text: "Wrijf een dun laagje cola over de folie. Maak het oppervlak daarna rustig schoon, zodat de tekening klaar is om inkt vast te houden.",
    vimeoId: "1198796582",
    vimeoHash: "8967b518b8",
    duration: 58
  },
  {
    title: "Inkten",
    text: "Rol de drukinkt gelijkmatig over de folie. De inkt blijft vooral zitten op de getekende, vette lijnen.",
    vimeoId: "1198796941",
    vimeoHash: "aa4cdc651d",
    duration: 48
  },
  {
    title: "Bedrukken",
    text: "Leg papier op de ingeinkte folie en wrijf stevig maar gelijkmatig. Til het papier langzaam op en bekijk de afdruk.",
    vimeoId: "1198797343",
    vimeoHash: "6a398bcd86",
    duration: 25
  }
];

const restartButton = document.querySelector("#restart-button");
const nextButton = document.querySelector("#next-button");
const playButton = document.querySelector("#play-button");
const stepButtons = document.querySelectorAll(".step-button");
const stepCount = document.querySelector("#step-count");
const stepLabel = document.querySelector("#step-label");
const stepTitle = document.querySelector("#step-title");
const stepText = document.querySelector("#step-text");
const videoFrame = document.querySelector("#video-frame");
const stepVideo = document.querySelector("#step-video");
const controlProgress = document.querySelector("#control-progress");
const controlTime = document.querySelector("#control-time");

let activeStep = 0;
let player = null;
let progressTimer = null;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
}

function getVimeoUrl(step) {
  return `https://player.vimeo.com/video/${step.vimeoId}?h=${step.vimeoHash}&autoplay=0&muted=0&controls=0&title=0&byline=0&portrait=0`;
}

function updateVideoProgress(currentTime = 0, duration = steps[activeStep].duration) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  controlProgress.style.width = `${Math.min(progress, 100)}%`;
  controlTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function stopProgressTimer() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function startProgressTimer() {
  stopProgressTimer();

  progressTimer = setInterval(() => {
    if (!player) {
      return;
    }

    Promise.all([
      player.getCurrentTime(),
      player.getDuration()
    ]).then(([currentTime, duration]) => {
      updateVideoProgress(currentTime, duration);
    }).catch(() => {
      updateVideoProgress(0, steps[activeStep].duration);
    });
  }, 250);
}

function setupPlayer() {
  if (typeof Vimeo === "undefined") {
    return;
  }

  player = new Vimeo.Player(stepVideo);

  player.on("loaded", () => {
    player.getDuration().then((duration) => {
      updateVideoProgress(0, duration);
    });
  });

  player.on("timeupdate", (data) => {
    updateVideoProgress(data.seconds, data.duration);
  });

  player.on("ended", () => {
    updateVideoProgress(steps[activeStep].duration, steps[activeStep].duration);
    videoFrame.classList.remove("is-playing");
    stopProgressTimer();
  });
}

function playCurrentVideo() {
  if (!player) {
    setupPlayer();
  }

  videoFrame.classList.add("is-playing");

  player.ready().then(() => {
    startProgressTimer();
    return player.play();
  }).catch(() => {
    videoFrame.classList.remove("is-playing");
    stopProgressTimer();
  });
}

function renderStep(autoplay = false) {
  const step = steps[activeStep];

  stepCount.textContent = `Stap ${activeStep + 1} van ${steps.length}`;
  stepLabel.textContent = `Stap ${activeStep + 1}`;
  stepTitle.textContent = step.title;
  stepText.textContent = step.text;

  stopProgressTimer();
  stepVideo.src = getVimeoUrl(step);
  player = null;
  setupPlayer();

  updateVideoProgress(0, step.duration);
  nextButton.textContent = activeStep === steps.length - 1 ? "Start opnieuw" : "Volgende stap";

  stepButtons.forEach((button, index) => {
    button.classList.toggle("is-active", index === activeStep);
    button.setAttribute("aria-current", index === activeStep ? "step" : "false");
  });

  if (autoplay) {
    playCurrentVideo();
  }
}

function restartWorkshop() {
  activeStep = 0;
  window.scrollTo(0, 0);
  videoFrame.classList.remove("is-playing");
  stopProgressTimer();
  renderStep();
}

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeStep = Number(button.dataset.step);
    videoFrame.classList.remove("is-playing");
    renderStep(true);
  });
});

nextButton.addEventListener("click", () => {
  if (activeStep === steps.length - 1) {
    restartWorkshop();
    return;
  }

  activeStep += 1;
  videoFrame.classList.remove("is-playing");
  renderStep(true);
});

playButton.addEventListener("click", () => {
  if (videoFrame.classList.contains("is-playing")) {
    player.pause();
    videoFrame.classList.remove("is-playing");
    stopProgressTimer();
  } else {
    playCurrentVideo();
  }
});

restartButton.addEventListener("click", restartWorkshop);

renderStep();