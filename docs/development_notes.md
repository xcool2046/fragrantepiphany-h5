# Development Notes & Pre-launch Checklist

## Features for Testing

### Mock Payment (Unlock Content)
To facilitate testing of the "Result" page without making actual payments, a backdoor parameter is available.

- **Usage**: Append `?mock_pay=true` to the URL.
  - Example: `http://localhost:8080/result?mock_pay=true`
  - If other parameters exist: `http://localhost:8080/result?order_id=123&mock_pay=true`
- **Effect**: Forces the page to display as if payment was successful (unlocks all cards and interpretations).
- **Location**: `frontend/src/pages/Result.tsx`

---

## ⚠️ Pre-launch Security Checklist

Before the official launch (Production Release), **YOU MUST** address the `mock_pay` parameter to prevent unauthorized free access.

### Action Required
Choose one of the following options:

1.  **Disable in Production (Recommended)**
    - Wrap the logic in a dev-only check:
      ```typescript
      if (import.meta.env.DEV && searchParams.get('mock_pay') === 'true') { ... }
      ```
2.  **Change to a Secret Key**
    - Change `true` to a secret string that only admins know:
      ```typescript
      if (searchParams.get('mock_pay') === 'super_secret_admin_key_2025') { ... }
      ```
3.  **Remove Completely**
    - Delete the code block entirely from `Result.tsx`.
