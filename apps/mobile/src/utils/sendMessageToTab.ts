// React Native doesn't support browser tabs or messaging like web extensions.
// You can use a custom event emitter, but most likely, you should remove this functionality.

export async function sendMessageToTab(_message: any) {
  // No-op on mobile
}

export async function sendMessageToAllTabs(_message: any) {
  // No-op on mobile
}
