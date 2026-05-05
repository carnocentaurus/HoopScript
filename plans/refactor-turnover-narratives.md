# Plan: Refactor Turnover Narrative Selection

## Objective
Refactor the turnover narrative selection in `src/utils/narrativeEngine.ts` to be fully aware of the three intensity tiers: CLUTCH (0-5), NORMAL (6-9), and BLOWOUT (10+).

## Key Files & Context
- `src/utils/narrativeEngine.ts`: Contains the `TURNOVER_LINES` constant and `getPostGameAnalysis` function.

## Implementation Steps
1.  **Update `TURNOVER_LINES` Constant**:
    - Change `TURNOVER_LINES.WIN` from an array to an object with keys for `blowout`, `normal`, and `clutch`.
    - Populate each key with the new narratives provided:
        - **Blowout**: Minor Speedbumps, Overwhelming Talent, Unstoppable Force.
        - **Normal**: Treading Water, Managing the Mess, Room for Improvement.
        - **Clutch**: Careless but Capable, Escaping the Mess, Playing with Fire.
    - Keep `TURNOVER_LINES.LOSS` as an array (unless intensity-aware loss narratives are provided later).

2.  **Update `getPostGameAnalysis` Function**:
    - Locate the section where turnover narratives are selected.
    - Modify the logic to use `TURNOVER_LINES.WIN[intensity]` when the user wins.
    - Ensure `TURNOVER_LINES.LOSS` is still handled correctly (as it remains an array).

## Verification
1.  **Code Review**: Verify that `TURNOVER_LINES.WIN[intensity]` correctly accesses the subdivided pools.
2.  **Manual Test Simulation**: Simulate games with different score differentials (e.g., 3 pts, 8 pts, 15 pts) and verify that the turnover narrative matches the intensity tier.
