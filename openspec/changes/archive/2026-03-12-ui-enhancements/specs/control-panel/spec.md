## MODIFIED Requirements

### Requirement: Time signature control
The system SHALL provide separate inputs for the time signature numerator (beats per measure, 1–16, default 4) and denominator (beat unit, selectable from 2/4/8/16, default 4). Changes to these inputs SHALL NOT take effect until the user clicks the Apply button.

#### Scenario: Default time signature
- **WHEN** the page loads
- **THEN** time signature SHALL display as 4/4

#### Scenario: Denominator options
- **WHEN** user opens the denominator selector
- **THEN** available options SHALL be 2, 4, 8, and 16 only

#### Scenario: Time signature change during playback
- **WHEN** user changes the time signature and clicks Apply while playback is active
- **THEN** the new value SHALL take effect at the start of the next measure

### Requirement: Measures per loop control
The system SHALL provide an input for total measures per loop, accepting integers from 1 to 64, default 8. Changes SHALL NOT take effect until the user clicks the Apply button.

#### Scenario: Valid measures input
- **WHEN** user sets measures to 16 and clicks Apply
- **THEN** the grid SHALL display 16 cells on next playback start

#### Scenario: Measures change during playback
- **WHEN** user changes total measures and clicks Apply while playback is active
- **THEN** the new value SHALL take effect at the start of the next loop

### Requirement: Loop count control
The system SHALL provide an input for loop count, accepting integers from 1 to 99 or an infinity (∞) option for endless looping. Default SHALL be 4. Changes SHALL NOT take effect until the user clicks the Apply button.

#### Scenario: Finite loop count
- **WHEN** loop count is set to 4 and Applied
- **THEN** playback SHALL stop automatically after 4 complete loops

#### Scenario: Infinite loop
- **WHEN** loop count is set to ∞ and Applied
- **THEN** playback SHALL continue indefinitely until the user presses Stop

## ADDED Requirements

### Requirement: Apply button triggers structural setting changes
The system SHALL provide an "套用結構設定" button that commits pending changes to beatsPerMeasure, beatUnit, totalMeasures, and loopCount. BPM changes SHALL continue to take effect immediately without requiring the Apply button.

#### Scenario: Apply during idle
- **WHEN** user modifies structural settings and clicks Apply while not playing
- **THEN** all pending values SHALL be written to state immediately and the beat-dots array SHALL be rebuilt

#### Scenario: Apply during playback
- **WHEN** user modifies structural settings and clicks Apply while playing
- **THEN** the changes SHALL be written to pendingChanges and applied at the next measure/loop boundary

### Requirement: Apply button shows dirty state when changes are pending
When the user modifies any structural setting (beatsPerMeasure, beatUnit, totalMeasures, loopCount) without yet clicking Apply, the Apply button SHALL change to an orange color and update its label to indicate pending changes.

#### Scenario: Dirty state activated
- **WHEN** user changes beatsPerMeasure, beatUnit, totalMeasures, or loopCount
- **THEN** the Apply button SHALL turn orange and display text indicating unsaved changes

#### Scenario: Dirty state cleared after Apply
- **WHEN** user clicks the Apply button
- **THEN** the Apply button SHALL return to its default appearance
