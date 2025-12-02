# Implementation Plan - Dynamic Questionnaire

## Goal
Transition from hardcoded questions in the frontend to fetching dynamic questions from the backend database. This ensures the frontend always reflects the server-side configuration and enables correct rule matching.

## User Review Required
> [!IMPORTANT]
> This change assumes the backend database (`questions` table) is populated with data. If the table is empty, the questionnaire will show no questions.
> The `submit` endpoint in `QuestionnaireController` is currently a stub and does not persist answers. This plan does not change that, but ensures the frontend sends the correct data structure.

## Proposed Changes

### Backend

#### [MODIFY] [questionnaire.module.ts](file:///home/code/h5-web/backend/src/questionnaire/questionnaire.module.ts)
- Import `TypeOrmModule`.
- Register `Question` entity.

#### [MODIFY] [questionnaire.controller.ts](file:///home/code/h5-web/backend/src/questionnaire/questionnaire.controller.ts)
- Inject `Repository<Question>`.
- Add `GET /questions` endpoint.
  - Returns active questions sorted by `weight` ASC, `id` ASC.
  - Returns localized fields (`title_en`, `title_zh`, etc).

### Frontend

#### [MODIFY] [api.ts](file:///home/code/h5-web/frontend/src/api.ts)
- Add `Question` type definition.
- Add `fetchQuestions()` function.

#### [MODIFY] [Question.tsx](file:///home/code/h5-web/frontend/src/pages/Question.tsx)
- Remove hardcoded `QUESTIONS` constant.
- Use `useEffect` to call `fetchQuestions`.
- Render questions dynamically.
- Update `answers` state to use Question ID as key (e.g., `Record<number, string>`).
- Update `submitQuestionnaire` call to send `Record<number, string>`.

#### [MODIFY] [PerfumePage.tsx](file:///home/code/h5-web/frontend/src/components/PerfumePage.tsx)
- Update logic to find the "Scent" answer.
- Strategy: Use the answer to the **first question** (by order) as the trigger for background images, maintaining consistency with the current `q1` logic.

## Verification Plan

### Automated Tests
- None (Manual verification required).

### Manual Verification
1.  Start backend and frontend.
2.  Navigate to `/question`.
3.  Verify questions are loaded (if DB has data).
    - *Self-correction*: Since I don't have a running DB with data in this environment, I might need to seed some mock data or rely on the user to test against their server.
    - **Mitigation**: I will add a fallback in `Question.tsx` or `api.ts` to use mock data if the API fails or returns empty, so the app doesn't break locally.
4.  Complete questionnaire.
5.  Verify `PerfumePage` shows the correct background based on the first answer.
