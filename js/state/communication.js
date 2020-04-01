/**
 * type Communication =
 *   { type: "nothing" } |
 *   { type: "waiting", code: number, expireAt: number } |
 *   { type: "sending", code: number } |
 *   { type: "requesting", code: number } |
 *   { type: "receiving", clientId: string }
 */

export function isNothing(communication) {
  return communication.type === "nothing";
}

export function isWaiting(communication) {
  return communication.type === "waiting";
}

export function isSending(communication) {
  return communication.type === "sending";
}

export function isRequesting(communication) {
  return communication.type === "requesting";
}

export function isReceiving(communication) {
  return communication.type === "receiving";
}
