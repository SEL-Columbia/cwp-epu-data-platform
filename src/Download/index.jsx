import * as styles from './styles.css';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class About extends Component {
	render() {
		return (
			<div className={styles.wrapper}>
				<span className={styles.header}>{'Download'}</span>
			</div>
		);
	}
}

export default withRouter(About);
