import * as styles from './styles.css';

import React, { Component } from 'react';
import { withRouter, NavLink, Route, Switch } from 'react-router-dom';

import Explore from '../Explore';
import MapWrapper from '../MapWrapper';
import About from '../About';
import Download from '../Download';

class App extends Component {
	constructor(props) {
		super(props);
		const { history } = props;
		let path = localStorage.getItem('path');
		if (path) {
			localStorage.removeItem('path');
			history.replace(`/${path}`);
		}
	}

	renderHeader = () => {
		return (
			<div className={styles.headerWrapper}>
				<div className={styles.header}>
					<h2>{'Columbia World Projects Energy for Productive Use'}</h2>
				</div>
				<div className={styles.navigation}>
					<NavLink
						exact={true}
						className={styles.link}
						activeClassName={styles.active}
						to={process.env.ROOT_PATH}
					>
						{'Explore data'}
					</NavLink>
					<NavLink
						exact={true}
						className={styles.link}
						activeClassName={styles.active}
						to={`${process.env.ROOT_PATH}/map`}
					>
						{'Map'}
					</NavLink>
					<NavLink
						exact={true}
						className={styles.link}
						activeClassName={styles.active}
						to={`${process.env.ROOT_PATH}/download`}
					>
						{'Download'}
					</NavLink>
					<NavLink
						exact={true}
						className={styles.link}
						activeClassName={styles.active}
						to={`${process.env.ROOT_PATH}/about`}
					>
						{'About'}
					</NavLink>
				</div>
			</div>
		);
	};

	renderBody = () => {
		return (
			<div className={styles.bodyWrapper}>
				<Switch>
					<Route exact={true} path={`${process.env.ROOT_PATH}/map`} component={MapWrapper} />
					<Route exact={true} path={`${process.env.ROOT_PATH}/download`} component={Download} />
					<Route exact={true} path={`${process.env.ROOT_PATH}/about`} component={About} />
					<Route component={Explore} />
				</Switch>
			</div>
		);
	};

	render() {
		return (
			<div className={styles.appWrapper}>
				{this.renderHeader()}
				{this.renderBody()}
			</div>
		);
	}
}

export default withRouter(App);
