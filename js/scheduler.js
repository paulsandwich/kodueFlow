// ── Audio Engine: Look-ahead Scheduler ──
// Exports globals: audioCtx, audioFallback, beatQueue,
//                  schedulerInit(), scheduleNote(), startScheduler(), stopScheduler()

var SCHEDULER_INTERVAL_MS = 25;
var SCHEDULE_AHEAD_TIME = 0.1; // seconds

var audioCtx = null;
var audioFallback = false;
var schedulerTimer = null;
var beatQueue = [];

var _getState = null;
var _onBeatAdvance = null;

// Task 2.1: Init AudioContext, detect support
function schedulerInit() {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) {
    audioFallback = true;
    return false;
  }
  if (!audioCtx) {
    audioCtx = new AC();
  }
  return true;
}

// Task 2.2: Schedule a single oscillator note at a precise time
function scheduleNote(frequency, duration, time) {
  if (!audioCtx) return;
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.35, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.start(time);
  osc.stop(time + duration + 0.005);
}

// Task 2.3 + 2.4 + 2.5: Look-ahead scheduler
function runScheduler() {
  var state = _getState();
  if (!state.isPlaying) return;

  var now = audioCtx ? audioCtx.currentTime : performance.now() / 1000;
  var scheduleUntil = now + SCHEDULE_AHEAD_TIME;

  while (state.nextBeatTime < scheduleUntil) {
    var beatTime     = state.nextBeatTime;
    var beatNumber   = state.currentBeat;
    var measureNumber = state.currentMeasure;
    var loopNumber   = state.currentLoop;
    var isDownbeat   = (beatNumber === 0);

    // Task 2.4: Schedule beat audio with correct tone
    if (!audioFallback) {
      var freq = isDownbeat ? 880 : 440;
      var dur  = isDownbeat ? 0.06 : 0.04;
      scheduleNote(freq, dur, beatTime);

      // Task 2.5: Subdivision audio only (NOT pushed to beatQueue)
      if (state.subdivisionEnabled && state.subdivisionValue > 1) {
        var beatDur = (60 / state.bpm) * (4 / state.beatUnit);
        for (var i = 1; i < state.subdivisionValue; i++) {
          var subTime = beatTime + (beatDur * i / state.subdivisionValue);
          scheduleNote(220, 0.02, subTime);
        }
      }
    }

    // Task 2.4: Push to beatQueue for UI layer (includes loopNumber)
    beatQueue.push({
      beatTime: beatTime,
      beatNumber: beatNumber,
      measureNumber: measureNumber,
      loopNumber: loopNumber,
      isDownbeat: isDownbeat
    });

    // Advance beat state
    _onBeatAdvance();
  }
}

// Task 2.6: Start scheduler loop
function startScheduler(getState, onBeatAdvance) {
  _getState = getState;
  _onBeatAdvance = onBeatAdvance;
  schedulerTimer = setInterval(runScheduler, SCHEDULER_INTERVAL_MS);
}

// Task 2.6: Stop scheduler loop and clear queue
function stopScheduler() {
  if (schedulerTimer !== null) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  beatQueue.length = 0;
}
