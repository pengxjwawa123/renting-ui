import useNotificationStore from "../hooks/useNotificationStore";

export const notify = (newNotification: {
  type?: string,
  title?: string,
  message?: string,
  description?: string,
  txid?: string,
}) => {
  const {
    notifications,
    set: setNotificationStore
  } = useNotificationStore.getState();

  setNotificationStore((state: {notifications: any[]}) => {
    state.notifications = [
      ...notifications,
      { type: 'success', ...newNotification},
    ]
  })
}