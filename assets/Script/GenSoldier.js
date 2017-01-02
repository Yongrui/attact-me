var MapPath = require('MapPath');

cc.Class({
    extends: cc.Component,

    properties: {
        map: cc.Node,
        soldierPrefab: cc.Prefab,
        soldierDisplay: cc.Label,
        sourceXEdit: cc.EditBox,
        sourceYEdit: cc.EditBox,
        targetXEdit: cc.EditBox,
        targetYEdit: cc.EditBox,
        soldierTypeEdit: cc.EditBox,
        genSoldierBtn: cc.Button
    },

    onLoad: function () {
        this.soldierCount = 0;
    },

    addSoldierCount: function () {
        this.soldierCount += 1;
        this.soldierDisplay.string = 'Soldier: ' + this.soldierCount.toString();
    },
    
    genSoldier: function (soldierType, sourceX, sourceY, targetX, targetY) {
        var mapComp = this.map.getComponent("Map");

        var newSoldier = cc.instantiate(this.soldierPrefab);
        this.map.addChild(newSoldier);
        var source = mapComp.calcMapPosition(cc.p(sourceX, sourceY));
        newSoldier.setPosition(source);

        var animSoldier = newSoldier.getComponent('AnimSoldier')
        animSoldier.setSoldierType(soldierType);
        // var target = mapComp.calcMapPosition(cc.p(targetX, targetY));
        // animSoldier.runTo(target);

        this.addSoldierCount();

        var path = MapPath.search(cc.v2(sourceX, sourceY), cc.v2(targetX, targetY));
        for (var i = 0; i < path.length; i++) {
            cc.log(path[i].x + ', ' + path[i].y);
        };
        var newPath = mapComp.calcPathPos(path);
        animSoldier.runToPath(newPath, animSoldier.playStand.bind(animSoldier));
    },

    onBtnGenClicked: function () {
        var soldierType = this.soldierTypeEdit.string;
        var sourceX = parseInt(this.sourceXEdit.string);
        var sourceY = parseInt(this.sourceYEdit.string);
        var targetX = parseInt(this.targetXEdit.string);
        var targetY = parseInt(this.targetYEdit.string);
        this.genSoldier(soldierType, sourceX, sourceY, targetX, targetY);
    }
});
