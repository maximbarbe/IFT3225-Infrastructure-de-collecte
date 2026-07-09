export default async function callApi(method, headers, body=null) {
    const response = await fetch(URL, {
        method: method,
        headers: headers,
        body: body
    });
    if (!response.ok) {
        throw new Error(`Error status: ${response.status}`)
    }
    const resultat = await response.json();
    return resultat;
}