cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        this.anim = this.getComponent(cc.Animation);
        this.setSoldierType(100);
        this._doCallFunc = null;
    },

    setSoldierType: function (soldierType) {
        this._soldierType = soldierType;
        this.playStand();
    },

    playRun: function () {
        this.anim.play('s' + this._soldierType + 'run');
    },

    playStand: function () {
        this.anim.play('s' + this._soldierType + 'stand');
    },

    runTo: function (pos, callback) {
        var currX = Math.floor(this.node.x);
        var destX = Math.floor(pos.x);
        if (destX < currX) {
            this.node.scaleX = -1;
        }
        this.playRun();
        var callFunc = cc.callFunc(callback, this);
        this.node.runAction(cc.sequence(cc.moveTo(0.5, pos), callFunc));
    },

    runToPath: function (path, callback) {
        if (path.length < 1) {
            callback();
            return;
        }

        var pos = path.shift();
        this.runTo(pos, function () {
            this._doCallFunc = function () {
                this.runToPath(path, callback);
            }
        });
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this._doCallFunc) {
            this._doCallFunc();
            this._doCallFunc = null;
        }
    },
});
