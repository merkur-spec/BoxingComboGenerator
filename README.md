# BoxingComboGenerator
This project is a boxing combination generator and round timer, generally designed for users training alone on a boxing heavy bag. It generates unlimited, realistic boxing combinations for the user to practice during the round time. The number of rounds and the duration of each round can be manually set on the settings page.

## Features

- **Stance Selection:** Users select their stance (Southpaw/left-handed or Orthodox/right-handed) on the stance selection page. The chosen stance affects how combinations are generated to suit the user’s stance.

- **Round Timer:**  
  - A 5-second "Get Ready" countdown occurs before the first round, so that the user has time to read the first combination.  
  - Users can generate new combinations during the ready period and during rest periods.  
  - During active round time, the "Generate Combo" button is disabled to ensure uninterrupted training.

- **Combo Generator:**  
  - Generates realistic and feasible boxing combinations following a set of rules to ensure practicality.  
  - Categorizes moves as lead or rear, and separates them into lists: head punches, body punches, body hooks, defensive moves, slips, rolls, and starter moves.  
  - Ensures combinations:  
    - Do not repeat the same move excessively.  
    - Avoid consecutive strikes from the same side beyond allowed limits.  
    - Avoid consecutive defensive moves.  
    - End appropriately and remain within 3–7 moves per combination.

## Implementation Details

- **Frontend:**  
  - Written using HTML, CSS, and JavaScript.  
  - Handles UI for stance selection, settings input, timer countdown, and combo display.  
  - Timer phases: READY → ROUND → REST → ROUND, with sound cues for start/end of rounds.

- **Backend:**  
  - Written in Python using Flask.  
  - Core logic resides in the combination generator.  
  - The `can_add_move` function strictly enforces all boxing rules for realistic combinations.  
  - The `generate_combination` function continuously generates combinations until one meets all rules, ensuring proper starting moves, length, and ending moves.

- **Rules Enforced in Combination Generator:**  
  - Only one body punch per combination to keep it simple for now.   
  - Maximum consecutive lead or rear strikes.  
  - Avoids three identical consecutive strikes.  
  - Restricts certain moves based on previous moves (e.g., uppercuts after rolls, overhands only at the end).  
  - Prevents inefficient sequences like punching from the opposite side immediately after a defensive move.
  - Some of these rules may be subject to updates in the future.

## Usage

1. Open the app and select a stance.  
2. Set the number of rounds, round time, and rest time on the settings page.  
3. Click "Start Session" to begin.  
4. Generate a new combination during ready or rest periods.  
5. Follow the timer and practice each generated combination.

## Deployment

The project is deployed at: [boxingcombogenerator.vercel.app](https://boxingcombogenerator.vercel.app)
