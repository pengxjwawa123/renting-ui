import create, { State } from "zustand";
import produce from "immer";

export interface NotificationStore extends State {
  notifications: Array<{
    type: string,
    title?:string,
    message?: string,
    description?: string,
    txid?: string,
  }>
  set: (x: any) => void,
}

const useNotificationStore = create<NotificationStore>((set, _get) => ({
  notifications: [],
  set: (fn) => set(produce(fn)),
}))

export default useNotificationStore
