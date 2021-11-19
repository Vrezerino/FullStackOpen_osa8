const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const express = require('express')
const { createServer } = require('http')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const config = require('./utils/config')
const mongoose = require('mongoose')
const resolvers = require('./resolvers/resolvers')
const typeDefs = require('./typedefs/typedefs')
const jwt = require('jsonwebtoken')
const User = require('./models/User')

console.log('Connecting to', config.DB_URI)
mongoose.connect(config.DB_URI).then(() => {
	console.log('Connected to MongoDB!')
})
	.catch((e) => {
		console.log('Error connecting to database:', e.message)
	})

const startApolloServer = async ()  => {

	const app = express()
	const httpServer = createServer(app)
	const schema = makeExecutableSchema({ typeDefs, resolvers })

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }),
			{
				async serverWillStart() {
					return {
						async drainServer() {
							subscriptionServer.close()
						}
					}
				}
			}
		],
		context: async ({ req }) => {
			const auth = req ? req.headers.authorization : null
			if (auth && auth.toLowerCase().startsWith('bearer')) {
				const decodedToken = jwt.verify(
					auth.substring(7), config.JWT_SECRET
				)
				const currentUser = await User
					.findById(decodedToken.id).populate('friends')
				return { currentUser }
			}
		}
	})

	const subscriptionServer = SubscriptionServer.create({
		schema, execute, subscribe
	}, { server: httpServer, path: server.graphqlPath })

	await server.start()
	server.applyMiddleware({
		app,
		path: '/'
	})

	const PORT = 4000
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  )
}

startApolloServer()