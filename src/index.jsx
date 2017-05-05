import React from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';

import Fuse from 'fuse.js';

class Results extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			results: props.results
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({results: nextProps.results});
	}

	jumpToUrl(event, url) {
		chrome.tabs.query({currentWindow: true, active: true}, (tab) => {

			chrome.storage.sync.get('elephante_stats', (items) => {
				var stats_obj;
				var elephante_stats;
				if (items.elephante_stats == null) {
					elephante_stats = {};
				} else {
					elephante_stats = items.elephante_stats;
				}

				if (!('retrievals' in elephante_stats)) {
					// if this is first time, instantiate an empty object
					stats_obj = {};
					stats_obj[url] = 1;
				} else {
					stats_obj = elephante_stats.retrievals;
					stats_obj[url] = (stats_obj[url] || 0) + 1;
				}

				elephante_stats['retrievals'] = stats_obj;
				chrome.storage.sync.set({'elephante_stats': elephante_stats}, () => {
					console.log(stats_obj);
					chrome.tabs.update(tab.id, {url: url});
				});
			});
		});
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
					<div onClick={(e) => this.jumpToUrl(e, search.url)} className="result">
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
			placeholderText: 'search all snippets',
			search_result: []
		};

		this.handlePress = this.handlePress.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.submitButton = this.submitButton.bind(this);
		chrome.storage.sync.get('elephante_urls', (items) => {
			if ('items' in items.elephante_urls) {
				this.setState({list: items.elephante_urls.items});
			} else {
				this.setState({list: []});
			}

			this.state.search_options = {
				shouldSort: true,
				threshold: 0.6,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 1,
				keys: [
					"title",
					"url",
					"tags"
				]
			};
			this.state.fuse = new Fuse(this.state.list, this.state.search_options);
		});
	}

	componentDidMount() {
		window.document.addEventListener('keydown', this.handlePress);
	}

	componentWillUnmount() {
		window.document.removeEventListener('keydown', this.handlePress);
	}

	handleChange(event) {
		let val = event.target.value;
		let result = this.state.fuse.search(val);
		this.setState({value: val, search_result: result});
	}

	handlePress(event) {
		if (event.key === 'Enter') {
			this.submitButton();
		}
	}

	submitButton() {
		var title = this.state.title;
		var url = this.state.url;
		var tags = this.state.value.split(/[ ,]+/);
		if (this.state.view == 'save') {
			// saving logic here
			console.log('saving what we have');
			chrome.storage.sync.get('elephante_urls', (items) => {

				var new_obj;
				if (!('items' in items.elephante_urls)) {
					console.log('new stuff');
					new_obj = {
						items: [
							{
								title: title,
								url: url,
								tags: tags
							}
						]
					}
				} else {
					console.log('pushing to existing');
					new_obj = {
						items: items.elephante_urls.items
					}
					new_obj.items.push({
						title: title,
						url: url,
						tags: tags
					});
				}

				this.state.list = new_obj.items;
				this.state.fuse = new Fuse(this.state.list, this.state.search_options);
				chrome.storage.sync.set({'elephante_urls': new_obj}, () => {
					console.log(new_obj);
					console.log('success');
					this.setState({value: '', view: 'search', url: '', title: '', placeholderText: 'search all snippets'});
				});
			});
		} else {
			console.log('nothing to do');
		}
	}

	handleSave(event) {
		chrome.tabs.getSelected(null, (tab) => {
			this.setState({
				view: 'save',
				placeholderText: 'add tags here',
				url: tab.url,
				title: tab.title
			});
		});
	}

	render() {
		var bottom;
		if (this.state.view == 'save') {
			bottom = <AddTags title={this.state.title}
						url={this.state.url} />;
		} else {
			console.log('results in app render');
			console.log(this.state.search_result);
			bottom = <Results results={this.state.search_result}/>;
		}

		return (
			<div>
				<div className="searchContainer">
					<div className="saveButton" onClick={this.handleSave}>
						<i className="fa fa-plus" aria-hidden="true"></i>
					</div>
					<input className="searchBar" placeholder={this.state.placeholderText} onChange={this.handleChange} type="text" value={this.state.value} />
				</div>
				{ bottom }
			</div>
		);
	}
}

render((
	<App />
), document.getElementById('content'))