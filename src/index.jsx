import React from 'react';
import ReactDOM from 'react-dom';

import { render } from 'react-dom';

class Results extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			results: props.results
		};
	}

	render() {
		var results;
		if (this.state.results.length < 1) {
			results = (
				<div className="result">
					<h4>no results</h4>
				</div>
			);
		} else {
			results = this.state.results.map(search => {
				return (
					<div className="result">
						<h4>{search.title}</h4>
					</div>
				)
			});
		}

		return (
			<div id="resultContainer">
				<h2 className="header"><i className="fa fa-archive" aria-hidden="true"></i> results</h2>
				{ results }
			</div>
		);
	}
}

class AddTags extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="saveContainer">
				<h3>{this.props.title}</h3>
				<h4>{this.props.url}</h4>
			</div>
		);
	}
}

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: '',
			url: '',
			title: '',
			view: 'search',
			placeholderText: 'search all snippets'
		};

		this.handlePress = this.handlePress.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.submit = this.submit.bind(this);
	}

	componentDidMount() {
		window.document.addEventListener('keydown', this.handlePress);
	}

	componentWillUnmount() {
		window.document.removeEventListener('keydown', this.handlePress);
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handlePress(event) {
		console.log(event);
		// if (event.key === 's') {
		// 	this.setState({
		// 		view: 'save', 
		// 		title: document.title, 
		// 		url: window.location.href,
		// 		placeholderText: 'add tags here'
		// 	});
		// }
		if (event.key === 'Enter') {
			this.submit();
		}
	}

	submit() {
		if (this.state == 'save') {
			// saving logic here
			console.log('saving what we have');
		} else {
			console.log('nothing to do');
		}
	}

	handleSave(event) {
		var state = this;
		chrome.tabs.getSelected(null, function(tab) {
			state.setState({
				view: 'save',
				placeholderText: 'add tags here',
				url: tab.url,
				title: tab.title
			})
		})
	}

	render() {
		var bottom;
		if (this.state.view == 'save') {
			bottom = <AddTags title={this.state.title}
						url={this.state.url} />;
		} else {
			bottom = <Results results={[]}/>;
		}
		return (
			<div>
				<div className="searchContainer">
					<div className="saveButton" onClick={this.handleSave}>
						<i className="fa fa-plus" aria-hidden="true"></i>
					</div>
					<input className="searchBar" placeholder={this.state.placeholderText} onChange={this.handleChange} type="text" />
				</div>
				{ bottom }
			</div>
		);
	}
}

render((
	<App />
), document.getElementById('content'))