export function calculatePublishingSplit(tierPublishingStake: number, producerShareDefault = 50) {
  const platformShare = tierPublishingStake;
  const producerShare = 100 - platformShare;
  // Apply default producer share cap
  return {
    platform: platformShare,
    producer: producerShare
  };
}

