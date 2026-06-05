const steps = [
  {
    title: "Tekenen",
    text: "Leg de aluminiumfolie glad op tafel. Teken met een vet krijt of lithostift je lijnen stevig op het oppervlak.",
    video: "video/Stap1_tekenen.mp4",
    duration: 34
  },
  {
    title: "Etsen",
    text: "Wrijf een dun laagje cola over de folie. Maak het oppervlak daarna rustig schoon, zodat de tekening klaar is om inkt vast te houden.",
    video: "video/Stap2_etsen.mp4",
    duration: 58
  },
  {
    title: "Inkten",
    text: "Rol de drukinkt gelijkmatig over de folie. De inkt blijft vooral zitten op de getekende, vette lijnen.",
    video: "video/Stap3_inkten.mp4",
    duration: 48
  },
  {
    title: "Bedrukken",
    text: "Leg papier op de ingeinkte folie en wrijf stevig maar gelijkmatig. Til het papier langzaam op en bekijk de afdruk.",
    video: "video/Stap4_bedrukken.mp4",
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

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
}

function updateVideoProgress() {
  const fallbackDuration = steps[activeStep].duration;
  const duration = Number.isFinite(stepVideo.duration) ? stepVideo.duration : fallbackDuration;
  const progress = duration > 0 ? (stepVideo.currentTime / duration) * 100 : 0;

  controlProgress.style.width = `${Math.min(progress, 100)}%`;
  controlTime.textContent = `${formatTime(stepVideo.currentTime)} / ${formatTime(duration)}`;
}

function playCurrentVideo() {
  videoFrame.classList.add("is-playing");

  stepVideo.play().catch(() => {
    videoFrame.classList.remove("is-playing");
  });
}

function renderStep(autoplay = false) {
  const step = steps[activeStep];

  stepCount.textContent = `Stap ${activeStep + 1} van ${steps.length}`;
  stepLabel.textContent = `Stap ${activeStep + 1}`;
  stepTitle.textContent = step.title;
  stepText.textContent = step.text;

  stepVideo.pause();
  stepVideo.src = step.video;
  stepVideo.load();

  controlProgress.style.width = "0%";
  controlTime.textContent = `00:00 / ${formatTime(step.duration)}`;
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
    stepVideo.pause();
    videoFrame.classList.remove("is-playing");
  } else {
    playCurrentVideo();
  }
});

stepVideo.addEventListener("loadedmetadata", updateVideoProgress);
stepVideo.addEventListener("timeupdate", updateVideoProgress);

stepVideo.addEventListener("ended", () => {
  updateVideoProgress();
  videoFrame.classList.remove("is-playing");
});

restartButton.addEventListener("click", restartWorkshop);

renderStep();