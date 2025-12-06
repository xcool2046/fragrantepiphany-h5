# Missing Perfume Mapping Link Text

## Issue Description
During the verification of interpretation logic in `master (3).xlsx`, a data gap was identified regarding the "Perfume Mapping Link Text" (referred to as "Part 2" or "Mapping文案" in the logic).

The interpretation logic for the result page consists of three parts (as described in the `Logic` sheet):
1.  **Objective Perfume Info**: From `Perfume master` sheet (Brand, Name, Tags).
2.  **Link back to Present Card**: From `Perfume+卡 mapping` sheet. **<-- MISSING**
3.  **Inspirational Sentence**: From `Logic` sheet rule (Card + Q4 Answer).

Currently, the database tables (`tarot_interpretations` and `perfumes`) **DO NOT** contain the text from Part 2.

## Source of Truth
*   **File**: `master (3).xlsx`
*   **Sheet**: `Perfume+卡 mapping`
*   **Data Structure**:
    *   Columns: `卡牌/氣息` (Card Name), `UNIQUE ID` (Perfume ID), `Q2A`, `文案` (Link Text for A), `Q2B`...
    *   Example (The Fool + 20 (Gucci) + A):
        > "你正站在全新的起点，内心涌动着对未知的憧憬与不羁的自由。Gucci的「气味记忆」与这份心境共鸣..."

## Verification Findings
*   Executed scripts `verify_tarot_logic.ts` and analyzed `verify_fool_result.txt`.
*   **Result**: The `tarot_interpretations` table contains the standard card meanings (`interpretation_zh`) but lacks this specific perfume-to-card connection text.
*   **Result**: The `perfumes` table contains product info but no narrative connection to cards.

## Impact
*   **User Experience**: The result page interpretation will lack the crucial "bridge" text that connects the user's specific perfume result back to their drawn Tarot card. The interpretation may feel disjointed (Generic Card Info + Generic Perfume Info, without the connecting narrative).

## Recommended Fix
1.  **Database Update**: Add a new column (e.g., `mapping_text` or `link_text`) to the `perfumes` table OR create a new `perfume_card_mappings` table.
    *   *Note*: Since the text depends on the *combination* of Card + Perfume (derived from Q2 choice), a simple column on `perfumes` might change depending on which card led to it?
    *   *Correction*: The mapping sheet links `Card Name` + `Unique ID` -> `Text`.
        *   Wait, one perfume can be linked to multiple cards? Or is it 1-to-1 per Choice A/B/C/D?
        *   Structure: Card Name (Row) -> Unique ID (Col A, B, C, D).
        *   So yes, the text is unique to the **Card + Perfume** pair.
2.  **Import Script**: Create a script to read `Perfume+卡 mapping` from `master (3).xlsx` and populate this new storage.
