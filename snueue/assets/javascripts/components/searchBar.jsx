class SearchBar extends React.Component {
  handleSubmit(e) {
    if (typeof e !== 'undefined') e.preventDefault();
    let source = this.refs.source.getDOMNode().value.trim();
    let sorting = this.refs.select.refs.sorting.getDOMNode().value.trim();
    this.props.onSearch(source, sorting);
    return;
  }
  componentDidMount() {
    if (Snueue.sourceFromURL) {
      this.refs.source.getDOMNode().value = Snueue.sourceFromURL;
      this.handleSubmit();
    }
  }
  render() {
    return (
      <form id="source-form" className="search-form" onSubmit={this.handleSubmit.bind(this)} ref="form">
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

export default SearchBar;
