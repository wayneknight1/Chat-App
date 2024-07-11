import axios from "axios";
import { createContext, useState } from "react";
import { useEffect } from "react";
export const UserContext = createContext({})

export function UserContextProvider({children}){

    useEffect(() => {
        axios.get('/profile',{withCredentials: true}).then(response => {
            console.log('Inside /profile response.data is '+JSON.stringify(response.data))
            if (response.data) {
                setUsername(response.data.username);
                setId(response.data.userId);
              }
            })
        })
    // }, [])
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    return <UserContext.Provider value={{username, setUsername, id, setId}}>
        {children}
    </UserContext.Provider>
}
