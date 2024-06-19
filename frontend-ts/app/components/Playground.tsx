"use client";

import { ComponentRef, useRef } from "react";
import ChildPlayground from "./ChildPlayground";
import Messages from "./Messages";
import { VoiceProvider } from "@humeai/voice-react";
import Controls from "./Controls";
import StartCall from "./StartCall";

interface PlaygroundProps {
    selectedUser: IUser;
    selectedToy: IToy;
    accessToken: string;
}

const Playground: React.FC<PlaygroundProps> = ({
    selectedUser,
    selectedToy,
    accessToken,
}) => {
    const timeout = useRef<number | null>(null);
    const ref: any = useRef<ComponentRef<typeof Messages> | null>(null);

    return (
        <>
            <VoiceProvider
                auth={{ type: "accessToken", value: accessToken }}
                onMessage={() => {
                    if (timeout.current) {
                        window.clearTimeout(timeout.current);
                    }

                    timeout.current = window.setTimeout(() => {
                        if (ref.current) {
                            const scrollHeight = ref.current.scrollHeight;

                            ref.current.scrollTo({
                                top: scrollHeight,
                                behavior: "smooth",
                            });
                        }
                    }, 200);
                }}
                configId={
                    selectedToy?.hume_ai_config_id ??
                    "6947ac53-5f3b-4499-abc5-f8b368552cb6"
                }
            >
                <div className="flex flex-row items-center gap-4">
                    <h1 className="text-4xl font-semibold">Playground</h1>
                    <StartCall
                        selectedUser={selectedUser}
                        selectedToy={selectedToy}
                    />
                </div>
                <ChildPlayground
                    selectedUser={selectedUser}
                    selectedToy={selectedToy}
                >
                    <Messages
                        ref={ref}
                        selectedUser={selectedUser}
                        selectedToy={selectedToy}
                    />
                    <Controls />
                </ChildPlayground>
            </VoiceProvider>
        </>
    );
};

export default Playground;
