export default async function callApi(url, method, headers, body=null) {
    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    });
    if (!response.ok) {
        try {
            const res = await response.json()
            throw new Error(`${response.status}: ${res["message"]}`)
        } catch (e) {
            throw new Error(`Error: ${e.message}`)
        }
        
        
        
    }
    const resultat = await response.json();
    return resultat;
}