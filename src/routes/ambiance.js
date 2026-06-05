const express = require("express");
const { Measurement } = require("../models/measurement");
const Observation = require("../models/observation");

const router = express.Router();

router.get("/ambiance/:location", async (req, res) => {

    try {

        const { location } = req.params;

        const measurements = await Measurement.find({ location });
        const observations = await Observation.find({ location });

        if (measurements.length === 0 && observations.length === 0) {
            return res.status(404).json({
                error: "Location not found"
            });
        }

        const averageNoise =
            measurements.length > 0
                ? measurements.reduce(
                    (sum, measurement) => sum + measurement.value,
                    0
                ) / measurements.length
                : null;

        let noiseLevel = "unknown";

        if (averageNoise !== null) {
            if (averageNoise < 35) {
                noiseLevel = "quiet";
            } else if (averageNoise < 65) {
                noiseLevel = "moderate";
            } else {
                noiseLevel = "loud";
            }
        }

        const latestObservation =
            observations.length > 0
                ? observations[observations.length - 1]
                : null;

        res.status(200).json({
            location,
            noiseLevel,
            averageNoise,
            vibe: latestObservation?.vibe ?? null,
            proximity: latestObservation?.proximity ?? null,
            measurementsCount: measurements.length,
            observationsCount: observations.length
        });

    } catch (e) {

        res.status(500).json({
            error: e.message
        });

    }

});

module.exports = router;
