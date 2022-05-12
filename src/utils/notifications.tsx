export type Notification = {
  type: "success" | "info" | "error" | "confirm",
  title: "string",
  description?: null | string,
  txid?: string,
  show: boolean,
  id: number,
}

export function notify(newNotification: {
  type?: "success" | "info" | "error" | "confirm",
  title: string,
  description?: string,
  txid?: string,
}) {
}