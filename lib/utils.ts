import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function stepsToDistance(steps: number): number {
    // average stride length ~0.78m
    return parseFloat((steps * 0.78).toFixed(2));
}

export function stepsToCalories(steps: number): number {
    // rough estimate: ~0.04 calories per step
    return parseFloat((steps * 0.04).toFixed(1));
}

export function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}
