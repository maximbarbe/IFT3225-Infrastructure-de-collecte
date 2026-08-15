import { describe, expect, test } from "vitest";
import {
    prepareObservation,
    getLatestObservations
} from "../src/services/observationService.js";


describe("prepareObservation", () => {
    test("normalise la location", () => {
        const result = prepareObservation(
            {
                location: "Montreal",
                proximity: "proche",
                vibe: "calme"
            },
            "user123"
        );

        expect(result.location).toBe("montreal");
    });

    test("ajoute les notes par défaut", () => {
        const result = prepareObservation(
            {
                location: "Montreal",
                proximity: "proche",
                vibe: "calme"
            },
            "user123"
        );

        expect(result.notes).toBe("No notes.");
    });

    test("ajoute l'identifiant de l'utilisateur", () => {
        const result = prepareObservation(
            {
                location: "Montreal",
                proximity: "proche",
                vibe: "calme",
                notes: "Très agréable"
            },
            "user123"
        );

        expect(result.userId).toBe("user123");
        expect(result.notes).toBe("Très agréable");
    });
});

describe("getLatestObservations", () => {
    test("retourne les observations les plus récentes", () => {
        const observations = [
            { createdAt: "2026-08-10T10:00:00Z" },
            { createdAt: "2026-08-12T10:00:00Z" },
            { createdAt: "2026-08-11T10:00:00Z" }
        ];

        const result = getLatestObservations(observations, 2);

        expect(result).toHaveLength(2);
        expect(result[0].createdAt).toBe("2026-08-12T10:00:00Z");
        expect(result[1].createdAt).toBe("2026-08-11T10:00:00Z");
    });

    test("retourne au maximum cinq observations par défaut", () => {
        const observations = [
            { createdAt: "2026-08-01T10:00:00Z" },
            { createdAt: "2026-08-02T10:00:00Z" },
            { createdAt: "2026-08-03T10:00:00Z" },
            { createdAt: "2026-08-04T10:00:00Z" },
            { createdAt: "2026-08-05T10:00:00Z" },
            { createdAt: "2026-08-06T10:00:00Z" }
        ];

        expect(getLatestObservations(observations)).toHaveLength(5);
    });

    test("ne modifie pas le tableau original", () => {
        const observations = [
            { createdAt: "2026-08-10T10:00:00Z" },
            { createdAt: "2026-08-12T10:00:00Z" }
        ];

        const original = [...observations];

        getLatestObservations(observations);

        expect(observations).toEqual(original);
    });
});
