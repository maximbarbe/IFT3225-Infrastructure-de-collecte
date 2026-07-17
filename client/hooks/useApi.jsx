import { useEffect,useState } from "react";

// Cette fonction a été tirée de la démo 7.
export default function useApi(apiFunction, param) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const result = await apiFunction(param);
                setData(result);
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    },[param]);
    return { data, loading, error };
}