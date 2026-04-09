# Frontend Tasks and Backlog

This is the active technical backlog for frontend stabilization and migration completion.

## P0 - Critical Alignment

1. **Migrate signup to shared API client**
   - Replace legacy `apiService.signup` usage in `src/pages/Signup.tsx`
   - Align request body and response parsing with backend envelope
   - Add error handling parity with login flow

2. **Resolve audit log endpoint source of truth**
   - Align `ROUTES.admin.auditLogs` and `auditLogsApi` usage
   - Confirm backend controller path and remove duplicate conventions

3. **Remove hardcoded legacy base URL from active paths**
   - Identify whether `src/services/api.ts` is still required for transition pages
   - If required, switch to env-based base URL
   - If not required, mark for decommission in transition cleanup

## P1 - Guard and Contract Reliability

4. **Add tests for route guards**
   - `AdminRouteGuard`: unauthenticated, non-admin, admin
   - `ProtectedRoute`: unauthenticated redirect behavior

5. **Add parser tests for API response handling**
   - Success envelope
   - JSON error body
   - Empty-body gateway errors
   - 401 auto-logout behavior

6. **Standardize admin query key conventions**
   - Define a shared key factory
   - Refactor page-level ad-hoc keys to shared format

## P1 - Legacy Transition Completion

7. **Finalize legacy functionality audit**
   - Validate each `/legacy/*` page against current backend routes
   - Set `DeprecationBanner` variant to `unavailable` for broken pages
   - Document audit result in deprecation register

8. **Add clear replacement links on legacy pages**
   - Where admin alternatives exist, provide user navigation hint

9. **Add legacy usage telemetry for removal confidence**
   - Instrument `/legacy/*` page-load metric OR provide equivalent gateway log measurement
   - Track trend to support decommission decision

## P2 - UX and Maintainability Improvements

10. **Increase shared component adoption**
   - Refactor admin pages to use `src/admin/shared/*` consistently
   - Reduce page-specific table and pagination duplication

11. **Add Not Found handling in main router**
     - Add catch-all route in `src/App.tsx`
     - Ensure unknown paths render a safe fallback page

12. **Parameterize Vite proxy target**
     - Move hardcoded proxy host to env-controlled value
     - Document profile-specific setup in `.docs/technical/devops/`

## P3 - Release and Cleanup

13. **Establish minimum CI checks**
     - Lint + build + tests (once test tooling is added)

14. **Legacy decommission plan**
     - Remove `/legacy/*` routes after transition window
     - Remove `src/services/api.ts` and `src/types/api.ts`
     - Remove duplicate redirects no longer required
