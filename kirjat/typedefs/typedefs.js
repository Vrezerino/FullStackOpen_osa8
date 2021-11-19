const { gql } = require('apollo-server-express')

const typeDefs = gql`
	type User {
		username: String!
		favoriteGenre: String!
		id: ID!
	}
	type Token {
		value: String!
		user: User!
	}
	type Author {
		id: ID!
		name: String!
		born: Int
		bookCount: Int!
	}
	type Book {
		title: String!
		published: Int!
		author: Author!
		authorname: String!
		id: ID!
		genres: [String!]!
	}
  type Query {
		bookCount: Int!
		authorCount: Int!
		allBooks(author: String, genre: String): [Book!]!
		allAuthors: [Author!]!
		me: User
  }
	type Mutation {
		createUser(
			username: String!
			favoriteGenre: String!
			password: String!
		): User
		login(
			username: String!
			password: String!
		): Token
		addBook(
			title: String!
			author: String!
			published: Int!
			genres: [String!]!
		): Book
		editAuthor(
			name: String!
			setBornTo: Int!
		): Author
	}
	type Subscription {
		bookAdded: Book!
	}
`

module.exports = typeDefs