import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, ADD_BOOK, ALL_BOOKS } from '../queries'

const NewBook = ({ notif, setNotif, timer, user }) => {
	const [title, setTitle] = useState('')
	const [author, setAuthor] = useState('')
	const [published, setPublished] = useState(1900)
	const [genre, setGenre] = useState('')
	const [genres, setGenres] = useState([])

	console.log(user)

	const [ createBook ] = useMutation(ADD_BOOK, {
		refetchQueries: [ 
			{ query: ALL_AUTHORS },
			{ query: ALL_BOOKS }, 
			{ query: ALL_BOOKS, variables: { 
				genre: user ? user.favoriteGenre : null } 
			} 
		],
		onError: (e) => {
			setNotif(e.message)
			clearTimeout(timer)
			timer = setTimeout(() => {
				setNotif(null)
			}, 6000)
		}
	})

	const submit = async event => {
		event.preventDefault()
		try {
			await createBook({ variables: { title, author, published, genres } })

			setTitle('')
			setPublished(1900)
			setAuthor('')
			setGenres([])
			setGenre('')
		} catch (e) {
			console.log(e.message)
		}
	}

	const addGenre = () => {
		setGenres(genres.concat(genre))
		setGenre('')
	}

	return (
		<>
			<h2>Add new book</h2>
			<div className='newBook'>
				{notif ? <span>{notif}</span> : null}
				<form onSubmit={submit}>
					<div>
						<input
							placeholder='Title'
							value={title}
							minLength='1'
							onChange={({ target }) => setTitle(target.value)}
						/>
					</div>
					<div>
						<input
							placeholder='Author'
							value={author}
							minLength='1'
							onChange={({ target }) => setAuthor(target.value)}
						/>
					</div>
					<div>
						<input
							placeholder='Published'
							type='number'
							value={published}
							onChange={({ target }) => setPublished(Number(target.value))}
						/>
					</div>
					<div>
						<input
							placeholder='Genre'
							value={genre}
							minLength='2'
							onChange={({ target }) => setGenre(target.value)}
						/><br />
						<button onClick={addGenre} type="button">Add genre</button>
					</div>
					{genres.length > 0 ? <div className='genres'>Genres: {genres.join(' ')}</div> : null}
					<button type='submit'>Create book!</button>
				</form>
			</div>
		</>
	)
}

export default NewBook
