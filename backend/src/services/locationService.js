function normalizeLocation(location) {
    return location.toLowerCase();
}

function getUniqueLocations(observations) {
    if (!Array.isArray(observations)) {
        return [];
    }

    const locations = observations
        .filter(observation => observation && observation.location)
        .map(observation => normalizeLocation(observation.location));

    return [...new Set(locations)];
}

function locationExists(locations, location) {
    if (!Array.isArray(locations)) {
        return false;
    }

    const normalizedLocation = normalizeLocation(location);

    return locations.some(
        existingLocation =>
            normalizeLocation(existingLocation) === normalizedLocation
    );
}

export {
    normalizeLocation,
    getUniqueLocations,
    locationExists
};
