import React, { useEffect, useState } from 'react'
import Notification from './components/Notification'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Menu from './components/Menu'
import Login from './components/Login'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useQuery, useApolloClient, useSubscription } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from './queries'
import { updateCache } from './utils/cacheUtil'

const App = () => {
	const client = useApolloClient()
	const response = useQuery(ALL_AUTHORS)
	const [user, setUser] = useState(null)
	const [token, setToken] = useState(null)
	const [notif, setNotif] = useState(null)
	let timer

	const navigate = useNavigate()
	const gotoIndex = () => {
		navigate('/')
	}

	const logout = () => {
		setToken(null)
		setUser(null)
		window.localStorage.clear()
		client.resetStore()
		gotoIndex()
	}

	useEffect(() => {
		if (notif && notif.includes('500')) {
			logout()
			clearTimeout(timer)
		}
	})

	useEffect(() => {
		const t = window.localStorage.getItem('token')
		const u = window.localStorage.getItem('user')
		if (t && u) {
			setToken(t)
			setUser(JSON.parse(u))
		}
	}, [setToken, setUser])

	useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      setNotif(`"${addedBook.title}" by ${addedBook.authorname} was just added to the library!`)
			clearTimeout(timer)
			timer = setTimeout(() => {
				setNotif(null)
			}, 6000)
      updateCache(addedBook, client, ALL_BOOKS)
    }
  })

	return (
		<div className='container'>
			<Menu
				token={token}
				setToken={setToken}
				gotoIndex={gotoIndex}
				setUser={setUser}
				logout={logout} />
			{notif ? <Notification notif={notif} /> : null}
			<section>
				<Routes>
					<Route path='/books' element={
						<Books
							timer={timer}
							user={user}
							setNotif={setNotif} />} />
					<Route path='/newbook' element={
						<NewBook
							setNotif={setNotif}
							timer={timer}
							user={user} />
					} />
					<Route path='/' element={
						<Authors
							response={response}
							setNotif={setNotif}
							timer={timer}
							token={token}
							user={user} />
					} />
					<Route path='/login' element={
						<Login
							setNotif={setNotif}
							timer={timer}
							setToken={setToken}
							gotoIndex={gotoIndex}
							setUser={setUser} />
					} />
				</Routes>
				{user ? <small>~ Logged in as <b>{user.username}</b> ~</small> : null}
			</section>
		</div>
	)
}

export default App