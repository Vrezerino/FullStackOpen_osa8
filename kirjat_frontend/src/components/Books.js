import React, { useEffect, useState } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Recommendations = ({ user }) => {
	const [getRecs, result] = useLazyQuery(ALL_BOOKS)
	const [recs, setRecs] = useState(null)

	useEffect(() => {
		if (user) {
			getRecs(({
				variables: { genre: user.favoriteGenre }
			}))
			setRecs(result.data)
		}
	}, [result.data, getRecs, user])

	if (!user) return null
	return !(result && recs) ? <div>Loading...</div> : (
		<div className='recommendations'>
			<h4>Recommendations based on your favorite genre "{user.favoriteGenre}":</h4>
			<table>
				<tbody>
					<tr>
						<th></th>
						<th>
							Author
						</th>
						<th>
							Published
						</th>
					</tr>
					{recs.allBooks.map((r) =>
						<tr key={r.id}>
							<td><i>{r.title}</i></td>
							<td>{r.authorname}</td>
							<td>{r.published}</td>
						</tr>)
					}
				</tbody>
			</table>
		</div>
	)
}

const Books = ({ timer, user, notif, setNotif }) => {
	const response = useQuery(ALL_BOOKS, {
		onError: (e) => {
			setNotif(e.message)
			clearTimeout(timer)
			timer = setTimeout(() => {
				setNotif(null)
			}, 6000)
		}
	})
	const [books, setBooks] = useState([])
	const [genres, setGenres] = useState([])

	useEffect(() => {
		if (response.data) {
			setBooks(response.data.allBooks)
			setGenres(response.data.allBooks.reduce((genres, currentBook) => {
				currentBook.genres.forEach(g => {
					if (!genres.includes(g)) {
						genres.push(g)
					}
				})
				return genres
			}, []
			))
		}
	}, [setBooks, setGenres, response.data])

	const filterBooks = filter => {
		if (filter) {
			setBooks(books.filter(b => b.genres.includes(filter)))
		} else {
			setBooks(response.data.allBooks)
		}
	}

	return response.loading ? <div>Loading...</div> : (
		<div className='books'>
			<h2>Books</h2>
			{notif || null}
			{books && books.length > 0 ?
				<table>
					<tbody>
						<tr>
							<th></th>
							<th>
								Author
							</th>
							<th>
								Published
							</th>
						</tr>
						{books.map(b =>
							<tr key={b.title}>
								<td><i>{b.title}</i></td>
								<td>{b.authorname}</td>
								<td>{b.published}</td>
							</tr>
						)}
					</tbody>
				</table>
				: <div><b>No results.</b></div>}
			{genres.map(g =>
				<button onClick={() => filterBooks(g)} key={g}>{g}</button>
			)}
			<button onClick={() => filterBooks(null)}>all genres</button>
			<Recommendations
				user={user}
				books={books} />
		</div>
	)
}

export default Books