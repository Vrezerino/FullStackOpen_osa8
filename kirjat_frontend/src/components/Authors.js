import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { EDIT_AUTHOR, ALL_AUTHORS } from '../queries'

const EditAuthor = ({ authors, timer, notif, setNotif }) => {
	const [selectedOption, setSelectedOption] = useState(null)
	const [year, setYear] = useState(1900)
	const options = authors.map(a => ({ value: a.name, label: a.name }))

	const [editAuthor] = useMutation(EDIT_AUTHOR, {
		refetchQueries: [{ query: ALL_AUTHORS }],
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
			await editAuthor({ variables: { name: selectedOption.value, setBornTo: year } })
		} catch (e) {
			console.log(e.message)
		}
	}

	return !authors ? <div>Loading...</div> : (
		<div className='editAuthor'>
			{notif ? <span>{notif}</span> : null}
			<h3>Edit author birthyear</h3>
			<Select
				defaultValue={selectedOption}
				onChange={setSelectedOption}
				options={options}
			/>
			<form onSubmit={submit}>
				<input
					type='number'
					value={year}
					placeholder='Set new birthyear...'
					onChange={({ target }) => setYear(Number(target.value))}
				/><br />
				<button type='submit'>Edit</button>
			</form>
		</div>
	)
}

const Authors = ({ response, timer, notif, setNotif, user, token }) => {
	const [authors, setAuthors] = useState([])
	useEffect(() => {
		if (response.data) {
			setAuthors(response.data.allAuthors)
		}
	}, [setAuthors, response.data])

	return response.loading ? <div>Loading...</div> : (
		<div>
			<h2>Authors</h2>
			<table>
				<tbody>
					<tr>
						<th></th>
						<th>
							Born
						</th>
						<th>
							Books
						</th>
					</tr>
					{authors.map(a =>
						<tr key={a.name}>
							<td>{a.name}</td>
							<td>{a.born}</td>
							<td>{a.bookCount}</td>
						</tr>
					)}
				</tbody>
			</table>
			{user && token ?
				<EditAuthor
					authors={authors}
					notif={notif}
					setNotif={setNotif}
					timer={timer} />
				: null}
		</div>
	)
}

export default Authors