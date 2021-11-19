// update cache with addedBook
export const updateCache = (addedBook, client, query) => {
	const includedIn = (set, object) => 
		set.map(p => p.id).includes(object.id)  

	const dataInStore = client.readQuery({ query: query })
	if (dataInStore && !includedIn(dataInStore.allBooks, addedBook)) {
		client.writeQuery({
			query: query,
			data: { allBooks : dataInStore.allBooks.concat(addedBook) }
		})
	}   
}