import { memo } from "react";

// Les tables sont basées sur la documentation officielle de bootstrap (Bootstrap, s.d.a)
function DetailedViewRow( {index, bucketStart, averageNoise, noiseLevel, sampleCount} ) {
    return (
        <tr>
            <th scope="row">{index + 1}</th>
            <td>{bucketStart}</td>
            <td>{averageNoise}</td>
            <td >{noiseLevel}</td>
            <td>{sampleCount}</td>
        </tr>
    )
}

// Le tableau de la vue détaillée compte une ligne par tranche de 15 minutes,
// soit plusieurs centaines sur une fenêtre de 90 jours. `memo` évite de les
// re-rendre quand seul l'état de la page change (bouton « favoris », par ex.):
// toutes les props sont des primitives, la comparaison par défaut suffit.
export default memo(DetailedViewRow);
