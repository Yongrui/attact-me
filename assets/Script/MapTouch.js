var SCROLL_DEACCEL_RATE = 0.95;
var SCROLL_DEACCEL_DIST = 1.0;
var BOUNCE_DURATION = 0.15;
var INSET_RATIO = 0.2;
var MOVE_INCH = 7.0/160.0;
var BOUNCE_BACK_FACTOR = 0.35;

cc.Class({
    extends: cc.Component,

    properties: {
        view: cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this._container = this.node;
        this._viewSize = cc.size(0, 0);
        this._scrollDistance = cc.p(0, 0);
        this._contentOffset = cc.p(0,0);
        this._maxInset = cc.p(0, 0);
        this._minInset = cc.p(0, 0);
        this._touchPoint = cc.p(0, 0);
        this._touches = [];
        this.init();
        this._relocateContainer(false);
    },

    init: function () {
        var pZero = cc.p(0,0);
        this._viewSize = this.view.getContentSize();
        this._container.setAnchorPoint(pZero);
        this._container.setPosition(pZero);
        this._touchMoved = false;
        this._bounceable = false;
        this._minScale = 0.8;
        this._maxScale = 2.0;
        this._touchLength = 0.0;
        this._dragging = false;
        this._touches.length = 0;
        this.updateInset();

        this._container.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this._container.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this._container.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this._container.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    },

    convertTouchToParentSpace: function (touch) {
        return this._container.parent.convertTouchToNodeSpace(touch);
    },

    onTouchStart: function (event) {
        var locTouches = this._touches;
        var touches = event.getTouches();
        if ((locTouches.length + touches.length) > 2 || this._touchMoved)
            return false;

        locTouches = this._touches = locTouches.concat(touches);

        var locContainer = this._container;
        if (locTouches.length === 1) { // scrolling
            this._touchPoint = this.convertTouchToParentSpace(locTouches[0]);
            this._touchMoved = false;
            this._dragging = true; //dragging started
            this._scrollDistance.x = 0;
            this._scrollDistance.y = 0;
            this._touchLength = 0.0;
        } else if (locTouches.length === 2) {
            this._touchPoint = cc.pMidpoint(this.convertTouchToParentSpace(locTouches[0]),
                this.convertTouchToParentSpace(locTouches[1]));
            this._touchLength = cc.pDistance(locContainer.convertTouchToNodeSpace(locTouches[0]),
                locContainer.convertTouchToNodeSpace(locTouches[1]));
            this._dragging = false;
        }
        return true;
    },

    onTouchMove: function (event) {
        if (this._touches.length === 1 && this._dragging) { // scrolling
            this._touchMoved = true;
            var touches = event.getTouches();
            var newPoint = this.convertTouchToParentSpace(touches[0]);
            var moveDistance = cc.pSub(newPoint, this._touchPoint);
            var dis = Math.sqrt(moveDistance.x * moveDistance.x + moveDistance.y * moveDistance.y);
            var pos = this._container.getPosition();
            var _minOffset = this.minContainerOffset(), _maxOffset = this.maxContainerOffset();
            if (!(_minOffset.y <= pos.y && pos.y <= _maxOffset.y))
                moveDistance.y *= BOUNCE_BACK_FACTOR;

            if (!(_minOffset.x <= pos.x && pos.x <= _maxOffset.x))
                moveDistance.x *= BOUNCE_BACK_FACTOR;

            if (!this._touchMoved && Math.abs(cc.convertDistanceFromPointToInch(dis)) < MOVE_INCH ){
                return;
            }

            if (!this._touchMoved){
                moveDistance.x = 0;
                moveDistance.y = 0;
            }

            this._touchPoint = newPoint;
            this._touchMoved = true;

            if (this._dragging) {
                var locPosition = this._container.getPosition();
                var newX = locPosition.x + moveDistance.x;
                var newY = locPosition.y + moveDistance.y;

                this._scrollDistance = moveDistance;
                this.setContentOffset(cc.p(newX, newY));
            }
        } else if (this._touches.length === 2 && !this._dragging) {
            var len = cc.pDistance(this._container.convertTouchToNodeSpace(this._touches[0]),
                this._container.convertTouchToNodeSpace(this._touches[1]));
            this.setZoomScale(this.getZoomScale() * len / this._touchLength);
        }
    },

    onTouchEnd: function (event) {
        if (this._touches.length === 1 && this._touchMoved)
            this.schedule(this._deaccelerateScrolling, 0);

        this._touches.length = 0;
        this._dragging = false;
        this._touchMoved = false;
    },

    onTouchCancel: function (event) {
        this._touches.length = 0;
        this._dragging = false;
        this._touchMoved = false;
    },

    minContainerOffset:function () {
        var locContainer = this._container;
        var locContentSize = locContainer.getContentSize(), locViewSize = this._viewSize;
        var locViewAnchor = this.view.getAnchorPoint();
        return cc.p(locViewSize.width - locContentSize.width * locContainer.scaleX - locViewAnchor.x * locViewSize.width,
            locViewSize.height - locContentSize.height * locContainer.scaleY - locViewAnchor.y * locViewSize.width);
    },

    maxContainerOffset:function () {
        var locViewSize = this._viewSize;
        var locViewAnchor = this.view.getAnchorPoint();
        return cc.p(0.0 - locViewAnchor.x * locViewSize.width, 0.0 - locViewAnchor.y * locViewSize.height);
    },

    setContentOffset: function (offset, animated) {
        if (animated) { //animate scrolling
            this.setContentOffsetInDuration(offset, BOUNCE_DURATION);
            return;
        }
        if (!this._bounceable) {
            var minOffset = this.minContainerOffset();
            var maxOffset = this.maxContainerOffset();

            offset.x = Math.max(minOffset.x, Math.min(maxOffset.x, offset.x));
            offset.y = Math.max(minOffset.y, Math.min(maxOffset.y, offset.y));
        }

        this._container.setPosition(offset);
    },

    setContentOffsetInDuration:function (offset, dt) {
        var scroll = cc.moveTo(dt, offset);
        this._container.runAction(scroll);
    },

    setZoomScale: function (scale, animated) {
        if (animated) {
            this.setZoomScaleInDuration(scale, BOUNCE_DURATION);
            return;
        }

        var locContainer = this._container;
        if (locContainer.getScale() !== scale) {
            var oldCenter, newCenter;
            var center;

            if (this._touchLength === 0.0) {
                var locViewSize = this._viewSize;
                center = cc.p(locViewSize.width * 0.5, locViewSize.height * 0.5);
                center = locContainer.convertToWorldSpace(center);
            } else
                center = this._touchPoint;

            oldCenter = locContainer.convertToNodeSpace(center);
            locContainer.setScale(Math.max(this._minScale, Math.min(this._maxScale, scale)));
            newCenter = locContainer.convertToWorldSpace(oldCenter);

            var offset = cc.pSub(center, newCenter);
            this.setContentOffset(cc.pAdd(locContainer.getPosition(), offset));
        }
    },

    getZoomScale:function () {
        return this._container.getScale();
    },

    setZoomScaleInDuration:function (s, dt) {
        if (dt > 0) {
            var locScale = this._container.getScale();
            if (locScale !== s) {
                var scaleAction = cc.actionTween(dt, "zoomScale", locScale, s);
                this.runAction(scaleAction);
            }
        } else {
            this.setZoomScale(s);
        }
    },

    _deaccelerateScrolling:function (dt) {
        if (this._dragging) {
            this.unschedule(this._deaccelerateScrolling);
            return;
        }

        var maxInset, minInset;
        var oldPosition = this._container.getPosition();
        var locScrollDistance = this._scrollDistance;
        this._container.setPosition(oldPosition.x + locScrollDistance.x , oldPosition.y + locScrollDistance.y);
        if (this._bounceable) {
            maxInset = this._maxInset;
            minInset = this._minInset;
        } else {
            maxInset = this.maxContainerOffset();
            minInset = this.minContainerOffset();
        }

        //check to see if offset lies within the inset bounds
        var newX = this._container.getPositionX();
        var newY = this._container.getPositionY();
        
        locScrollDistance.x = locScrollDistance.x * SCROLL_DEACCEL_RATE;
        locScrollDistance.y = locScrollDistance.y * SCROLL_DEACCEL_RATE;

        this.setContentOffset(cc.p(newX, newY));

        if ((Math.abs(locScrollDistance.x) <= SCROLL_DEACCEL_DIST &&
            Math.abs(locScrollDistance.y) <= SCROLL_DEACCEL_DIST) ||
            newY > maxInset.y || newY < minInset.y ||
            newX > maxInset.x || newX < minInset.x ||
            newX === maxInset.x || newX === minInset.x ||
            newY === maxInset.y || newY === minInset.y) {
            this.unschedule(this._deaccelerateScrolling);
            this._relocateContainer(true);
        }
    },

    _relocateContainer:function (animated) {
        var min = this.minContainerOffset();
        var max = this.maxContainerOffset();

        var oldPoint = this._container.getPosition();
        var newX = oldPoint.x;
        var newY = oldPoint.y;
        newX = Math.max(newX, min.x);
        newX = Math.min(newX, max.x);
        newY = Math.min(newY, max.y);
        newY = Math.max(newY, min.y);

        if (newY !== oldPoint.y || newX !== oldPoint.x) {
            this.setContentOffset(cc.p(newX, newY), animated);
        }
    },

    updateInset:function () {
        var locViewSize = this._viewSize;
        var tempOffset = this.maxContainerOffset();
        this._maxInset.x = tempOffset.x + locViewSize.width * INSET_RATIO;
        this._maxInset.y = tempOffset.y + locViewSize.height * INSET_RATIO;
        tempOffset = this.minContainerOffset();
        this._minInset.x = tempOffset.x - locViewSize.width * INSET_RATIO;
        this._minInset.y = tempOffset.y - locViewSize.height * INSET_RATIO;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
