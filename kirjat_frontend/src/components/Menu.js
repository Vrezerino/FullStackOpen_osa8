import React from 'react'
import { Link } from 'react-router-dom'

const Menu = ({ token, logout }) => {
	return (
		<div className='nav'>
			~&nbsp;
			<Link to='/'>Authors</Link>&nbsp;•&nbsp;
			<Link to='/books'>Books</Link>&nbsp;•&nbsp;
			{!token ? 
				<span><Link to='/login'>Log In</Link>&nbsp;•&nbsp;</span>
				: <>
						<span><Link to='/newbook'>Add book</Link>&nbsp;•&nbsp;</span>
						<span className='logoutBtn' onClick={logout}>Log Out</span>&nbsp;•&nbsp;~
					</>}
		</div>
	)
}

export default Menu