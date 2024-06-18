interface IUser {
    user_id: string;
    parent_name: string;
    child_name: string;
    child_persona: string;
    child_age: string;
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
    hume_ai_config_id: string;
    prompt: string;
    third_person_prompt: string;
    image_src?: string;
}

type Module = "MATH" | "GENERAL_TRIVIA" | "SPELLING" | "SCIENCE";

type BarChartData = {
    country: string;
    "hot dog": number;
    burger: number;
    sandwich: number;
    kebab: number;
    fries: number;
    donut: number;
};
