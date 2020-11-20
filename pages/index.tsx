import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <h1>
        Procedural Map Generation 
      </h1>
      <Link href="/map">
        Test it!
      </Link>
    </>
  )
}
