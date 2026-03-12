// ── UI Layer ──
// Depends on scheduler.js (audioCtx, audioFallback, beatQueue, schedulerInit)
// Depends on metronome.js (metronomeState, pendingChanges, getBeatDuration,
//                          metronomeStart, metronomeStop)

// Task 5.1: RAF loop handle
var rafId = null;

// DOM refs
var ballEl, gridEl, dashMeasureEl, dashLoopEl, dashBpmEl;
var bpmInput, beatsInput, beatUnitSelect, measuresInput;
var loopCountInput, infiniteCheck, subdivCheck, subdivValueSelect;
var startStopBtn, warningBanner;

// Task 5.2 + 5.3 + 5.4: Animate beat ball
function animateBeat(isDownbeat) {
  var beatDurMs = getBeatDuration() * 1000;
  var animDur   = Math.min(Math.max(beatDurMs * 0.3, 50), 300);

  if (isDownbeat) {
    // Task 5.3: Downbeat — stronger
    ballEl.style.transform       = 'scale(1.6)';
    ballEl.style.backgroundColor = '#3730a3';
    ballEl.style.boxShadow       = '0 0 24px rgba(55,48,163,0.7)';
  } else {
    // Task 5.4: Regular beat
    ballEl.style.transform       = 'scale(1.45)';
    ballEl.style.backgroundColor = '#5a67d8';
    ballEl.style.boxShadow       = '0 0 16px rgba(90,103,216,0.6)';
  }

  setTimeout(function() {
    ballEl.style.transform       = 'scale(1)';
    ballEl.style.backgroundColor = '#c7d2fe';
    ballEl.style.boxShadow       = 'none';
  }, animDur);
}

// Task 5.5: Update measure grid cells
function updateMeasureGrid(currentMeasure, totalMeasures) {
  var cells = gridEl.querySelectorAll('.measure-cell');

  // Rebuild if cell count changed
  if (cells.length !== totalMeasures) {
    gridEl.innerHTML = '';
    for (var i = 0; i < totalMeasures; i++) {
      var cell = document.createElement('div');
      cell.className = 'measure-cell pending';
      gridEl.appendChild(cell);
    }
    cells = gridEl.querySelectorAll('.measure-cell');
  }

  cells.forEach(function(cell, i) {
    cell.className = 'measure-cell';
    if (currentMeasure < 0) {
      cell.classList.add('pending');
    } else if (i === currentMeasure) {
      cell.classList.add('current');
    } else if (i < currentMeasure) {
      cell.classList.add('completed');
    } else {
      cell.classList.add('pending');
    }
  });
}

// Task 5.6: Update dashboard text
function updateDashboard(measureNumber, loopNumber) {
  dashMeasureEl.textContent = (measureNumber + 1) + ' / ' + metronomeState.totalMeasures;
  var loopTotal = metronomeState.infiniteLoop ? '∞' : metronomeState.loopCount;
  dashLoopEl.textContent = (loopNumber + 1) + ' / ' + loopTotal;
}

// Task 5.1: requestAnimationFrame main loop — drains beatQueue
function startRAF() {
  function loop() {
    var now = audioCtx ? audioCtx.currentTime : performance.now() / 1000;
    var i = 0;
    while (i < beatQueue.length) {
      var entry = beatQueue[i];
      if (entry.beatTime <= now + 0.01) { // small tolerance
        animateBeat(entry.isDownbeat);
        updateDashboard(entry.measureNumber, entry.loopNumber);
        updateMeasureGrid(entry.measureNumber, metronomeState.totalMeasures);
        beatQueue.splice(i, 1);
      } else {
        i++;
      }
    }
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);
}

// Task 5.11: Reset UI after stop
function resetUI() {
  startStopBtn.textContent = '▶ START';
  startStopBtn.classList.remove('active');
  // Reset ball
  ballEl.style.transform       = 'scale(1)';
  ballEl.style.backgroundColor = '#c7d2fe';
  ballEl.style.boxShadow       = 'none';
  // Clear grid
  updateMeasureGrid(-1, metronomeState.totalMeasures);
  // Reset dashboard
  dashMeasureEl.textContent = '- / ' + metronomeState.totalMeasures;
  var loopTotal = metronomeState.infiniteLoop ? '∞' : metronomeState.loopCount;
  dashLoopEl.textContent = '- / ' + loopTotal;
}

// Task 5.12: Natural completion — linger 1s then fade reset
function onNaturalComplete() {
  startStopBtn.textContent = '▶ START';
  startStopBtn.classList.remove('active');
  setTimeout(function() {
    gridEl.classList.add('fade-out');
    setTimeout(function() {
      gridEl.classList.remove('fade-out');
      updateMeasureGrid(-1, metronomeState.totalMeasures);
      dashMeasureEl.textContent = '- / ' + metronomeState.totalMeasures;
      var loopTotal = metronomeState.infiniteLoop ? '∞' : metronomeState.loopCount;
      dashLoopEl.textContent = '- / ' + loopTotal;
    }, 500);
  }, 1000);
}

