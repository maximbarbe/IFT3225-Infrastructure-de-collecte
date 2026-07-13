import {useParams} from "react-router-dom";
import useApi from "../hooks/useApi";
import { getQuietHours } from "../services/ambiance";
//https://reactrouter.com/start/declarative/url-values
export default function DetailedView() {
    let { location } = useParams();
    const {data, loading , error} = useApi(() => (getQuietHours(location)));
    console.log(data);
    return (
        <>
            <h1>{location}</h1>
        </>
    )
}