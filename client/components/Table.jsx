


// Les tables sont basées sur la documentation officielle de bootstrap (Bootstrap, s.d.a)

export default function Table({columns, buildRow, data}) {
    return (

        <table className="table">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    {columns.map((col, index) => (
                        <th scope="col" key={index}>{col}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((d, index) => (
                    <tr key={index}>
                        <th scope="row">{index + 1}</th>
                        {buildRow(d, index)}
                    </tr>

                ))}
            </tbody>
        </table>

    )
}