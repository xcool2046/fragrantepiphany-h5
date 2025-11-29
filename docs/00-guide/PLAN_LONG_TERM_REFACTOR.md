# Project Refactor & Upgrade Plan (Long Term)

**Objective**: Refactor the interpretation logic to ensure commercial security, fix content display errors, remove hardcoding, and upgrade the UI to the V3 "Starry Dome" design.

## 🚨 Current Critical Issues
1.  **Commercial Logic Failure**: Full reading (Past/Present/Future) is returned and displayed for free users. Payment wall is visual-only.
2.  **Content Mismatch**: "Free" section shows everything mixed together. "Paid" section shows placeholder text instead of real card data.
3.  **Hardcoding**: Prices (`$5.00`) and text are hardcoded in frontend components.
4.  **UI/UX**: Unlocked state simply removes a blur but reveals placeholder text, not actual insights.

---

## 📅 Phase 1: Backend Refactoring (Security & Structure)
**Goal**: Provide structured, secure data where paid content is only available after verification.

1.  **Modify `InterpretationController`**:
    *   Rename/Refactor `matchRule` to a more semantic endpoint, e.g., `POST /api/interp/reading`.
    *   **Input**: `{ card_indices: number[], answers: any, orderId?: string, language: string }`.
    *   **Logic**:
        *   Fetch 3 interpretations (Past, Present, Future).
        *   Check `Order` status if `orderId` is provided.
        *   **Security Rule**: If `status != 'succeeded'`, mask or omit the `interpretation` text for Present and Future cards. Return `is_locked: true` flag.
    *   **Output**:
        ```json
        {
          "past": { "card": "...", "interpretation": "Real Text", "is_locked": false },
          "present": { "card": "...", "interpretation": "Masked/Null if unpaid", "is_locked": true/false },
          "future": { "card": "...", "interpretation": "Masked/Null if unpaid", "is_locked": true/false }
        }
        ```

## 🎨 Phase 2: Frontend Logic Fix
**Goal**: Bind UI correctly to the new structured data.

1.  **Update `api.ts`**: Reflect new API structure.
2.  **Refactor `Result.tsx`**:
    *   Remove local state logic that relied on the old "synthetic rule string".
    *   **Top Section (Past)**: Display `data.past.interpretation`.
    *   **Bottom Section (Present/Future)**:
        *   If `data.present.is_locked`, show a summary or "Locked" message (not fake text).
        *   If unlocked, show `data.present.interpretation`.
    *   **Payment Flow**: Ensure `orderId` is passed to the API after payment callback to fetch unlocked data.

## 🛠 Phase 3: Configuration & Cleanup
**Goal**: Remove hardcoded values.

1.  **Price Configuration**:
    *   Fetch price from Backend or use Env var (VITE_STRIPE_PRICE_DISPLAY).
2.  **Text Externalization**:
    *   Move remaining hardcoded UI strings to `locales/*.json`.

## ✨ Phase 4: UI V3 Upgrade (The Starry Dome)
**Goal**: Implement the "Hemispherical Star Field" design.

1.  **Layout Overhaul**:
    *   Split screen: Goddess (Top) / Starry Dome (Bottom).
    *   Implement CSS `radial-gradient` or `border-radius` for the dome.
2.  **Button Stack**:
    *   Center "Unlock/Start" button in the dome.
    *   Place "Learn More" text button below the main button.
3.  **Animation**:
    *   Refine card reveal animations to happen *inside* or *above* the dome context.

---

## ✅ Verification Plan
*   **Security**: Call API without `orderId` -> Verify Present/Future text is missing/masked.
*   **Payment**: Complete test payment -> Verify API returns full text -> Verify UI displays it.
*   **UI**: Verify V3 layout responsiveness and visual hierarchy.
