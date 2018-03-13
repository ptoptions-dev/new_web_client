
var PTOptionsChartView = function (params, id) {
    var self = this;
    self.name = id;
    self.ChartView = new PIXI.Container();
    //ChartViewSettings
    self.ChartViewSettings = $.extend(params, {
        PointCount: 5,
        PointSpace: 20,
        MainGridWidth: 0.3,
        SubGridWidth: 0.00,
        ChartDrawingAreaHeight: params.cHeight - 20,
        TimeInterval: params.ActiveInterval.value != 1 ? params.ActiveInterval.value * 1000 : 5000,
        ChartStyle: {
            fontSize: 11,
            fontFamily: 'Verdana',
            GridTextColor: '#fff',
            GridColor: 0x888888,
            GridWidth: 1,
            PointerGridColor: 0xBAD6EE
        },
        ChartVar: {
            yMin: 0,
            yMax: 0,
            yDiff: 0,
            ySteps: 100, //Initial Value
            BarStart: 0,
            BarEnd: 10 //Initial Value
        },
        BarCollection: [],

        UpdatedBoardBars: [],
        VisibleBarsA: [],
        VisibleBarsB: []


    });








    //ChartViewSettings END//
    self.GridView = new PTO_ChartGridView(self.ChartViewSettings, self.ChartView);
    self.ChartBars = new PTO_ChartBars(self.ChartViewSettings, self.ChartView, self.GridView);
    self.GridView.BarObject = self.ChartBars;
    // let linePath = new PTO_Line();

    //self.ChartView.addChild(animationPoint);
    // self.ChartView.addChild(linePath);
    // ------------------------------------
    self.DragStartX = 0;

    self.Cursor = function (x, y, isVisible) {
        if (!isVisible) self.isMouseDown = false;

        self.GridView.OnMouseMove({
            x: x,
            y: y,
            isVisible: isVisible
        });

        self.ChartBars.OnMouseMove({
            x: x,
            y: y,
            isVisible: isVisible
        });

    };
    // Grid dragging process
    self.OnMouseDrag = function (x) {
        var vectorX = x - self.DragStartX;
        if (self.DragStartX > x) { //Dragging Right to Left
            self.GridView.UpdateBoardPanAnimation();
            self.ChartBars.UpdateBoardPanAnimation();
        } else { //Dragging Left to Right
            self.GridView.UpdateBoardReversePanAnimation();
            self.ChartBars.UpdateBoardReversePanAnimation();
        }
        self.GridView.OnMouseDrag(vectorX);
        self.ChartBars.OnMouseDrag(vectorX);
        self.DragStartX = x;
    }

    self.OnMouseDown = function (params) {
        self.isMouseDown = true;
        self.GridView.OnMouseDown(params);
        self.ChartBars.OnMouseDown(params);
    }

    self.OnMouseWheel = function (_param) {
        // debugger;
        self.GridView.OnMouseWheel(_param);
        self.ChartBars.OnMouseWheel(_param);
    }
    // Grid dragging process

    // Grid line animation
    self.ProcessGrid = function () {
        if (!self.isMouseDown) {
            self.GridView.AnimateGridView();
        }
    }
    // Grid line animation
    self.isMouseDown = false;

    function DrawChartData() {
        linePath.clearLine();
        var BarSpace = self.ChartViewSettings.PointSpace * 5;
        var start = BarSpace * (BarEnd - BarStart);
        for (var i = BarStart; i > BarEnd + 1; i++) {
            var bar = ChartData[0].Bars[i];
            if (i === BarEnd) {
                // var x = self.GridView.GetXAxis(parseInt(bar.StampTicks));
                var y = GetYaxis(bar.Close);
                linePath.moveTo(start, y)
                start -= BarSpace;
            } else {
                // var x = self.GridView.GetXAxis(parseInt(bar.StampTicks));
                var y = GetYaxis(bar.Close);
                linePath.lineTo(start, y);
                start -= BarSpace;
            }
        }
    }

    self.SetChartData = function (cData) {
        ChartData = cData;
        // self.GridView.SetYminYmax(ChartData[0].Bars);
        //self.GridView.LineView.DrawBarHistory(ChartData[0].Bars);
    }

    var cursorContainer = new PIXI.Container();
    var barsContainer = new PIXI.Container();
    self.ChartView.addChild(cursorContainer);
    self.ChartView.addChild(barsContainer);
    self.ChartView.interactive = true;
    return self;
};

var PTO_ChartBars = function (cSettings, Stage, GridView) {
    var self = this;
    var chartHeight = cSettings.cHeight;
    var chartWidth = cSettings.cWidth;
    self.BoardWidth = GridView.BoardSprite_A.x + GridView.BoardSprite_A.width + cSettings.PointSpace;
    var barBoardContainer = new PIXI.Container();
    var barBoardA = new PIXI.Graphics();
    var barBoardB = new PIXI.Graphics();
    var leftLimit = 0;
    var rightLimit = 0;

    self.SpriteA = new PIXI.Sprite();
    self.SpriteB = new PIXI.Sprite();

    var yMin = 0;
    var yMax = 0;

    self.barCollection = [];
    self.gridgapX = 0;

    self.BarCollectionA = [];
    self.BarCollectionB = [];



    self.OnMouseMove = function (_param) {

    }


    self.OnMouseWheel = function (_param) {

    };

    self.OnMouseDrag = function (x) {

        barBoardA.x += x;
        barBoardB.x += x;
    };

    self.OnMouseDown = function (_param) {
    };

    function InitializeDrawing() {
        barBoardA.x = GridView.BoardSprite_A.x;
        barBoardA.width = GridView.BoardSprite_A.width;
        barBoardA.height = GridView.BoardSprite_A.height;
        barBoardB.x = GridView.BoardSprite_B.x;

        barBoardB.width = self.BoardWidth;
        barBoardB.height = GridView.BoardSprite_B.height

        barBoardContainer.addChild(barBoardA);
        barBoardContainer.addChild(barBoardB);

        Stage.addChild(barBoardContainer);

    };

    self.PanningOverGrid = function (s) {
        self.UpdateBoardPanAnimation();
        barBoardA.x -= s;
        barBoardB.x -= s;
    };

    self.UpdateBoardReversePanAnimation = function () {

        if (barBoardA.x >= self.BoardWidth) {
            barBoardA.x = barBoardB.x - self.BoardWidth;
            self.UpdateBarsOnBoard(barBoardA);
        }
        if (barBoardB.x >= self.BoardWidth) {
            barBoardB.x = barBoardA.x - self.BoardWidth;
            self.UpdateBarsOnBoard(barBoardB);
        }
    };

    self.UpdateBars = function (bars) {
        self.barCollection = bars;
    };

    self.BarsUpdateYMinYMax = function () {
        // debugger;
    }

    self.UpdateBarsOnBoard = function (graphics) {
        return;

        // graphics.clear();
        // var candleWidth = (cSettings.PointSpace * cSettings.PointCount) / 3;
        // var currentVal = 0;
        // var gaps = (cSettings.PointSpace * cSettings.PointCount);
        // for (var i = 0; i < cSettings.UpdatedBoardBars.length; i++) {

        //     var currentBar = cSettings.UpdatedBoardBars[i];
        //     var lineColor = currentBar.Open > currentBar.Close ? 0xc0392b : 0x52de57;

        //     if (currentBar.Stamp >= GridView.TickPointerView.TickStamp.Value) {
        //         continue;
        //     }

        //     var yOpen = GridView.GetYAxis(currentBar.Open);
        //     var yClose = GridView.GetYAxis(currentBar.Close);
        //     var yHigh = GridView.GetYAxis(currentBar.High);
        //     var yLow = GridView.GetYAxis(currentBar.Low);

        //     if (i == 0) {
        //         var midStamp = self.ComputeBarPosition(currentBar.Stamp);
        //         currentVal = GridView.GetXAxis(midStamp);
        //         currentVal = currentVal - graphics.x;
        //     }

        //     var yadjustment = GetYAdjustment(currentBar);

        //     graphics.lineStyle(1, lineColor, 1);
        //     graphics.moveTo(currentVal, yHigh);
        //     graphics.lineTo(currentVal, yLow + yadjustment);

        //     graphics.lineStyle(candleWidth, lineColor, 1);
        //     graphics.moveTo(currentVal, yOpen);
        //     graphics.lineTo(currentVal, yClose + yadjustment);
        //     currentVal += gaps;

        // }
    };

    self.ComputeBarPosition = function (stamp) {
        var _interval = GridView.ChartViewSettings.TimeInterval;
        var delta = stamp % _interval;
        var _centerGrid = _interval / 2;
        _stamp = stamp - delta + _centerGrid + 500;
        return _stamp;
    }


    function GetYAdjustment(bar) {
        if (bar.High == bar.Low && bar.Open == bar.Close) return 10;
        else return 0;
    }

    self.UpdateBoardPanAnimation = function () {

        var Ax = barBoardA.x + self.BoardWidth;
        var Bx = barBoardB.x + self.BoardWidth;

        if (Ax <= 0) {
            barBoardA.x = barBoardB.x + self.BoardWidth;
            self.UpdateBarsOnBoard(barBoardA);
        }
        if (Bx <= 0) {
            barBoardB.x = barBoardA.x + self.BoardWidth;
            self.UpdateBarsOnBoard(barBoardB);
        }
    };

    InitializeDrawing();
    return self;

};


