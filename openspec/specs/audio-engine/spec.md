# audio-engine

## Purpose

The audio engine is responsible for all beat timing and audio output in KodueFlow. It uses the Web Audio API Look-ahead Scheduler as the sole timing authority, ensuring drift-free playback and communicating scheduled beats to the UI layer via a shared queue.

## Requirements

### Requirement: Look-ahead scheduler drives all beat timing
The system SHALL use a Web Audio API Look-ahead Scheduler as the sole source of beat timing. A `setTimeout` loop firing every `SCHEDULER_INTERVAL_MS = 25` milliseconds SHALL schedule oscillator events within a `SCHEDULE_AHEAD_TIME = 0.1` second look-ahead window using `audioContext.currentTime` as the master clock.

#### Scenario: Scheduler runs while playing
- **WHEN** playback is active
- **THEN** the scheduler fires approximately every 25ms and schedules all beat events whose time falls within the next 100ms

#### Scenario: Scheduler does not drift under CPU load
- **WHEN** the browser tab is under heavy CPU load during playback
- **THEN** beat audio events SHALL still fire at their scheduled `audioContext.currentTime` without accumulating drift

### Requirement: Beat duration accounts for time signature denominator
The system SHALL calculate beat duration as `(60 / bpm) * (4 / beatUnit)` where `beatUnit` is the time signature denominator (2, 4, 8, or 16).

#### Scenario: Quarter-note beat unit at 120 BPM
- **WHEN** BPM is 120 and beatUnit is 4
- **THEN** beat duration SHALL be 0.5 seconds

#### Scenario: Eighth-note beat unit at 120 BPM
- **WHEN** BPM is 120 and beatUnit is 8
- **THEN** beat duration SHALL be 0.25 seconds

### Requirement: Audio tones distinguish beat types
The system SHALL produce distinct tones for each beat type using `OscillatorNode` with `sine` waveform and a rapid decay envelope.

#### Scenario: Downbeat (beat 1 of each measure)
- **WHEN** a downbeat fires
- **THEN** the oscillator SHALL play at 880 Hz for 60ms

#### Scenario: Regular beat
- **WHEN** a non-downbeat beat fires
- **THEN** the oscillator SHALL play at 440 Hz for 40ms

#### Scenario: Subdivision tick
- **WHEN** subdivision is enabled and a sub-tick fires between beats
- **THEN** the oscillator SHALL play at 220 Hz for 20ms

### Requirement: beatQueue communicates scheduled beats to the UI layer
The system SHALL maintain a shared `beatQueue` array. For each scheduled beat, the scheduler SHALL push `{ beatTime, beatNumber, measureNumber, isDownbeat }` onto the queue. Subdivision ticks SHALL NOT be pushed to `beatQueue`.

#### Scenario: Beat entry structure
- **WHEN** a beat is scheduled
- **THEN** the entry SHALL contain `beatTime` (audioContext timestamp), `beatNumber` (0-indexed within measure), `measureNumber` (0-indexed), and `isDownbeat` (boolean)

#### Scenario: Subdivision excluded from queue
- **WHEN** subdivision is enabled and a sub-tick is scheduled
- **THEN** no entry SHALL be added to `beatQueue` for that sub-tick

### Requirement: AudioContext resumed on user gesture
The system SHALL call `audioContext.resume()` when the user initiates playback, satisfying browser autoplay policy without additional user prompts.

#### Scenario: Start button pressed with suspended AudioContext
- **WHEN** the user clicks Start and AudioContext.state is "suspended"
- **THEN** the system SHALL call `audioContext.resume()` before scheduling the first beat

### Requirement: Visual degradation when Web Audio API is unavailable
The system SHALL detect Web Audio API unavailability at page load. If unavailable, audio SHALL be disabled and animation SHALL fall back to `setInterval`-driven timing.

#### Scenario: Browser does not support Web Audio API
- **WHEN** `window.AudioContext` and `window.webkitAudioContext` are both undefined
- **THEN** a warning banner SHALL appear at the top of the page and playback SHALL continue in visual-only mode with approximate timing
