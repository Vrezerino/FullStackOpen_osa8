import { gql } from '@apollo/client'

export const LOG_IN = gql`
	mutation login($username: String!, $password: String!) {
		login(
			username: $username
			password: $password
		) {
			value
			user {
				username,
				favoriteGenre
			}
		}
	}
`

export const REGISTER = gql`
	mutation createUser($username: String!, $password: String!) {
		register(
			username: $username
			password: $password
		) {
			name
		}
	}
`

export const ALL_BOOKS = gql`
	query allBooks($genre: String) {
		allBooks(genre: $genre) {
			id
			title
			authorname
			published
			genres
		}
	}
`

export const ALL_AUTHORS = gql`
	query {
		allAuthors {
			name
			born
			bookCount
		}
	}
`

export const ADD_BOOK = gql`
	mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
		addBook(
			title: $title,
			published: $published,
			author: $author,
			genres: $genres
		) {
			title
			author {
				name
			}
			published
		}
	}
`

export const EDIT_AUTHOR = gql`
	mutation editAuthor($name: String!, $setBornTo: Int!) {
		editAuthor(
			name: $name,
			setBornTo: $setBornTo
		) {
			name,
			born
			bookCount
		}
	}
`

const BOOK_DETAILS = gql`
	fragment BookDetails on Book {
		title
		authorname
		published
		genres
	}
`

export const BOOK_ADDED = gql`
	subscription {
		bookAdded {
			...BookDetails
		}
	}
	${BOOK_DETAILS}
`