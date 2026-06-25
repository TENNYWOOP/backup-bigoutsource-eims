import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

export function GlobalNotifications() {
  const { user } = useAuth();

  // Listen to audit_logs for push notifications
  useRealtimeSubscription({
    table: 'audit_logs',
    event: 'INSERT',
    enabled: !!user?.uid,
    onChange: (payload) => {
      const log = payload.new;
      if (!log || log.user_id === user?.uid || !log.action) return; // Don't notify self, and ensure action exists

      // Format notification text based on action
      const actionName = String(log.action).replace(/\./g, ' ').toUpperCase();
      
      let message = `${log.user_name || 'Someone'} performed: ${actionName}`;
      
      if (log.action === 'employee.created') {
        message = `${log.user_name || 'Someone'} added a new employee.`;
        toast.success(message, { icon: '👤' });
      } else if (log.action === 'account.disabled') {
        message = `${log.user_name || 'Someone'} disabled an account.`;
        toast.error(message, { icon: '🚫' });
      } else if (log.action === 'employee.archived') {
        message = `${log.user_name || 'Someone'} archived an employee.`;
        toast.error(message, { icon: '📦' });
      } else if (log.action.includes('created') || log.action.includes('added')) {
        toast.success(message);
      } else if (log.action.includes('deleted') || log.action.includes('removed')) {
        toast.error(message);
      } else {
        // Optional: comment out below if too noisy
        // toast(message);
      }
    }
  });

  return null; // This component doesn't render anything visually itself
}
