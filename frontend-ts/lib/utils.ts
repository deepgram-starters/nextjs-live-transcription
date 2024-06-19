import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const constructUserPrompt = (user: IUser) => {
    return `You are engaging with ${user.child_name} who is ${user.child_age} year old. Here is some more information on ${user.child_name}: ${user.child_persona}`;
};

export const getMessageRoleName = (
    role: string,
    selectedUser: IUser,
    selectedToy: IToy
) => {
    if (role === "user") {
        return selectedUser.child_name;
    } else {
        return selectedToy.name;
    }
};
