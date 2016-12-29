cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        this.anim = this.getComponent(cc.Animation);
        this.setSoldierType(100);
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

    runTo: function (pos) {
        var currX = this.node.x;
        var destX = pos.x;
        if (destX < currX) {
            this.node.scaleX = -1;
        }
        this.playRun();
        var callback = cc.callFunc(this.playStand, this);
        this.node.runAction(cc.sequence(cc.moveTo(3, pos), callback));
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
