/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		threadListUtils = require("./thread-list-utils.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		ThreadFeed;

	ThreadFeed = React.createClass({
		onScroll: threadListUtils.onScroll,

		getCols: function() {
			var container = document.querySelector(".main-content-threads"),
				card = document.querySelector(".main-content-threads .grid-item");

			if (!(container && card)) {
				return 1;
			}

			return (Math.floor(container.offsetWidth / card.offsetWidth) || 1);

		},

		render: function() {
			var sections, key, nav = store.getNav();

			// Don't show
			if (nav.mode !== "room") {
				return <div />;
			}

			sections = threadListUtils.getSections("card", this.getCols());
			key = 'thread-feed-' + nav.room;

			return (
					<div className="main-content-threads" data-mode="room">
						<GridView endlesskey={key} sections={sections} endless={true} onScroll={this.onScroll} />
					</div>
			);
		}
	});

	return ThreadFeed;
};
