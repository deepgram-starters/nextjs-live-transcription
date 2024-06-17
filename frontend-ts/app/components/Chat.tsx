"use client";

import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useRef, useState } from "react";
import ParentDashboard from "./ParentDashboard";
import ChildPlayground from "./ChildPlayground";

export default function ClientComponent({
    accessToken,
}: {
    accessToken: string;
}) {
    const timeout = useRef<number | null>(null);
    const ref = useRef<ComponentRef<typeof Messages> | null>(null);

    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const chooseUser = (user: IUser) => {
        setSelectedUser(user);
    };
    return (
        <>
            <div className="flex flex-col gap-2 sm:w-1/2 border border-black rounded-md">
                <ParentDashboard
                    chooseUser={chooseUser}
                    selectedUser={selectedUser}
                />
            </div>
            <div className="flex flex-col gap-2 sm:w-1/2 border border-black rounded-md">
                <ChildPlayground selectedUser={selectedUser}>
                    <VoiceProvider
                        auth={{ type: "accessToken", value: accessToken }}
                        onMessage={() => {
                            if (timeout.current) {
                                window.clearTimeout(timeout.current);
                            }

                            timeout.current = window.setTimeout(() => {
                                if (ref.current) {
                                    const scrollHeight =
                                        ref.current.scrollHeight;

                                    ref.current.scrollTo({
                                        top: scrollHeight,
                                        behavior: "smooth",
                                    });
                                }
                            }, 200);
                        }}
                        configId="6947ac53-5f3b-4499-abc5-f8b368552cb6"
                    >
                        <Messages ref={ref} />
                        <Controls />
                        <StartCall />
                    </VoiceProvider>
                </ChildPlayground>
            </div>
        </>
    );

    return (
        <div
            className={
                "relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"
            }
        ></div>
    );
}
