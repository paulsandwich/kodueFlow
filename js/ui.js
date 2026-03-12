// ── UI Layer ──
// Depends on scheduler.js (audioCtx, audioFallback, beatQueue, schedulerInit)
// Depends on metronome.js (metronomeState, pendingChanges, getBeatDuration,
//                          metronomeStart, metronomeStop)

// RAF loop handle
var rafId = null;

// DOM refs
var dotsEl, gridEl, dashMeasureEl, dashLoopEl, dashBpmEl;
var bpmInput, beatsInput, beatUnitSelect, measuresInput;
var loopCountInput, infiniteCheck, subdivCheck, subdivValueSelect;
var startStopBtn, applyBtn, warningBanner;

// Apply button dirty state
var isDirty = false;
var pendingUI = {};

// Task 3.1: Render N beat dots matching beatsPerMeasure
function renderBeatDots(beatsPerMeasure) {
  dotsEl.innerHTML = '';
  for (var i = 0; i < beatsPerMeasure; i++) {
    var dot = document.createElement('div');
    dot.className = 'beat-dot' + (i === 0 ? ' downbeat' : '');
    dotsEl.appendChild(dot);
  }
}

// Task 3.3: Animate the dot at beatNumber position
function animateBeat(beatNumber, isDownbeat) {
  var dot = dotsEl.children[beatNumber];
  if (!dot) return;

  var beatDurMs = getBeatDuration() * 1000;
  var animDur   = Math.min(Math.max(beatDurMs * 0.3, 50), 300);

  if (isDownbeat) {
    dot.style.transform       = 'scale(1.6)';
    dot.style.backgroundColor = '#3730a3';
    dot.style.boxShadow       = '0 0 24px rgba(55,48,163,0.7)';
  } else {
    dot.style.transform       = 'scale(1.45)';
    dot.style.backgroundColor = '#5a67d8';
    dot.style.boxShadow       = '0 0 16px rgba(90,103,216,0.6)';
  }

  setTimeout(function() {
    dot.style.transform       = 'scale(1)';
    dot.style.backgroundColor = '';
    dot.style.boxShadow       = 'none';
  }, animDur);
}

// Update measure grid cells
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

    // Set columns and exact width so grid doesn't stretch full container
    var cols = Math.min(totalMeasures, 8);
    var cellW = 40, gap = 6, pad = 8;
    gridEl.style.gridTemplateColumns = 'repeat(' + cols + ', ' + cellW + 'px)';
    gridEl.style.width = (cols * cellW + (cols - 1) * gap + pad) + 'px';
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

// Update dashboard text
function updateDashboard(measureNumber, loopNumber) {
  dashMeasureEl.textContent = (measureNumber + 1) + ' / ' + metronomeState.totalMeasures;
  var loopTotal = metronomeState.infiniteLoop ? '∞' : metronomeState.loopCount;
  dashLoopEl.textContent = (loopNumber + 1) + ' / ' + loopTotal;
}

