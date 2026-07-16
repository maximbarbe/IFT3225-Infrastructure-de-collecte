// https://getbootstrap.com/docs/5.3/content/tables/
export default function DetailedViewRow( {index, bucketStart, averageNoise, noiseLevel, sampleCount} ) {
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