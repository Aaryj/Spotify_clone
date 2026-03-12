

document.addEventListener("DOMContentLoaded", function () {

  const currentSong = new Audio();

  const songs = [
    "assests/songs/s1.mp3",
    "assests/songs/s2.mp3",
    "assests/songs/s3.mp3",
    "assests/songs/s4.mp3",
    "assests/songs/s5.mp3",
    "assests/songs/s6.mp3",
    "assests/songs/s7.mp3",
    "assests/songs/s8.mp3",
  ];

  let currentIndex  = -1;   // -1 = nothing loaded yet
  let isShuffled    = false;
  let isRepeat      = false;
  let isMuted       = false;
  let lastVolume    = 0.8;   // remember volume before mute

  
  const playbar        = document.getElementById("playbar");
  const playBtn        = document.getElementById("playBtn");
  const playIcon       = document.getElementById("playIcon");
  const pauseIcon      = document.getElementById("pauseIcon");
  const prevBtn        = document.getElementById("prevBtn");
  const nextBtn        = document.getElementById("nextBtn");
  const shuffleBtn     = document.getElementById("shuffleBtn");
  const repeatBtn      = document.getElementById("repeatBtn");
  const muteBtn        = document.getElementById("muteBtn");
  const progressBar    = document.getElementById("progressBar");
  const volumeSlider   = document.getElementById("volumeSlider");
  const songTitle      = document.getElementById("songTitle");
  const songTime       = document.getElementById("songTime");
  const nowPlayingThumb = document.getElementById("nowPlayingThumb");

  // All clickable cards (recent section)
  const cards = document.querySelectorAll(".horizontal-card");



  // Format seconds → "m:ss"
  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Show play icon, hide pause icon (or vice-versa)
  function setPlayingState(playing) {
    playIcon.style.display  = playing ? "none"  : "block";
    pauseIcon.style.display = playing ? "block" : "none";
  }

  // Highlight the active card
  function updateActiveCard(index) {
    cards.forEach((c, i) => {
      c.classList.toggle("playing-card", i === index);
    });
  }

  // Get image src from a card by index
  function getCardThumb(index) {
    if (index < 0 || index >= cards.length) return "";
    return cards[index].querySelector(".h-img")?.src || "";
  }

  // Get random index different from current
  function randomIndex() {
    if (songs.length <= 1) return 0;
    let r;
    do { r = Math.floor(Math.random() * songs.length); }
    while (r === currentIndex);
    return r;
  }

  function playMusic(index) {
    if (index < 0 || index >= songs.length) return;

    currentIndex = index;

    currentSong.src = songs[index];
    currentSong.volume = volumeSlider.value / 100;

    currentSong.play().catch((err) => {
      console.warn("Playback failed:", err);
    });

    // Update UI
    const title = index < cards.length
      ? cards[index].querySelector("p").innerText
      : `Song ${index + 1}`;

    songTitle.innerText = title;

    // Thumbnail
    const thumb = getCardThumb(index);
    if (thumb) {
      nowPlayingThumb.src = thumb;
      nowPlayingThumb.style.display = "block";
    } else {
      nowPlayingThumb.style.display = "none";
    }

    setPlayingState(true);
    updateActiveCard(index);

    // FIX: Make playbar visible
    playbar.classList.add("active");
  }


  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      if (currentIndex === index && !currentSong.paused) {
        // Clicking playing card → pause
        currentSong.pause();
        setPlayingState(false);
      } else {
        playMusic(index);
      }
    });
  });


  playBtn.addEventListener("click", () => {
    if (currentIndex === -1) {
      // Nothing loaded yet — start first song
      playMusic(0);
      return;
    }

    if (currentSong.paused) {
      currentSong.play().catch(console.warn);
      setPlayingState(true);
    } else {
      currentSong.pause();
      setPlayingState(false);
    }
  });


  function playNext() {
    let next;
    if (isShuffled) {
      next = randomIndex();
    } else {
      next = (currentIndex + 1) % songs.length;
    }
    playMusic(next);
  }

  function playPrev() {
    // If more than 3 seconds in, restart current song
    if (currentSong.currentTime > 3) {
      currentSong.currentTime = 0;
      return;
    }
    const prev = (currentIndex - 1 + songs.length) % songs.length;
    playMusic(prev);
  }

  nextBtn.addEventListener("click", playNext);
  prevBtn.addEventListener("click", playPrev);


  currentSong.addEventListener("ended", () => {
    if (isRepeat) {
      currentSong.currentTime = 0;
      currentSong.play().catch(console.warn);
    } else {
      playNext();
    }
  });


  shuffleBtn.addEventListener("click", () => {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle("btn-active", isShuffled);
  });

 
  repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("btn-active", isRepeat);
  });


  currentSong.addEventListener("timeupdate", () => {
    if (!currentSong.duration) return;

    const pct = (currentSong.currentTime / currentSong.duration) * 100;
    progressBar.value = pct;

    // Update progress bar fill color
    progressBar.style.background = `linear-gradient(to right, #1db954 ${pct}%, #4d4d4d ${pct}%)`;

    // Update time display
    songTime.innerText = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
  });


  progressBar.addEventListener("input", () => {
    if (!currentSong.duration) return;
    currentSong.currentTime = (progressBar.value / 100) * currentSong.duration;
  });


  volumeSlider.value = 80;
  currentSong.volume = 0.8;

  volumeSlider.addEventListener("input", () => {
    const vol = volumeSlider.value / 100;
    currentSong.volume = vol;
    lastVolume = vol;
    isMuted = vol === 0;
    muteBtn.classList.toggle("muted", isMuted);

    // Update slider fill
    volumeSlider.style.background =
      `linear-gradient(to right, #1db954 ${volumeSlider.value}%, #4d4d4d ${volumeSlider.value}%)`;
  });

 
  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;

    if (isMuted) {
      lastVolume = currentSong.volume || lastVolume;
      currentSong.volume = 0;
      volumeSlider.value = 0;
    } else {
      currentSong.volume = lastVolume;
      volumeSlider.value = Math.round(lastVolume * 100);
    }

    muteBtn.classList.toggle("muted", isMuted);

    const v = volumeSlider.value;
    volumeSlider.style.background =
      `linear-gradient(to right, #1db954 ${v}%, #4d4d4d ${v}%)`;
  });


  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active-filter"));
      btn.classList.add("active-filter");
    });
  });


  document.addEventListener("keydown", (e) => {
    // Ignore if typing in input
    if (e.target.tagName === "INPUT") return;

    switch (e.key) {
      case " ":
        e.preventDefault();
        playBtn.click();
        break;
      case "ArrowRight":
        e.preventDefault();
        nextBtn.click();
        break;
      case "ArrowLeft":
        e.preventDefault();
        prevBtn.click();
        break;
      case "ArrowUp":
        e.preventDefault();
        volumeSlider.value = Math.min(100, +volumeSlider.value + 5);
        volumeSlider.dispatchEvent(new Event("input"));
        break;
      case "ArrowDown":
        e.preventDefault();
        volumeSlider.value = Math.max(0, +volumeSlider.value - 5);
        volumeSlider.dispatchEvent(new Event("input"));
        break;
      case "m":
      case "M":
        muteBtn.click();
        break;
    }
  });


  progressBar.style.background = "linear-gradient(to right, #1db954 0%, #4d4d4d 0%)";
  volumeSlider.style.background = "linear-gradient(to right, #1db954 80%, #4d4d4d 80%)";

});
