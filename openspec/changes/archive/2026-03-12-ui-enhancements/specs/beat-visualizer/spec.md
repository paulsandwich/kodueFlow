## MODIFIED Requirements

### Requirement: Beat ball animates on every beat via beatQueue
The system SHALL drive beat dot animation exclusively by consuming entries from `beatQueue` inside a `requestAnimationFrame` loop. The loop SHALL drain all entries where `beatTime <= audioContext.currentTime` each frame. The animated element SHALL be the dot at index `beatNumber` within the `.beat-dots` container.

#### Scenario: Normal beat animation trigger
- **WHEN** the rAF loop finds a beatQueue entry with `beatTime <= audioContext.currentTime`
- **THEN** the dot at `beatNumber` position SHALL immediately begin its animation and the entry SHALL be removed from the queue

#### Scenario: No animation when queue is empty
- **WHEN** `beatQueue` is empty
- **THEN** all dots SHALL remain in their idle state

### Requirement: Beat ball idle state
In idle state each beat dot SHALL be a circle with background color `#c7d2fe` (light indigo) and no glow shadow. The downbeat dot (index 0) SHALL be approximately 1.4× larger than regular beat dots.

#### Scenario: Idle appearance
- **WHEN** no beat is being triggered
- **THEN** all dots SHALL show color `#c7d2fe`, scale 1.0, box-shadow none

#### Scenario: Downbeat dot size
- **WHEN** the beat-dots container is rendered
- **THEN** the first dot (index 0) SHALL appear larger than the remaining dots

### Requirement: Regular beat animation
On a non-downbeat trigger, the target dot SHALL animate from scale 1.0 to scale 1.45, color SHALL transition to `#5a67d8`, and a glow shadow SHALL appear. The animation SHALL return to idle after the animation duration.

#### Scenario: Regular beat visual
- **WHEN** a non-downbeat entry is consumed from beatQueue
- **THEN** the dot at `beatNumber` SHALL scale to 1.45 and color SHALL become `#5a67d8` with glow, then return to idle

### Requirement: Downbeat animation is visually stronger
On a downbeat trigger (`isDownbeat: true`), the target dot (index 0) SHALL animate to scale 1.6 and color `#3730a3` with an intensified glow, distinguishable from a regular beat.

#### Scenario: Downbeat visual
- **WHEN** a beatQueue entry with `isDownbeat: true` is consumed
- **THEN** the dot at index 0 SHALL scale to 1.6 and color SHALL become `#3730a3` with stronger glow

### Requirement: Animation duration is clamped
Animation duration SHALL be 30% of the current beat duration, clamped to a minimum of 50ms and a maximum of 300ms.

#### Scenario: Fast tempo clamp
- **WHEN** 30% of beat duration is less than 50ms (e.g., 300 BPM + beatUnit 8)
- **THEN** animation duration SHALL be 50ms

#### Scenario: Slow tempo clamp
- **WHEN** 30% of beat duration exceeds 300ms (e.g., 20 BPM)
- **THEN** animation duration SHALL be 300ms

### Requirement: Subdivision ticks do not animate the beat ball
Subdivision ticks SHALL produce audio only. No dot SHALL animate on subdivision ticks.

#### Scenario: Subdivision tick fires
- **WHEN** subdivision is enabled and a sub-tick fires between beats
- **THEN** all dots SHALL remain in their current state without any scale or color change

### Requirement: Dashboard displays real-time playback state
The visualizer SHALL display a dashboard showing current BPM, current measure (1-indexed display of 0-indexed `currentMeasure`), total measures, current loop (1-indexed display), and total loops.

#### Scenario: Dashboard during playback
- **WHEN** playback is active and on measure 3 of 8, loop 2 of 4
- **THEN** dashboard SHALL show "MEASURE 3 / 8" and "LOOP 2 / 4"

## ADDED Requirements

### Requirement: Beat dots display N dots matching beatsPerMeasure
The system SHALL render exactly `beatsPerMeasure` dots in a horizontal row within `.beat-dots`. When `beatsPerMeasure` changes and is applied, the dot array SHALL be rebuilt to reflect the new count. Dots SHALL wrap to a new row after every 8 dots.

#### Scenario: 4/4 time signature
- **WHEN** beatsPerMeasure is 4
- **THEN** `.beat-dots` SHALL contain exactly 4 dot elements in a horizontal row

#### Scenario: 12 beats wraps to 2 rows
- **WHEN** beatsPerMeasure is 12
- **THEN** `.beat-dots` SHALL show 8 dots on the first row and 4 dots on the second row

#### Scenario: Beat count changes after Apply
- **WHEN** user changes beatsPerMeasure and clicks Apply
- **THEN** the dot array SHALL be rebuilt to the new count before the next playback
