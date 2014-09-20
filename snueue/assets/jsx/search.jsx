/** @jsx React.DOM */
var Search = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.refs.source.getDOMNode().value.trim();
    var text = this.refs.sorting.getDOMNode().value.trim();
    return;
  },
  render: function() {
    return (
      <div className="row">
        <form id="search-form" onSubmit={this.handleSubmit} ref="form">
          <div className="small-12 large-8 large-offset-2 columns">
            <div className="row collapse">
              <div className="small-10 columns">
                <input id="resource" className="search-bar" type="text" placeholder="/r/music" ref="source"/>
              </div>
              <div className="small-2 columns">
                <select className="results-sorting-select" ref="sorting">
                  <option value="hot">Hot</option>
                  <option value="top">Top</option>
                  <option value="new">New</option>
                </select>
              </div>
            </div>
          </div>
          <div role="button" className="small-12 large-2 columns end">
            <button type="submit" className="button"><i className="fa fa-arrow-right"></i></button>
          </div>
        </form>
      </div>
    );
  }
});

React.renderComponent(
  <Search />,
  document.getElementById('search')
);
