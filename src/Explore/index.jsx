import * as styles from './styles.css';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class Explore extends Component {
	render() {
		return (
			<div className={styles.exploreWrapper}>
				<span className={styles.header}>{'Explore data'}</span>
			</div>
		);
	}
}

export default withRouter(Explore);
