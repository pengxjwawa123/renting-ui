import type { NextPage } from "next";
import Head from "next/head";
import { SwapView } from "../views";
import NotificationList from '../components/Notification';

const Swap: NextPage = (props) => {
    return (
        <div>
            <Head>
                <title>Swap | Pisces Protocol</title>
            </Head>
            <NotificationList />
            <SwapView />
        </div>  
    )
}

export default Swap;