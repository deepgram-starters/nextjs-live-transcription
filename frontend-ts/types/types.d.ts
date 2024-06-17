interface IUser {
    id: string;
    parentName: string;
    childName: string;
    childPersona: string;
    childAge: string;
    modules: Module[];
}

interface IToy {
    id: string;
    name: string;
    humeAiConfigId: string;
    prompt: string;
    imageSrc?: string;
}

type Module = "MATH" | "GENERAL_TRIVIA" | "SPELLING" | "SCIENCE";
