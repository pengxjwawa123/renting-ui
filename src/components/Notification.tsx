import { useState } from 'react';
import useNotificationStore, { NotificationStore }  from "../hooks/useNotificationStore";
import {
  CheckCircleIcon, InformationCircleIcon, XCircleIcon, XIcon,
} from '@heroicons/react/outline'

const NotificationList = () => {

  const { notifications, set: setNotificationStore } = useNotificationStore(s => s);

  return (
    <div className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-99">
      <div className="flex flex-col w-full">
        {notifications.map((n, idx) => (
          <Notification
            idx={idx}
            key={`${n.message}${idx}`}
            type={n.type}
            message={n.message}
            description={n.description}
            txid={n.txid}
          />
        ))}
      </div>
    </div>
  )
}


const Notification = ({
  type,
  message,
  description,
  txid,
  idx,
}: any) => {
  const [showNotification, setShowNotification] = useState(true);

  if (!showNotification) return null;

  return (
    <div className={`max-w-sm w-full bg-gray-200 shadow-lg rounded-md mt-2 pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden bottom-10 left-10 absolute
                    z-[${idx-999}]`}
    >
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {type === "success" ? (
              <CheckCircleIcon className="n-8 w-8 mr-1 text-success" />
            ) : null}
            {type === "info" && (
              <InformationCircleIcon className="h-8 w-8 mr-1" />
            )}
            {type ==="error" && (
              <XCircleIcon className="h-8 w-8 text-warning" />
            )}
          </div>
            <div className="ml-2 w-0 flex-1">
              {message && (<div className="font-bold">
                {message}
              </div>)}
              {description ? (
                <p className="mt-0.5 text-sm text-black">{description}</p>
              ) : null}
              {txid ? (
                <a
                  href={`https://explorer.solana.com/tx/` + txid}
                  className="text-promary"
                >
                  View transaction {txid.slice(0, 8)}...
                  {txid.slice(txid.length, 8)}
                </a>
              ) : null}
            </div>
            <div className="ml-4 flex-shrink-0 self-start flex">
                <button
                  className="bg-gray-200 default-transition rounded-md inline-flex hover:text-success focus:outline-none"
                  onClick={() => setShowNotification(false)}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationList;