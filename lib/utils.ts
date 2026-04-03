import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function stepsToDistance(steps: number): number {
    return parseFloat((steps * 0.78).toFixed(2));
}

export function stepsToCalories(steps: number): number {
    return parseFloat((steps * 0.04).toFixed(1));
}

export function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}
