import webpush from "web-push";

type PushSubscriptionRecord = {
  userId: string;
  endpoint: string;
  subscription: webpush.PushSubscription;
};

const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:support@smajpihub.com";

if (publicKey && privateKey) webpush.setVapidDetails(subject, publicKey, privateKey);

export const pushConfigured = () => Boolean(publicKey && privateKey);
export const getVapidPublicKey = () => publicKey || "";

export const sendPushNotification = async (app: any, userId: string, payload: Record<string, unknown>) => {
  if (!pushConfigured() || !app.locals.pushSubscriptionCollection) return;
  const subscriptions: PushSubscriptionRecord[] = await app.locals.pushSubscriptionCollection.find({ userId }).toArray();
  await Promise.all(subscriptions.map(async (record) => {
    try {
      await webpush.sendNotification(record.subscription, JSON.stringify(payload), { TTL: 86400 });
    } catch (error: any) {
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await app.locals.pushSubscriptionCollection.deleteOne({ endpoint: record.endpoint });
      } else {
        console.error("Push notification delivery failed:", error?.statusCode || error);
      }
    }
  }));
};
