# measure-grid

## Purpose

The measure grid provides a visual progress tracker showing all measures in the current loop as a grid of cells, with each cell reflecting whether its measure is current, completed, or pending. It responds to loop boundaries, stops, and natural completion.

## Requirements

### Requirement: Measure grid displays all measures as cells
The system SHALL render one cell per measure in the current loop, arranged in a grid layout. Total cells SHALL equal `totalMeasures`.

#### Scenario: 8-measure grid
- **WHEN** totalMeasures is 8
- **THEN** the grid SHALL display exactly 8 cells

### Requirement: Grid cells reflect measure state
Each cell SHALL visually indicate one of three states: current (active), completed (past), or pending (future).

#### Scenario: Current measure cell
- **WHEN** `currentMeasure` (0-indexed) corresponds to a cell
- **THEN** that cell SHALL be highlighted with filled indigo color (`#5a67d8`)

#### Scenario: Completed measure cell
- **WHEN** a measure's index is less than `currentMeasure`
- **THEN** that cell SHALL display in a secondary/muted color to indicate completion

#### Scenario: Pending measure cell
- **WHEN** a measure's index is greater than `currentMeasure`
- **THEN** that cell SHALL appear empty/gray

### Requirement: Grid resets at loop boundary
When a new loop begins, the grid SHALL reset all cells to pending state and begin highlighting from the first cell.

#### Scenario: Loop advances
- **WHEN** all measures in a loop complete and a new loop starts
- **THEN** all cells SHALL return to pending state and cell 0 SHALL become current

### Requirement: Grid clears on stop
When playback stops (user presses Stop), the grid SHALL immediately clear all cell states and return all cells to the pending appearance.

#### Scenario: Stop pressed mid-loop
- **WHEN** the user presses Stop during playback
- **THEN** all cells SHALL immediately show pending state

### Requirement: Grid lingers briefly on natural completion
When all loops complete naturally (not stopped by user), the grid SHALL maintain its final state for approximately 1 second before fading out and resetting.

#### Scenario: All loops complete
- **WHEN** the final measure of the final loop finishes
- **THEN** the grid SHALL hold its state for ~1 second then fade and reset to all-pending
