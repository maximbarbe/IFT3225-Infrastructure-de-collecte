const QUIET_THRESHOLD = 48;
const MODERATE_THRESHOLD = 60;

function classifyNoise(avgDb) {
    if (avgDb === null || avgDb === undefined) {
        return "unknown";
    }

    if (avgDb < QUIET_THRESHOLD) {
        return "calme";
    }

    if (avgDb < MODERATE_THRESHOLD) {
        return "modéré";
    }

    return "animé";
}

function parseWindow(value) {
    if (!value) {
        return null;
    }

    const match = String(value).match(/^(\d+)\s*([smhd])$/);

    if (!match) {
        return null;
    }

    const factors = {
        s: 1000,
        m: 60000,
        h: 3600000,
        d: 86400000
    };

    return parseInt(match[1], 10) * factors[match[2]];
}

function calculateAverageNoise(measurements) {
    if (!measurements || measurements.length === 0) {
        return null;
    }

    return measurements.reduce((sum, measurement) => {
        return sum + measurement.value;
    }, 0) / measurements.length;
}

export {
    classifyNoise,
    parseWindow,
    calculateAverageNoise
};
