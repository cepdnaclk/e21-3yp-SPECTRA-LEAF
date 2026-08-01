import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const LIVE_BATCH_CHANNEL_ID = 'live-batches';
const LIVE_BATCH_NOTIFICATION_ID = 'spectraleaf-live-batch';

let handlerConfigured = false;

async function prepareNotifications() {
  if (Platform.OS === 'web') return null;

  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(LIVE_BATCH_CHANNEL_ID, {
      name: 'Live batches',
      description: 'Ongoing SpectraLeaf fermentation batch status',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#20C873',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
    });
  }

  return Notifications;
}

export async function requestLiveBatchNotificationAccess() {
  try {
    const Notifications = await prepareNotifications();
    if (!Notifications) return true;

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export async function showLiveBatchNotification(batchId: string, factoryId: string) {
  try {
    const Notifications = await prepareNotifications();
    if (!Notifications || !(await requestLiveBatchNotificationAccess())) return false;

    await Notifications.dismissNotificationAsync(LIVE_BATCH_NOTIFICATION_ID).catch(() => undefined);
    await Notifications.scheduleNotificationAsync({
      identifier: LIVE_BATCH_NOTIFICATION_ID,
      content: {
        title: `Batch ${batchId} is live`,
        body: `${factoryId} fermentation sensor stream is running.`,
        data: { batchId, factoryId, screen: 'Dashboard' },
        color: '#20C873',
        sticky: true,
        autoDismiss: false,
      },
      trigger: Platform.OS === 'android' ? { channelId: LIVE_BATCH_CHANNEL_ID } : null,
    });
    return true;
  } catch {
    return false;
  }
}

export async function hideLiveBatchNotification() {
  try {
    const Notifications = await prepareNotifications();
    if (!Notifications) return;
    await Notifications.dismissNotificationAsync(LIVE_BATCH_NOTIFICATION_ID);
  } catch {
    // The notification may not have been presented yet.
  }
}
