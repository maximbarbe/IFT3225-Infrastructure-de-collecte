import callApi from "./apiCaller";

// Recupere les données d'ambiance pour un lieu
export function getAmbiance(loc, window=null) {
    if (window) {
        return callApi(`/ambiance/${loc}?last=${window}`, "GET", { "Content-Type": "application/json" });
    } else {
        return callApi(`/ambiance/${loc}`, "GET", { "Content-Type": "application/json" });
    }
    
}

export function getQuietHours(loc, window=null) {
    if (window ==  null) {
        return callApi(`/ambiance/${loc}/quiet-hours`, "GET", {"Content-Type": "application/json"});
    } else {
        return callApi(`/ambiance/${loc}/quiet-hours?last=${window}`, "GET", {"Content-Type": "application/json"});
    }
    
}

export function getHistory(loc, window=null) {
    if (window) {
        return callApi(`/ambiance/${loc}/history?last=${window}`, "GET", {"Content-Type": "application/json"});
    } else {
        return callApi(`/ambiance/${loc}/history`, "GET", {"Content-Type": "application/json"});
    }
    
}