exports.canUploadImages = (subscription) => {
  return subscription.hasFullBackupWithImages == 1;
};

exports.hasOnlineBackup = (subscription) => {
  return subscription.hasOnlineBackup == 1;
};

exports.isUnlimited = (value) => {
  return value === null;
};