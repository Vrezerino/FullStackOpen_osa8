import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter as Router } from 'react-router-dom'
import {
	ApolloClient, 
	ApolloProvider, 
	HttpLink, 
	InMemoryCache, 
	split
} from '@apollo/client'
import './index.css'
import { setContext } from 'apollo-link-context'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'

const authLink = setContext((_, { headers }) => {
  const token = window.localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? token : null,
    }
  }
})

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })
const wsLink = new WebSocketLink({
	uri: 'ws://localhost:4000/graphql',
	options: {
		reconnect: true
	}
})

const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query)
		return (
			definition.kind === 'OperationDefinition' &&
			definition.operation === 'subscription'
		)
	}, wsLink, authLink.concat(httpLink)
)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink
})

ReactDOM.render(
	<ApolloProvider client={client}>
		<Router>
			<App />
		</Router>
	</ApolloProvider>,
	document.getElementById('root'))