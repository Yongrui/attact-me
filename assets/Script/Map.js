var MapPath = require('MapPath');

cc.Class({
    extends: cc.Component,

    properties: {
        originalPoint: cc.Vec2,
        tileSize: cc.Size,
        mapSize: cc.Size
    },

    // use this for initialization
    onLoad: function () {
        var self = this;
        cc.loader.loadRes("TopographicMap", function (error, content) {
            if (error) {
                cc.log(error);
            } else {
                self.drawMap(content);
                MapPath.init(content);
            }
        });
    },

    drawMap: function (graph) {
        var orix = this.originalPoint.x;
        var oriy = this.originalPoint.y;
        var mapWidth = this.mapSize.width;
        var mapHeight = this.mapSize.height;
        var tileWidth = this.tileSize.width;
        var tileHeight = this.tileSize.height;
        var ctx = this.getComponent(cc.Graphics);
        for (var i = 0; i < mapWidth; i++) {
            for (var j = 0; j < mapHeight; j++) {
                var movex = orix;
                var movey = oriy + j * tileHeight;
                var linex = movex + mapWidth * tileWidth;
                var liney = movey;
                ctx.moveTo(movex, movey);
                ctx.lineTo(linex, liney);
                ctx.stroke();

                if (graph[i][j] == 0) {
                    var rectx = orix + i * tileWidth;
                    var recty = oriy + j * tileHeight;
                    ctx.rect(rectx, recty, tileWidth, tileHeight);
                    ctx.stroke();
                    ctx.fill();
                }
            }
            var movex = orix + i * tileWidth;
            var movey = oriy;
            var linex = movex;
            var liney = movey + mapHeight * tileHeight;
            ctx.moveTo(movex, movey);
            ctx.lineTo(linex, liney);
            ctx.stroke();
        };
    },

    calcMapPosition: function (tilePos) {
        var x = (tilePos.x) * this.tileSize.width + this.tileSize.width / 2 + this.originalPoint.x;
        var y = (tilePos.y) * this.tileSize.height + this.tileSize.height / 2 + this.originalPoint.y;
        return cc.v2(x, y);
    },

    calcPathPos: function (path) {
        var newPath = [];
        for (var i = 0; i < path.length; i++) {
            newPath[i] = this.calcMapPosition(path[i]);
        };
        return newPath;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