var PTO_ChartGridView = function (params, _chartView) {
    var self = this;
    self.StartTime = params.StartTime;
    self.isMouseDown = false;
    self.ChartViewSettings = params;
    self.BarObject = {};
    var ExpirationViewStage;
    var LineGraphViewStage;
    var LoadingViewStage;
    var TickPointerViewStage;
    var CursorPointerViewStage;
    var BorderViewStage;
    var ActiveOptionViewStage;
    var tweenLocatePrice;
    var MaxRange;
    var ptLeftAllow = 15;
    var ptRightAllow = 15;
    var leftAllowance = params.PointSpace * ptLeftAllow;
    var rightAllowance = params.PointSpace * ptRightAllow;


    function SetMaxRange() {
        var dWidth = Math.round((params.cWidth / params.PointSpace), 0) * params.PointSpace;
        if (dWidth < params.cWidth) {
            while (dWidth < params.cWidth) {
                dWidth += params.PointSpace;
            }
        }
        var MaxWidth = dWidth + leftAllowance + rightAllowance;
        MaxRange = MaxWidth / params.PointSpace;

    }

    self.SetBarsRange = function () {
        var tempStart = 0;
        var pos = self.TickPointerView.TickStamp.position.x;
        var maxPoints = Math.ceil(params.cWidth / params.PointSpace);
        // console.log(pos);
        if (pos > params.cWidth) {
            var diff = self.TickPointerView.TickStamp.position.x - params.cWidth;
            if (diff < params.PointSpace) {
                params.ChartVar.BarStart = tempStart;
                params.ChartVar.BarEnd = Math.floor((tempStart + maxPoints));
            } else {
                var rp = diff / params.PointSpace;
                if ((rp % 1) === 0) {
                    params.ChartVar.BarStart = rp;
                    params.ChartVar.BarEnd = rp + maxPoints;
                } else {
                    var irp = parseInt(rp);
                    params.ChartVar.BarStart = irp;
                    params.ChartVar.BarEnd = irp + maxPoints;
                }
            }
        } else {
            if (pos < 0) {
                params.ChartVar.BarStart = 0;
                params.ChartVar.BarEnd = maxPoints;
            } else {
                params.ChartVar.BarStart = 0;
                params.ChartVar.BarEnd = Math.ceil(self.TickPointerView.TickStamp.position.x / params.PointSpace);
            }
        }
    }

    SetMaxRange();

    self.OnChartStampChanged = function (tick) {
        var _InitStartTime = new Date(tick);
        var _initSeconds = _InitStartTime.getSeconds();
        var _counter = (_initSeconds % 10 > 5 ? _initSeconds % 10 - 5 : _initSeconds % 10);
        _counter = _counter == 0 ? 5 : _counter;
        var _diff = 1;
        if (_counter != 1) {
            _diff = _counter;
            _counter = 3;
        }
        _InitStartTime.setSeconds(_initSeconds - _diff - GetNumberLineOfPointer(params.cWidth / 2));
        UpdateChartStamp(_InitStartTime);
    };

    self.OnTimeIntervalChanged = function (interval) {
        self.ChartViewSettings.TimeInterval = interval;
        UpdateChartStamp(GetMinBoard().MinTick);
        self.LineView.ReDraw();
        self.LocateCurrentPrice();
    }

    self.UpdateStampValue = function (Graphics, Sprite) {

        var _item = Graphics.children;
        var _temp = GetTimeIntervalFormat(Sprite.MinTick, params.TimeInterval);
        Sprite.MinTick = _temp;

        var isFirstBarExist = false;
        self.ChartViewSettings.UpdatedBoardBars = [];
        for (var i = 0; i < _item.length; i++) {
            _child = _item[i];
            _child.text = FormatStampValue(_temp, "hh-mm-ss");
            _temp += params.TimeInterval;

            // var index = self.ChartViewSettings.BarCollection.findIndex(x => x.Stamp === _temp);
            var barFound = self.ChartViewSettings.BarCollection.find(x => x.Stamp === _temp);
            if (self.ChartViewSettings.UpdatedBoardBars.length == 0 && i == 0 && barFound != undefined) {
                // self.ChartViewSettings.UpdatedBoardBars.push(index);
                var bar = new OHLCBar(barFound, _temp);
                self.ChartViewSettings.UpdatedBoardBars.push(bar);
                isFirstBarExist = true;
            }

            else if (self.ChartViewSettings.UpdatedBoardBars.length != 0) {
                var last = self.ChartViewSettings.UpdatedBoardBars[self.ChartViewSettings.UpdatedBoardBars.length - 1];
                self.ChartViewSettings.UpdatedBoardBars.push(barFound == undefined ? new OHLCBar(last, _temp) : new OHLCBar(barFound, _temp));
            }


        }

        if (isFirstBarExist) {
            if (Sprite.Name == "First_BoardSprite") {
                self.ChartViewSettings.VisibleBarsA = self.ChartViewSettings.UpdatedBoardBars;
            }
            else {
                self.ChartViewSettings.VisibleBarsB = self.ChartViewSettings.UpdatedBoardBars;
            }
        }
        else {
            // params.RequestData(Sprite.MinTick, Sprite.MaxTick);
        }

        UpdateSpriteTexture(Graphics, Sprite);
        Sprite.MaxTick = _temp;

    };

    self.ComputeBarPosition = function (stamp) {
        var _interval = self.ChartViewSettings.TimeInterval;
        var delta = stamp % _interval;
        var _centerGrid = _interval / 2;
        _stamp = stamp - delta + _centerGrid + 500;
        return _stamp;
    }

    self.UpdateBoardPanAnimation = function () {
        var Ax = self.BoardSprite_A.x + self.BoardWidth;
        var Bx = self.BoardSprite_B.x + self.BoardWidth;
        if (Ax <= 0) {
            self.BoardSprite_A.x = self.BoardSprite_B.x + self.BoardWidth;
            self.BoardSprite_A.MinTick = self.BoardSprite_B.MaxTick;
            self.UpdateStampValue(self.BoardGraphic_A, self.BoardSprite_A);
        }
        if (Bx <= 0) {
            self.BoardSprite_B.x = self.BoardSprite_A.x + self.BoardWidth;
            self.BoardSprite_B.MinTick = self.BoardSprite_A.MaxTick;
            self.UpdateStampValue(self.BoardGraphic_B, self.BoardSprite_B);
        }
    };

    self.UpdateBoardReversePanAnimation = function () {
        var _minBoard = GetMinBoard();
        var _min = _minBoard.MinTick - (_minBoard.MaxTick - _minBoard.MinTick);
        if (self.BoardSprite_A.x >= self.BoardWidth) {
            self.BoardSprite_A.x = self.BoardSprite_B.x - self.BoardWidth;
            self.BoardSprite_A.MinTick = _min;
            self.UpdateStampValue(self.BoardGraphic_A, self.BoardSprite_A);
        }
        if (self.BoardSprite_B.x >= self.BoardSprite_B.width) {
            self.BoardSprite_B.x = self.BoardSprite_A.x - self.BoardWidth;
            self.BoardSprite_B.MinTick = _min;
            self.UpdateStampValue(self.BoardGraphic_B, self.BoardSprite_B);
        }
    };

    self.GetSpeed = function () {
        if (self.TickPointerView.TickStamp.position.x < params.cWidth / 2) return 0;
        else return 1;
    };
    self.runAnimateWhenExpired = true;
    self.AnimateGridView = function () {
        var s = self.GetSpeed();
        if (self.TickPointerView.TickStamp.position.x < params.cWidth && self.runAnimateWhenExpired) {
            self.UpdateBoardPanAnimation();
            self.BoardSprite_A.x -= s;
            self.BoardSprite_B.x -= s;
            self.BarObject.PanningOverGrid(s);
            self.LineView.LineViewPanAnimation(s);
            self.ExpirationView.ExpirationViewPanAnimation(s);
            for (var i = 0; i < params.OpenOption.length; i++) {
                params.OpenOption[i].View.AnimateNewOptionView(s);
            }
            params.isCurrentVisible = true;
        }
        params.isCurrentVisible = false;
        self.TickPointerView.TickPointerViewPanAnimation(s);
    };

    self.OnMouseMove = function (_param) {
        UpdateCursorPointerView(_param);
    }

    self.OnMouseWheel = function (_param) {
        //self.AddNewZoomLevel = self.YGrid.scale.y + (_param / 2);
    }

    self.OnMouseDrag = function (_param) {
        self.BoardSprite_A.x += _param;
        self.BoardSprite_B.x += _param;
        self.LineView.OnDraggedLineView(_param);
        self.TickPointerView.OnDraggedTickPointerView(_param);
        self.ExpirationView.OnDraggedExpirationView(_param);
        if (!params.OpenOption.length) return;
        for (var i = 0; i < params.OpenOption.length; i++) {
            params.OpenOption[i].View.OnDragged(_param);
        }
    };

    self.OnMouseDown = function (_param) {
        CheckActiveBoard(_param.x);
    }

    self.GetTimeStamp = function (xaxis) {
        if (!self.ActiveBoardSprite) {
            CheckActiveBoard(xaxis);
        }
        var _xx;
        _xx = xaxis - self.ActiveBoardSprite.x;
        var _temp = _xx - (_xx % params.PointSpace);
        _temp = Math.abs(_temp - _xx) < Math.abs(_temp + params.PointSpace - _xx) ? _temp : _temp + params.PointSpace;
        var _lineNumber = (_temp / params.PointSpace - 2) * params.TimeInterval / params.PointCount;
        var _minDate = new Date(self.ActiveBoardSprite.MinTick);
        var _secs = _minDate.getSeconds();
        var _stamp = _minDate.getTime() + _lineNumber;
        return new Date(_stamp);
    };

    self.GetXAxis = function (tick) {
        var _minBoard = GetMinBoard();
        var _minTick = new Date(_minBoard.MinTick);
        _minTick.setMilliseconds(0);
        var _temp = _minBoard.x + Math.abs(_minBoard.x % params.PointSpace);
        var _temp1 = Math.abs(_temp - _minBoard.x);
        var _temp2 = Math.abs((_temp - params.PointSpace) - _minBoard.x);
        _temp = _temp1 < _temp2 ? _minBoard.x : _minBoard.x + params.PointSpace;
        var foreignTick = new Date(tick).setMilliseconds(0);
        var divider = ((params.PointSpace * params.PointCount) / (params.TimeInterval / 1000));
        var _xaxis = (foreignTick - _minBoard.MinTick) / 1000;
        var gridexcess = params.PointSpace * 2;
        _xaxis = _xaxis * divider + gridexcess;
        return _xaxis + _minBoard.x;
    }

    self.LocateCurrentPrice = function () {
        if (tweenLocatePrice == undefined) {
            tweenLocatePrice = PIXI.tweenManager.createTween(self.ActiveBoardSprite);
            tweenLocatePrice.time = 250;
            tweenLocatePrice.easing = PIXI.tween.Easing.linear();
            tweenLocatePrice.loop = true;
            tweenLocatePrice.on("update", function () {
                var _cPos = self.GetXAxis(new Date(self.TickPointerView.TickStamp.Value));
                var center = params.cWidth / 2;
                var _direction;
                if (_cPos > center) _direction = -1;
                else _direction = 1;
                var length = Math.abs(_cPos - center) * 100 / 1000;
                self.TickPointerView.StopTweenAnimation();
                if (length < 1) {
                    tweenLocatePrice.stop();
                    self.TickPointerView.StartTweenAnimation();
                }
                if (_direction < 0) {
                    length = -length;
                    self.UpdateBoardPanAnimation();
                    self.BarObject.UpdateBoardPanAnimation();

                    if (_cPos - 5 <= center) {
                        tweenLocatePrice.stop();
                        self.TickPointerView.StartTweenAnimation();
                    }
                } else {
                    self.UpdateBoardReversePanAnimation();
                    self.BarObject.UpdateBoardReversePanAnimation();

                    if (_cPos + 5 >= center) {
                        tweenLocatePrice.stop();
                        self.TickPointerView.StartTweenAnimation();
                    }
                }
                self.OnMouseDrag(length);
            });
        }
        tweenLocatePrice.start();
    };

    self.AddNewOption = function (_param) {
        var isDrawn = false;
        if (params.OpenOption.length) {
            for (let x = 0; x < params.OpenOption.length; x++) {
                if (params.OpenOption[x].Model.StartStamp != _param.StartStamp) continue;
                params.OpenOption[x].Model.count++;
                params.OpenOption[x].Model.TotalAmount += parseFloat(params.OpenOption[x].Model.Amount);
                params.OpenOption[x].View.Update(params.OpenOption[x].Model);
                isDrawn = true;
                break;
            }
        }
        if (isDrawn) return;
        var x = self.GetXAxis(_param.StartStamp);
        var y = self.GetYAxis(parseFloat(_param.StartQuote));
        var _newOption = new DrawNewOptionView(x, y, _param);
        _param.count = 1;
        _param.TotalAmount = parseFloat(_param.Amount);
        params.OpenOption.push({
            Model: _param,
            View: _newOption
        });
    }

    function GetYminYmax(data) {
        return {
            yMin: Math.min.apply(Math, data.map(function (val) { return val.Close; })),
            yMax: Math.max.apply(Math, data.map(function (val) { return val.Close; }))
        };
    }

    function OHLCBar(bar, stamp) {
        this.Open = bar.Open;
        this.High = bar.High;
        this.Low = bar.Low;
        this.Close = bar.Close;
        this.Stamp = stamp;
    }

    // self.SetYminYmax = function () { // for bar history
    //     var tempMax = 0;
    //     var tempMin = 9999;
    //     if (VisibleBarsA != undefined || VisibleBarsB != undefined) {
    //         var VisibleBarsA = self.ChartViewSettings.VisibleBarsA;
    //         var VisibleBarsB = self.ChartViewSettings.VisibleBarsB;

    //         for (var ctr = 0; ctr < VisibleBarsA.length; ctr++) {

    //             tempMax = VisibleBarsA[ctr].High > tempMax ? VisibleBarsA[ctr].High : tempMax;
    //             tempMin = VisibleBarsA[ctr].Low < tempMin ? VisibleBarsA[ctr].Low : tempMin;
    //         }

    //         for (var ctr = 0; ctr < VisibleBarsB.length; ctr++) {

    //             tempMax = VisibleBarsB[ctr].High > tempMax ? VisibleBarsB[ctr].High : tempMax;
    //             tempMin = VisibleBarsB[ctr].Low < tempMin ? VisibleBarsB[ctr].Low : tempMin;
    //         }

    //         params.ChartVar.yMax = parseFloat(tempMax);
    //         params.ChartVar.yMin = parseFloat(tempMin);
    //         params.ChartVar.yDiff = params.ChartVar.yMax - params.ChartVar.yMin;
    //         params.ChartVar.ySteps = params.ChartDrawingAreaHeight / params.ChartVar.yDiff;
    //         UpdateChartAllowance();
    //     }

    //     else {
    //         var barData = params.BarCollection;
    //         tempMin = barData[0].Close == undefined ? barData[0].Bid : barData[0].Close - 0.00010;
    //         tempMax = barData[0].Close == undefined ? barData[0].Bid : barData[0].Close + 0.00010;

    //         if (params.ChartVar.yMin <= 0) {
    //             params.ChartVar.yMax = parseFloat(tempMax);
    //             params.ChartVar.yMin = parseFloat(tempMin);
    //             params.ChartVar.yDiff = params.ChartVar.yMax - params.ChartVar.yMin;
    //             params.ChartVar.ySteps = params.ChartDrawingAreaHeight / params.ChartVar.yDiff;                

    //         } else {
    //             params.ChartVar.yMax = parseFloat(tempMax);
    //             params.ChartVar.yMin = parseFloat(tempMin);
    //             params.ChartVar.yDiff = params.ChartVar.yMax - params.ChartVar.yMin;
    //             params.ChartVar.ySteps = params.ChartDrawingAreaHeight / params.ChartVar.yDiff;

    //         } 
    //         UpdateChartAllowance();           
    //     }
    // }

    self.SetYminYmax = function () {
        if (!self.TickPointerView) return;
        var barData = params.BarCollection;
        self.SetBarsRange();
        var barCount = barData.length;
        var tempMin = 0;
        var tempMax = 0;
        var end = params.ChartVar.BarEnd > barCount ? barCount - 1 : params.ChartVar.BarEnd - 1;
        var changed = false;

        if (barData.length > 1) {
            for (var i = 0; i < end; i++) {
                if (!barData || !barData.length) break;
                var bar = barData[i]; // Dummy Data
                var _close = bar.Close == undefined ? bar.Bid : bar.Close;
                if (i === 0) {
                    tempMin = _close;
                    tempMax = _close;
                } else {
                    if (_close > tempMax) {
                        tempMax = _close;
                    }

                    if (_close < tempMin) {
                        tempMin = _close;
                    }
                }
            }

            params.ChartVar.yMax = parseFloat(tempMax);
            params.ChartVar.yMin = parseFloat(tempMin);
            params.ChartVar.yDiff = params.ChartVar.yMax - params.ChartVar.yMin;
            params.ChartVar.ySteps = params.ChartDrawingAreaHeight / params.ChartVar.yDiff;
            UpdateChartAllowance();
        }

        else {
            tempMin = barData[0].Close == undefined ? barData[0].Bid : barData[0].Close - 0.00010;
            tempMax = barData[0].Close == undefined ? barData[0].Bid : barData[0].Close + 0.00010;
            if (params.ChartVar.yMin <= 0) {
                params.ChartVar.yMax = parseFloat(tempMax);
                params.ChartVar.yMin = parseFloat(tempMin);
                params.ChartVar.yDiff = params.ChartVar.yMax - params.ChartVar.yMin;
                params.ChartVar.ySteps = params.ChartDrawingAreaHeight / params.ChartVar.yDiff;
                UpdateChartAllowance();

            } else {
                params.ChartVar.yMax = parseFloat(tempMax);
                params.ChartVar.yMin = parseFloat(tempMin);
                params.ChartVar.yDiff = params.ChartVar.yMax - params.ChartVar.yMin;
                params.ChartVar.ySteps = params.ChartDrawingAreaHeight / params.ChartVar.yDiff;
                UpdateChartAllowance();
            }
            // return;
        }
    }

    self.GetPrice = function (yAxis) {
        var price = (((params.ChartDrawingAreaHeight - yAxis) / params.ChartVar.ySteps) + params.ChartVar.yMin).toFixed(7); // Set to 5 digits return value
        return GetPriceFormat(price);
    };

    function GetPriceFormat(price) {
        var _int = price.indexOf(".");
        var _temp = 8 - _int;
        var _string = parseFloat(price).toFixed(_temp);
        // for (let x = 0; x < _int; x++) {
        //     _string = " " + _string;
        // }
        return _string;
    }

    self.GetYAxis = function (price) {
        var yAxis = (params.ChartVar.yMax - price) * params.ChartVar.ySteps;
        return yAxis;
    }

    self.GetPriceFromPixel = function (yaxis) {
        var _defaultLine = Math.ceil(params.ChartDrawingAreaHeight / (params.PointCount * params.PointSpace));
        var _gap = params.ChartDrawingAreaHeight / _defaultLine;
        var _diff = params.ChartVar.yMax - params.ChartVar.yMin;
        var _priceLevel = _diff / _defaultLine;
        return ((yaxis - _gap) * _diff / _gap * (_defaultLine - 2) + params.ChartVar.yMax).toFixed(5);
    };

    self.GetPixelFromPrice = function (price) {
        price = parseFloat(price);
        var result = 0;
        var _defaultLine = Math.ceil(params.ChartDrawingAreaHeight / (params.PointCount * params.PointSpace));
        var _gap = params.ChartDrawingAreaHeight / _defaultLine;
        result = (price - params.ChartVar.yMax);
        var _compute = (params.ChartVar.yMin - params.ChartVar.yMax) / (_gap * (_defaultLine - 3));
        result /= _compute == 0 ? 1 : _compute;

        // if (isFinite(result) || isNaN(result)) return 0;
        var ret = result + _gap;
        return ret;
    }

    function GridGapY() {
        return params.ChartDrawingAreaHeight / self.YGrid.children.length;
    }

    self.ChangeYProperty = function (yMin, yMax) {
        var temparr = [];
        for (var i = 100; i <= params.ChartDrawingAreaHeight - 20; i += GridHeight()) {
            temparr.push(i);
        }
        Reposition(temparr);
        // return;
        // // var points = RecomputeYGridLines();
        // if (!points.length) return;
        // self.YGrid.clear();
        // self.YGrid.children.length = 0;
        // self.YGrid.lineStyle(params.ChartStyle.GridWidth, params.ChartStyle.GridColor, params.MainGridWidth);
        // for (var x = 0; x < points.length; x++) {
        //     var yaxis = self.GetYAxis(points[x]);
        //     var pText = DrawGridTextGraphics(points[x], params.cWidth, yaxis, params.ChartStyle, "y");
        //     self.YGrid.addChild(pText);
        //     self.YGrid.moveTo(0, yaxis);
        //     self.YGrid.lineTo(params.cWidth, yaxis);
        // }
        UpdateOpenOptionsDrawing();
        if (self.ExpirationView.Tick < self.TickPointerView.TickStamp.Value) self.ExpirationView.UpdateResult(params.CloseQuote);
        return;
    }

    function RoundPips(price, digit) {
        return Math.round(price * Math.pow(10, digit)) / Math.pow(10, digit);
    }

    function RecomputeYGridLines() {
        var digit = 7;
        var _ymax = RoundPips(params.ChartVar.yMax, digit);
        var _ymin = RoundPips(params.ChartVar.yMin, digit);
        var diff = RoundPips(_ymax - _ymin, digit);
        var tempArr = [];
        var pip = parseFloat(diff.toFixed(digit).split(".")[1].replace(/^0+/, ''));
        var ss = CheckPipsPosition(pip);
        var mid = RoundPips(_ymax - (diff / 2), digit);
        var power = Math.pow(10, digit - ss);
        var pipGap = 1 / power;
        var divde = Math.ceil(self.YGrid.children.length / 2);
        var temp = new Array(self.YGrid.children.length).fill(0);
        line(0, mid, pipGap, digit, temp);
        for (var x = 1; x <= divde; x++) {
            line(x, mid, pipGap, digit, temp);
            line(-x, mid, pipGap, digit, temp);
        }
        Reposition(temp, ss);
        return [];
    }

    function line(index, price, gap, digit, list) {
        var _d = Math.ceil(self.YGrid.children.length / 2);
        var _line = list[_d + index];
        if (_line == undefined) return;
        var n = index == 0 ? 1 : Math.abs(index);
        var _price = index == 0 ? RoundPips(price, digit) : index < 0 ? RoundPips(price + (gap * n), digit) : RoundPips(price - (gap * n), digit);
        list[_d + index] = _price;
    }

    function ComputeYline() {
        var digit = 7;
        var _ymax = RoundPips(params.ChartVar.yMax, digit);
        var _ymin = RoundPips(params.ChartVar.yMin, digit);
        var diff = RoundPips(_ymax - _ymin, digit);
        var tempArr = [];
        var pip = parseFloat(diff.toFixed(digit).split(".")[1].replace(/^0+/, ''));
        var ss = CheckPipsPosition(pip);
        var power = Math.pow(10, ss);
        var pipGap = 1 / power;
        for (var x = 1; x <= ss; x++) {
            tempArr.push(RoundPips(_ymax - (pipGap * x), ss));
        }
        tempArr.unshift(RoundPips(tempArr[0] + pipGap, ss));
        tempArr.push(RoundPips(tempArr[tempArr.length - 1] - pipGap, ss));
        Reposition(tempArr, ss);
        return [];
    }

    function CheckPipsPosition(pip) {
        for (var x = 1; x <= 7; x++) {
            var d = Math.pow(10, x);
            if (pip > d) continue;
            return x;
        }
    }

    function YminMaxdistanceInPip(digits, ydiff) {
        var retVal = 0;
        var pow = Math.pow(10, digits);
        retVal = parseInt((ydiff * pow));

        return retVal;
    }

    function GridHeight() {
        var defaultGridDistance = 100;
        var ydiff = params.ChartVar.yMax - params.ChartVar.yMin;
        var gridheight = (params.ChartDrawingAreaHeight - 200) / YminMaxdistanceInPip(GetSymbolDigit(params.ChartVar.yMax), ydiff);
        if (ydiff == 0) gridheight = defaultGridDistance;
        if (gridheight < defaultGridDistance && gridheight > 0) {
            var ctr = 1;
            while (gridheight * ctr < defaultGridDistance) {
                ctr++;
            }
            gridheight *= ctr;
        }
        return gridheight;
    }

    function GetSymbolDigit(sampleQuote) {
        var whole = ~~sampleQuote;
        var listofdigit = [6, 5, 3, 3, 2];
        var x = 1;
        var retval = null;
        while (retval == null) {
            if (whole / Math.pow(10, x) < 1) retval = listofdigit[x];
            x++;
        }
        return retval;
    }

    function UpdateChartStamp(time) {
        var _minBoard = GetMinBoard();
        _minBoard.MinTick = typeof time == "number" ? time : time.getTime();
        var otherGraphic;
        var otherSprite;
        var _graphic;
        if (_minBoard.Name == "First_BoardSprite") {
            _graphic = self.BoardGraphic_A;
            otherGraphic = self.BoardGraphic_B;
            otherSprite = self.BoardSprite_B;
        } else {
            _graphic = self.BoardGraphic_B;
            otherGraphic = self.BoardGraphic_A;
            otherSprite = self.BoardSprite_A;
        }
        self.UpdateStampValue(_graphic, _minBoard);
        otherSprite.MinTick = _minBoard.MaxTick;
        self.UpdateStampValue(otherGraphic, otherSprite);
    }

    function GetTimeIntervalFormat(time, interval) {
        var format;
        var _rawTime = new Date(time);
        var toChange;
        if (interval < 60 * 1000) {
            toChange = _rawTime.getSeconds();
        } else if (interval < 60 * 60 * 1000) {
            toChange = _rawTime.getMinutes();
            _rawTime.setSeconds(0);
        } else {
            toChange = _rawTime.getHours();
            _rawTime.setMinutes(0);
            _rawTime.setSeconds(0);
        }
        var a = time % interval;
        format = time - a;
        return format;
    }

    function UpdateChartAllowance() {
        params.ChartVar.yMax = params.ChartVar.yMax + (100 / params.ChartVar.ySteps);
        params.ChartVar.yDiff = params.ChartVar.yMax - params.ChartVar.yMin;
        params.ChartVar.ySteps = isNaN(params.ChartDrawingAreaHeight / params.ChartVar.yDiff) ? params.ChartVar.ySteps : (params.ChartDrawingAreaHeight / params.ChartVar.yDiff);
        params.ChartVar.yMin = params.ChartVar.yMin - (100 / params.ChartVar.ySteps);
        params.ChartVar.yDiff = params.ChartVar.yMax - params.ChartVar.yMin;
        params.ChartVar.ySteps = isNaN(params.ChartDrawingAreaHeight / params.ChartVar.yDiff) ? params.ChartVar.ySteps : (params.ChartDrawingAreaHeight / params.ChartVar.yDiff);
    }

    function GetNumberLineOfPointer(xaxis) {
        var _num = GetVisibleLines(xaxis);
        return GetPossibleLines(_num);
    }

    function DrawLoadingView(startTick, endTick) {
        var _graphic = new PIXI.Graphics();
        var _initPos = endTick == undefined ? 100 : self.GetXAxis(endTick);
        _graphic.beginFill(0x060606, 0.8);
        _graphic.drawRect(0, 0, _initPos, params.ChartDrawingAreaHeight);
        _graphic.endFill();
        var _line = DrawDashedLine([_initPos, 0], [_initPos, params.ChartDrawingAreaHeight], 1, 2, 7, 0x595654);
        _graphic.addChild(_line);
        return _graphic;
    }

    function UpdateSpriteTexture(Graphic, Sprite) {
        var _texture = Graphic.generateCanvasTexture();
        Sprite.texture = _texture;
    }

    function UpdateCursorPointerView(_param) {
        CheckActiveBoard(_param.x);
        var _stamp = self.GetTimeStamp(_param.x);
        var _price = self.GetPrice(_param.y);
        self.CursorPointerView.ReDraw(_param.x, _param.y, _param.isVisible, _stamp, _price);
    }

    function SetDefaultTextLocation(Graphic, Sprite) {
        var _item = Graphic.children;
        for (var i = 0; i < _item.length; i++) {
            _child = _item[i];
            _child.x -= _child.width / 2;
        }
        var _texture = Graphic.generateCanvasTexture();
        Sprite.texture = _texture;
    }

    function GetMinBoard() {
        var _minBoard;
        if (self.BoardSprite_A.MinTick > self.BoardSprite_B.MinTick) {
            _minBoard = self.BoardSprite_B;
        } else {
            _minBoard = self.BoardSprite_A;
        }
        return _minBoard;
    }

    function InitGridLines() {
        self.VisibleLines = GetVisibleLines(params.cWidth);
        self.YGridPointCollection = [];
        self.YGrid = DrawYGridGraphics();
        self.BoardGraphic_A = DrawXGridGraphics();
        self.BoardGraphic_B = DrawXGridGraphics();

        var _textureA = self.BoardGraphic_A.generateCanvasTexture();
        var _textureB = self.BoardGraphic_B.generateCanvasTexture();
        var _textureY = self.YGrid.generateCanvasTexture();
        self.BoardYSprite = new PIXI.Sprite(_textureY);
        self.BoardSprite_A = new PIXI.Sprite(_textureA);
        self.BoardSprite_B = new PIXI.Sprite(_textureB);


        InitFirstBoardSpriteProperty();
        self.BoardWidth = self.BoardSprite_A.x + self.BoardSprite_A.width + params.PointSpace;
        InitSecondBoardSpriteProperty();


        ExpirationViewStage = new PIXI.Graphics();
        self.ExpirationView = new DrawExpirationView(params, ExpirationViewStage);

        LineGraphViewStage = new PIXI.Graphics();
        self.LineView = new DrawLineGraphView(LineGraphViewStage, self);

        LoadingViewStage = new PIXI.Graphics();

        TickPointerViewStage = new PIXI.Graphics();
        self.TickPointerView = new DrawTickPointerView(params, TickPointerViewStage);

        CursorPointerViewStage = new PIXI.Graphics();
        self.CursorPointerView = new DrawCursorPointerView(params, CursorPointerViewStage);

        ActiveOptionViewStage = new PIXI.Graphics();

        BorderViewStage = new PIXI.Graphics();
        var topBorder = ChartBorder();
        var leftBorder = ChartBorder("left");
        BorderViewStage.addChild(topBorder);
        BorderViewStage.addChild(leftBorder);
        BorderViewStage.addChild(self.ExpirationView.PurchaseTimeCounter);

        AddChildrenToChartView();
    }

    self.OnTickChanged = function (bar, stamp) {

    };

    self.GetVisiblePoints = function (xaxis) {
        return GetNumberLineOfPointer(xaxis);
    };

    function AddChildrenToChartView() {
        //GridLines
        _chartView.addChild(self.YGrid);
        _chartView.addChild(self.BoardSprite_A);
        _chartView.addChild(self.BoardSprite_B);

        //Line Graph View
        _chartView.addChild(LineGraphViewStage);

        //Expiration Line View
        _chartView.addChild(ExpirationViewStage);


        //Loading View
        _chartView.addChild(LoadingViewStage);

        //Active Option View
        _chartView.addChild(ActiveOptionViewStage);

        //Tick Pointer View
        _chartView.addChild(TickPointerViewStage);

        //Cursor Pointer View
        _chartView.addChild(CursorPointerViewStage);

        //Border View
        _chartView.addChild(BorderViewStage);
    }

    function InitFirstBoardSpriteProperty() {
        self.BoardSprite_A.Name = "First_BoardSprite";
        self.BoardSprite_A.MinTick = self.BoardGraphic_A.tempMinTick;
        self.BoardSprite_A.MaxTick = self.BoardGraphic_A.tempMaxTick;
        self.UpdateStampValue(self.BoardGraphic_A, self.BoardSprite_A);
        SetDefaultTextLocation(self.BoardGraphic_A, self.BoardSprite_A);
        self.BoardSprite_A.interactive = true;
    }

    function InitSecondBoardSpriteProperty() {
        self.BoardSprite_B.Name = "Second_BoardSprite";
        self.BoardSprite_B.MinTick = self.BoardSprite_A.MaxTick;
        self.BoardSprite_B.x = self.BoardWidth;
        self.UpdateStampValue(self.BoardGraphic_B, self.BoardSprite_B);
        SetDefaultTextLocation(self.BoardGraphic_B, self.BoardSprite_B);
        self.BoardSprite_B.interactive = true;
    }

    function DrawXGridGraphics() {
        var _graphic = new PIXI.Graphics();
        var yHeight = params.ChartDrawingAreaHeight;
        var _InitStartTime = new Date(self.StartTime);
        var _initSeconds = _InitStartTime.getSeconds();
        var _counter = (_initSeconds % 10 > 5 ? _initSeconds % 10 - 5 : _initSeconds % 10);
        _counter = _counter == 0 ? 5 : _counter;
        // var _diff = 1;
        // if (_counter != 1) {
        //     _diff = _counter;
        //     _counter = 3;
        // }
        var _tempTick = _InitStartTime.setSeconds(_initSeconds - _counter);
        _graphic.tempMinTick = _tempTick;
        var _possibleLines = GetPossibleLines(self.VisibleLines + (self.VisibleLines / 2));
        var _spaces = 0;
        _counter = 3;
        for (var i = 0; i < _possibleLines; i++) {
            var x1 = _spaces,
                y1 = 0,
                x2 = _spaces,
                y2 = yHeight;
            _graphic.lineStyle(params.ChartStyle.GridWidth, params.ChartStyle.GridColor, params.SubGridWidth);
            while (_counter >= 5) {
                _counter = 0;
                _graphic.lineStyle(params.ChartStyle.GridWidth, params.ChartStyle.GridColor, params.MainGridWidth);
                _stampText = DrawGridTextGraphics("", _spaces, y2, params.ChartStyle, "x");
                _graphic.addChild(_stampText);
                _tempTick += params.TimeInterval;
            }
            _graphic.moveTo(x1, y1);
            _graphic.lineTo(x2, y2);
            _spaces += params.PointSpace;
            _counter++;
        }
        _graphic.tempMaxTick = _tempTick;
        return _graphic;
    }

    function ComputeGridLines(graphics, distance) {
        var _currentYDis = distance;
        var _spaces = 0;
        var _counter = params.PointCount;
        var possibleSpace = distance / 5;
        var _subGridWidth = 0;
        if (possibleSpace >= params.PointSpace) {
            _pointSpace = possibleSpace;
            _subGridWidth = params.SubGridWidth;
        } else {
            _pointSpace = params.PointSpace;
            _subGridWidth = 0;
        }
        //var _pointSpaces = distance / 5 >= params.PointSpace ? distance / 5 : 10;
        while (_spaces + _pointSpace < params.ChartDrawingAreaHeight) {
            _counter--;
            _spaces += _pointSpace;
            var x1 = 0,
                y1 = _spaces,
                x2 = params.cWidth,
                y2 = _spaces;
            if (_counter == 0) {
                _counter = params.PointCount;
                graphics.lineStyle(params.ChartStyle.GridWidth, params.ChartStyle.GridColor, params.MainGridWidth);
                _priceText = DrawGridTextGraphics(self.GetPrice(_currentYDis), x2, y2, params.ChartStyle, "y");
                graphics.addChild(_priceText);

                _currentYDis += distance;
                self.YGridPointCollection.push({ X1: x1, Y1: y1, X2: x2, Y2: y2, Price: self.GetPrice(_currentYDis) });
            } else {
                graphics.lineStyle(params.ChartStyle.GridWidth, params.ChartStyle.GridColor, _subGridWidth);
            }
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
        }
    }

    function DrawYGridGraphics() {
        var _graphic = new PIXI.Graphics();
        // var _yDistance = params.ChartDrawingAreaHeight / Math.ceil(params.ChartDrawingAreaHeight / (params.PointSpace * params.PointCount));
        // ComputeGridLines(_graphic, _yDistance);
        DrawInitYlines(_graphic);
        return _graphic;
    }

    function Reposition(points, digit) {
        for (var x = 0; x < self.YGrid.children.length; x++) {
            var _line = self.YGrid.children[x];
            _line.position.y = points[x];
            _line.children[0].text = self.GetPrice(points[x]);
            // line.position.y = self.GetYAxis(points[x]);
            // _line.children[0].text = points[x].toFixed(digit);
        }
        //UpdateSpriteTexture(self.YGrid, self.BoardYSprite);
    }

    function DrawInitYlines(graphics) {
        var _defaultSize = params.PointCount * params.PointSpace;
        var length = Math.ceil(params.ChartDrawingAreaHeight / _defaultSize);
        for (var c = 1; c <= length; c++) {
            _priceText = DrawGridTextGraphics("0.0000000", params.cWidth, 0, params.ChartStyle, "y");
            var newLine = new PIXI.Graphics();
            newLine.lineStyle(params.ChartStyle.GridWidth, params.ChartStyle.GridColor, params.MainGridWidth);
            newLine.moveTo(0, 0);
            newLine.lineTo(params.cWidth, 0);
            newLine.addChild(_priceText);
            graphics.addChild(newLine);
        }
    }

    function DrawGridTextGraphics(text, x, y, _style, orientation) {
        var style = {
            fontSize: _style.fontSize,
            fontFamily: _style.fontFamily,
            fill: _style.GridTextColor
        };
        var _graphic = new PIXI.Text(text, style);
        _graphic.x = orientation == "y" ? x - _graphic.width - 5 : x - (_graphic.width / 2);
        _graphic.y = orientation == "y" ? y - _graphic.height - 5 : y + 2;
        return _graphic;
    }

    function GetPossibleLines(line) {
        var templine = Math.round(line);
        templine = templine - (templine % 5);
        return templine;

    }

    function GetVisibleLines(containerSize) {
        var tempsize = Math.round(containerSize);
        tempsize = (tempsize - (tempsize % params.PointSpace)) / params.PointSpace;
        return tempsize;
    }

    function FormatStampValue(tick, format) {
        var _date = new Date(tick);
        var h = _date.getHours(),
            m = _date.getMinutes(),
            s = _date.getSeconds(),
            y = _date.getFullYear(),
            mon = _date.getMonth() + 1,
            d = _date.getDate();
        var months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'July',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];
        var _hms = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        var _ymd = y + "." + (mon < 10 ? "0" + mon : mon) + "." + (d < 10 ? "0" + d : d);
        var _month_day = months[mon - 1] + "-" + (d < 10 ? "0" + d : d);
        switch (format) {
            case "hh-mm-ss":
                _textTime = h == 0 && m == 0 && s == 0 ? "  " + _month_day : _hms;
                break;
            case "y-m-d-hh-mm-ss":
                _textTime = _ymd + " " + _hms;
                break;
        }
        return _textTime;
    }

    function DrawExpirationView(_param, stage) {
        var _self = this;
        var _initPos = 0;
        var timer_pos;
        var startAngle = Math.PI * 1.5;
        var _100Percent = Math.PI * 1;
        var font__style = {
            fontSize: params.ChartStyle.fontSize + 2,
            fontFamily: params.ChartStyle.fontFamily,
            fill: "white",
            padding: 15
        };
        _self.PurchaseTimeCounter = DrawPurchaseTimer();
        _self.PurchaseLine = DrawPurchaseLine();
        _self.ExpirationLine = DrawExpirationLine();
        _self.ExpirationEndLine = DrawExpirationEnd();
        _self.Update = function (value) {
            if (!value.PurchaseTime) return;
            _self.PurchaseLine.visible = true;
            _self.ExpirationLine.visible = true;
            _self.PurchaseTimeCounter.visible = true;
            _self.PurchaseTimeCounter.children[1].text = value.hasOpenOptions && value.PurchaseTime.InSecond <= 0 ? value.RemainingTime.string : value.PurchaseTime.string;
            _self.ExpirationTick = value.ExpiryTime.tick;
            _self.ExpirationLine.x = self.GetXAxis(value.ExpiryTime.tick);
            _self.PurchaseLine.x = self.GetXAxis(value.PurchaseTime.tick);
            if (value.hasOpenOptions) {
                _self.PurchaseTimeCounter.visible = false;
                _self.PurchaseLine.children[0].children[0].text = value.PurchaseTime.InSecond > 9 ? ':' + value.PurchaseTime.InSecond : ':0' + value.PurchaseTime.InSecond;
                _self.PurchaseLine.children[0].children[0].position.x = -8;
                _self.PurchaseLine.children[0].children[0].position.y = -8;

                _self.PurchaseLine.children[0].children[0].style = {
                    fontSize: 15,
                    fontFamily: FontAwesome.fontFamily,
                    fill: 'black'
                }

                if (value.PurchaseTime.InSecond < 0) {
                    _self.PurchaseLine.children[0].children[0].text = '\uf017';
                    _self.PurchaseLine.children[0].children[0].position.x = -8.5;
                    _self.PurchaseLine.children[0].children[0].position.y = -10;
                    _self.PurchaseLine.children[0].children[0].style = {
                        fontSize: 20,
                        fontFamily: FontAwesome.fontFamily,
                        fill: 'black'

                    }
                    _self.ExpirationLine.children[0].children[0].text = (30 + value.PurchaseTime.InSecond) > 9 ? ':' + (30 + value.PurchaseTime.InSecond) : ':0' + (30 + value.PurchaseTime.InSecond);
                }

                if (value.isExpired) {
                    _self.UpdateResult(self.ChartViewSettings.CloseQuote);
                    //
                    self.runAnimateWhenExpired = false;
                    _self.ExpirationLine.children[0].children[0].text = '\uf11e';

                }

            }
        };

        _self.UpdateResult = function (close) {
            var y = self.GetYAxis(close);
            var _pl = self.ChartViewSettings.ProfitLoss;
            if (_pl > 0) {
                _color = 0x3dce4e;
                _pl = "+$" + _pl.toFixed(2);
            } else {
                _color = 0xc0392b;
                _pl = "-$" + Math.abs(_pl.toFixed(2));
            }
            if (isNaN(close)) {
                _self.ExpirationLine.balloon.IsLoading();
                close = self.TickPointerView.ClosePrice;
                y = self.GetYAxis(close);
                _self.ExpirationEndLine.visible = false;
            }
            else {
                _self.ExpirationLine.balloon.Change("left", "Result (P/L)\n" + _pl + "", _color, font__style, CloseBalloon);
                _self.ExpirationLine.balloon.isResult = true;
                _self.ExpirationEndLine.visible = true;
            }
            _self.ExpirationLine.balloon.Position(7, y);
            _self.ExpirationLine.closepoint.position.y = y;
            _self.ExpirationEndLine.position.y = y;
            _self.ExpirationEndLine.children.length = 0;
            _self.ExpirationEndLine.addChild(DrawResultPolygon(close, _color));
            _self.ExpirationLine.balloon.Drawing.visible = true;
            _self.ExpirationLine.closepoint.visible = true;
        }

        _self.ExpirationViewPanAnimation = function (s) {
            _self.PurchaseLine.x -= s;
            _self.ExpirationLine.x -= s;
            if (_self.PurchaseLine.x - 90 < timer_pos) {
                _self.PurchaseTimeCounter.x = _self.PurchaseLine.x - 90;
                _self.PurchaseTimeCounter.children[0].visible = true;
                _self.PurchaseTimeCounter.children[2].visible = false;
            } else {
                _self.PurchaseTimeCounter.x = timer_pos;
                _self.PurchaseTimeCounter.children[0].visible = false;
                _self.PurchaseTimeCounter.children[2].visible = true;
            }
        };

        _self.OnDraggedExpirationView = function (_param) {
            _self.PurchaseLine.position.x += _param;
            _self.ExpirationLine.position.x += _param;
            _self.PurchaseTimeCounter.position.x += _param;
        };

        function DrawPurchaseLine() {

            var startAngle = Math.PI * 1.5;
            var _100Percent = Math.PI * 2;
            var _dash = DrawDashedLine([_initPos, 0], [_initPos, params.ChartDrawingAreaHeight], 1, 1, 2, 0xffffff);
            var _timer = new PIXI.Graphics();

            _timer.beginFill(0xffffff);

            _timer.lineStyle(2, 0xffffff);
            _timer.arc(0, 0, 15, startAngle, startAngle + _100Percent);// cx, cy, radius,startangle,endangle
            var clock = new PIXI.Text('\uf017', {
                fontSize: 20,
                fontFamily: FontAwesome.fontFamily,
                fill: 'black'
            });
            clock.position.x = -8.5;
            clock.position.y = -10;
            _timer.rotation = 180.63;
            _timer.addChild(clock);
            _dash.addChild(_timer);
            _timer.position.x = params.ChartDrawingAreaHeight - (_timer.height / 2);
            return _dash;
        }

        function DrawResultPolygon(text, color) {
            var _lineStyle = {
                width: 1,
                color: color == undefined ? 0xef7809 : color
            };
            var closeValue = DrawPolygon({
                xPosition: params.cWidth,
                width: 100,
                height: 1,
                space: 17
            }, _lineStyle, text, {
                    fontSize: 14,
                    fill: 'white'
                });
            return closeValue;
        }

        function DrawExpirationEnd() {
            var _graphic = DrawDashedLine([0, 0], [params.cWidth, 0], 2, 1, 2, 0xffffff);
            _graphic.addChild(DrawResultPolygon("XXX", 0xef7809));
            return _graphic;
        }

        function CloseBalloon() {
            params.CloseQuote = NaN;
            _self.ExpirationLine.balloon.IsLoading();
            _self.ExpirationLine.balloon.Drawing.visible = false;
            _self.ExpirationLine.closepoint.visible = false;
            _self.ExpirationEndLine.visible = false;
            params.OpenOption = [];
            ActiveOptionViewStage.children = [];
            self.ChartViewSettings.OnExpirationStateChanged();
            self.runAnimateWhenExpired = true;
            self.LocateCurrentPrice();
        }

        function DrawExpirationLine() {
            var startAngle = Math.PI * 1.5;
            var _100Percent = Math.PI * 2;
            var _color = 0xFA4225;
            var _dash = DrawLine([_initPos, 0], [_initPos, params.ChartDrawingAreaHeight], {
                color: _color,
                width: 2
            })
            var _timer = new PIXI.Graphics();
            _timer.beginFill(0xFA4225);
            _timer.lineStyle(2, 0xFA4225);
            _timer.arc(0, 0, 15, startAngle, startAngle + _100Percent);// cx, cy, radius,startangle,endangle
            var flag = new PIXI.Text('\uf11e', {
                fontSize: 15,
                fontFamily: FontAwesome.fontFamily,
                fill: 'white'
            });
            flag.position.x = -8;
            flag.position.y = -8;
            _timer.addChild(flag);
            _dash.addChild(_timer);
            _timer.position.x = _initPos;
            _timer.position.y = params.ChartDrawingAreaHeight - (_timer.height / 2);

            _dash.balloon = new DrawBalloon("left", "Result (P/L)\n+$1.00", 0x3dce4e, font__style, CloseBalloon);
            _dash.balloon.IsLoading();
            _dash.balloon.Position(7, 80);
            _dash.closepoint = DrawPoint(4, 0xffffff);
            _dash.closepoint.position.x = 0;
            _dash.closepoint.position.y = 0;
            _dash.addChild(_dash.closepoint);
            _dash.addChild(_dash.balloon.Drawing);
            return _dash;
        }

        function DrawPurchaseTimer() {
            var _graphic = new PIXI.Graphics();
            var _style = {
                fontSize: 10,
                fontFamily: 'Arial',
                fill: 'white',
                align: "right"
            };
            var _textGraphic = new PIXI.Text('PURCHASE\nTIME', _style);
            var __style = {
                fontSize: 25,
                fontFamily: 'Arial',
                fill: 'white'
            };
            var _timerGraphic = new PIXI.Text("00:00", __style);
            var clock = new PIXI.Text('\uf017', {
                fontSize: 25,
                fontFamily: FontAwesome.fontFamily,
                fill: 'white'
            });
            _textGraphic.visible = false;
            _graphic.addChild(_textGraphic);
            _graphic.addChild(_timerGraphic);
            _graphic.addChild(clock);
            _timerGraphic.x = _textGraphic.width + 3;
            _textGraphic.y = 2;
            clock.position.x = _timerGraphic.x - clock.width - 2;
            var _tempPos = _param.cWidth - _graphic.width - 2;
            timer_pos = _tempPos;
            _graphic.x = timer_pos;
            return _graphic;
        }

        _self.CloseResultTransaction = CloseBalloon;
        stage.addChild(_self.ExpirationEndLine);
        stage.addChild(_self.ExpirationLine);
        stage.addChild(_self.PurchaseLine);
        _self.PurchaseTimeCounter.visible = false;
        _self.PurchaseLine.visible = false;
        _self.ExpirationLine.visible = false;
        _self.ExpirationEndLine.visible = false;
        _self.ExpirationLine.balloon.Drawing.visible = false;
        _self.ExpirationLine.closepoint.visible = false;
        return _self;
    }

    function DrawNewOptionView(x, y, _type) {
        var _self = this;
        var _color = _type.TransactionType == "UP" ? 0x3dce4e : 0xc0392b;
        var _arrow = _type.TransactionType == "UP" ? '\uf0d8' : '\uf0d7';
        var font__style = {
            fontSize: 11,
            fontFamily: params.ChartStyle.fontFamily,
            fill: "white",
            padding: 4
        };
        var _lineStyle = {
            width: 1,
            color: _color
        };
        var tempPos = x;
        var _point = DrawPoint(7, 0xffffff);//new PIXI.Graphics();
        _point.interactive = true;
        var _inner = DrawPoint(6, _color);
        _point.addChild(_inner);
        _point.position.x = tempPos;
        var arrow = new PIXI.Text(_arrow, {
            fontSize: 11,
            fontFamily: FontAwesome.fontFamily,
            fill: 'white'
        });
        arrow.position.x = -3.2;//tempPos;// - arrow.width /2;
        arrow.position.y = _type.TransactionType == "UP" ? -8 : -7;
        _point.addChild(arrow);
        _point.mouseover = function (e) {
        };

        function GetAmountLabel(_Amount, Count) {
            var _amnt = parseFloat(_Amount) > 0 ? "$" + parseFloat(_Amount).toFixed(0) : "$" + Math.abs(parseFloat(_Amount)).toFixed(0);
            return Count > 1 ? _amnt + " x " + Count : _amnt;
        }

        var _DashedlineView = DrawDashedLine([0, 0], [params.cWidth, 0], 1, 2, 3, _color);
        // var _lineView = DrawLine([tempPos, 0.5], [params.cWidth, 0.5], _lineStyle);
        var _priceView = DrawPolygon({
            xPosition: params.cWidth,
            width: 75,
            height: 0,
            space: 10
        }, _lineStyle, _type.StartQuote, {
                fontFamily: params.ChartStyle.fontFamily,
                fontSize: params.ChartStyle.fontSize,
                fill: "white",
                align: "center"
            });
        // _DashedlineView.addChild(_lineView);
        _DashedlineView.addChild(_priceView);
        _DashedlineView.addChild(_point);
        _DashedlineView.balloon = new DrawBalloon('top', GetAmountLabel(_type.Amount, _type.count), _color, font__style);
        _DashedlineView.balloon.Position(_point.position.x, 10);
        _DashedlineView.addChild(_DashedlineView.balloon.Drawing);
        _DashedlineView.position.y = y;
        ActiveOptionViewStage.addChild(_DashedlineView);

        _self.AnimateNewOptionView = function (s) {
            _point.position.x -= self.runAnimateWhenExpired ? s : 0;
            var _expLinePos = self.ExpirationView.ExpirationLine.position.x > params.cWidth ? params.cWidth : self.ExpirationView.ExpirationLine.position.x + 100;
            // _lineView.clear();
            // _lineView.lineStyle(_lineStyle.width, _lineStyle.color);
            // _lineView.moveTo(tempPos + _point.position.x, 0.5);
            // _lineView.lineTo(_expLinePos, 0.5);
            _DashedlineView.balloon.Position(_point.position.x, 10);
        };

        _self.OnDragged = function (_param) {
            _point.position.x += _param;
            _DashedlineView.balloon.Position(_point.position.x, 10);
        };

        _self.Update = function (model) {
            _DashedlineView.position.y = self.GetYAxis(parseFloat(model.StartQuote));
            _DashedlineView.balloon.Change('top', GetAmountLabel(model.Amount, model.count), _color, font__style);
        };

        return _self;
    }

    function DrawCursorPointerView(_param, _chartView) {
        var _self = this;
        var _lineStyle = {
            width: 0.3,
            color: _param.ChartStyle.PointerGridColor
        };
        _self.VerticalLine = DrawLine([0, 0], [0, _param.cHeight], _lineStyle);
        _self.HorizontalLine = DrawLine([0, 0], [_param.cWidth, 0], _lineStyle);

        var _Stamp = DrawText("x", 130);
        _Stamp.position = {
            x: _self.VerticalLine.x - (_Stamp.width / 2),
            y: _param.ChartDrawingAreaHeight + 2
        };
        _self.VerticalLine.addChild(_Stamp);

        var _Price = DrawPolygon({
            xPosition: _param.cWidth,
            width: 85,
            height: 0,
            space: 10
        }, _lineStyle, 'X.XXXXX', {
                fontFamily: params.ChartStyle.fontFamily,
                fontSize: params.ChartStyle.fontSize,
                fill: "black",
                align: "center"
            });

        _self.HorizontalLine.addChild(_Price);

        _self.ReDraw = function (x, y, IsVisible, Stamp, Price) {
            _self.VerticalLine.x = x;
            _self.HorizontalLine.y = y;
            _self.VerticalLine.visible = IsVisible;
            _self.HorizontalLine.visible = IsVisible;
            _self.VerticalLine.children[0].children[0].text = FormatStampValue(Stamp, "y-m-d-hh-mm-ss");
            _self.HorizontalLine.children[0].children[0].text = Price;
        };

        function DrawText(orient, _width) {
            var bgGraphics = new PIXI.Graphics();
            bgGraphics.beginFill(_param.ChartStyle.PointerGridColor);
            bgGraphics.lineStyle(0.5, _param.ChartStyle.PointerGridColor);
            bgGraphics.drawRect(0, 0, _width, 18);
            bgGraphics.endFill();

            var text = new PIXI.Text(orient == "x" ? FormatStampValue(_param.StartTime, "y-m-d-hh-mm-ss") : "XXX", {
                fontFamily: params.ChartStyle.fontFamily,
                fontSize: params.ChartStyle.fontSize,
                fill: "black",
                align: "center"
            });
            text.x = orient == "x" ? (bgGraphics.width / 2) - text.width / 2 : bgGraphics.width - text.width - 2;
            text.y = 1;
            bgGraphics.addChild(text);
            return bgGraphics;
        }

        _chartView.addChild(_self.VerticalLine);
        _chartView.addChild(_self.HorizontalLine);
        _self.VerticalLine.visible = false;
        _self.HorizontalLine.visible = false;
        return _self;
    }

    function DrawTickPointerView(_param, _chartView) {
        var _self = this;
        var _rawPosition = 0;
        // var _lineStyle = { color: 0xef7809, width: 1, alpha: 0.7 };
        var _lineStyle = { color: 0xffffff, width: 1, alpha: 0.7 };
        var _pos1 = [0, 0];
        var _pos2 = [params.cWidth, _pos1[1]];
        var newBar = {};
        var isInitPosition = true;
        var _lastBar = {};

        function DrawTickPointer() {
            var _y = _pos1[1];
            var _graphic = DrawLine(_pos1, _pos2, _lineStyle);
            var _tickValue = DrawPolygon({
                xPosition: params.cWidth,
                width: 100,
                height: _y,
                space: 17
            }, _lineStyle, "000000000", {
                    fontSize: 14,
                    fill: 'black'
                });
            _self.TickFlicker = DrawGradientFlicker();
            var _point = DrawPoint(4, 0x40b240);
            _point.position = {
                x: 0,
                y: _y
            };
            _chartView.addChild(_graphic);
            _point.addChild(_self.TickFlicker);
            _graphic.addChild(_tickValue);
            _graphic.addChild(_point);
            return _graphic;
        }

        function DrawGradientFlicker() {
            var _sprite = PIXI.Sprite.fromImage('styles/images/tick.png');
            _sprite.position = {
                x: 0,
                y: 0
            };
            _sprite.scale.set(0);
            _sprite.aplha = 0;
            return _sprite;
        }

        _self.TickPointer = DrawTickPointer();
        _self.TickPrice = _self.TickPointer.children[0].children[0];
        _self.TickStamp = _self.TickPointer.children[1];
        _self.TickPrice.Update = function (text, style) {
            _self.TickPrice.text = text;
            _self.TickPrice.style.fill = style.color;
            _self.TickPrice.style.fontWeight = style.weight;
        };

        var flickTween = PIXI.tweenManager.createTween(_self.TickFlicker);

        flickTween.time = 250;
        flickTween.easing = PIXI.tween.Easing.linear();
        flickTween.loop = true;
        flickTween.start();

        var lineTween = PIXI.tweenManager.createTween(_self.TickPointer);
        var _tempNewBarPos;
        var _tempLastBarPos;


        _self.OnTickChanged = function (bar) {
            if (self.runAnimateWhenExpired) {
                _self.TickStamp.visible = true;
                _self.TickPointer.visible = true;
            } else {
                _self.TickStamp.visible = false;
                _self.TickPointer.visible = false;
            }
            newBar = bar;
            newBar.Stamp = typeof newBar.Stamp == "string" ? Number(newBar.Stamp) : newBar.Stamp;
            if (params.GraphType == "CandleStick") {
                _tempNewBarPos = self.LineView.CandleStick.ComputeBarPosition(newBar.Stamp);
                _tempLastBarPos = self.LineView.CandleStick.ComputeBarPosition(_lastBar.Stamp);
                var _i = params.TimeInterval;
                _self.TickStamp.position.x = _i == 5000 || _i == 15000 ? self.GetXAxis(_tempNewBarPos) - (((params.PointSpace * 5) / (_i / 1000)) / 2) : self.GetXAxis(_tempNewBarPos);
            }
            else {
                _tempNewBarPos = newBar.Stamp;
                _tempLastBarPos = _lastBar.Stamp;
                _self.TickStamp.position.x = self.GetXAxis(_tempNewBarPos);
            }
            if (isInitPosition) {
                params.ChartVar.yMin = newBar.Close;
                _self.TickStamp.position.x = self.GetXAxis(_tempNewBarPos);
                _self.TickPointer.position.y = self.GetYAxis(newBar.Close);
                _self.TickStamp.Value = _tempNewBarPos;
                isInitPosition = false;
                _lastBar = bar;
                var _loading = DrawLoadingView(null, _tempNewBarPos);
                // LoadingViewStage.addChild(_loading);
            }
            if (_lastBar != undefined && _tempNewBarPos != _tempLastBarPos) {
                var lastX = self.GetXAxis(_lastBar.Stamp);

                self.LineView.setLastPoint(newBar, _self.TickPointer.position.y);
                self.LineView.drawHistoryPath(params.ChartVar, params.PointSpace, lastX);
            }
            _self.TickStamp.Value = newBar.Stamp;
            if (_self.TickStamp.Value == self.ExpirationView.ExpirationTick) {
                _self.ClosePrice = newBar.Close;
                self.ExpirationView.UpdateResult();
            }
            lineTween.time = 10;
            lineTween.easing = PIXI.tween.Easing.linear();
            lineTween.loop = true;
            lineTween.start();
            _lastBar = bar;
        };

        _self.TickPointerViewPanAnimation = function (s) {
            _self.TickStamp.x -= s;
        };

        _self.OnDraggedTickPointerView = function (_param) {
            _self.TickStamp.position.x += _param;
        }

        _self.StopTweenAnimation = function () {
            self.LineView.AnimatedLine.visible = false;
            flickTween.stop();
            lineTween.stop();
        };

        _self.StartTweenAnimation = function () {
            self.LineView.AnimatedLine.visible = true;
            flickTween.start();
            lineTween.start();
        };

        flickTween.on('update', function (delta) {
            if (_counter >= 15 || _counter <= 0) {
                _radius_diff = -_radius_diff;
                _pos_diff = -_pos_diff;
                _iterate = -_iterate;
            }
            var _xPos = _self.TickFlicker.position.x + _pos_diff;
            var _scale = _self.TickFlicker.scale.x + _radius_diff;
            _self.TickFlicker.position = {
                x: _xPos,
                y: _xPos
            };
            _self.TickFlicker.scale.set(_scale);
            _self.TickFlicker.alpha = _scale;
            _counter += _iterate;
        });

        lineTween.on('update', function (delta) {
            var __y = isNaN(_self.TickPointer.position.y) ? (_param.cHeight / 2) : _self.TickPointer.position.y;
            var _newY = self.GetYAxis(newBar.Close);
            var _diff = Math.abs(_newY - __y) * 100 / 1000;
            var _style = {};
            if (Math.floor(__y) == Math.floor(_newY)) {
                _style = {
                    color: 0x000000,
                    weight: 'normal'
                };
            } else if (_newY > __y) {
                _newY = __y + _diff;
                _style = {
                    color: 0xc0392b,
                    weight: 'bold'
                };
            } else {
                _newY = __y - _diff;
                _style = {
                    color: 0x40b240,
                    weight: 'bold'
                };
            }
            _self.TickPointer.position.y = _newY;
            _self.TickPrice.Update(self.GetPrice(_newY), _style);
            _self.TickStamp.Value = Number(newBar.Stamp);
            self.LineView.OnPriceChangedAnimation(_self.TickStamp.Value, _newY, newBar);
        });

        var _iterate = 1;
        var _counter = 15;
        var _radius_diff = -0.1;
        var _pos_diff = 2.5;
        _self.TickStamp.visible = false
        return _self;
    }

    function CheckActiveBoard(x) {
        var _active;
        var _aGraph;
        if (self.BoardSprite_A.x + self.BoardSprite_A.width >= x) {
            _active = self.BoardSprite_A;
            _activeGraph = self.BoardGraphic_A;
        } else {
            _active = self.BoardSprite_B;
            _activeGraph = self.BoardGraphic_B;
        }
        self.ActiveBoardSprite = _active;
        self.ActiveBoardGraph = _activeGraph;
    }

    function DrawLine(pos1, pos2, _lineStyle) {
        var _line = new PIXI.Graphics();
        var _alpha = _lineStyle.alpha ? _lineStyle.alpha : 1;
        _line.lineStyle(_lineStyle.width, _lineStyle.color, _alpha);
        _line.moveTo(pos1[0], pos1[1]);
        _line.lineTo(pos2[0], pos2[1]);
        return _line;
    }

    function DrawPoint(size, color) {
        var _point = new PIXI.Graphics();
        _point.beginFill(color);
        _point.drawCircle(0, 0, size);
        return _point;
    }

    function DrawPolygon(_param, _style, _text, _textStyle) {
        var graphics = new PIXI.Graphics();
        var _height = _param.height;
        var _spaces = _param.space;
        var _width = _param.width;
        var _xpos = _param.xPosition;

        var point1 = [_xpos - _width, _height];
        var point2 = [point1[0] + _spaces, _height - _spaces];
        var point3 = [_xpos, point2[1]];
        var point4 = [_xpos, _height + _spaces];
        var point5 = [point2[0], point4[1]];


        // set a fill and line style
        graphics.beginFill(_style.color);

        // draw a shape
        graphics.moveTo(point1[0], point1[1]);
        graphics.lineTo(point2[0], point2[1]);
        graphics.lineTo(point3[0], point3[1]);
        graphics.lineTo(point4[0], point4[1]);
        graphics.lineTo(point5[0], point5[1]);
        graphics.lineTo(point1[0], point1[1]);
        graphics.endFill();

        if (_text) {
            var _textGraphic = new PIXI.Text(_text, _textStyle);
            _textGraphic.position = {
                x: _xpos - _textGraphic.width - 2,
                y: _height - _textGraphic.height / 2
            };
            graphics.addChild(_textGraphic);
        }

        return graphics;
    }

    function DrawDashedLine(pos1, pos2, linewidth, length, space, _color) {
        var dashed = new PIXI.Graphics();
        dashed.lineStyle(linewidth, _color, 1); // linewidth,color,alpha
        dashed.moveTo(0, 0);
        dashed.lineTo(length, 0);
        var _temp = length + space;
        dashed.moveTo(_temp, 0);
        dashed.lineTo(length + _temp, 0);
        var dashedtexture = dashed.generateCanvasTexture(1, 1);
        var linelength = Math.pow(Math.pow(pos2[0] - pos1[0], 2) + Math.pow(pos2[1] - pos1[1], 2), 0.5);
        var tilingSprite = new PIXI.extras.TilingSprite(dashedtexture, linelength, linewidth);
        tilingSprite.x = pos1[0];
        tilingSprite.y = pos1[1];
        tilingSprite.rotation = GetAngle(pos1, pos2);
        tilingSprite.pivot.set(linewidth / 2, linewidth / 2);
        return tilingSprite;
    }

    function DrawBalloon(pointerPosition, text, BalloonColor, FontStyle, CloseMethod) {
        var obj = this;
        obj.isResult = false;
        var balloon = new PIXI.Graphics();
        var _adjustment = 0;
        var padding = FontStyle.padding;
        function ReDraw(content, ballooncolor, style, closecallback) {
            var position = obj.Orientation;
            balloon.beginFill(ballooncolor, 0.8);
            var fontSize = style.fontSize;
            var Balloontext = new PIXI.Text(content, style);

            var balHeight = Balloontext.height + padding;
            var balHeightAllowance = balHeight * 0.25;
            var balwidth = balHeightAllowance + Balloontext.width + padding;
            var x = 0;
            var y = balHeight / 2;

            balloon.addChild(Balloontext);
            if (closecallback) {
                var closeBtn = new PIXI.Text('\uf00d', {
                    fontSize: 12,
                    fontFamily: FontAwesome.fontFamily,
                    fill: 'white'
                });

                closeBtn.interactive = true;
                closeBtn.on('mousedown', function (ars) {
                    closecallback();
                });
                switch (position) {
                    case "left":
                        balwidth += closeBtn.width + padding;
                        closeBtn.position.x = balwidth - closeBtn.width - padding / 2;
                        closeBtn.position.y = Balloontext.height / fontSize < 2 ? y - (closeBtn.height / 2) : padding / 2;
                        break;
                    case "top":
                        balwidth += closeBtn.width + padding;
                        closeBtn.position.x = (balwidth / 2) - (padding / 2) - closeBtn.width;
                        closeBtn.position.y = y + balHeightAllowance + padding / 2;
                        break;
                }
                balloon.addChild(closeBtn)
            }

            switch (position) {
                case "left":
                    var _half = balHeight / 2;
                    balloon.moveTo(x, y); //p1
                    balloon.lineTo(x + balHeightAllowance, y - balHeightAllowance); //p2
                    balloon.lineTo(x + balHeightAllowance, y - _half); //p3
                    balloon.lineTo(x + balwidth, y - _half); //p4
                    balloon.lineTo(x + balwidth, y + _half); //p5
                    balloon.lineTo(x + balHeightAllowance, y + _half); // p6
                    balloon.lineTo(x + balHeightAllowance, y + balHeightAllowance); //p7
                    Balloontext.x = balHeightAllowance + padding / 2;
                    Balloontext.y = y - Balloontext.height / 2;
                    break;
                case "top":
                    var _half = balwidth / 2;
                    balloon.moveTo(x, y); //p1
                    balloon.lineTo(x + balHeightAllowance, y + balHeightAllowance); //p2
                    balloon.lineTo(x + _half, y + balHeightAllowance); //p3
                    balloon.lineTo(x + _half, y + balHeightAllowance + balHeight); //p4
                    balloon.lineTo(x - _half, y + balHeightAllowance + balHeight); //p5
                    balloon.lineTo(x - _half, y + balHeightAllowance); // p6
                    balloon.lineTo(x - balHeightAllowance, y + balHeightAllowance); //p7
                    Balloontext.x = closecallback == undefined ? x - Balloontext.width / 2 : (x - Balloontext.width / 2) - padding;
                    Balloontext.y = y + balHeightAllowance + padding / 2;
                    break;
            }
            balloon.endFill();
            obj.Position(obj.LastPosition.x, obj.LastPosition.y);
        }

        obj.Orientation = pointerPosition;

        obj.Change = function (pointerPosition, text, BalloonColor, FontStyle, CloseMethod) {
            obj.Orientation = pointerPosition;
            balloon.clear();
            balloon.children.length = 0;
            ReDraw(text, BalloonColor, FontStyle, CloseMethod);
        }
        obj.LastPosition = {
            x: 0,
            y: 0
        };

        obj.Position = function (x, y) {
            _adjustment = balloon.height / 4;
            if (x != undefined && y != undefined) {
                obj.LastPosition.x = x;
                obj.LastPosition.y = y;
                balloon.position.x = x;
                balloon.position.y = y - (balloon.height / 2) + (obj.Orientation == "left" && obj.isResult ? padding / 2 : 0);
            } else if (x != undefined && y == undefined) {
                balloon.position.x = x;
            } else if (x == undefined && y != undefined) {
                balloon.position.y = y - (balloon.height / 2);// + (obj.Orientation == "left" ? padding / 2 : 0);
            } else {
                return {
                    x: balloon.position.x,
                    y: balloon.position.y - _adjustment
                }
            }
        }

        obj.IsLoading = function () {
            let loading__style = {
                fontFamily: FontAwesome.fontFamily,
                fontSize: 20,
                fill: "#ffffff",
                align: "left"
            };
            obj.isResult = false;
            balloon.clear();
            balloon.children.length = 0;
            ReDraw("\uf110", 0xc9c9d6, loading__style);
        };

        ReDraw(text, BalloonColor, FontStyle, CloseMethod);

        obj.Drawing = balloon;

        return obj;
    }

    function GetAngle(pos1, pos2) {
        var x0 = pos1[0],
            y0 = pos1[1],
            x1 = pos2[0],
            y1 = pos2[1];
        var diff_x = Math.abs(x1 - x0),
            diff_y = Math.abs(y1 - y0);
        var cita;
        if (x1 > x0) {
            if (y1 > y0) {
                cita = 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
            } else {
                if (y1 < y0) {
                    cita = -360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
                } else {
                    cita = 0;
                }
            }
        } else {
            if (x1 < x0) {
                if (y1 > y0) {
                    cita = 180 - 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
                } else {
                    if (y1 < y0) {
                        cita = 180 + 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
                    } else {
                        cita = 180;
                    }
                }
            } else {
                if (y1 > y0) {
                    cita = 90;
                } else {
                    if (y1 < y0) {
                        cita = -90;
                    } else {
                        cita = 0;
                    }
                }
            }
        }
        return cita * Math.PI / 180;
    }

    function ChartBorder(position) {
        var texture;
        var tilingSprite;
        switch (position) {
            case "left":
                texture = PIXI.Texture.fromImage('styles/images/gradient1.png');
                tilingSprite = new PIXI.extras.TilingSprite(texture, 50, params.cHeight);
                break;
            default:
                texture = PIXI.Texture.fromImage('styles/images/gradient.png');
                tilingSprite = new PIXI.extras.TilingSprite(texture, params.cWidth, 50);
                break;
        }
        return tilingSprite;
    }

    function UpdateOpenOptionsDrawing() {
        for (let x = 0; x < params.OpenOption.length; x++) {
            params.OpenOption[x].View.Update(params.OpenOption[x].Model);
        }
    }



    InitGridLines();
    return self;
};

