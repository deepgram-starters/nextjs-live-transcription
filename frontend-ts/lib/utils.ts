import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const constructUserPrompt = (user: IUser) => {
    return `You are engaging with ${user.childName} who is ${user.childAge} year old. Here is some more information on ${user.childName}: ${user.childPersona}`;
};
