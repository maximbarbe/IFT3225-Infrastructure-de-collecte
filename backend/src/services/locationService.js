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
    // (Jonca33, 2017)
    return [...new Set(locations)];
}


export {
    normalizeLocation,
    getUniqueLocations
};
