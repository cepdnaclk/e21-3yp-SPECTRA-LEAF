import { useEffect } from 'react';
import { useFermentationState } from '../hooks/useFermentationState';
import {
  hideLiveBatchNotification,
  showLiveBatchNotification,
} from '../lib/liveBatchNotifications';
import { useAuthStore } from '../store/authStore';

export default function LiveBatchNotificationSync() {
  const factoryId = useAuthStore(state => state.factoryId);
  const liveAlertsEnabled = useAuthStore(state => state.liveAlertsEnabled);
  const { state, isLive, loading, supported } = useFermentationState(factoryId, 5_000);

  useEffect(() => {
    if (!liveAlertsEnabled) {
      void hideLiveBatchNotification();
      return;
    }
    if (loading || !supported) return;

    if (isLive && state?.batchId) {
      void showLiveBatchNotification(state.batchId, factoryId);
    } else {
      void hideLiveBatchNotification();
    }
  }, [factoryId, isLive, liveAlertsEnabled, loading, state?.batchId, supported]);

  return null;
}
