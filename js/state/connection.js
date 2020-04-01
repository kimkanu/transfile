/**
 * type Connection = { type: "trying" | "retrying" | "connected", id: string | null, peer: Peer | null }
 */

export function isConnected(connection) {
  return connection.type === "connected";
}