// requestAnimationFrame main loop — drains beatQueue
function startRAF() {
  function loop() {
    var now = audioCtx ? audioCtx.currentTime : performance.now() / 1000;
    var i = 0;
    while (i < beatQueue.length) {
      var entry = beatQueue[i];
      if (entry.beatTime <= now + 0.01) {
        // Task 3.4: pass beatNumber to animateBeat
        animateBeat(entry.beatNumber, entry.isDownbeat);
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

// Reset UI after stop
function resetUI() {
  startStopBtn.textContent = '▶ START';
  startStopBtn.classList.remove('active');
  // Reset all dots to idle
  var dots = dotsEl.querySelectorAll('.beat-dot');
  dots.forEach(function(dot) {
    dot.style.transform       = 'scale(1)';
    dot.style.backgroundColor = '';
    dot.style.boxShadow       = 'none';
  });
  // Clear grid
  updateMeasureGrid(-1, metronomeState.totalMeasures);
  // Reset dashboard
  dashMeasureEl.textContent = '- / ' + metronomeState.totalMeasures;
  var loopTotal = metronomeState.infiniteLoop ? '∞' : metronomeState.loopCount;
  dashLoopEl.textContent = '- / ' + loopTotal;
}

// Natural completion — linger 1s then fade reset
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

// Task 6.3: setDirty — toggle apply button dirty state
function setDirty(flag) {
  isDirty = flag;
  if (flag) {
    applyBtn.classList.add('dirty');
    applyBtn.textContent = '● 有變更，點擊套用';
  } else {
    applyBtn.classList.remove('dirty');
    applyBtn.textContent = '套用結構設定';
  }
}

// Task 6.5: applyStructuralChanges — flush pendingUI to state
function applyStructuralChanges() {
  // Apply each pending value
  if (pendingUI.beatsPerMeasure !== undefined) {
    if (metronomeState.isPlaying) {
      pendingChanges.beatsPerMeasure = pendingUI.beatsPerMeasure;
    } else {
      metronomeState.beatsPerMeasure = pendingUI.beatsPerMeasure;
    }
  }
  if (pendingUI.beatUnit !== undefined) {
    if (metronomeState.isPlaying) {
      pendingChanges.beatUnit = pendingUI.beatUnit;
    } else {
      metronomeState.beatUnit = pendingUI.beatUnit;
    }
  }
  if (pendingUI.totalMeasures !== undefined) {
    if (metronomeState.isPlaying) {
      pendingChanges.totalMeasures = pendingUI.totalMeasures;
    } else {
      metronomeState.totalMeasures = pendingUI.totalMeasures;
      updateMeasureGrid(-1, pendingUI.totalMeasures);
      dashMeasureEl.textContent = '- / ' + pendingUI.totalMeasures;
    }
  }
  if (pendingUI.loopCount !== undefined) {
    if (metronomeState.isPlaying) {
      pendingChanges.loopCount = pendingUI.loopCount;
    } else {
      metronomeState.loopCount = pendingUI.loopCount;
      var loopTotal = metronomeState.infiniteLoop ? '∞' : pendingUI.loopCount;
      dashLoopEl.textContent = '- / ' + loopTotal;
    }
  }

  // Rebuild dots if not playing (if playing, dots rebuild on next measure boundary)
  if (!metronomeState.isPlaying) {
    var beats = pendingUI.beatsPerMeasure !== undefined
      ? pendingUI.beatsPerMeasure
      : metronomeState.beatsPerMeasure;
    renderBeatDots(beats);
  }

  pendingUI = {};
  setDirty(false);
}

// Start/Stop button handler
function onStartStop() {
  if (metronomeState.isPlaying) {
    metronomeStop();
    resetUI();
  } else {
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

// BPM input — immediate effect
function onBpmInput() {
  var raw = parseInt(bpmInput.value);
  if (isNaN(raw)) return;
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
  // BPM — immediate
  bpmInput.addEventListener('input',  onBpmInput);
  bpmInput.addEventListener('change', onBpmInput);
  document.getElementById('bpm-up').addEventListener('click',   function() { changeBpm(1); });
  document.getElementById('bpm-down').addEventListener('click', function() { changeBpm(-1); });

  // Task 6.2: Structural inputs — write to pendingUI, setDirty
  beatsInput.addEventListener('change', function() {
    var val = Math.min(Math.max(parseInt(this.value) || 4, 1), 16);
    this.value = val;
    pendingUI.beatsPerMeasure = val;
    setDirty(true);
  });
  beatUnitSelect.addEventListener('change', function() {
    pendingUI.beatUnit = parseInt(this.value);
    setDirty(true);
  });
  measuresInput.addEventListener('change', function() {
    var val = Math.min(Math.max(parseInt(this.value) || 8, 1), 64);
    this.value = val;
    pendingUI.totalMeasures = val;
    setDirty(true);
  });
  loopCountInput.addEventListener('change', function() {
    var val = Math.min(Math.max(parseInt(this.value) || 4, 1), 99);
    this.value = val;
    pendingUI.loopCount = val;
    setDirty(true);
  });

  // Infinite loop toggle — immediate (not structural)
  infiniteCheck.addEventListener('change', function() {
    metronomeState.infiniteLoop = this.checked;
    loopCountInput.disabled = this.checked;
    var loopTotal = this.checked ? '∞' : metronomeState.loopCount;
    dashLoopEl.textContent = (metronomeState.isPlaying ? dashLoopEl.textContent.split('/')[0] : '- ') + '/ ' + loopTotal;
  });

  // Subdivision — immediate effect
  subdivCheck.addEventListener('change', function() {
    metronomeState.subdivisionEnabled = this.checked;
    subdivValueSelect.disabled = !this.checked;
  });
  subdivValueSelect.addEventListener('change', function() {
    metronomeState.subdivisionValue = parseInt(this.value);
  });

  // Task 6.4: Apply button
  applyBtn.addEventListener('click', applyStructuralChanges);

  // Start/Stop
  startStopBtn.addEventListener('click', onStartStop);
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Grab DOM refs
  dotsEl          = document.getElementById('beat-dots');
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
  applyBtn        = document.getElementById('apply-btn');
  warningBanner   = document.getElementById('warning-banner');

  // Detect Web Audio API support
  schedulerInit();
  if (audioFallback) {
    warningBanner.style.display = 'block';
  }

  // Task 3.5: Initialize beat dots
  renderBeatDots(metronomeState.beatsPerMeasure);

  // Initialize grid
  updateMeasureGrid(-1, metronomeState.totalMeasures);

  // Bind controls
  bindControls();

  // Start RAF loop
  startRAF();
});
