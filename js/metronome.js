// ── Metronome State Machine ──
// Depends on scheduler.js (audioCtx, startScheduler, stopScheduler)

// Task 3.1: State object
var metronomeState = {
  bpm: 120,
  beatsPerMeasure: 4,
  beatUnit: 4,
  totalMeasures: 8,
  loopCount: 4,
  infiniteLoop: false,
  subdivisionEnabled: false,
  subdivisionValue: 2,
  // Runtime (0-indexed internally; display adds 1)
  currentBeat: 0,
  currentMeasure: 0,
  currentLoop: 0,
  nextBeatTime: 0,
  isPlaying: false
};

// Task 3.4: Pending changes buffer (flushed at measure/loop boundary)
var pendingChanges = {};

var _onNaturalComplete = null;

// Task 3.2: Beat duration formula
function getBeatDuration() {
  return (60 / metronomeState.bpm) * (4 / metronomeState.beatUnit);
}

// Task 3.3: Advance beat — called by scheduler after each scheduled beat
function advanceBeat() {
  metronomeState.nextBeatTime += getBeatDuration();
  metronomeState.currentBeat++;

  if (metronomeState.currentBeat >= metronomeState.beatsPerMeasure) {
    metronomeState.currentBeat = 0;
    metronomeState.currentMeasure++;

    // Task 3.4: Flush time-signature pending changes at measure boundary
    if (pendingChanges.beatsPerMeasure !== undefined) {
      metronomeState.beatsPerMeasure = pendingChanges.beatsPerMeasure;
      delete pendingChanges.beatsPerMeasure;
    }
    if (pendingChanges.beatUnit !== undefined) {
      metronomeState.beatUnit = pendingChanges.beatUnit;
      delete pendingChanges.beatUnit;
    }

    if (metronomeState.currentMeasure >= metronomeState.totalMeasures) {
      metronomeState.currentMeasure = 0;
      metronomeState.currentLoop++;

      // Flush loop-level pending changes
      if (pendingChanges.totalMeasures !== undefined) {
        metronomeState.totalMeasures = pendingChanges.totalMeasures;
        delete pendingChanges.totalMeasures;
      }
      if (pendingChanges.loopCount !== undefined) {
        metronomeState.loopCount = pendingChanges.loopCount;
        delete pendingChanges.loopCount;
      }

      // Check loop completion
      if (!metronomeState.infiniteLoop && metronomeState.currentLoop >= metronomeState.loopCount) {
        metronomeState.isPlaying = false;
        stopScheduler();
        if (_onNaturalComplete) _onNaturalComplete();
      }
    }
  }
}

// Task 3.5: Start playback
function metronomeStart(onNaturalComplete) {
  _onNaturalComplete = onNaturalComplete;
  metronomeState.currentBeat = 0;
  metronomeState.currentMeasure = 0;
  metronomeState.currentLoop = 0;
  metronomeState.isPlaying = true;

  // Task 2.7: Resume AudioContext (autoplay policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Small offset so first beat doesn't fire immediately
  var now = audioCtx ? audioCtx.currentTime : performance.now() / 1000;
  metronomeState.nextBeatTime = now + 0.05;

  startScheduler(function() { return metronomeState; }, advanceBeat);
}

// Task 3.6: Stop playback and reset counters
function metronomeStop() {
  metronomeState.isPlaying = false;
  metronomeState.currentBeat = 0;
  metronomeState.currentMeasure = 0;
  metronomeState.currentLoop = 0;
  stopScheduler();
}
