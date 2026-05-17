const CHANNEL_NAME = "notifications:changed";

type Listener = () => void;

const listeners = new Set<Listener>();

let channel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = () => {
    for (const listener of listeners) listener();
  };
}

export function emitNotificationsChanged(): void {
  for (const listener of listeners) listener();
  channel?.postMessage(Date.now());
}

export function subscribeNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return function unsubscribe(): void {
    listeners.delete(listener);
  };
}
