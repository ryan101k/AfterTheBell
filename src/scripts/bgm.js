/* Lightweight, original generative BGM for After the Bell. */
(function () {
  'use strict';

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const STORAGE_KEY = 'after-the-bell.bgm-muted';
  const LOOK_AHEAD_MS = 100;
  const SCHEDULE_AHEAD = 0.35;
  const MASTER_VOLUME = 0.16;

  const themes = {
    title: {
      bpm: 48,
      chords: [[50, 57, 62], [48, 55, 60], [45, 52, 57], [47, 54, 59]],
      bass: [38, 36, 33, 35],
      melody: [null, 69, null, null, 67, null, 64, null, null, 62, null, 64, null, null, 60, null],
      color: 'sine'
    },
    prologue: {
      bpm: 54,
      chords: [[50, 57, 62], [46, 53, 58], [43, 50, 55], [45, 52, 57]],
      bass: [38, 34, 31, 33],
      melody: [62, null, null, 65, null, null, 60, null, 58, null, null, 57, null, 60, null, null],
      color: 'triangle'
    },
    dangerous: {
      bpm: 68,
      chords: [[50, 53, 57], [49, 53, 58], [46, 50, 55], [48, 52, 57]],
      bass: [38, 37, 34, 36],
      melody: [74, null, 73, null, null, 69, null, 70, null, 68, null, null, 65, null, 68, null],
      color: 'sawtooth',
      pulse: true
    },
    sera: {
      bpm: 58,
      chords: [[48, 55, 60], [46, 53, 58], [43, 50, 55], [45, 52, 57]],
      bass: [36, 34, 31, 33],
      melody: [67, null, null, 65, 64, null, null, 60, null, 62, null, null, 64, null, 60, null],
      color: 'triangle'
    },
    yujin: {
      bpm: 64,
      chords: [[52, 59, 64], [50, 57, 62], [48, 55, 60], [51, 58, 63]],
      bass: [40, 38, 36, 39],
      melody: [71, null, 71, null, 67, null, null, 69, null, 66, null, null, 64, null, 66, null],
      color: 'sine',
      pulse: true
    },
    chaerin: {
      bpm: 62,
      chords: [[47, 54, 59], [48, 55, 60], [44, 51, 56], [46, 53, 58]],
      bass: [35, 36, 32, 34],
      melody: [71, null, 74, null, 70, null, 68, null, 71, null, null, 75, null, 73, null, 70],
      color: 'triangle',
      pulse: true
    },
    freedom: {
      bpm: 76,
      chords: [[50, 54, 57], [47, 50, 54], [43, 47, 50], [45, 49, 52]],
      bass: [38, 35, 31, 33],
      melody: [66, null, 69, null, 71, null, 69, 66, null, 64, null, 62, 64, null, 66, null],
      color: 'sine',
      pulse: true
    },
    trueEnding: {
      bpm: 60,
      chords: [[50, 54, 57], [45, 50, 54], [47, 50, 54], [50, 54, 59]],
      bass: [38, 33, 35, 38],
      melody: [69, null, 71, 74, null, 73, null, 69, 66, null, 69, null, 71, null, 74, null],
      color: 'sine'
    },
    badEnding: {
      bpm: 46,
      chords: [[50, 53, 56], [46, 50, 53], [43, 47, 50], [41, 45, 49]],
      bass: [38, 34, 31, 29],
      melody: [62, null, null, 61, null, null, 56, null, null, 58, null, null, 53, null, null, null],
      color: 'triangle'
    }
  };

  let context = null;
  let master = null;
  let themeBus = null;
  let scheduler = null;
  let nextNoteTime = 0;
  let step = 0;
  let activeTheme = '';
  let requestedTheme = 'title';
  let unlocked = false;
  let muted = readMuted();

  function readMuted() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function saveMuted() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(muted));
    } catch (error) {
      /* Storage is optional. */
    }
  }

  function midi(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function ensureContext() {
    if (!AudioContextClass || context) {
      return Boolean(context);
    }

    context = new AudioContextClass();
    master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.connect(context.destination);
    return true;
  }

  function playTone(frequency, start, duration, volume, wave, destination, detune) {
    if (!context || !destination) {
      return;
    }

    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.setValueAtTime(detune || 0, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.035);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope);
    envelope.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function scheduleStep(theme, at, index, destination) {
    const beat = 60 / theme.bpm;
    const chordIndex = Math.floor(index / 8) % theme.chords.length;

    if (index % 8 === 0) {
      theme.chords[chordIndex].forEach(function (note, noteIndex) {
        playTone(midi(note), at, beat * 7.5, 0.022 / (noteIndex + 1), theme.color, destination, noteIndex * 3);
      });
      playTone(midi(theme.bass[chordIndex]), at, beat * 3.5, 0.038, 'sine', destination, 0);
    }

    if (theme.pulse && index % 2 === 0) {
      playTone(midi(theme.bass[chordIndex] + 12), at, beat * 0.36, 0.009, 'triangle', destination, 0);
    }

    const melodyNote = theme.melody[index % theme.melody.length];
    if (melodyNote !== null) {
      playTone(midi(melodyNote), at, beat * 1.6, 0.018, 'sine', destination, 5);
    }
  }

  function stopScheduler() {
    if (scheduler) {
      window.clearInterval(scheduler);
      scheduler = null;
    }
  }

  function schedulerTick() {
    const theme = themes[activeTheme];
    const destination = themeBus;
    if (!context || !theme || !destination) {
      return;
    }

    const stepDuration = (60 / theme.bpm) / 2;
    while (nextNoteTime < context.currentTime + SCHEDULE_AHEAD) {
      scheduleStep(theme, nextNoteTime, step, destination);
      nextNoteTime += stepDuration;
      step = (step + 1) % 32;
    }
  }

  function startTheme(themeName) {
    if (!unlocked || muted || !ensureContext()) {
      return;
    }

    const nextTheme = themes[themeName] ? themeName : 'title';
    if (activeTheme === nextTheme && scheduler) {
      return;
    }

    stopScheduler();
    const now = context.currentTime;
    const oldBus = themeBus;
    themeBus = context.createGain();
    themeBus.gain.setValueAtTime(0.0001, now);
    themeBus.gain.exponentialRampToValueAtTime(1, now + 1.1);
    themeBus.connect(master);

    if (oldBus) {
      oldBus.gain.cancelScheduledValues(now);
      oldBus.gain.setValueAtTime(Math.max(0.0001, oldBus.gain.value), now);
      oldBus.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
      window.setTimeout(function () {
        oldBus.disconnect();
      }, 1400);
    }

    activeTheme = nextTheme;
    step = 0;
    nextNoteTime = now + 0.06;
    schedulerTick();
    scheduler = window.setInterval(schedulerTick, LOOK_AHEAD_MS);
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(MASTER_VOLUME, now + 0.65);
    updateButton();
  }

  function endingThemeFromPage() {
    const ending = document.querySelector('.chapter-end');
    if (!ending) {
      return '';
    }
    const text = ending.textContent || '';
    if (/BAD|EARLY|FRAGILE|LOCKED/.test(text)) {
      return 'badEnding';
    }
    if (/TRUE|FRIEND|SOLO TRUE/.test(text)) {
      return 'trueEnding';
    }
    return '';
  }

  function chooseTheme() {
    const pageEnding = endingThemeFromPage();
    if (pageEnding) {
      return pageEnding;
    }

    const name = typeof passage === 'function' ? passage() : '';
    const chapter = State.variables.chapter || 0;
    if (tags().includes('menu')) {
      return 'title';
    }
    if (/^3S/.test(name)) {
      return 'sera';
    }
    if (/^3Y/.test(name)) {
      return 'yujin';
    }
    if (/^3C/.test(name)) {
      return 'chaerin';
    }
    if (chapter >= 4) {
      return 'freedom';
    }
    if (chapter >= 1) {
      return 'dangerous';
    }
    return 'prologue';
  }

  function updateButton() {
    const button = document.querySelector('[data-vn-action="bgm"]');
    if (!button) {
      return;
    }
    const off = muted || !AudioContextClass;
    button.classList.toggle('is-muted', off);
    button.setAttribute('aria-pressed', String(!off));
    button.setAttribute('aria-label', off ? '배경음악 켜기' : '배경음악 끄기');
    button.title = AudioContextClass ? (off ? '배경음악 켜기' : '배경음악 끄기') : '이 브라우저는 배경음악을 지원하지 않습니다';
    const icon = button.querySelector('[data-bgm-icon]');
    if (icon) {
      icon.textContent = off ? '♪×' : '♪';
    }
  }

  function unlock() {
    if (muted || !ensureContext()) {
      updateButton();
      return;
    }
    context.resume().then(function () {
      unlocked = true;
      startTheme(requestedTheme);
    });
  }

  function setMuted(value) {
    muted = Boolean(value);
    saveMuted();

    if (muted) {
      stopScheduler();
      if (context && master) {
        const now = context.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      }
    } else {
      activeTheme = '';
      unlock();
    }
    updateButton();
  }

  setup.bgm = {
    sync: function () {
      requestedTheme = chooseTheme();
      document.documentElement.dataset.bgmTheme = requestedTheme;
      if (unlocked && !muted) {
        startTheme(requestedTheme);
      }
      updateButton();
    },
    unlock: unlock,
    toggle: function () {
      setMuted(!muted);
    },
    isMuted: function () {
      return muted;
    },
    currentTheme: function () {
      return requestedTheme;
    }
  };

  $(document).one('pointerdown.bgm keydown.bgm', function () {
    unlock();
  });
}());
