type NotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
};

export const createNotification = async (app: any, input: NotificationInput) => {
  if (!input.userId || !app.locals.notificationCollection) return;
  await app.locals.notificationCollection.insertOne({ ...input, read: false, createdAt: new Date() });
};
