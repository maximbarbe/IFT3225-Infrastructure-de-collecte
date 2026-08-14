import { describe, expect, test } from "vitest";
import {
    classifyNoise,
    parseWindow,
    calculateAverageNoise
} from "../src/services/ambianceService.js";

describe("classifyNoise", () => {
    test("retourne calme pour un niveau inférieur à 48 dB", () => {
        expect(classifyNoise(40)).toBe("calme");
    });

    test("retourne modéré pour un niveau entre 48 et 59 dB", () => {
        expect(classifyNoise(55)).toBe("modéré");
    });

    test("retourne animé pour un niveau supérieur ou égal à 60 dB", () => {
        expect(classifyNoise(65)).toBe("animé");
    });

    test("retourne unknown lorsque la valeur est absente", () => {
        expect(classifyNoise(null)).toBe("unknown");
    });
});

describe("parseWindow", () => {
    test("convertit les heures en millisecondes", () => {
        expect(parseWindow("3h")).toBe(10800000);
    });

    test("convertit les minutes en millisecondes", () => {
        expect(parseWindow("30m")).toBe(1800000);
    });

    test("retourne null pour une fenêtre invalide", () => {
        expect(parseWindow("abc")).toBeNull();
    });

    test("convertit les jours en millisecondes", () => {
        expect(parseWindow("2d")).toBe(172800000);
    });
});

describe("calculateAverageNoise", () => {
    test("calcule la moyenne de plusieurs mesures", () => {
        expect(
            calculateAverageNoise([
                { value: 40 },
                { value: 50 },
                { value: 60 }
            ])
        ).toBe(50);
    });

    test("calcule la moyenne avec deux mesures", () => {
        expect(
            calculateAverageNoise([
                { value: 40 },
                { value: 60 }
            ])
        ).toBe(50);
    });

    test("retourne null lorsqu'il n'y a aucune mesure", () => {
        expect(calculateAverageNoise([])).toBeNull();
    });
});
