import { useEffect, useRef, useState } from "react";

// Cette fonction a été tirée de la démo 7, puis corrigée sur trois points:
//
//  1. la liste de dépendances est explicite. Avant, `[param]` valait `[undefined]`
//     pour tous les appels du type `useApi(() => getAmbiance(location))`: passer
//     de /view/a à /view/b ne rechargeait rien et affichait les données de a;
//  2. une réponse arrivée en retard ne peut plus écraser une réponse plus
//     récente (garde `requestId`);
//  3. plus de mise à jour d'état après démontage du composant.
//
// Les réponses cachées (voir services/cache.js) reviennent en microtâche, donc
// le passage par `loading` reste invisible.
export default function useApi(apiFunction, param, deps) {

    const [state, setState] = useState({ data: null, loading: true, error: null });

    // Numéro de la dernière requête lancée: seule celle-ci a le droit d'écrire.
    const latestRequest = useRef(0);

    const dependencies = deps ?? [param];

    useEffect(() => {
        const requestId = ++latestRequest.current;
        let cancelled = false;

        // Vrai seulement pour la requête la plus récente, sur un composant monté.
        function isCurrent() {
            return !cancelled && requestId === latestRequest.current;
        }

        async function load() {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const result = await apiFunction(param);
                if (isCurrent()) {
                    setState({ data: result, loading: false, error: null });
                }
            } catch (e) {
                if (isCurrent()) {
                    setState({ data: null, loading: false, error: e });
                }
            }
        }

        load();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return state;
}