var PTOptionsChartManager = function (params, id, $scope, barsUpdateEvent, ptoData) {
    var self = this;
    self.name = "ChartMgr";
    var chartCanvas = document.getElementById(id);
    var renderer = new PIXI.autoDetectRenderer(params.cWidth, params.cHeight, {
        view: chartCanvas,
        antialias: true
    });
    var stage = new PIXI.Container();
    var mainContainer = new PIXI.Container();
    var cView = new PTOptionsChartView(params, "Chart1");
    // var marker = new PIXI.Graphics();

    var animationCancellationToken;
    //cView.ChartView.on('mousemove', MouseMove);
    cView.ChartView.on('mousedown', MouseDown);
    $(chartCanvas).on('mousemove', MouseMove);
    $(chartCanvas).mouseout(MouseLeave);
    $(chartCanvas).on('mousewheel', MouseWheel);
    cView.ChartView.on('mouseup', MouseUp);
    //cView.ChartView.addChild(marker);

    function MouseUp(e) {
        cView.isMouseDown = false;
    }

    function MouseDown(e) {
        var point = e.data.getLocalPosition(cView.ChartView);
        cView.isMouseDown = true;
        cView.DragStartX = point.x;
        cView.OnMouseDown(point);
    }

    function MouseLeave(e) {
        cView.Cursor(0, 0, false);
        // marker.visible = false;
        // self.Render();
    }

    function MouseMove(e) {
        //var point = e.data.getLocalPosition(cView.ChartView);
        var point = {
            x: e.offsetX,
            y: e.offsetY
        };
        if (point.x < 0 || point.y < 0) {
            cView.Cursor(point.x, point.y, false);
            // marker.visible = false;
        } else {
            if (point.x > params.cWidth || point.y > params.cHeight) {
                cView.Cursor(point.x, point.y, false);
                // marker.visible = false;
            } else {
                cView.Cursor(point.x, point.y, true);
                // marker.visible = true;
                // marker.clear().beginFill(0x888888);
                // marker.moveTo(point.x, point.y);
                // marker.drawCircle(point.x, point.y, 10);
            }
        }

        if (cView.isMouseDown) cView.OnMouseDrag(point.x);


        // self.Render();
    }

    function MouseWheel(e) {
        cView.OnMouseWheel(e.originalEvent.wheelDelta / 120);
    }
    var bg = PIXI.Sprite.fromImage('styles/images/map-flat.png');
    bg.alpha = 0.7;
    bg.width = params.cWidth;
    bg.height = params.cHeight;
    stage.addChild(bg);
    stage.addChild(cView.ChartView);
    stage.interactive = true;
    // Uses WebGL Renderer by default if supported by the browser. If not, it uses the CanvasRenderer instead.

    self.ChangedGraphType = function (type) {
        params.GraphType = type;
        cView.GridView.LineView.ChangedGraphType();
    }

    self.ChangedTimeInterval = function (value) {
        cView.GridView.OnTimeIntervalChanged(value != 1 ? 1000 * value : 5000);
    }

    self.OnLiveBars = function (bar) {
        var _barCollection = cView.ChartViewSettings.BarCollection;
        var isExist = false;
        var count = _barCollection.length;
        if (count != 0) {
            if (_barCollection[0].Stamp == bar.Stamp) {
                _barCollection[0].Close = bar.Close;
                isExist = true;
                console.log("Exist");
            }
        }
        if (!params.IsActive) return;
        if (!isExist) _barCollection.unshift(bar);
        var _lastyMin = params.ChartVar.yMin;
        var _lastyMax = params.ChartVar.yMax;
        cView.GridView.SetYminYmax();
        if (_lastyMin != params.ChartVar.yMin || _lastyMax != params.ChartVar.yMax) {
            cView.GridView.ChangeYProperty(_lastyMin, _lastyMax);
        }
        cView.GridView.TickPointerView.OnTickChanged(bar);
    };

    self.OnCloseResultTransaction = function () {
        cView.GridView.ExpirationView.CloseResultTransaction();
    }

    self.ChangedSymbol = function (symbol) {
        cView.ChartViewSettings.Symbol = symbol;
        // cView.GridView.ChartViewSettings.ChartVar.yMax = 0;
        // cView.GridView.ChartViewSettings.ChartVar.yMin = 0;
        cView.GridView.LineView.ReDraw();
    }

    self.GetSettings = function () {
        return cView.ChartViewSettings;
    }

    self.ChangeChartStamp = function (_param) {
        cView.GridView.OnChartStampChanged(_param);
    };

    self.ExpirationUpdates = function (_param) {
        cView.GridView.ExpirationView.Update(_param);
    };


    self.BarData = [];
    self.UpdateQuoteData = function (quote) {
        return;
        if (!quote) return;
        var _bar = RandomBar(quote);
        var isPriceChanged = false;
        if (self.BarData.length) {
            if (new Date(self.BarData[0].Stamp).getTime() == _bar.Stamp) {
                self.BarData[0] = quote;
                isPriceChanged = true;
            }
            else self.BarData.unshift(_bar);
        } else {
            self.BarData.unshift(_bar);
        }
        cView.GridView.SetYminYmax(self.BarData);
        cView.GridView.UpdateGridPriceValue();
        cView.GridView.OnTickChanged(_bar);
    };

    self.RequestCollection = [];

    self.BarsRequestUpdate = function () {
        var count = self.RequestCollection.length;
        if (count != 0) {
            if (count === 1) {
                $scope.$emit(barsUpdateEvent, self.RequestCollection[0]);
            }
        }
    };

    self.RequestData = function (end, start) {
        // debugger;
        var hours = (60000 * 60) * 24;
        // var hourss = (60000 * 60) * 1;
        // var hh = hourss * 24;
        // var End = new Date().getTime() - (hh * 5);
        var End = typeof end == "object" ? end.getTime() : end;//new Date().getTime();
        if ((typeof ptoData.CurrentTime == "object" ? ptoData.CurrentTime.getTime() : ptoData.CurrentTime) > End) return;
        var Start = start == undefined ? End - hours : start;
        // debugger;
        var RequestObject = {
            symbol: "EURUSD",            
            timeframe: "2",
            interval: "5",
            start: Start,
            end: End
        };
        // var isRequested = false;
        // for (var i = 0; i < self.RequestCollection.length; i++) {
        //     if (self.RequestCollection[i].end >= RequestObject.end) {
        //         isRequested = true;
        //     } else {
        //         if (ptoData.CurrentTime < RequestObject.end) {

        //         }
        //     }
        //     if (self.RequestCollection[i].start <= RequestObject.start) {
        //         isRequested = true;
        //     }
        // }
        // if (!isRequested) self.RequestCollection.push(RequestObject);
        $scope.$emit(barsUpdateEvent, RequestObject);
        //params.RequestBars(RequestObject);
    };

    self.SetBarsData = function () {
        // for (var x = 0; x < self.RequestCollection.length; x++) {
        //     for (var x = 0; x < ptoData.BarsData.length; x++) {
        //         var ResponseData = ptoData.BarsData[x];
        //     }
        // }
        ptoData.BarsData
        self.RequestCollection = [];
        cView.SetChartData(ptoData.BarsData);
    };

    self.startAnimation = function () {
        if (animationCancellationToken == null) {
            animationCancellationToken = requestAnimationFrame(self.Animate);
            self._Animate();
        }
        // Start Animation Code
    };

    self.stopAnimation = function () {
        // Stop Animation Code
        if (animationCancellationToken != null) {
            cancelAnimationFrame(animationCancellationToken);
            animationCancellationToken = null;
        }
    };

    self.OnOpenOption = function (params) {
        cView.GridView.AddNewOption(params);
    };

    self.OnCloseOption = function (params) {
        // debugger;
    };

    self.LocateCurrentPrice = function () {
        cView.GridView.LocateCurrentPrice();
    };

    //Render Main Container
    self.Render = function () {
        renderer.render(stage);
    };

    self.ResizeChart = function (width, height) {
        // Resize Code
    };

    self._Animate = function (e, x) {
        if (params.IsActive) {
            PIXI.tweenManager.update();
            self.Render();
        }
        requestAnimationFrame(self._Animate);
    }

    self.Animate = function (e, x) {
        if (params.IsActive) {
            cView.ProcessGrid();
            //PIXI.tweenManager.update();
            self.Render();
        }
        setTimeout(function () {
            requestAnimationFrame(self.Animate);
        }, 10);
    }


    return self;
};

