cc.Class({
    extends: cc.Component,

    properties: {
        originalPoint: cc.Vec2,
        tileSize: cc.Size,
        mapSize: cc.Size
    },

    // use this for initialization
    onLoad: function () {

    },

    calcMapPosition: function (tilePos) {
        var x = tilePos.x * this.tileSize.width + this.tileSize.width / 2 + originalPoint.x;
        var y = tilePos.y * this.tileSize.height + this.tileSize.height / 2 + originalPoint.y;
        return cc.v2(x, y);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
