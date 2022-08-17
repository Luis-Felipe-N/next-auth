import Router from 'next/router'

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

import { parseCookies, setCookie } from 'nookies'

interface singInCredentials {
    email: string;
    password: string;
}

interface IUser {
    email: string;
    permissions: string[];
    roles: string[]
}

interface IAuthContext {
    singIn: (credentials: singInCredentials) => void;
    isAuthenticated: boolean;
    user: IUser | undefined;
}

interface IAuthProvider {
    children: ReactNode;
}


const AuthContext = createContext({} as IAuthContext)

export function AuthProvider({children}: IAuthProvider) {
    const [user, setUser] = useState<IUser>()
    const isAuthenticated = !!user

    useEffect(() => {
        const { 'nextauth@token': token } = parseCookies()

        if (token) {
            api.get('/me')
            .then(res => {
                setUser(res.data)
            })
        }
    }, [])

    async function singIn({email, password}: singInCredentials) {
        try {
            const response = await api.post('sessions', {
                email,
                password
            })

            const { token, refreshToken, permissions, roles } = response.data

            setCookie(undefined, 'nextauth@token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                path: '/',
            })
            setCookie(undefined, 'nextauth@refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                path: '/',
            })

            setUser({
                email,
                permissions,
                roles
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`

            Router.push('dashboard')
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <AuthContext.Provider value={{singIn, isAuthenticated, user}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);