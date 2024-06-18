interface IUser {
    user_id: string;
    parentName: string;
    childName: string;
    childPersona: string;
    childAge: string;
    modules: Module[];
}

interface IConversation {
    conversation_id?: string;
    toy_id: string;
    user_id: string;
    role: string;
    content: string;
    metadata: any;
}

interface IToy {
    toy_id: string;
    name: string;
    humeAiConfigId: string;
    prompt: string;
    imageSrc?: string;
}

type Module = "MATH" | "GENERAL_TRIVIA" | "SPELLING" | "SCIENCE";
