import { createContext, ReactNode, useContext, useState } from "react";
import { api } from "../services/api";

interface singInCredentials {
    email: string;
    password: string;
}

interface IAuthContext {
    singIn: (credentials: singInCredentials) => void;
    isAuthenticated: boolean;
}

interface IAuthProvider {
    children: ReactNode;
}

interface IUser {
    name: string;
    email: string
}

const AuthContext = createContext({} as IAuthContext)

function AuthProvider({children}: IAuthProvider) {
    const [user, setUser] = useState()
    const [isAuthenticated, SetIsAuthenticated] = useState(false)

    async function singIn(credentials: singInCredentials) {
        try {
            const response = api.post('sessions', {
                credentials
            })
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <AuthContext.Provider value={{singIn, isAuthenticated}}>

        </AuthContext.Provider>
    )
}

export function UseAuth() {
    const values = useContext(AuthContext)

    return values
}