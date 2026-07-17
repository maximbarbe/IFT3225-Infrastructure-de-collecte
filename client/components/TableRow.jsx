// Les tables sont basées sur la documentation officielle de bootstrap (Bootstrap, s.d.a)
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