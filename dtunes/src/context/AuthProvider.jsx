import { createContext, useEffect, useState } from "react";
import axiosBase from "../api/axiosBase";
import { useLocation } from "react-router-dom";
const AuthContext = createContext({});

export function AuthProvider({children}){
    const [auth, setAuth] = useState({loggedIn: false});
    const location = useLocation();

    async function getUserAuth(){
        // console.log('getting user auth...')
        try{
            const response = await axiosBase.get('/refresh', {
                withCredentials: true,
                credentials: 'include',
            })
            if (response.data.success){
                setAuth({loggedIn: true, accessToken: response.data.accessToken, user: response.data.user})
            }
            else{
                setAuth({loggedIn: false})
            }
        }
        catch(err){
            // console.log(err);
            console.log('user needs to login, refresh token expired')
            setAuth({loggedIn: false})
        }
    }

    //at first render and every change in location, get the auth.
    useEffect(() => {
        getUserAuth();
    }, [location])

    
    async function logout(){
        //returns true or false to check if logout successful
        try{
            const response = await axiosBase.get('/logout', {withCredentials: true, credentials: 'include'});
            setAuth({loggedIn: false});
            if (response.status === 500){
                console.log('logout server error');
                return false;
            }
            return true;
        }catch(err){
            return false;
        }
    }

    return(
        <AuthContext.Provider value={{auth, setAuth, logout, getUserAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export {AuthContext};