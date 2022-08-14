import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { UseAuth } from '../context/AuthContext'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [email, setEmail] = useState('')  
  const [password, setPassword] = useState('')  

  const {singIn} = UseAuth()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password
    }

    singIn(data)
  }


  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input type="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} />

        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

export default Home