var DrawLineGraphView = function (stage, GridView) {
    var _self = this;
    var ptoLine = new PTO_Line(0xffffff, GridView.ChartViewSettings.BarCollection);
    var LineGraph = new PIXI.Graphics();
    var animatioLine = new PIXI.Graphics();
    let lineFill = new LineFill(GridView.ChartViewSettings.ChartDrawingAreaHeight, 0x793d03);
    animatioLine.lineStyle(1.5, 0xef7809);
    LineGraph.lineStyle(1.5, 0xef7809);
    var _lastPosition = undefined;
    var _newPosition = [0, 100];
    var lastPoint = {};
    _self.BarCollection = GridView.ChartViewSettings.BarCollection;
    _self.CandleStick = new DrawCandleStickView(stage, GridView);
    _self.AnimatedLine = animatioLine;
    _self.DrawBarHistory = function (bars) {
        var _points = GridView.TickPointerView == undefined ? 0 : GridView.GetVisiblePoints(GridView.TickPointerView.TickStamp.position.x);
        _points = _points < bars.length ? _points == 0 ? 0 : _points + 10 : bars.length;
        _points = GridView.ChartViewSettings.GraphType == "CandleStick" ? Math.ceil(_points / 5) : _points;
        for (var ctr = 1; ctr < _points; ctr++) {
            var _close = bars[ctr].Close == undefined ? bars[ctr].Bid : bars[ctr].Close;
            if (ctr == 1) {
                lastPoint.x = GridView.GetXAxis(parseInt(bars[ctr].Stamp)) - LineGraph.position.x;
                lastPoint.y = GridView.GetPixelFromPrice(_close);
                _lastPosition = [lastPoint.x, lastPoint.y];
                lineFill.addPoint(lastPoint.x, lastPoint.y);
                continue;
            }

            var x = GridView.GetXAxis(parseInt(bars[ctr].Stamp)) - LineGraph.position.x;
            var y = GridView.GetPixelFromPrice(_close);

            if (GridView.ChartViewSettings.GraphType == "CandleStick") {
                barGraphic = _self.CandleStick.DrawNewCandleStick(bars[ctr]);
                if (LineGraph.children.length != 0) {
                    if (_self.CandleStick.ComputeBarPosition(bars[ctr].Stamp) != _self.CandleStick.LastBarPosition) LineGraph.addChild(barGraphic);
                    // else LineGraph.children[LineGraph.children.length - 1] = barGraphic;
                } else LineGraph.addChild(barGraphic);

            } else {
                LineGraph.moveTo(lastPoint.x, lastPoint.y);
                LineGraph.lineTo(x, y);
            }
            lastPoint.x = x;
            lastPoint.y = y;

            if (ctr === 0) {
                lineFill.endLineFill(lastPoint.x);
            }
        }
    }

    _self.GraphView = LineGraph;

    _self.drawHistoryPath = function (chartParams, pointSpace, x) {
        var adjVal = ptoLine.position.x < 0 ? (ptoLine.position.x * -1) : (ptoLine.position.x * -1);
        var adjustedX = x + adjVal;
        ptoLine.drawLinePath(chartParams, pointSpace, adjustedX);
    }

    _self.setLastPoint = function (bar, pos) {
        var tick = bar.Stamp;
        // if (_lastPosition == undefined) {
        _lastPosition = [GridView.GetXAxis(tick), pos];
        _newPosition = _lastPosition;
        // return;
        // }
    }

    _self.DrawNewLine = function (bar, pos2) {
        var tick = bar.Stamp;
        if (_lastPosition == undefined) {
            _lastPosition = [GridView.GetXAxis(tick), pos2];
            _newPosition = _lastPosition;
            if (GridView.ChartViewSettings.GraphType == "CandleStick") {
                _self.CandleStick.DrawLiveBar(animatioLine, bar);
            }
            return;
        }
        if (!_self.BarCollection[2]) return;
        var xA = GridView.GetXAxis(_self.BarCollection[2].Stamp) - LineGraph.position.x;
        var xB = GridView.GetXAxis(_self.BarCollection[1].Stamp) - LineGraph.position.x;
        switch (GridView.ChartViewSettings.GraphType) {
            case "CandleStick":
                for (var x = 0; x < _self.BarCollection.length; x++) {
                    if (_self.CandleStick.ComputeBarPosition(_self.BarCollection[x].Stamp) != _self.CandleStick.ComputeBarPosition(bar.Stamp)) {
                        var _newClose;
                        for (let i in bar) {
                            if (i == "Stamp") continue;
                            if (i == "Close") {
                                _newClose = _self.BarCollection[x][i];
                            }
                        }
                        for (let o in bar) {
                            if (o == "Stamp") continue;
                            bar[o] = _newClose;
                        }
                        _self.CandleStick.DrawLiveBar(animatioLine, bar);
                        var _bar = _self.CandleStick.DrawNewCandleStick(_self.BarCollection[x]);
                        _bar.position.x -= LineGraph.position.x;
                        LineGraph.addChild(_bar);
                        break;
                    }
                }
                break;
            case "Line Graph":
            case "Area Graph":
                if (GridView.ChartViewSettings.GraphType == "Area Graph") {
                    lineFill.updateFill(xA, _lastPosition[1], xB, _newPosition[1] + 1);
                }
                LineGraph.moveTo(xA, _lastPosition[1]);
                LineGraph.lineTo(xB, _newPosition[1]);
                break;
        }
        _lastPosition = [GridView.GetXAxis(tick), pos2];
    };

    _self.OnPriceChangedAnimation = function (tick, price, bar) {
        if (typeof animatioLine.clear == "function") {
            animatioLine.clear();
            animatioLine.lineStyle(1.5, 0xffffff);
            _newPosition = [GridView.GetXAxis(tick), price];
            if (!_lastPosition) return;
            if (GridView.ChartViewSettings.GraphType == "CandleStick") {
                _self.CandleStick.LatestBarData = bar;
                _self.CandleStick.AnimateLiveBar(animatioLine, price);
                return;
            }
            // animatioLine.moveTo(GridView.GetXAxis(tick - 1000), _lastPosition[1]);
            // animatioLine.lineTo(_newPosition[0], _newPosition[1]);
            var lp = ptoLine.getLastPoint();
            if (ptoLine.xyCount != 0) {
                animatioLine.moveTo(GridView.GetXAxis(tick - 1000), lp.y);
                animatioLine.lineTo(_newPosition[0], _newPosition[1]);
            } else {
                animatioLine.moveTo(GridView.GetXAxis(tick - 1000), _lastPosition[1]);
                animatioLine.lineTo(_newPosition[0], _newPosition[1]);
            }
        }
    };

    _self.OnDraggedLineView = function (_param) {
        LineGraph.position.x += _param;
        lineFill.position.x += _param;
        ptoLine.position.x += _param;
    }

    _self.LineViewPanAnimation = function (s) {
        LineGraph.position.x -= s;
        lineFill.position.x -= s;
        ptoLine.position.x -= s;
    }

    _self.ChangedGraphType = function () {
        var _tickPointer = GridView.TickPointerView.TickStamp;
        if (GridView.ChartViewSettings.GraphType == "CandleStick") _tickPointer.position.x = GridView.GetXAxis(_self.CandleStick.ComputeBarPosition(_tickPointer.Value)) - GridView.ChartViewSettings.PointSpace / 2;
        _self.ReDraw();
    };

    _self.ReDraw = function () {
        animatioLine.children.length = 0;
        animatioLine.clear();
        LineGraph.clear();
        lineFill.clearLine();
        LineGraph.children.length = 0;
        LineGraph.lineStyle(2, 0xef7809);
    };

    var NewLineTweening = PIXI.tweenManager.createTween(animatioLine);


    //_self.DrawBarHistory(_self.BarCollection);
    stage.addChild(lineFill);
    stage.addChild(LineGraph);
    stage.addChild(ptoLine);
    stage.addChild(animatioLine);
    return _self;
}

