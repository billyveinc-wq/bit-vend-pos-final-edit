/**
 * Account Cleanup Service
 * Handles automatic cleanup of expired account deletions
 *
 * SETUP REQUIRED:
 * To enable account cleanup, you need to:
 * 1. Start the admin server: `node server/admin.js`
 * 2. Set environment variables:
 *    - VITE_ADMIN_SERVER_URL (e.g., http://localhost:8787)
 *    - VITE_ADMIN_API_KEY (secure API key for admin operations)
 *    - SUPABASE_SERVICE_ROLE (for the admin server)
 *
 * Without these, the cleanup service will be disabled.
 */

const ADMIN_SERVER_URL = import.meta.env.VITE_ADMIN_SERVER_URL || 'http://localhost:8787';
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'change-me';

/**
 * Checks if the admin server is available
 */
export async function checkAdminServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ADMIN_SERVER_URL}/admin/list-users`, {
      method: 'GET',
      headers: { 'x-admin-key': ADMIN_API_KEY },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export interface CleanupResult {
  ok: boolean;
  database_cleanup_count: number;
  auth_cleanup_count: number;
  auth_cleanup_errors: Array<{ user_id: string; error: string }>;
  total_processed: number;
}

export interface DeletionStatus {
  is_deleted: boolean;
  deletion_id: number | null;
  deleted_at: string | null;
  scheduled_cleanup_at: string | null;
  days_remaining: number | null;
  cleanup_completed: boolean;
}

/**
 * Runs the cleanup process for expired account deletions
 * This should be called periodically (e.g., daily via cron job)
 */
export async function runAccountCleanup(): Promise<CleanupResult> {
  try {
    const response = await fetch(`${ADMIN_SERVER_URL}/admin/cleanup-expired-deletions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cleanup failed: ${response.status} ${errorText}`);
    }

    const result: CleanupResult = await response.json();

    // Log the cleanup results
    console.log('Account cleanup completed:', {
      database_records_cleaned: result.database_cleanup_count,
      auth_users_cleaned: result.auth_cleanup_count,
      total_processed: result.total_processed,
      errors: result.auth_cleanup_errors,
    });

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Admin server unavailable at ${ADMIN_SERVER_URL}. Please ensure the admin server is running.`);
    }
    console.error('Account cleanup failed:', error);
    throw error;
  }
}

/**
 * Gets the deletion status for a specific user
 */
export async function getAccountDeletionStatus(userId: string): Promise<DeletionStatus> {
  try {
    const response = await fetch(`${ADMIN_SERVER_URL}/admin/deletion-status/${userId}`, {
      method: 'GET',
      headers: {
        'x-admin-key': ADMIN_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get deletion status: ${response.status} ${errorText}`);
    }

    const { status } = await response.json();
    return status;
  } catch (error) {
    console.error('Failed to get account deletion status:', error);
    throw error;
  }
}

/**
 * Soft deletes a user account with 30-day retention
 */
export async function softDeleteUserAccount(userId: string, email?: string): Promise<{
  ok: boolean;
  deletion_id: number;
  retention_days: number;
  message: string;
}> {
  try {
    const response = await fetch(`${ADMIN_SERVER_URL}/admin/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY,
      },
      body: JSON.stringify({
        userId,
        email,
        immediate: false, // Ensure soft delete
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Soft delete failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Soft delete failed:', error);
    throw error;
  }
}

/**
 * Immediately deletes a user account (bypasses 30-day retention)
 * Should only be used in emergency situations
 */
export async function immediateDeleteUserAccount(userId: string): Promise<{ ok: boolean }> {
  try {
    const response = await fetch(`${ADMIN_SERVER_URL}/admin/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY,
      },
      body: JSON.stringify({
        userId,
        immediate: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Immediate delete failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Immediate delete failed:', error);
    throw error;
  }
}

/**
 * Restores a soft-deleted account (within 30 days)
 */
export async function restoreUserAccount(userId: string): Promise<{
  ok: boolean;
  message: string;
  days_remaining_before_restore: number;
}> {
  try {
    const response = await fetch(`${ADMIN_SERVER_URL}/admin/restore-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Restore failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Account restore failed:', error);
    throw error;
  }
}

/**
 * Sets up automatic cleanup to run daily
 * This should be called when the application starts
 */
export function setupAutomaticCleanup(): void {
  // Check if admin server is configured
  if (!ADMIN_SERVER_URL || ADMIN_SERVER_URL === 'http://localhost:8787') {
    console.warn('Admin server not configured - account cleanup disabled');
    return;
  }

  // Run cleanup every 24 hours
  const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Run initial cleanup after 1 minute (to allow app to fully start)
  setTimeout(async () => {
    try {
      const result = await runAccountCleanup();
      console.log('Initial account cleanup completed:', result);
    } catch (error) {
      console.warn('Initial account cleanup failed (admin server unavailable):', error.message);
    }
  }, 60 * 1000);

  // Set up recurring cleanup
  setInterval(async () => {
    try {
      const result = await runAccountCleanup();
      console.log('Scheduled account cleanup completed:', result);
    } catch (error) {
      console.warn('Scheduled account cleanup failed (admin server unavailable):', error.message);
    }
  }, CLEANUP_INTERVAL);

  console.log('Automatic account cleanup scheduled to run every 24 hours');
}

/**
 * Helper function to format time remaining for UI display
 */
export function formatTimeRemaining(daysRemaining: number | null): string {
  if (daysRemaining === null) {
    return 'Unknown';
  }
  
  if (daysRemaining <= 0) {
    return 'Expired';
  }
  
  if (daysRemaining < 1) {
    const hoursRemaining = Math.floor(daysRemaining * 24);
    return `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} remaining`;
  }
  
  const days = Math.floor(daysRemaining);
  return `${days} day${days !== 1 ? 's' : ''} remaining`;
}

/**
 * Helper function to check if an account can still be restored
 */
export function canRestoreAccount(deletionStatus: DeletionStatus): boolean {
  return (
    deletionStatus.is_deleted &&
    !deletionStatus.cleanup_completed &&
    (deletionStatus.days_remaining ?? 0) > 0
  );
}
