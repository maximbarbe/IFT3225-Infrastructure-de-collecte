export default async function callApi(method, headers, body=null) {
    const response = await fetch(URL, {
        method: method,
        headers: headers,
        body: body
    })
}