import { useEffect } from "react";
import { axiosPrivate, axiosPrivateFile } from "../api/axiosBase";
import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";


export default function useAxiosPrivate(acceptFiles=false){
    const refresh = useRefreshToken();
    const {auth} = useAuth();

    let axiosUsed;
    if (acceptFiles){
        axiosUsed = axiosPrivateFile;
    }
    else{
        axiosUsed = axiosPrivate;
    }

    useEffect(() => {

        const requestIntercept = axiosUsed.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']){
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            },
            error => Promise.reject(error)

        )

        const responseIntercept = axiosUsed.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                //check if user was not authorized provided the previous request wasn't sent to avoid loop
                if (error?.response?.status === 403 && !prevRequest?.sent){
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
                    return axiosUsed(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        //use Effect cleanup function clears the interceptors added, to prevent them from piling up.
        return () => {
            axiosUsed.interceptors.request.eject(requestIntercept);
            axiosUsed.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refresh])

    return axiosUsed;
}