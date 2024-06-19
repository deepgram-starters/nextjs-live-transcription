import {
    AssistantTranscriptMessage,
    UserTranscriptMessage,
    useVoice,
} from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React, { useCallback } from "react";
import { constructUserPrompt } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { dbInsertConversation } from "@/db/conversations";
import { Bird } from "lucide-react";

interface StartCallProps {
    selectedUser: IUser | null;
    selectedToy: IToy | null;
}

const StartCall: React.FC<StartCallProps> = ({ selectedUser, selectedToy }) => {
    const {
        status,
        connect,
        lastVoiceMessage,
        lastUserMessage,
        sendUserInput,
        sendAssistantInput,
        sendPauseAssistantMessage,
        sendSessionSettings,
    } = useVoice();
    const supabase = createClientComponentClient();

    const userPrompt = selectedUser
        ? constructUserPrompt(selectedUser)
        : "You are talking to a young child who is 10 years old.";

    const insertConversation = useCallback(
        async (message: AssistantTranscriptMessage | UserTranscriptMessage) => {
            await dbInsertConversation(supabase, {
                toy_id: selectedToy?.toy_id ?? "",
                user_id: selectedUser?.user_id ?? "",
                ...message.message,
                metadata: message.models.prosody,
            });
        },
        [selectedUser, selectedToy, supabase]
    );

    React.useEffect(() => {
        if (lastVoiceMessage) {
            insertConversation(lastVoiceMessage);
            console.log("lastVoiceMessage", lastVoiceMessage);
        }
    }, [lastVoiceMessage, insertConversation]);

    React.useEffect(() => {
        if (lastUserMessage) {
            insertConversation(lastUserMessage);
            console.log("lastUserMessage", lastUserMessage);
        }
    }, [lastUserMessage, insertConversation]);

    return (
        <AnimatePresence>
            <motion.div
                // className={
                //     "fixed inset-0 p-4 flex items-center justify-center bg-background"
                // }
                initial="initial"
                animate="enter"
                exit="exit"
                variants={{
                    initial: { opacity: 0 },
                    enter: { opacity: 1 },
                    exit: { opacity: 0 },
                }}
            >
                <AnimatePresence>
                    <motion.div
                        variants={{
                            initial: { scale: 0.5 },
                            enter: { scale: 1 },
                            exit: { scale: 0.5 },
                        }}
                    >
                        <Button
                            disabled={
                                status.value === "connected" ||
                                !selectedUser ||
                                !selectedToy
                            }
                            className={"z-50 flex items-center gap-1.5"}
                            onClick={() => {
                                connect()
                                    .then(() => {
                                        // sendSessionSettings({
                                        //     systemPrompt: userPrompt,
                                        // });
                                        sendUserInput(
                                            `My name is ${selectedUser?.child_name}`
                                        );
                                    })
                                    .catch(() => {})
                                    .finally(() => {});
                            }}
                            size="sm"
                        >
                            <span>
                                <Bird
                                    size={16}
                                    strokeWidth={3}
                                    stroke={"currentColor"}
                                />
                            </span>
                            <span className="text-md font-semibold">Talk</span>
                        </Button>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};

export default StartCall;