var DrawCandleStickView = function (stage, GridView) {
    var self = this;
    var dummyLiveBar = {
        Close: "1.162571",
        High: "1.162576",
        Low: "1.162567",
        Open: "1.162572",
        EndTime: "1500577685000"
    };

    function HighLowObject(Bar) {
        var hl = this;
        hl.high = GridView.GetYAxis(parseFloat(Bar.High));
        hl.low = GridView.GetYAxis(parseFloat(Bar.Low));
        var stamp = self.ComputeBarPosition(Bar.Stamp);
        var _i = GridView.ChartViewSettings.TimeInterval;
        hl.Position = _i == 5000 || _i == 15000 ? GridView.GetXAxis(stamp) - (((GridView.ChartViewSettings.PointSpace * 5) / (_i / 1000)) / 2) : GridView.GetXAxis(stamp);
        return hl;
    }

    function OpenCloseObject(Bar) {
        var oc = this;
        oc.open = GridView.GetYAxis(parseFloat(Bar.Open));
        oc.close = GridView.GetYAxis(parseFloat(Bar.Close));
        oc.color = oc.open <= oc.close ? 0xc0392b : 0x52de57;
        oc.defaultHeight = 1;
        oc.height = oc.open == oc.close ? oc.defaultHeight : oc.close - oc.open;
        oc.Position = oc.open == oc.close ? oc.open - (oc.defaultHeight / 2) : oc.open;
        return oc;
    }

    self.LastBarPosition = 0;

    self.DrawNewCandleStick = function (Bar) {
        var _graphic = new PIXI.Graphics();
        var hlObj = new HighLowObject(Bar);
        var ocObj = new OpenCloseObject(Bar);
        var hl = DrawHighLowView([hlObj.Position, hlObj.high], [hlObj.Position, hlObj.low], ocObj.color);
        var width = GridView.ChartViewSettings.PointSpace * GridView.ChartViewSettings.PointCount / 2;
        var oc = DrawOpenCloseView([hlObj.Position - width / 2, ocObj.Position], width, ocObj.height, ocObj.color);
        _graphic.addChild(hl);
        _graphic.addChild(oc);
        self.LastBarPosition = self.ComputeBarPosition(Bar.Stamp);
        hlObj = null;
        ocObj = null;
        return _graphic;
    };

    self.LatestBarData = null;
    var _price = 0;
    self.AnimateLiveBar = function (grph, price) {
        grph.children.length = 0;
        _price = price;
        self.DrawLiveBar(grph, self.LatestBarData);
    };

    self.DrawLiveBar = function (grph, bar) {
        grph.children.length = 0;
        var Bar = bar == undefined ? self.LatestBarData : bar;
        if (Bar == null) return;
        var hlObj = new HighLowObject(Bar);
        var ocObj = new OpenCloseObject(Bar);
        var _height = _price - ocObj.open;
        _color = _height < 0 ? 0x52de57 : 0xc0392b;
        var hl = DrawHighLowView([hlObj.Position, hlObj.high], [hlObj.Position, hlObj.low], _color);
        var width = GridView.ChartViewSettings.PointSpace * GridView.ChartViewSettings.PointCount / 2;
        var oc = DrawOpenCloseView([hlObj.Position - width / 2, ocObj.Position], width, _height, _color);
        grph.addChild(hl);
        grph.addChild(oc);
        self.LatestBarData = Bar;
        hlObj = null;
        ocObj = null;
    }

    self.ComputeBarPosition = function (stamp) {
        var _interval = GridView.ChartViewSettings.TimeInterval;
        var delta = stamp % _interval;
        var _centerGrid = _interval / 2;
        _stamp = stamp - delta + _centerGrid + 500;
        return _stamp;
    }

    function DrawHighLowView(pos1, pos2, color) {
        var grphc = new PIXI.Graphics();
        grphc.lineStyle(1, color);
        grphc.moveTo(pos1[0], pos1[1]);
        grphc.lineTo(pos2[0], pos2[1]);
        return grphc;
    }

    function DrawOpenCloseView(pos, width, height, color) {
        var grphc = new PIXI.Graphics();
        grphc.beginFill(color);
        grphc.drawRect(pos[0], pos[1], width, height);
        return grphc;
    }

    return self;
};

