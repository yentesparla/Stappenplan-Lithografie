const steps = [
  {
    title: "Tekenen",
    text: "Kies een van de drie plaatjes met aluminiumfolie: de oneindige trap, de oneindige driehoek of de duivelsvork. Gebruik de vetkrijtjes om er zelf figuren of lijnen bij te tekenen zodat het onderdeel wordt van de illusie. Maak de illusie op jouw eigen manier af!",
    vimeoId: "1198796187",
    vimeoHash: "6168f2996e",
    duration: 34
  },
  {
    title: "Etsen",
    text: "Leg je plaatje in de bak en giet er een beetje cola overheen. Laat dit heel even intrekken. Spoel daarna het plaatje schoon met het sponsje en een beetje water. Dep het voorzichtig droog, maar zorg dat de folie een klein beetje vochtig blijft!",
    vimeoId: "1198796582",
    vimeoHash: "8967b518b8",
    duration: 58
  },
  {
    title: "Inkten",
    text: "Rol met de verfroller over je tekening. Blijft er overal inkt plakken? Maak je plaatje dan weer een beetje vochtig met het sponsje en rol opnieuw. Herhaal dit een paar keer totdat er bijna geen inkt meer op de rest van de folie zit en je jouw eigen tekening heel duidelijk ziet staan.",
    vimeoId: "1198796941",
    vimeoHash: "aa4cdc651d",
    duration: 48
  },
  {
    title: "Bedrukken",
    text: "Leg je papier voorzichtig bovenop de plaat met inkt. Wrijf daarna met je hand stevig over het hele vel papier. Trek het papier er daarna langzaam en voorzichtig af. Tadaa! Jouw eigen Escher-print is klaar!",
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
const controlProgress = document.querySelector("#control-progress");
const controlTime = document.querySelector("#control-time");

let activeStep = 0;
let player = null;
let progressTimer = null;
let playRequestPending = false;
let stepVideo = document.querySelector("#step-video");

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
}

function getVimeoUrl(step, autoplay = false) {
  const autoplayValue = autoplay ? "1" : "0";

  return `https://player.vimeo.com/video/${step.vimeoId}?h=${step.vimeoHash}&autoplay=${autoplayValue}&muted=0&controls=0&title=0&byline=0&portrait=0&autopause=0`;
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

function setPlaybackState(isPlaying) {
  videoFrame.classList.toggle("is-playing", isPlaying);

  if (isPlaying) {
    videoFrame.classList.remove("is-ended");
  }
}

function resetPlaybackState() {
  playRequestPending = false;
  setPlaybackState(false);
  videoFrame.classList.remove("is-ended");
  stopProgressTimer();
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

function createVimeoIframe(step, autoplay = false) {
  const iframe = document.createElement("iframe");

  iframe.id = "step-video";
  iframe.className = "step-video";
  iframe.src = getVimeoUrl(step, autoplay);
  iframe.allow = "autoplay; fullscreen; picture-in-picture";
  iframe.allowFullscreen = true;

  stepVideo.replaceWith(iframe);
  stepVideo = iframe;
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

  player.on("play", () => {
    playRequestPending = false;
    setPlaybackState(true);
    startProgressTimer();
  });

  player.on("pause", () => {
    playRequestPending = false;
    setPlaybackState(false);
    stopProgressTimer();
  });

  player.on("ended", () => {
    updateVideoProgress(steps[activeStep].duration, steps[activeStep].duration);
    showReplayState();
  });
}

function showReplayState() {
  const step = steps[activeStep];

  playRequestPending = false;
  setPlaybackState(false);
  stopProgressTimer();
  videoFrame.classList.add("is-ended");

  createVimeoIframe(step, false);
  setupPlayer();
  updateVideoProgress(0, step.duration);
}

function playCurrentVideo() {
  if (playRequestPending) {
    return;
  }

  if (!player) {
    setupPlayer();
  }

  if (!player) {
    resetPlaybackState();
    return;
  }

  playRequestPending = true;

  player.ready().then(() => {
    return player.play();
  }).then(() => {
    playRequestPending = false;
    setPlaybackState(true);
    startProgressTimer();
  }).catch(() => {
    resetPlaybackState();
  });
}

function renderStep(autoplay = false) {
  const step = steps[activeStep];

  stepCount.textContent = `Stap ${activeStep + 1} van ${steps.length}`;
  stepLabel.textContent = `Stap ${activeStep + 1}`;
  stepTitle.textContent = step.title;
  stepText.textContent = step.text;

  if (player) {
    player.pause().catch(() => {});
  }

  resetPlaybackState();
  createVimeoIframe(step, autoplay);
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
  renderStep();
}

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeStep = Number(button.dataset.step);
    renderStep(true);
  });
});

nextButton.addEventListener("click", () => {
  if (activeStep === steps.length - 1) {
    restartWorkshop();
    return;
  }

  activeStep += 1;
  renderStep(true);
});

playButton.addEventListener("click", () => {
  if (!player) {
    setupPlayer();
  }

  if (videoFrame.classList.contains("is-playing")) {
    player.pause();
    resetPlaybackState();
  } else {
    playCurrentVideo();
  }
});

restartButton.addEventListener("click", restartWorkshop);

renderStep();