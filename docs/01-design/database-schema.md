# Data Schema & API Contract Discrepancies

## Overview
This document outlines the current discrepancies between the Frontend (Local) and Backend (Server) data structures, specifically regarding the Questionnaire and Interpretation logic.

## Current Status (2025-11-27)

### 1. Questionnaire Mismatch
- **Frontend (`Question.tsx`)**: Hardcodes 6 questions.
- **Backend (`QuestionnaireController` / Database)**:
  - The database schema (`questions` table) exists and is populated.
  - The Frontend has been updated to fetch questions dynamically from `/api/questionnaire/questions`.
  - **Status**: **Resolved**. Frontend and Backend are now aligned.

### 2. Perfume Page Background Logic
- **Requirement**: Display different background images based on the user's "Scent/Atmosphere" preference.
- **Current Implementation**:
  - The `perfumes` table has been created and populated with 168 records.
  - The Frontend dynamically fetches perfume chapters via `/api/perfume/chapters`.
  - Background images are mapped based on the answer to Question 4 (Scent Preference).
  - **Status**: **Resolved**.

## Proposed Solution

### Short Term (Immediate Fix)
- **Frontend**: Bind the visual assets to existing questions (Q1) as a placeholder.
- **Backend**: No changes yet.

### Long Term (Refactor Plan)
1.  **Dynamic Questionnaire**:
    - Frontend should fetch questions from `GET /api/questionnaire/questions`.
    - Backend should serve the questions stored in the database.
    - This ensures the Frontend always renders what the Backend expects.

2.  **Explicit "Scent" Question**:
    - If the product requirement is to choose a scent based on a specific question, that question must be added to the database and served to the frontend.
    - Alternatively, the "Rule Matching" logic should be updated to consider *all* answers, not just the first one.

3.  **API Contract**:
    - Define the exact payload for `POST /api/interp/rule-match`.
    - Define the expected response structure.

## Action Items
- [x] Update `PerfumePage.tsx` to use Q1 answers for background images (Temporary).
- [ ] Confirm with Product/Backend team: What is the exact content of `questions` table on production?
- [ ] Refactor `Question.tsx` to use dynamic data.
