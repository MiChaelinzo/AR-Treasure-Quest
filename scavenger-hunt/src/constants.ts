import { environment } from "./environments/environment";

export const points: Map<string, number> = new Map([
    [environment.id1, 150],
    [environment.id2, 250],
    [environment.id3, 500],
]);

export const colors: Map<string, string> = new Map([
    [environment.id1, '#2594f8'],
    [environment.id2, '#e7335f'],
    [environment.id3, '#faa300'],
]);

export const colorStrings: Map<string, string> = new Map([
    [environment.id1, 'blue'],
    [environment.id2, 'red'],
    [environment.id3, 'gold'],
]);