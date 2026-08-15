import { normalizeLocation } from "./locationService.js";

function prepareObservation(data, userId) {
    return {
        ...data,
        location: normalizeLocation(data.location),
        notes: data.notes || "No notes.",
        userId
    };
}

function getLatestObservations(observations, limit = 5) {
    if (!Array.isArray(observations)) {
        return [];
    }

    const validLimit = Number.isInteger(limit) && limit > 0 ? limit : 5;

    return [...observations]
        .sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, validLimit);
}

export {
    prepareObservation,
    getLatestObservations
};
