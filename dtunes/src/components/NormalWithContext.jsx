import PlayerContextProvider from "../context/PlayerContext";
import Normal from "./Normal";
let backendUrl = 'http://localhost:2006';

export default function NormalWithContext() {
    return (
            <PlayerContextProvider backendUrl={backendUrl}>
                <Normal />
            </PlayerContextProvider>
    )
}