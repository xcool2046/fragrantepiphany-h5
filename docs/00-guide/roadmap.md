# Project Roadmap & Migration Plan

**Last Updated**: 2025-11-28
**Status**: Active Development

---

## 1. Immediate Pending Tasks (待开发任务)

### Task 1: PerfumeAdmin Panel (Completed)
**Goal**: Build a backend management interface for Perfume data.
-   **Status**: ✅ Done
-   **Outcome**: Backend API and Frontend Management Page (`/admin/perfumes`) are implemented.

### Task 2: Data Import (Completed)
-   **Status**: ✅ Done
-   **Outcome**: `perfumes` table populated with 168 records from Excel.

### Task 3: Chinese Translation (Completed)
**Goal**: Full localization for the Perfume Journey.
-   **Status**: ✅ Done
-   **Outcome**: UI and Content (Perfume names, descriptions, notes) are fully localized (en/zh).

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
-   **Payment Integration**: Expand Stripe integration for more products.
-   **Analytics**: Track user journey and drop-off rates.