function RandomNum(max, min) {
    return Math.random() * (max - min) + min;
}

function RandomBar(quote, range) {
    var _high;
    var _low;
    var _open;
    var _close;
    var _stamp = new Date(quote.Stamp).getTime();
    if (range == undefined) {
        _high = parseFloat(quote.Bid) + 0.00100;
        _low = parseFloat(quote.Bid) - 0.00100;
        _open = RandomNum(_high, _low);
        _close = parseFloat(quote.Bid);
    } else {
        var _ran = RandomNum(range[0], range[1]);
        _high = _ran + 0.00100;
        _low = _ran - 0.00100;
        _open = RandomNum(_high, _low);
        _close = RandomNum(_high, _low);
    }
    return {
        Open: _open,
        High: _high,
        Low: _low,
        Close: _close,
        Stamp: _stamp
    };
}


var D3ChartManager = function (Settings) {
    var self = this;
    self.Symbol = Settings.Symbol;

    //Local Variables;
    var limit,
        duration,
        pipAllowance,
        container,
        currentPrice,
        margin,
        ylabelallowance,
        width,
        height,
        lineGraph,
        _animationAllowance,
        lastDomain,
        drag,
        xCoordinate,
        yCoordinate,
        FontAwesome;

    //Local Elements
    var line,
        svg,
        image,
        clipBoard,
        area,
        axis,
        yAx,
        areaGradient,
        paths,
        areapath,
        areaanimation,

        //View Variables
        TickPointer,
        CursorPointer,
        LoadingView,
        ExpirationLine;





    InitializeVariables();
    InitializeElements();

    function InitializeVariables() {

        now = new Date();
        min = new Date(now.getTime() - (60000 * 1));
        max = new Date(now.getTime() + (60000 * 1));
        minran = 1.50001;
        maxran = 1.65999;
        limit = 60 * 1;
        duration = 1000;
        pipAllowance = 0.00010;

        container = d3.select(Settings.Container);

        currentPrice = {};
        margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 40
        };
        ylabelallowance = 50;
        // var width = Settings.cWidth - margin.left - margin.right,
        //     height = Settings.cHeight - margin.top - margin.bottom;;
        width = Settings.cWidth;
        height = Settings.cHeight - 55;

        xCoordinate = d3.time.scale()
            .domain([min, max])
            .range([0, width]);

        yCoordinate = d3.scale.linear()
            .domain([minran - pipAllowance, maxran + pipAllowance])
            .range([height, 0]);

        lineGraph = {
            data: []
        }
        _animationAllowance = (xCoordinate(now) - xCoordinate(now - 1000)) * 5;
        lastDomain = [];

        FontAwesome = new Font();
        FontAwesome.src = "styles/fonts/FontAwesome.otf";
        FontAwesome.fontFamily = "FontAwesome";
        drag = d3.behavior.drag()
            .on("drag", function (d, i) {
                // d.x += d3.event.dx
                // d.y += d3.event.dy
                // d3.select(this).attr("transform", function (d, i) {
                //     return "translate(" + [d.x, d.y] + ")"
                // })
            });
    }
    function InitializeElements() {
        line = d3.svg.line()
            .interpolate('basic')
            .x(function (d, i) {
                return xCoordinate(d.stamp) - 7;
            })
            .y(function (d) {
                return yCoordinate(d.price)
            })

        svg = container.append('svg')
            .attr('class', 'chart')
            .attr('width', width)
            .attr('height', height + 50)
            .call(drag)
            .on(
            "mousemove", OnMouseMove
            ).on(
            "mouseleave", OnMouseOut
            );
        image = svg.append("image")
            .attr("xlink:href", "styles/images/map-flat.png")
            .attr("x", -200)
            .attr("y", -80)
            .attr("width", width + 100)
            .attr("height", height).attr('transform', 'scale(1.23, 1.19)')
            .style('opacity', 0.3)
            .attr("id", "fillImage");

        clipBoard = svg.append("clipPath")
            .attr("id", "ChartClip")
            .append("rect")
            .attr("width", 0)
            .attr("height", height);

        area = d3.svg.area()
            .interpolate("linear")
            .x(function (d, i) { return xCoordinate(d.stamp) - 7; })
            .y0(height)
            .y1(function (d, i) { return yCoordinate(d.price); });

        axis = svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + (-ylabelallowance) + ',' + height + ')')
            .call(xCoordinate.axis = d3.svg.axis().scale(xCoordinate).orient("bottom").tickFormat(d3.time.format('%H:%M:%S')).ticks(15).tickSize(-height, -height, -height));

        yCoordinate.axis = d3.svg.axis().scale(yCoordinate).orient("right").tickFormat(d3.format("s")).ticks(5).tickSize(-width, -width, -width);
        yAx = svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width - ylabelallowance) + "," + (0) + ")")
            .call(yCoordinate.axis);

        paths = svg.append('g')
        areaGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "areaGradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");
        areaGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#ef9509")//
            .attr("stop-opacity", 1);
        areaGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "transparent")
            .attr("stop-opacity", 1);
        areapath = paths.append('path')//.style("fill", "url(#areaGradient)")
            .attr("class", "area")
            .data([self.ChartData])
            .attr("clip-path", "url(#normalclip)");
        areaanimation = paths.append('path')//.style("fill", "url(#areaGradient)")
            .attr("class", "area")
            .data([self.ChartData])
            .attr("clip-path", "url(#ChartClip)");

        lineGraph.path = paths.append('path')
            .data([self.ChartData])
            .attr('class', 'line')
            .attr("clip-path", "url(#normalclip)")
        lineGraph.AnimationLine = paths.append('path')
            .data([self.ChartData])
            .attr('class', 'line')
            .attr("clip-path", "url(#ChartClip)");

        LoadingView = new DrawLoadingView(paths);
        ExpirationLine = new DrawExpirationView(paths);
        TickPointer = new DrawTickPointerView(svg);
        CursorPointer = new DrawCursorView(svg);
        DrawBorderView(svg);
    }


    function DrawExpirationView(parent) {
        var con = parent.append('g');
        var pointSize = 14;
        var redLine = con.append('line').attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .attr("stroke-width", 2)
            .attr("stroke", '#FA4225');

        var redPoint = con.append('circle')
            .attr('cx', 0)
            .attr('cy', height - pointSize)
            .attr('r', pointSize).style('fill', '#FA4225');

        var redIcon = con.append("text")
            .attr('x', -(pointSize / 2) - 1.5)
            .attr('y', height - (pointSize / 2) - 1)
            .attr('fill', 'black')
            .attr('font-size', '16px')
            .attr('font-family', FontAwesome.fontFamily)
            .text("\uf11e");

        var whiteLine = con.append('line').attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", '5 3')
            .attr("stroke", 'white');

        var WhitePoint = con.append('circle')
            .attr('cx', 0)
            .attr('cy', height - pointSize)
            .attr('r', pointSize).style('fill', 'white');

        var whiteIcon = con.append("text")
            .attr('x', -(pointSize / 2) - 1.5)
            .attr('y', height - (pointSize / 2))
            .attr('fill', 'black')
            .attr('font-size', '20px')
            .attr('font-family', FontAwesome.fontFamily)
            .text("\uf017");

        this.Update = function () {
            var _endline = new Date(this.Data.ExpiryTime.tick - 3 * 1000);
            // var _endline = new Date(this.Data.PurchaseTime.tick + (3 * 1000));
            var _purchaseLine = new Date(this.Data.PurchaseTime.tick - (3 * 1000));
            redLine.attr('transform', 'translate(' + (xCoordinate(_endline) + 7) + ',0)');
            whiteLine.attr('transform', 'translate(' + (xCoordinate(_purchaseLine) + 7) + ',0)');
            WhitePoint.attr('transform', 'translate(' + (xCoordinate(_purchaseLine) + 7) + ',0)');
            whiteIcon.attr('transform', 'translate(' + (xCoordinate(_purchaseLine) + 7) + ',0)');
            redPoint.attr('transform', 'translate(' + (xCoordinate(_endline) + 7) + ',0)');
            redIcon.attr('transform', 'translate(' + (xCoordinate(_endline) + 7) + ',0)');
        }

        return this;
    }

    function DrawLoadingView(parent) {

        this._width = 10;

        var con = parent.append("g");
        var body = con.append("rect")
            .attr("width", this._width)
            .attr("height", height)
            .attr('opacity', 0.2)
            .style("fill", "grey")
            ;

        var __line = con.append('line').attr("x1", this._width)
            .attr("y1", 0)
            .attr("x2", this._width)
            .attr("y2", height)
            .style('stroke', 'grey')
            .style('stroke-width', 2)
            .attr("stroke-dasharray", '5 3')
            .attr('class', 'loadingline');

        // var _text = con.append("text")
        //     .attr('x', this._width / 2)
        //     .attr('y', height / 2)
        //     .attr('fill', 'white')
        //     .attr('font-size', '15px')
        //     .text("Loading Data")
        this.View = con;

        this.Position = function (data) {
            this._width = data[1] + 7;
            body.attr('width', this._width)
                // .attr('transform', 'translate(' + data[0] + ', 0)')
                ;
            __line.attr("x1", this._width)
                .attr("y1", 0)
                .attr("x2", this._width)
                .attr("y2", height)

            // _text
            //     .attr('x', (this._width / 2) - _text.node().getBoundingClientRect().width / 2)
        }

        return this;
    }

    function DrawBorderView(parent) {
        var con = parent.append('g');

        TopLoweGradient = con.append("defs")
            .append("linearGradient")
            .attr("id", "TopLoweGradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");

        TopLoweGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "black")//#ef9509
            .attr("stop-opacity", 1);
        TopLoweGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "transparent")
            .attr("stop-opacity", 1);

        LeftRightGradient = con.append("defs")
            .append("linearGradient")
            .attr("id", "LeftRightGradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");

        LeftRightGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "black")//#ef9509
            .attr("stop-opacity", 1);
        LeftRightGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "transparent")
            .attr("stop-opacity", 1);

        con.append("rect")
            .attr("width", 100)
            .attr("height", height + 50)
            .style("fill", "url(#LeftRightGradient)");

        con.append("rect")
            .attr("width", width)
            .attr("height", 100)
            .style("fill", "url(#TopLoweGradient)");
    }

    function DrawCursorView(parent) {
        var con = parent.append("g").attr('class', 'CursorView');
        var vLinelabelSize = 150;
        var vLine = con.append('line').attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height).attr('class', 'cursor');

        var hLine = con.append('line').attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 0).attr('class', 'cursor');

        var hLinelabel = new DrawPolygonView(con, {
            height: 20,
            Start: width - 70,
            End: width,
            FontStyle: {
                color: 'white',
                size: 12,
                weight: 'normal'
            },
            Style: {
                fill: '#59748c'
            }
        }, false);

        var vLinelabel = con.append("rect")
            .attr('y', height)
            .attr("width", vLinelabelSize)
            .attr("height", 15)
            .style("fill", "#59748c")
            ;

        var v_text = con.append("text")
            .attr('y', height + 11)
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .text('XXXXXXXXXXXXXX')

        this.Position = function (point) {
            vLine.attr("x1", point[0])
                .attr("y1", 0)
                .attr("x2", point[0])
                .attr("y2", height);
            hLine.attr("x1", 0)
                .attr("y1", point[1])
                .attr("x2", width)
                .attr("y2", point[1]);
            hLinelabel.View.attr('transform', 'translate(0, ' + point[1] + ')');
            hLinelabel.Text(yCoordinate.invert(point[1]));
            vLinelabel.attr('transform', 'translate(' + (point[0] - vLinelabelSize / 2) + ', 0)');
            v_text.attr('transform', 'translate(' + (point[0] - v_text.node().getBoundingClientRect().width / 2) + ', 0)');
            v_text.text(FormatTime(xCoordinate.invert(point[0]), "y-m-d-hh-mm-ss"));
        }

        this.Visibility = function (isVisible) {
            con.attr('opacity', isVisible ? 1 : 0);
        }
        return this;
    }

    function DrawTickPointerView(parent) {
        var Line = parent.append('line').attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", width)
            .attr("y2", 0).attr('class', 'TickPointer Tickline');

        var polygon = new DrawPolygonView(parent, {
            height: 30,
            Start: width - 90,
            End: width,
            FontStyle: {
                color: 'black',
                size: 15,
                weight: 'bold'
            },
            Style: {
                fill: 'white'
            }
        }, true);

        // var Point = Line.append('circle')
        //     .attr('cx', 0)
        //     .attr('cy', 0)
        //     .attr('r', 4).style('fill', '#003f30');

        this.Position = function (x, y) {
            Line.transition().duration(duration - 250).delay(50).attr('transform', 'translate(0, ' + y + ')');
            polygon.View.transition().duration(duration - 250).delay(50).attr('transform', 'translate(0, ' + y + ')');
            polygon.Text(yCoordinate.invert(y));
            // Point.transition().duration(duration - 250).delay(50).attr('transform', 'translate(' + x + ', ' + y + ')');//.attr('cx', x).attr('cy', y);
        }

        return this;
    }

    function DrawPolygonView(parent, data, isAnimate) {
        var _h = data.height;
        var _startPoint = data.Start;
        var _endPoint = data.End;
        var _fontStyle = data.FontStyle;
        var _Style = data.Style;
        var _slantwidth = (_endPoint - _startPoint) * .15;
        var y = 0;
        var _points = [
            [_startPoint, y],
            [_startPoint + _slantwidth, y - (_h / 2)],
            [_endPoint, y - (_h / 2)],
            [_endPoint, y + (_h / 2)],
            [_startPoint + _slantwidth, y + (_h / 2)],
            [_startPoint, y]
        ];
        var con = parent.append("g").attr('class', 'TickPointerClass');

        var poly = con.append("polygon")
            .data([_points])
            .attr('points', function (d, i) {
                return d;
            })
            .attr("stroke", "_Style.fill")
            .attr('fill', _Style.fill)
            .attr("stroke-width", 1);

        var _text = con.append("text")
            .attr('x', _points[1][0])
            .attr('y', y + (_h / 6))
            .attr('fill', _fontStyle.color)
            .attr('font-size', _fontStyle.size)
            .attr('font-weight', _fontStyle.weight)
            .text(0)

        this.Text = function (text) {
            _text.data([text]);
            if (!isAnimate) {
                _text.text(GetPriceFormat(text));
                return;
            }
            _text.transition()
                .duration(duration)
                .delay(50)
                .tween("text", function (d) {
                    var i = d3.interpolate(this.textContent, d),
                        prec = (d + "").split("."),
                        round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

                    return function (t) {
                        this.textContent = GetPriceFormat(Math.round(i(t) * round) / round);
                    };
                });
        };

        this.View = con;

        return this;
    }

    function GetPriceFormat(price) {
        var _int = price.toString().indexOf(".");
        var _temp = 8 - _int;
        var _string = parseFloat(price).toFixed(_temp);
        // for (let x = 0; x < _int; x++) {
        //     _string = " " + _string;
        // }
        return _string;
    }

    self.AnimateChart = function () {
        var digit = GetSymbolDigit(self.ChartData[0].price);
        var _allow = GetPipsAllowance(digit, 0.3);
        yCoordinate.domain([d3.min(self.ChartData, function (d) { return d.price; }) - _allow, d3.max(self.ChartData, function (d) { return d.price; }) + _allow]);
        xCoordinate.domain([min, max]);
        TickPointer.Position(xCoordinate(self.ChartData[0].stamp - 1000), yCoordinate(self.ChartData[0].price));
        // TickPointer.View.Line.transition().duration(duration - 250).delay(50).attr('transform', 'translate(0, ' + yCoordinate(currentPrice.price) + ')');
        // if (lastDomain.length && lastDomain[0] != yCoordinate.domain()[0] || lastDomain[1] != yCoordinate.domain()[1]) {
        //     var t = d3.transition()
        //         .duration(duration)
        //         .ease(d3.ease('linear'));
        //     lineGraph.path.transition().duration(duration).attr('d', line(self.ChartData.slice(1, self.ChartData.length - 1)));
        //     areapath.transition().duration(duration).attr('d', area(self.ChartData.slice(1, self.ChartData.length - 1)));
        //     lineGraph.AnimationLine.transition().duration(duration).attr('d', line(self.ChartData.slice(0, 2)));
        //     areaanimation.transition().duration(duration).attr('d', area(self.ChartData.slice(0, 2)));
        // } else {
        //     lineGraph.path.attr('d', line(self.ChartData.slice(1, self.ChartData.length - 1)));
        //     areapath.attr('d', area(self.ChartData.slice(1, self.ChartData.length - 1)));
        //     lineGraph.AnimationLine.attr('d', line(self.ChartData.slice(0, 2)));
        //     areaanimation.attr('d', area(self.ChartData.slice(0, 2)));
        // }
        lineGraph.path.attr('d', line(self.ChartData.slice(1, self.ChartData.length - 1)));
        areapath.attr('d', area(self.ChartData.slice(1, self.ChartData.length - 1)));
        lineGraph.AnimationLine.attr('d', line(self.ChartData.slice(0, 2)));
        areaanimation.attr('d', area(self.ChartData.slice(0, 2)));

        clipBoard.attr("width", 0);
        if (self.ChartData.length > 2) {
            clipBoard
                .transition().duration(duration).attr('transform', "translate(" + xCoordinate(self.ChartData[2].stamp) + ",0)")
                .attr("width", _animationAllowance)
        }
        lastDomain = yCoordinate.domain();
        axis.transition()
            .duration(duration)
            .ease('linear')
            .call(xCoordinate.axis)

        yAx.transition()
            .duration(duration)
            .ease('linear')
            .call(yCoordinate.axis.tickFormat(function (d, i) {
                return d.toFixed(digit + 1);
            }))


        paths.attr('transform', null)
            .transition()
            .duration(duration)
            .ease('linear')
            .attr('transform', 'translate(' + xCoordinate(min - duration) + ')')
            .each('end', self.AnimateChart);

        if (self.ChartData.length > limit) self.ChartData.pop();
        if (self.ChartData.length < 2) return;
        var oldestDataX = xCoordinate(self.ChartData[self.ChartData.length - 1].stamp);
        if (oldestDataX > 0) {
            LoadingView.Position([0, oldestDataX]);
        } else {
            LoadingView.View.remove();
        }
        ExpirationLine.Update();
    }

    function OnMouseMove(d, e) {
        var mouse = d3.mouse(this);
        CursorPointer.Position(mouse);
        CursorPointer.Visibility(true);
    }

    function OnMouseOut(d, e) {
        CursorPointer.Visibility(false);
    }

    // function formatFixed(x, digit) {
    //     return +(+x).toFixed(digit) + "";
    // }

    function GetPipsAllowance(digit, pip) {
        return pip / (Math.pow(10, digit));
    }

    function GetSymbolDigit(SymbolQuote) {
        var whole = ~~SymbolQuote;
        var listofdigit = [6, 5, 3, 3, 2];
        var x = 1;
        var retval = null;
        while (retval == null) {
            if (whole / Math.pow(10, x) < 1) retval = listofdigit[x];
            x++;
        }
        return retval - 1;
    }
    var isInit = true;
    self.ChartData = [];
    self.OnLiveBars = function (data) {
        now = new Date(data.Stamp - 1000);
        min = new Date(now.getTime() - (60000 * 1));
        max = new Date(now.getTime() + (60000 * 1));
        currentPrice = {
            price: data.Close,//minran + Math.random() * 0.01,
            stamp: now
        };
        // if (self.ChartData.length != 0 && now == self.ChartData[0].stamp) {
        //     self.ChartData[0].stamp = currentPrice.stamp;
        //     self.ChartData[0].price = currentPrice.price;
        //     return;
        // } else {
        //     self.ChartData.unshift(currentPrice);
        // }
        self.ChartData.unshift(currentPrice);
        if (isInit) {
            self.AnimateChart();
            isInit = false;
        }
        // svg.attr('opacity', xCoordinate.invert(self.ChartData[self.ChartData.length - 1].stamp) > 0 ? 0 : 1);
    }

    self.ExpirationUpdates = function (args) {
        ExpirationLine.Data = args;
    }

    return self;
}