import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import reactMixin from 'react-mixin';
import { Navigation } from 'react-router';

import SubmissionStore from '../stores/SubmissionStore.js';

class Search extends React.Component {
  static getStores(props) {
    return [SubmissionStore];
  }

  static getPropsFromStores(props) {
    return SubmissionStore.getState();
  }

  resolveSearchRoute(source, sorting) {
    // The default sorting is hot so it can be left out of the params.
    let query = sorting === 'hot' ? {} : { sorting };
    const subredditPattern = /(?:\/?(?:r\/))?(\w*)/;
    const testPattern = /\/?s\/(\w*)/;
    if (testPattern.test(source)) {
      let name = testPattern.exec(source)[1];
      this.transitionTo('test', { name }, query);
    } else if (subredditPattern.test(source)) {
      let subreddit = subredditPattern.exec(source)[1];
      this.transitionTo('subreddit', { subreddit }, query);
    }
  }

  handleSearch(e) {
    if (e) e.preventDefault();
    let source = this.refs.source.getDOMNode().value.trim();
    let sorting = this.refs.select.refs.sorting.getDOMNode().value.trim();
    // Default to showing /r/music
    if (!source) source = '/r/music';
    this.resolveSearchRoute(source, sorting);
  }

  componentDidUpdate() {
    // Keep the search bar text in sync with the source of the current submissions.
    if (this.props.loading) {
      this.refs.source.getDOMNode().value = this.props.source;
    }
  }

  render() {
    return (
      <form id="source-form" className="search-form" onSubmit={this.handleSearch.bind(this)} ref="form">
        {/* name="q" is there so that the field can be saved as a search engine. */}
        <div className="search-bar-container">
          <input id="search-bar" className="search-bar" name="q" type="text" placeholder="/r/music" ref="source"/>
          <SearchSortingSelect ref="select" />
        </div>
        <button type="submit" className="button submit-button"><i className="fa fa-arrow-right"></i></button>
      </form>
    );
  }
}

class SearchSortingSelect extends React.Component {
  render() {
    return (
      <select className="results-sorting-select" ref="sorting">
        <option disabled="disabled">Sort By:</option>
        <option value="hot" defaultValue>Hot</option>
        <option value="new">New</option>
        <optgroup label="Top">
          <option value="hour">Hour</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="all">All</option>
        </optgroup>
      </select>
    );
  }
}

reactMixin.onClass(Search, Navigation);
export default connectToStores(Search);
