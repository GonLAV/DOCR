/**
 * Centralized Role Permission System
 *
 * Roles:
 *   - admin:                       Full access to everything
 *   - user (has_full_access=true): Full document features, no admin panel
 *   - user (has_full_access=false): Free tier — 1 upload credit, read-only most things
 */

export function getPermissions(user) {
  const isAdmin = user?.role === "admin";
  const hasFullAccess = isAdmin || user?.has_full_access === true;
  const hasCredits = (user?.credits ?? 1) > 0;
  const canUpload = isAdmin || hasFullAccess || hasCredits;

  return {
    // ── Navigation / Pages ──────────────────────────────────────
    canViewDashboard: true,
    canViewDocuments: true,
    canViewUpload: true,
    canViewAnalytics: hasFullAccess,
    canViewReports: hasFullAccess,
    canViewWorkflows: hasFullAccess,
    canViewWorkflowMonitor: hasFullAccess,
    canViewBatchProcessing: hasFullAccess,
    canViewCompare: hasFullAccess,
    canViewExternalSources: isAdmin,
    canViewDocumentTypeConfig: isAdmin,
    canViewPipeline: isAdmin,
    canViewSystemDesign: isAdmin,

    // ── Document Actions ─────────────────────────────────────────
    canUploadDocuments: canUpload,
    canDeleteDocuments: isAdmin,
    canReprocessDocuments: hasFullAccess,
    canExportDocuments: hasFullAccess,
    canViewAllUserDocuments: isAdmin,

    // ── Workflow ─────────────────────────────────────────────────
    canCreateWorkflows: hasFullAccess,
    canEditWorkflows: hasFullAccess,
    canDeleteWorkflows: isAdmin,
    canExecuteWorkflows: hasFullAccess,
    canViewWorkflowOptimization: hasFullAccess,

    // ── Analytics & Reports ──────────────────────────────────────
    canGenerateReports: hasFullAccess,
    canViewDetailedAnalytics: hasFullAccess,
    canExportReports: hasFullAccess,

    // ── Admin Functions ──────────────────────────────────────────
    canManageUsers: isAdmin,
    canConfigureDocumentTypes: isAdmin,
    canManageExternalSources: isAdmin,
    canViewAuditLogs: isAdmin,
    canManageBatchJobs: isAdmin,
    canGrantFullAccess: isAdmin,

    // ── Helpers ──────────────────────────────────────────────────
    isAdmin,
    hasFullAccess,
    hasCredits,
    remainingCredits: user?.credits ?? 1,
  };
}