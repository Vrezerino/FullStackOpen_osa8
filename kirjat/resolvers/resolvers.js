const Book = require('../models/Book')
const Author = require('../models/Author')
const User = require('../models/User')
const config = require('../utils/config')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()
const { UserInputError, AuthenticationError } = require('apollo-server-errors')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const resolvers = {
	Query: {
		bookCount: async () => await Book.count(),
		authorCount: async () => await Author.count(),
		allBooks: async (root, args) => {
			let results = await Book.find({})
			if (args.genre) {
				results = results.filter(b => b.genres.includes(args.genre))
			}
			if (args.author) {
				results = results.filter(b => b.author === args.author)
			}
			return results
		},
		allAuthors: async () => await Author.find({}),
		me: ({ currentUser }) => currentUser
	},
	Author: {
		bookCount: async (root) => {
			// books.reduce((a, v) => (v.author === root.name ? a + 1 : a), 0)
			//return (await Book.find({ authorname: root.name })).length
			const a = await Author.findById(root.id)
			return a.books.length
		}
	},
	Mutation: {
		createUser: async (root, args) => {
			if (args.password.length < 8) throw new UserInputError('Password must be longer than 8 characters.')

			const saltRounds = 10
			const passwordHash = await bcrypt.hash(args.password, saltRounds)
			const user = new User({
				username: args.username,
				favoriteGenre: args.favoriteGenre,
				passwordHash
			})
			return user.save()
				.catch(e => {
					throw new UserInputError(e.message, {
						invalidArgs: args
					})
				})
		},
		login: async (root, args) => {
			const user = await User.findOne({ username: args.username })
			const passwordCorrect = user === null
				? false
				: await bcrypt.compare(args.password, user.passwordHash)

			if (!(user && passwordCorrect)) {
				throw new UserInputError('Wrong credentials.')
			}

			const userForToken = {
				username: user.username,
				favoriteGenre: user.favoriteGenre,
				id: user.id
			}

			return {
				value: jwt.sign(userForToken, config.JWT_SECRET, { expiresIn: 60 * 30 }),
				user: userForToken
			}
		},
		addBook: async (root, args, { currentUser }) => {
			if (!currentUser) { throw new AuthenticationError("Not authenticated!") }
			let author = await Author.findOne({ name: args.author })

			if (!author) {
				author = new Author({
					name: args.author
				})
				try {
					author = await author.save()
				} catch (e) {
					throw new UserInputError(e.message, { invalidArgs: args })
				}
			}

			const newBook = new Book(
				{
					title: args.title,
					published: args.published,
					author: author,
					authorname: author.name,
					genres: args.genres
				}
			)
			try {
				const savedBook = await newBook.save()
				author.books.push(savedBook.id)
				await author.save()
			} catch (e) {
				throw new UserInputError(e.message, { invalidArgs: args })
			}

			pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
			return newBook
		},
		editAuthor: async (root, args, { currentUser }) => {
			if (!currentUser) { throw new AuthenticationError("Not authenticated!") }

			let result = await Author.findOne({ name: args.name })
			result.born = args.setBornTo
			try {
				return result.save()
			} catch (e) {
				throw new UserInputError(e.message, { invalidArgs: args })
			}
		}
	},
	Subscription: {
		bookAdded: {
			subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
		}
	}
}

module.exports = resolvers