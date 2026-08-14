import { describe, expect, test } from "vitest";
import {
    normalizeLocation,
    getUniqueLocations,
    locationExists
} from "../src/services/locationService.js";

describe("normalizeLocation", () => {
    test("convertit une location en minuscules", () => {
        expect(normalizeLocation("Montreal")).toBe("montreal");
    });

    test("convertit une location entièrement en majuscules", () => {
        expect(normalizeLocation("LAVAL")).toBe("laval");
    });

    test("conserve une location déjà normalisée", () => {
        expect(normalizeLocation("longueuil")).toBe("longueuil");
    });
});

describe("getUniqueLocations", () => {
    test("supprime les doublons", () => {
        const observations = [
            { location: "montreal" },
            { location: "montreal" },
            { location: "laval" }
        ];

        expect(getUniqueLocations(observations)).toEqual([
            "montreal",
            "laval"
        ]);
    });

    test("ignore les différences de majuscules", () => {
        const observations = [
            { location: "Montreal" },
            { location: "MONTREAL" },
            { location: "Laval" }
        ];

        expect(getUniqueLocations(observations)).toEqual([
            "montreal",
            "laval"
        ]);
    });

    test("retourne une liste vide lorsqu'il n'y a aucune observation", () => {
        expect(getUniqueLocations([])).toEqual([]);
    });

    test("ignore les observations sans location", () => {
        const observations = [
            { location: "montreal" },
            { vibe: "calme" },
            { location: "laval" }
        ];

        expect(getUniqueLocations(observations)).toEqual([
            "montreal",
            "laval"
        ]);
    });
});

describe("locationExists", () => {
    test("retourne true si la location existe", () => {
        expect(
            locationExists(["montreal", "laval"], "montreal")
        ).toBe(true);
    });

    test("retourne true même avec des majuscules", () => {
        expect(
            locationExists(["montreal", "laval"], "MONTREAL")
        ).toBe(true);
    });

    test("retourne false si la location n'existe pas", () => {
        expect(
            locationExists(["montreal", "laval"], "longueuil")
        ).toBe(false);
    });
});
