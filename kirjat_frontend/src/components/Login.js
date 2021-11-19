import React, { useEffect, useState, useRef } from "react"
import { useMutation } from '@apollo/client'
import { LOG_IN, REGISTER } from "../queries"

const Login = ({ timer, notif, setNotif, setToken, setUser, gotoIndex }) => {
	const favGenreInputRef = useRef()
	const [checked, setChecked] = useState(false)
	const [login, result] = useMutation(LOG_IN, {
		onError: (e) => {
			setNotif(e.graphQLErrors[0].message)
			clearTimeout(timer)
			timer = setTimeout(() => {
				setNotif(null)
			}, 6000)
		}
	})

	const [register] = useMutation(REGISTER, {
		onError: (e) => {
			setNotif(e.graphQLErrors[0].message)
			clearTimeout(timer)
			timer = setTimeout(() => {
				setNotif(null)
			}, 6000)
		}
	})

	useEffect(() => {
		if (result.data) {
			const token = result.data.login.value
			const user = JSON.stringify(result.data.login.user)
			window.localStorage.setItem('token', `bearer ${token}`)
			window.localStorage.setItem('user', user)
			setToken(token)
			setUser(JSON.parse(user))
		}
	}, [result.data, setToken, setUser])

	const loginOrRegister = async event => {
		event.preventDefault()
		if (event.target.register.checked) {
			// Register
			try {
				await register({
					variables: {
						username: event.target.username.value,
						password: event.target.password.value,
						favoriteGenre: event.target.favGenre.value
					}
				})
				await login({
					variables: {
						username: event.target.username.value,
						password: event.target.password.value
					}
				})
				gotoIndex()
			} catch (e) {
				console.log(e.message)
			}
		} else {
			// Log In
			try {
				await login({
					variables: {
						username: event.target.username.value,
						password: event.target.password.value
					}
				})
				gotoIndex()
			} catch (e) {
				console.log(e.message)
			}
		}
	}
	return (
		<>
			{notif || checked ? <h2>Register!</h2> : <h2>Log In!</h2>}
			<div className='loginForm'>
				{notif ? <span>{notif}</span> : null}
				<form onSubmit={loginOrRegister}>
					<div>
						<input hidden
							type='text'
							placeholder='Username'
							autoComplete='username'
							readOnly />
					</div>
					<div>
						<input type='username'
							id='username'
							placeholder='Username'
							autoComplete='username'
							name='username' />

					</div>
					<div>
						<input type='password'
							id='password'
							placeholder='Password'
							autoComplete='new-password'
							name='password' />
					</div>
					<div>
						<input type='text'
							id='favoriteGenre'
							placeholder='Favorite genre'
							name='favoriteGenre'
							ref={favGenreInputRef}
							style={{ visibility: 'hidden' }} />
					</div>
					<div>
						<input type='checkbox'
							id='register'
							name='register'
							onChange={(event) => {
								setChecked(!checked)
								if (event.target.checked) {
									favGenreInputRef.current.style = 'visibility: visible'
								} else {
									favGenreInputRef.current.style = 'visibility: hidden'
								}
							}} />Register account
						<br />
						<button type='submit'>Go!</button>
					</div>
				</form>
			</div>
		</>
	)
}

export default Login