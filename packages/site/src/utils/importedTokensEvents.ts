type Subscriber = () => void;

const subscribers = new Set<Subscriber>();

export const subscribeImportedTokens = (subscriber: Subscriber) => {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
};

export const notifyImportedTokensUpdated = () => {
  subscribers.forEach((subscriber) => {
    try {
      subscriber();
    } catch (error) {
      void error;
    }
  });
};
