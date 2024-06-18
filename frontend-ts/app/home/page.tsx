// "use client";
// import Dashboard from "./components/Dashboard";
import { getHumeAccessToken } from "@/lib/getHumeAccessToken";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/app/components/Chat"), {
    ssr: false,
});

export default async function Home() {
    const accessToken = await getHumeAccessToken();

    if (!accessToken) {
        throw new Error();
    }

    return (
        <div className="flex sm:flex-row flex-col gap-2 sm:h-[70%] h-full">
            <Chat accessToken={accessToken} />
        </div>
    );
}
