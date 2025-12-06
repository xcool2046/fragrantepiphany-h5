# Perfume Data Refactoring Walkthrough

## Overview
We successfully refactored the perfume data import process to correct previous corruption and ensure    *   Conclusion: Core card logic is consistent. Perfume data integration needs further review. (Documented in [docs/03-bugs/missing_perfume_mapping_link.md](file:///home/projects/h5/docs/03-bugs/missing_perfume_mapping_link.md))sting English translations and performed a cleanup of invalid data sources.

## Key Changes
1.  **Source of Truth**: Switched to `master (3).xlsx` as the definitive source.
2.  **Schema Parsing**: Updated logic to handle the horizontal schema (Choices A, B, C, D in columns) of `Perfume+卡 mapping`.
3.  **Sorting**: Implemented sequential logic: Card ID (1-78) + Choice (A, B, C, D) -> Sort Order 1-312.

## Card Interpretation Fix (Career Category)
**Issue**: The 'Career' category interpretations were corrupted. Specifically, the 'Strength' card contained the interpretation text for 'Justice'.
**Root Cause**: The source Excel file `assets/excel_files/事业正式.xlsx` had mismatched data (Columns 6-9 contained Justice text for the Strength row).
**Fix**: Replaced the corrupted file with the correct version found in `backend/assets/excel_files/` and re-ran the seed script.

### Verification
**Before (Corrupted)**:
```json
{
  "card_name": "Strength",
  "interpretation_en": "Justice in the future promises 'equilibrium.'..." // INCORRECT
}
```

**After (Fixed)**:
```json
{
  "card_name": "Strength",
  "interpretation_en": "Strength in the future promises 'respect.'..." // CORRECT
}
```

## Legacy Data Cleanup**:
    - **Identification**: Discovered that old English translation JSONs contained descriptions for deprecated Card-Perfume mappings (e.g., "Silver Mountain Water" was described as a Knight card in old data, but is a King card in new data).
    - **Action**: Removed 9 invalid JSON files (`backend/perfume_translations_*.json`, etc.) to prevent data pollution.
    - **Impact**: The system is now clean but lacks English descriptions for the 312 perfume records.

## Verification Results
- **Total Records**: 312 (Complete set: 78 Cards * 4 Choices).
- **Sorting**: Verified sequential order (1 to 312).
- **English Descriptions**: **0% Coverage** (Intentionally cleared).
    - Previous attempts to merge old data were reverted because the content was semantically incorrect for the new card assignments.

## Next Steps
- **Translation**: A new translation effort is required. We need to translate the 312 verified Chinese descriptions from `master (3).xlsx` into English.
- **Deploy**: Once new translations are available, update the import script to ingest the clean data.