// Task 5.10: Start/Stop button handler
function onStartStop() {
  if (metronomeState.isPlaying) {
    metronomeStop();
    resetUI();
  } else {
    // Task 2.7: Ensure AudioContext exists (lazy init) and resume
    if (!audioCtx && !audioFallback) {
      schedulerInit();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    startStopBtn.textContent = '⏹ STOP';
    startStopBtn.classList.add('active');
    metronomeStart(onNaturalComplete);
  }
}

// Task 5.7: BPM input — immediate effect
function onBpmInput() {
  var raw = parseInt(bpmInput.value);
  if (isNaN(raw)) return;
  // Task 6.2: Clamp validation
  var val = Math.min(Math.max(raw, 20), 300);
  if (val !== raw) {
    bpmInput.classList.add('out-of-range');
    bpmInput.value = val;
  } else {
    bpmInput.classList.remove('out-of-range');
  }
  metronomeState.bpm = val;
  dashBpmEl.textContent = val;
}

// BPM ▲▼ buttons
function changeBpm(delta) {
  var val = Math.min(Math.max((metronomeState.bpm + delta), 20), 300);
  bpmInput.value = val;
  metronomeState.bpm = val;
  dashBpmEl.textContent = val;
  bpmInput.classList.remove('out-of-range');
}

// Bind all controls
function bindControls() {
  // Task 5.7: BPM
  bpmInput.addEventListener('input',  onBpmInput);
  bpmInput.addEventListener('change', onBpmInput);
  document.getElementById('bpm-up').addEventListener('click',   function() { changeBpm(1); });
  document.getElementById('bpm-down').addEventListener('click', function() { changeBpm(-1); });

  // Task 5.8: Time signature (pending)
  beatsInput.addEventListener('change', function() {
    var val = Math.min(Math.max(parseInt(this.value) || 4, 1), 16);
    this.value = val;
    if (metronomeState.isPlaying) {
      pendingChanges.beatsPerMeasure = val;
    } else {
      metronomeState.beatsPerMeasure = val;
    }
  });
  beatUnitSelect.addEventListener('change', function() {
    var val = parseInt(this.value);
    if (metronomeState.isPlaying) {
      pendingChanges.beatUnit = val;
    } else {
      metronomeState.beatUnit = val;
    }
  });

  // Task 5.8: Measures (pending)
  measuresInput.addEventListener('change', function() {
    var val = Math.min(Math.max(parseInt(this.value) || 8, 1), 64);
    this.value = val;
    if (metronomeState.isPlaying) {
      pendingChanges.totalMeasures = val;
    } else {
      metronomeState.totalMeasures = val;
      updateMeasureGrid(-1, val);
      dashMeasureEl.textContent = '- / ' + val;
    }
  });

  // Task 5.8: Loop count (pending)
  loopCountInput.addEventListener('change', function() {
    var val = Math.min(Math.max(parseInt(this.value) || 4, 1), 99);
    this.value = val;
    if (metronomeState.isPlaying) {
      pendingChanges.loopCount = val;
    } else {
      metronomeState.loopCount = val;
      var loopTotal = metronomeState.infiniteLoop ? '∞' : val;
      dashLoopEl.textContent = '- / ' + loopTotal;
    }
  });

  // Infinite loop toggle
  infiniteCheck.addEventListener('change', function() {
    metronomeState.infiniteLoop = this.checked;
    loopCountInput.disabled = this.checked;
    var loopTotal = this.checked ? '∞' : metronomeState.loopCount;
    dashLoopEl.textContent = (metronomeState.isPlaying ? dashLoopEl.textContent.split('/')[0] : '- ') + '/ ' + loopTotal;
  });

  // Task 5.9: Subdivision — immediate effect
  subdivCheck.addEventListener('change', function() {
    metronomeState.subdivisionEnabled = this.checked;
    subdivValueSelect.disabled = !this.checked;
  });
  subdivValueSelect.addEventListener('change', function() {
    metronomeState.subdivisionValue = parseInt(this.value);
  });

  // Task 5.10: Start/Stop
  startStopBtn.addEventListener('click', onStartStop);
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Grab DOM refs
  ballEl          = document.getElementById('beat-ball');
  gridEl          = document.getElementById('measure-grid');
  dashMeasureEl   = document.getElementById('dash-measure');
  dashLoopEl      = document.getElementById('dash-loop');
  dashBpmEl       = document.getElementById('dash-bpm');
  bpmInput        = document.getElementById('bpm-input');
  beatsInput      = document.getElementById('beats-input');
  beatUnitSelect  = document.getElementById('beat-unit-select');
  measuresInput   = document.getElementById('measures-input');
  loopCountInput  = document.getElementById('loop-count-input');
  infiniteCheck   = document.getElementById('infinite-check');
  subdivCheck     = document.getElementById('subdiv-check');
  subdivValueSelect = document.getElementById('subdiv-value-select');
  startStopBtn    = document.getElementById('start-stop-btn');
  warningBanner   = document.getElementById('warning-banner');

  // Task 6.1: Detect Web Audio API support
  schedulerInit();
  if (audioFallback) {
    warningBanner.style.display = 'block';
  }

  // Initialize grid
  updateMeasureGrid(-1, metronomeState.totalMeasures);

  // Bind controls
  bindControls();

  // Task 5.1: Start RAF loop
  startRAF();
});
