## ADDED Requirements

### Requirement: BPM control
The system SHALL provide a BPM input accepting integer values from 20 to 300 inclusive, with increment and decrement buttons (▲▼). Default value SHALL be 120.

#### Scenario: BPM within range
- **WHEN** user enters 120 in the BPM field
- **THEN** the state SHALL update to bpm: 120 immediately

#### Scenario: BPM out of range
- **WHEN** user enters a value outside 20–300
- **THEN** the value SHALL be clamped to the nearest boundary (20 or 300) and the input SHALL reflect the clamped value

#### Scenario: BPM change during playback
- **WHEN** user changes BPM while playback is active
- **THEN** the new BPM SHALL take effect in the next scheduler cycle without stopping playback

### Requirement: Time signature control
The system SHALL provide separate inputs for the time signature numerator (beats per measure, 1–16, default 4) and denominator (beat unit, selectable from 2/4/8/16, default 4).

#### Scenario: Default time signature
- **WHEN** the page loads
- **THEN** time signature SHALL display as 4/4

#### Scenario: Denominator options
- **WHEN** user opens the denominator selector
- **THEN** available options SHALL be 2, 4, 8, and 16 only

#### Scenario: Time signature change during playback
- **WHEN** user changes the time signature while playback is active
- **THEN** the new value SHALL take effect at the start of the next measure

### Requirement: Measures per loop control
The system SHALL provide an input for total measures per loop, accepting integers from 1 to 64, default 8.

#### Scenario: Valid measures input
- **WHEN** user sets measures to 16
- **THEN** the grid SHALL display 16 cells on next playback start

#### Scenario: Measures change during playback
- **WHEN** user changes total measures while playback is active
- **THEN** the new value SHALL take effect at the start of the next loop

### Requirement: Loop count control
The system SHALL provide an input for loop count, accepting integers from 1 to 99 or an infinity (∞) option for endless looping. Default SHALL be 4.

#### Scenario: Finite loop count
- **WHEN** loop count is set to 4
- **THEN** playback SHALL stop automatically after 4 complete loops

#### Scenario: Infinite loop
- **WHEN** loop count is set to ∞
- **THEN** playback SHALL continue indefinitely until the user presses Stop

### Requirement: Subdivision control
The system SHALL provide a toggle to enable subdivision, and when enabled a selector for subdivision value (2, 3, or 4 sub-ticks per beat). Default state SHALL be disabled.

#### Scenario: Subdivision disabled
- **WHEN** subdivision toggle is off
- **THEN** no subdivision audio ticks SHALL be produced

#### Scenario: Subdivision enabled with value 2
- **WHEN** subdivision is enabled and value is 2
- **THEN** the scheduler SHALL produce 2 evenly spaced audio ticks per beat (on-beat tick + 1 mid-beat tick)

#### Scenario: Subdivision change during playback
- **WHEN** user toggles subdivision while playback is active
- **THEN** the change SHALL take effect immediately in the next scheduler cycle

### Requirement: Start / Stop button
The system SHALL provide a single Start/Stop toggle button. Pressing it while idle SHALL begin playback; pressing it while playing SHALL stop playback and reset all counters.

#### Scenario: Start
- **WHEN** user clicks Start while idle
- **THEN** playback SHALL begin from measure 1, beat 1, loop 1

#### Scenario: Stop mid-playback
- **WHEN** user clicks Stop during playback
- **THEN** playback SHALL halt immediately, currentBeat/currentMeasure/currentLoop SHALL reset to 0, and the grid SHALL clear
