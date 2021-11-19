import React from 'react'

const Notification = ({ notif }) => {
	return (
		<div className='notification'>
			<span>
				{notif}
			</span>
		</div>
	)
}

export default Notification