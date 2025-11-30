# Task: Executing Handoff Instructions

- [ ] Environment Check <!-- id: 0 -->
    - [ ] Verify `backend/.env` contains `JWT_SECRET` <!-- id: 1 -->
- [ ] Data Verification <!-- id: 2 -->
    - [ ] Run migration check `npm run typeorm -- migration:show` <!-- id: 3 -->
- [ ] Rules Data Import (Pending Issue) <!-- id: 4 -->
    - [ ] Investigate `rules` table status <!-- id: 5 -->
    - [ ] Locate source data for rules <!-- id: 6 -->
    - [ ] Create/Run seeding script for rules <!-- id: 7 -->
- [ ] Admin Acceptance <!-- id: 8 -->
    - [x] Verify Global Card Order in Database (Fixed via Content-Based Lookup)
- [x] Verify Frontend State Persistence (Confirmed robust)
- [x] Verify "Unlock" Consistency (Confirmed via data fix)
- [x] Final End-to-End Test (Queen of Swords verified)
- [x] Update Documentation (Added DATA_MAPPING.md)
- [x] Assess Production Impact (Local DB confirmed)

> [!IMPORTANT]
> **Root Cause Found**: 
> 1. **Excel Corruption**: Row labels (Col 0) did not match Content (Col 6+). Fixed via Content-Based Lookup.
> 2. **ID Mismatch**: The `cards` table IDs were 1-based relative to the image order, but the import script used 0-based indexing. This caused an off-by-one error where the Controller fetched the wrong card (e.g., King instead of Queen). Fixed by updating `fix_tarot_data_v2.ts` to use `id: i + 1`.
> **Solution**: Implemented "Content-Based Lookup" and corrected ID indexing. Verified that Index 34 now correctly returns "Queen of Swords" data.
- [/] Deployment <!-- id: 11 -->
    - [/] Deploy updates if necessary <!-- id: 12 -->
    - [ ] Run data fix script on production <!-- id: 13 -->
