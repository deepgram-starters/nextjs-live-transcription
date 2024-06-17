interface IUser {
    id: string;
    parentName: string;
    childName: string;
    childPersona: string;
    childAge: string;
    modules: Module[];
}

type Module = "MATH" | "GENERAL_TRIVIA" | "SPELLING" | "SCIENCE";
