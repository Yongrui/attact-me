cc.Class({
    extends: cc.Component,

    properties: {
        bornPoint: cc.Vec2,
        interval: 3,

        soldierDisplay: {
            default: null,
            type: cc.Label
        },

        soldierPrefab: {
            default: null,
            type: cc.Prefab
        },

        map: {
            default: null,
            type: cc.Node
        },

        soldierTypeArray: [cc.Integer]
    },

    // use this for initialization
    onLoad: function () {
        this.time = 0;
        this.soldierCount = 0;
    },

    randomSoldierType: function () {
        var num = this.soldierTypeArray.length;
        var i = Math.round(cc.random0To1() * (num - 1));
        return this.soldierTypeArray[i];
    },

    randomDestination: function () {
        var signs = [-1, 1];
        var i = Math.round(cc.random0To1());
        var signx = signs[i];
        var j = Math.round(cc.random0To1());
        var signy = signs[j];
        var deltax = Math.round(cc.random0To1() * 100) + 100;
        var deltay = Math.round(cc.random0To1() * 100) + 100;
        var x = deltax * signx + this.bornPoint.x;
        var y = deltay * signy + this.bornPoint.y;
        return cc.v2(x, y);
    },
    
    bornSoldier: function () {
        var newSoldier = cc.instantiate(this.soldierPrefab);
        this.map.addChild(newSoldier);
        newSoldier.setPosition(this.bornPoint);
        var animSoldier = newSoldier.getComponent('animSoldier')
        animSoldier.setSoldierType(this.randomSoldierType());
        animSoldier.runTo(this.randomDestination());
        
        this.soldierCount += 1;
        this.soldierDisplay.string = 'Soldier: ' + this.soldierCount.toString();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // if (this.time < this.interval) {
        //     this.time += dt;
        //     return;
        // }
        // this.time = 0;
        // this.bornSoldier();
    },
});
