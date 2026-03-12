## ADDED Requirements

### Requirement: Beat ball animates on every beat via beatQueue
The system SHALL drive beat ball animation exclusively by consuming entries from `beatQueue` inside a `requestAnimationFrame` loop. The loop SHALL drain all entries where `beatTime <= audioContext.currentTime` each frame.

#### Scenario: Normal beat animation trigger
- **WHEN** the rAF loop finds a beatQueue entry with `beatTime <= audioContext.currentTime`
- **THEN** the beat ball SHALL immediately begin its animation and the entry SHALL be removed from the queue

#### Scenario: No animation when queue is empty
- **WHEN** `beatQueue` is empty
- **THEN** the beat ball SHALL remain in its idle state

### Requirement: Beat ball idle state
In idle state the beat ball SHALL be a circle of approximately 30px diameter with background color `#c7d2fe` (light indigo) and no glow shadow.

#### Scenario: Idle appearance
- **WHEN** no beat is being triggered
- **THEN** ball color SHALL be `#c7d2fe`, scale SHALL be 1.0, box-shadow SHALL be none

### Requirement: Regular beat animation
On a non-downbeat trigger, the ball SHALL animate from scale 1.0 to scale 1.45, color SHALL transition to `#5a67d8`, and a glow shadow SHALL appear. The animation SHALL return to idle after the animation duration.

#### Scenario: Regular beat visual
- **WHEN** a non-downbeat entry is consumed from beatQueue
- **THEN** ball SHALL scale to 1.45 and color SHALL become `#5a67d8` with glow, then return to idle

### Requirement: Downbeat animation is visually stronger
On a downbeat trigger (`isDownbeat: true`), the ball SHALL animate to scale 1.6 and color `#3730a3` with an intensified glow, distinguishable from a regular beat.

#### Scenario: Downbeat visual
- **WHEN** a beatQueue entry with `isDownbeat: true` is consumed
- **THEN** ball SHALL scale to 1.6 and color SHALL become `#3730a3` with stronger glow than a regular beat

### Requirement: Animation duration is clamped
Animation duration SHALL be 30% of the current beat duration, clamped to a minimum of 50ms and a maximum of 300ms.

#### Scenario: Fast tempo clamp
- **WHEN** 30% of beat duration is less than 50ms (e.g., 300 BPM + beatUnit 8)
- **THEN** animation duration SHALL be 50ms

#### Scenario: Slow tempo clamp
- **WHEN** 30% of beat duration exceeds 300ms (e.g., 20 BPM)
- **THEN** animation duration SHALL be 300ms

### Requirement: Subdivision ticks do not animate the beat ball
Subdivision ticks SHALL produce audio only. The beat ball SHALL NOT animate on subdivision ticks.

#### Scenario: Subdivision tick fires
- **WHEN** subdivision is enabled and a sub-tick fires between beats
- **THEN** the beat ball SHALL remain in its current state without any scale or color change

### Requirement: Dashboard displays real-time playback state
The visualizer SHALL display a dashboard showing current BPM, current measure (1-indexed display of 0-indexed `currentMeasure`), total measures, current loop (1-indexed display), and total loops.

#### Scenario: Dashboard during playback
- **WHEN** playback is active and on measure 3 of 8, loop 2 of 4
- **THEN** dashboard SHALL show "MEASURE 3 / 8" and "LOOP 2 / 4"
