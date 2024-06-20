// types/type.d.ts

declare global {
    interface IUser {
        user_id: string;
        parent_name: string;
        child_name: string;
        child_persona: string;
        child_age: number;
        toy_id: string;
        toy?: IToy;
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

    type BarChartData = Any;

    type PieChartData = {
        id: string;
        label: string;
        value: number;
    };

    interface DataPoint {
        x: string;
        y: number;
    }

    interface HeatMapData {
        id: string;
        data: DataPoint[];
    }

    interface LineChartData {
        id: any;
        name: string;
        data: any;
    }
}

export {}; // This is necessary to make this file a module and avoid TypeScript errors.
