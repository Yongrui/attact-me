var ASTAR = require('astar');
var Graph = ASTAR.Graph;
var astar = ASTAR.astar;

var mapMatrix;

exports = {
	init: function (matrix) {
		mapMatrix = matrix;
	},

	search: function (source, target) {
		var graph = new Graph(mapMatrix, { diagonal: true });
		var start = graph.grid[source.x][source.y];
		var end = graph.grid[target.x][target.y];
		var result = astar.search(graph, start, end);
		return result;
	}
};

module.exports = exports;
