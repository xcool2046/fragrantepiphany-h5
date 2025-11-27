# Project Roadmap & Migration Plan

**Last Updated**: 2025-11-27
**Status**: Active Development

---

## 1. Immediate Pending Tasks (待开发任务)

### Task 1: PerfumeAdmin Panel (High Priority)
**Goal**: Build a backend management interface for Perfume data.
-   **Features**:
    -   CRUD for Perfumes (Brand, Name, Notes, Images).
    -   Image Upload.
-   **Tech Stack**: React + React Hook Form + Tailwind.
-   **Estimated Effort**: 5-7 days (Frontend + Backend).

### Task 2: Data Import (Completed)
-   **Status**: ✅ Done
-   **Outcome**: `perfumes` table populated with 168 records from Excel.

### Task 3: Chinese Translation (Medium Priority)
**Goal**: Full localization for the Perfume Journey.
-   **Scope**:
    -   Dynamic content (Perfume names, descriptions).
    -   Static UI elements (Navigation, Labels).
-   **Strategy**: Use `i18next` for UI, and potentially dual-column storage (`name_en`, `name_zh`) or dynamic translation keys for DB content.

---

## 2. Long-Term System Migration

### Objective
Establish the Backend Database as the single source of truth, eliminating hardcoded frontend logic.

### Current Status (as of Nov 2025)
| Component | Status | Notes |
| :--- | :--- | :--- |
| **Questions** | 🟢 Aligned | Dynamic fetching implemented. |
| **Perfumes** | 🟢 Aligned | DB populated. |
| **Rules** | 🔴 Pending | Table exists but is empty. Needs seeding. |

### Migration Phases

#### Phase 1: Database Schema & Sync (Done)
-   Server updated with latest migrations.
-   `perfumes` and `rules` tables created.

#### Phase 2: Data Population (In Progress)
-   **Perfumes**: Seeding complete.
-   **Rules**: Need to import rules mapping "Cards + Answers" to "Interpretations".

#### Phase 3: Frontend Deployment (Done)
-   Frontend now queries dynamic APIs.

#### Phase 4: Admin Panel (Next Step)
-   Empower non-devs to manage content via `/admin`.

---

## 3. Future Enhancements
-   **User Accounts**: Persistent history for users.
-   **Payment Integration**: Expand Stripe integration for more products.
-   **Analytics**: Track user journey and drop-off rates.
