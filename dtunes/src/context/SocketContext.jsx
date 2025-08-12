import React, { createContext, useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { socket } from '../socket';

export const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    const { auth } = useAuth();
    const { loggedIn, user } = auth;

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnnect', onDisconnect);

        //cleanup function:
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnnect', onDisconnect);
        }
    }, [])

    useEffect(() => {
        socket.emit('authChange', { loggedIn, userId: user?._id });
    }, [loggedIn, user?._id, socket])

    //used by server for handling user reloading page when logged in:
    // useEffect(() => {
    //     socket.on('getUserAuth', () => {
    //         socket.emit('authChange', { loggedIn, userId: user?._id });
    //     })
    // }, [loggedIn, user?._id])

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}
