var D3ChartManager = function (Settings) {
    var self = this;
    self.Symbol = Settings.Symbol;
    Settings.VisibleChartData = [];
    Settings.ZoomLevel = 1;
    Settings.MinLevel = 1;
    Settings.MaxLevel = 10;
    self.SymbolDigit = 0;
    self.IsAnimationStarted = false;
    self.CurrentVisible = true;
    Settings.OpenOptionsCollection = [];
    Settings.LoadingViewCollection = [];
    //Local Variables;
    var limit,
        mouselocation,
        duration,
        container,
        currentPrice,
        margin,
        ylabelallowance,
        width,
        height,
        lineGraph,
        _animationAllowance,
        lastDomain,
        zoom,
        drag,
        lastdragposition,
        _liveBar,
        xCoordinate,
        yCoordinate,
        FontAwesome,
        ExpiredLastQuote,
        ChartDrag,
        TickpointLocation,
        LiveBarsStop;

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
        isOptionsExpired,
        //View Variables
        TickPointer,
        CursorPointer,
        LoadingView,
        NoDataView,
        OpenOptionView,
        DefaultAnimation = 1000,
        ExpirationLine,
        OptionsSVGGroup,
        OptionsPATHGroup,
        OpenOptionData = [];


    InitializeVariables();
    InitializeElements();

    Settings.OnNewOptionBtn = function () {
        for (var x = 0; x < Settings.OpenOptionsCollection.length; x++) {
            Settings.OpenOptionsCollection[x].View.Remove();
        }
        Settings.OpenOptionsCollection = [];
        // // debugger;        
        // OpenOptionData = [];
        // // d3.selectAll("svg > *").remove();
        // // d3.selectAll("#OpenOptions").remove();
        // d3.selectAll("g.OpenOptions").remove();
        // // OpenOptionView.RemovePoints();
    }

    function GetAnimationSpan() {
        return duration;
    }

    function InitializeVariables() {

        Settings.TimeNow = new Date();
        min = new Date(Settings.TimeNow.getTime() - (60000 * Settings.ZoomLevel));
        max = new Date(Settings.TimeNow.getTime() + (60000 * Settings.ZoomLevel));
        limit = 60 * 1;
        duration = DefaultAnimation;

        container = d3.select(Settings.Container);

        currentPrice = {};
        margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 40
        };
        ylabelallowance = 50;
        lastdragposition = 0;
        width = Settings.cWidth;
        height = Settings.cHeight - 35;
        // height = Settings.cHeight - 55;

        self.BoardProperty = {
            DefaultLocation: width / 2,
            CurrentLocation: width / 2,
            TickProperties: GetZoomLevelData(width)
        };

        Settings.MinPrice = 0;
        Settings.MaxPrice = 0;

        self.BoardProperty.ActiveLevel = self.BoardProperty.TickProperties[0];

        xCoordinate = d3.time.scale()
            .domain([])
            .range([0, width - ylabelallowance]);

        yCoordinate = d3.scale.linear()
            .domain([0, 1])
            .range([height, 0]);

        lineGraph = {
            data: []
        }
        _animationAllowance = (xCoordinate(Settings.TimeNow) - xCoordinate(Settings.TimeNow - GetAnimationSpan())) * 5;
        lastDomain = [];

        FontAwesome = new Font();
        FontAwesome.src = "styles/fonts/FontAwesome.otf";
        FontAwesome.fontFamily = "FontAwesome";
        ChartDrag = false;
        zoom = d3.behavior.zoom()
            .x(xCoordinate)
            .y(yCoordinate)
            .scaleExtent([1, 32])
            .translate([0, 0])
            .scale(1)
            .on("zoom", zoomed)
            .on("zoomstart", function () {
                self.IsAnimationStarted = false;
            })
            .on("zoomend", function () {
                self.IsAnimationStarted = true;
            });
        drag = d3.behavior.drag()
            .on("dragstart", draggstart)
            .on("drag", dragging)
            .on("dragend", draggend);

        TickpointLocation = 70;

    }

    function InitializeElements() {
        line = d3.svg.line()
            // .defined(function (d, i) {
            //     var collection = Settings.VisibleChartData;
            //     if (i + 1 >= collection.length) return;
            //     var current = collection[i].stamp.getTime();
            //     var previous = collection[i + 1].stamp.getTime();
            //     var r = current - previous <= 1000;
            //     if (!r) {
            //         CreateLoadingView({ End: collection[i].stamp, Start: collection[i + 1].stamp });
            //     }
            //     return r;
            // })
            .interpolate('basic')
            .x(function (d, i) {
                return xCoordinate(d.stamp);
            })
            .y(function (d) {
                return yCoordinate(d.price)
            })

        svg = container.append('svg')
            .attr('class', 'chart')
            .attr('width', width)
            .attr('height', height + 50)
            .call(zoom)
            .call(drag)
            .on(
            "mousemove", OnMouseMove
            ).on(
            "mouseleave", OnMouseOut
            )
            .on("mouseup", OnMouseUp)
            .on("mousedown", OnMouseDown);
        ;
        image = svg.append("image")
            .attr("xlink:href", "styles/images/world-dots.png")
            .attr("x", -200)
            .attr("y", 0)
            .attr("width", width + 100)
            .attr("height", height)
            .attr('transform', 'scale(1.20, 1.12)')
            .style('opacity', 0.7)
            .attr("id", "fillImage");

        clipBoard = svg.append("clipPath")
            .attr("id", "ChartClip")
            .append("rect")
            .attr("width", 0)
            .attr("height", height);

        area = d3.svg.area()
            .interpolate("linear")
            // .defined(line.defined())
            .x(function (d, i) {
                return xCoordinate(d.stamp);
            })
            .y0(function () {
                return height;
            })
            .y1(function (d, i) {
                return yCoordinate(d.price);
            });
        xCoordinate.axis = d3.svg.axis().scale(xCoordinate).orient("bottom").innerTickSize(-height).outerTickSize(0).tickFormat(d3.time.format('%H:%M:%S')).ticks(d3.time.second, 5)
        axis = svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xCoordinate.axis);

        axis.ReDraw = function (duration) {
            // console.log("Grid Redraw" + duration);
            axis.transition()
                .duration(duration)
                .ease('linear')
                .call(xCoordinate.axis);
        };

        yCoordinate.axis = d3.svg.axis().scale(yCoordinate).orient("right").tickFormat(d3.format("s")).ticks(5).tickSize(-width, -width, -width);
        yAx = svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width - ylabelallowance) + "," + (0) + ")")
            .attr('opacity', 0)
            .call(yCoordinate.axis);

        yAx.ReDraw = function (duration) {
            yAx.transition()
                .duration(duration)
                .ease('linear')
                .call(yCoordinate.axis.tickFormat(function (d, i) {
                    return d.toFixed(self.SymbolDigit + 1);
                }));
        }

        OptionsSVGGroup = svg.append('g').attr('class', 'OpenOptionsSVGGroupView');
        paths = svg.append('g')
        areaGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "areaGradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");
        areaGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#2ec4ff") //
            .attr("stop-opacity", 1);
        areaGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "transparent")
            .attr("stop-opacity", 1);
        areapath = paths.append('path') //.style("fill", "url(#areaGradient)")
            .attr("class", "area")
            .data([Settings.ChartData])
            .attr("clip-path", "url(#normalclip)");
        lineGraph.path = paths.append('path')
            .data([Settings.ChartData.filter(function (d) {
                return d;
            })])
            .attr('class', 'line')
            .attr("clip-path", "url(#normalclip)")
        NoDataView = new DrawLoadingView(paths);
        LoadingView = paths.append('g').attr('class', 'LoadingView');
        ExpirationLine = new DrawExpirationView(paths);
        OptionsPATHGroup = paths.append('g').attr('class', 'OpenOptionsPATHGroupView');
        // OpenOptionView = new DrawOpenOptions(svg, paths);
        TickPointer = new DrawTickPointerView(svg, paths);
        CursorPointer = new DrawCursorView(svg);
        CursorPointer.Visibility(false);
        DrawBorderView(svg);

        var loaderlogo = $('svg#chartLoader-logo');
        $(Settings.Container).append(loaderlogo);
    }

    function CreateLoadingView(args) {
        if (Settings.LoadingViewCollection.length) {
            for (var x = 0; x < Settings.LoadingViewCollection.length; x++) {
                if (Settings.LoadingViewCollection[x].Model.Start == args.Start && Settings.LoadingViewCollection[x].Model.End == args.End) continue;
                Settings.LoadingViewCollection.push(new DrawLoadingView(LoadingView, args));
            }
        } else Settings.LoadingViewCollection.push(new DrawLoadingView(LoadingView, args));
    }

    function DrawStatisticsView(parent) {
        var stats = this;
        var _h = height * .18;
        var con = parent.append('g').attr('class', 'StatisticsGraph').attr('transform', 'translate(0,' + _h + ')');
        var gradientGroup = con.append('g').attr('class', 'StatisticsGraph-GradientDef');
        var RedGradient = gradientGroup.append("defs")
            .append("linearGradient")
            .attr("id", "RedStats")
            .attr("x1", "20%").attr("y1", "20%")
            .attr("x2", "80%").attr("y2", "80%");
        var GreenGradient = gradientGroup.append("defs")
            .append("linearGradient")
            .attr("id", "GreenStats")
            .attr("x1", "20%").attr("y1", "20%")
            .attr("x2", "80%").attr("y2", "80%");
        var group = con.append('g');
        var UP_label;
        var Down_label;

        var _size = 30;
        var space = 15;
        RedGradient.append("stop")
            .attr("offset", "0%")
            .attr("class", "stop-top-red")
            .attr("stop-opacity", 1);
        RedGradient.append("stop")
            .attr("offset", "100%")
            .attr("class", "stop-bottom-red");

        GreenGradient.append("stop")
            .attr("offset", "0%")
            .attr("class", "stop-top-green")
            .attr("stop-opacity", 1);
        GreenGradient.append("stop")
            .attr("offset", "100%")
            .attr("class", "stop-bottom-green");

        function AnimateStats(data) {
            var mid = Math.floor(data[0] / 10 * 2);
            UP_label.Label.text((data[0] < 10 ? "0" + data[0] : data[0]) + "%");
            Down_label.Label.text((data[1] < 10 ? "0" + data[1] : data[1]) + "%");
            group.selectAll("rect").each(function (d, i) {
                var _item = d3.select(this);
                var _iter = 19 - i;
                var _duration = GetAnimationSpan();
                var _delay = 50;
                if (_iter <= mid && _item.attr('data-value') != "up") {
                    var _space = space * _iter;
                    _item.transition().duration(_duration).delay(_delay * (mid - i))
                        .attr('data-value', "up")
                        .attr('transform', 'rotate(45)translate(' + _space + ',' + _space + ')scale(1,0)')
                        .transition().duration(_duration)
                        .attr('transform', 'rotate(45)translate(' + _space + ',' + _space + ')scale(1,1)')
                        .attr('class', "").attr('class', "GreenStats");
                }
                if (_iter >= mid && _item.attr('data-value') != "down") {
                    var _space = space * _iter;
                    _item.transition().duration(_duration).delay(_delay * i)
                        .attr('data-value', "down")
                        .attr('transform', 'rotate(45)translate(' + _space + ',' + _space + ')scale(1,0)')
                        .transition().duration(_duration)
                        .attr('transform', 'rotate(45)translate(' + _space + ',' + _space + ')scale(1,1)')
                        .attr('class', "").attr('class', "RedStats");
                }

            });
        }

        function drawRect(index) {
            var _space = space * index;
            var x = (index >= 10 ? "down" : "up");
            group.append("rect")
                .attr("x", _size / 2).attr("y", -_size / 2)
                .attr('transform', 'rotate(45)translate(' + _space + ',' + _space + ')')
                .attr("width", _size).attr("height", _size)
                .style('opacity', 0.4)
                .attr('data-value', x)
                .attr('class', x == "down" ? "RedStats" : "GreenStats");
            if (index == 0) {
            } else if (index == 19) {
            }
        }

        for (let x = 19; x >= 0; x--) {
            drawRect(x);
        }


        UP_label = group.append("text")
            .attr('x', 5)
            .attr('y', 0)
            .attr('fill', 'white')
            .attr('font-size', '16px')
        UP_label.append('tspan')
            .attr('x', 12)
            .text("UP");
        UP_label.Label = UP_label.append('tspan')
            .attr('x', 7)
            .attr('y', 15)
            .text("50%");



        Down_label = group.append("text")
            // .attr('x', 1)
            .attr('y', group.node().getBBox().height - 5)
            .attr('fill', 'white')
            .attr('font-size', '14px')
        Down_label.append('tspan')
            .attr('x', 0)
            .text("DOWN");
        Down_label.Label = Down_label.append('tspan')
            .attr('x', 7)
            .attr('font-size', '16px')
            .attr('y', group.node().getBBox().height - 30)
            .text("50%");

        // PAKITANGGAL NETO PAG MERONG REAL DATA
        //  setInterval(function () {
        //      var up = Math.floor(Math.random() * (100 - 1 + 1) + 1);
        //      var down = 100 - up;
        //      AnimateStats([up, down]);
        //  }, 5000);
        // HANGGANG DITO
        stats.Data = [];
        stats.UpdateChartStatistics = function (array) {
            if (stats.Data.length) {
                if (stats.Data[0] == array[0]) return;
            } else stats.Data = array;
            AnimateStats(array);
            stats.Data = array;
        };
        return stats;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // var _h = height * .30;
        // var count = 0;
        // var con = parent.append('g')
        //     .attr('height', _h)
        //     .attr('class', 'StatisticsView');
        // var boxes = 100;
        // var scales = d3.scale.linear()
        //     .domain([0, boxes])
        //     .range(["#2ecc71", "red"])
        //     .interpolate(d3.interpolateRgb);
        // var UP_label = con.append("text")
        //     .attr('fill', 'white')
        //     .attr('font-size', '16px')
        //     .text("50%");
        // for (var x = 0; x < boxes; x++) {
        //     var _size = 3;
        //     con.append('rect').attr('id', 'box-' + x)
        //         .attr('height', _size)
        //         .attr('width', 30)
        //         .attr('y', ((_size + 1) * x))
        //         .style('fill', scales(x));
        //     count += _size + 1;
        // }
        // var Down_label = con.append("text")
        //     .attr('fill', 'white')
        //     .attr('font-size', '16px')
        //     .attr('y', count + (16 - _size - 1))
        //     .text("50%");

        // setInterval(function () {
        //     var _random = RandomStats();
        //     Down_label.text((100 - Math.abs(_random)) + '%');
        //     UP_label.text((Math.abs(_random)) + '%');
        //     scales.domain([0, boxes + _random])
        //         .range(["#2ecc71", "red"])
        //         .interpolate(d3.interpolateRgb);
        //     d3.selectAll('.StatisticsView rect').style('fill', function (d, i) {
        //         return scales(i);
        //     });
        // }, 3000);


        // function RandomStats() {
        //     var ran = Math.random();
        //     var val = Math.floor(ran * (100 - 1 + 1) + 1);
        //     return ran > 0.5 ? +val : -val;
        // }

        // con.attr('transform', 'translate(0,' + ((height / 2) - (count * .50)) + ')');


    }

    function DrawBorderView(parent) {
        var con = parent.append('g');

        // TopLoweGradient = con.append("defs")
        //     .append("linearGradient")
        //     .attr("id", "TopLoweGradient")
        //     .attr("x1", "0%").attr("y1", "0%")
        //     .attr("x2", "0%").attr("y2", "100%");

        // TopLoweGradient.append("stop")
        //     .attr("offset", "0%")
        //     .attr("stop-color", "black")//#ef9509
        //     .attr("stop-opacity", 1);
        // TopLoweGradient.append("stop")
        //     .attr("offset", "100%")
        //     .attr("stop-color", "transparent")
        //     .attr("stop-opacity", 1);

        LeftRightGradient = con.append("defs")
            .append("linearGradient")
            .attr("id", "LeftRightGradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");

        LeftRightGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "black") //#ef9509
            .attr("stop-opacity", 1);
        LeftRightGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "transparent")
            .attr("stop-opacity", 1);

        con.append("rect")
            .attr("width", 100)
            .attr("height", height + 50)
            .style("fill", "url(#LeftRightGradient)");
    }

    function DrawExpirationView(parent) {
        var prevExpiredQuotes = [];
        var con = parent.append('g');
        var pointSize = 14;
        //var _height = height;
        var _color = "#2f2f32";
        var _result = "result-processing";
        var _resultPrice = ""

        this.UpdateLineLaber = function () {
            redLine.attr("y2", height);
            redPoint.attr('cy', height - pointSize);
            redIcon.attr('y', height - (pointSize / 2) - 1);
            whiteLine.attr("y2", height);
            whiteIcon.attr('y', height - (pointSize / 2));
            WhitePoint.attr('cy', height - pointSize);
        }

        var redLine = con.append('line').attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .attr("stroke-width", 2)
            .attr("stroke", '#FA4225');

        var whiteLine = con.append('line').attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", '2 2')
            .attr("stroke", 'white');

        con.append("rect")
            .attr("width", width)
            .attr("height", 100)
            .style("fill", "url(#TopLoweGradient)");

        var TopGradientBorder = con.append("defs")
            .append("linearGradient")
            .attr("id", "TopLoweGradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");

        TopGradientBorder.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "black")
            .attr("stop-opacity", 1);
        TopGradientBorder.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "transparent")
            .attr("stop-opacity", 1);

        var redPoint = con.append('circle')
            .attr('cx', 0)
            .attr('cy', height - pointSize)
            .attr('r', pointSize).style('fill', '#FA4225');

        var redIcon = con.append("text")
            .attr('x', -(pointSize / 2) - 1.5)
            .attr('y', height - (pointSize / 2) - 1)
            .attr('fill', 'white')
            .attr('font-size', '16px')
            .attr('font-family', FontAwesome.fontFamily)
            .attr('id', 'expiration-icon-timer')
            .text("\uf11e");

        var redIconLabel = con.append("foreignObject")
            .attr('x', -(pointSize / 2) + 30)
            .attr('y', height - (pointSize + 12))
            .attr('visibility', 'hidden')
            .html('<p class="expiration-time-label">EXPIRATION<br>TIME</p>');

        var pt = con.append('g');

        var PurchaseTimeLabel = pt.append("text")
            .attr('x', 7)
            .attr('y', 42)
            .attr('visibility', 'visible')
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .text("PURCHASE TIME");

        var PurchaseTimer = pt.append("text")
            .attr('x', 7)
            .attr('y', 22)
            .attr('visibility', 'visible')
            .attr('fill', 'white')
            .attr('font-size', '22px')
            .attr('id', 'purchase-timer')
            .text("00:00");

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
            .attr('id', 'purchase-icon-timer')
            .text("\uf017");

        var whiteIconLabel = con.append("foreignObject")
            .attr('x', -(pointSize / 2) - 80)
            .attr('y', height - (pointSize + 12))
            .attr('visibility', 'hidden')
            .html('<p class="purchase-time-label" align="right">PURCHASE<br>TIME</p>');

        var priceLine = con.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', width)
            .attr('y2', 0)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4 2')
            .attr('stroke', '#fff')
            .attr('visibility', 'hidden');

        var priceIndicator = new DrawPolygonView(con, {
            height: 30,
            width: 90,
            FontStyle: {
                color: 'black',
                size: 15,
                weight: 'bold'
            },
            Style: {
                fill: 'white'
            }
        }, true);

        priceIndicator.View.attr('visibility', 'hidden');

        var ExpirationTick = con.append("circle")
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 3)
            .attr('visibility', 'hidden')
            .style('fill', '#fff');

        var ResultView = con.append('g').attr('id', 'ResultBubbleView');

        var CloseBtn = ResultView.append('foreignObject')
            .attr('x', 100)
            .attr('y', 100)
            .attr('visibility', 'hidden')
            .html("<a href=" + "#link" + " class=" + "uk-button-yellow" + " ng-if=" + "hasOption" +
            " ng-click=" + "UpDownTrade(2)" + "><span class=" + "uk-icon-plus-square" + "></span><span>New Option</span></a>");

        var layer1 = ResultView.append('g')
        var layer2 = ResultView.append('g')

        var ProcessingResult = layer2.append("foreignObject")
            .attr('x', 0)
            .attr('y', 0)
            .attr('visibility', 'hidden')
            .html('<div class="processing-bg"><div class="processing-result"></div></div>');

        var ResultBubble = layer2.append("foreignObject")
            .attr('x', 0)
            .attr('y', 0)
            .attr('id', 'resultBubble')
            .attr('visibility', 'hidden')
            .html('<div class="' + _result + '"><p class="result-details">RESULT (P\L)<br>' + _resultPrice + '</p></div>')
            .on('click', function () {
                // ResultView.remove();
                // ResultView.attr('visibility','hidden');
                document.getElementById("ResultBubbleView").setAttribute('visibility', 'hidden');
            });

        var ResultPointer = layer1.append("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("x", ResultBubble.node().getBBox().x - 5)
            .attr("y", 0)
            .attr('visibility', 'hidden')
            .attr('visibility', document.getElementById('resultBubble').style.visibility)
            .append("path")
            .attr("fill-rule", "evenodd")
            .attr("fill", _color)
            .attr("d", "M10.045,20.875 L0.063,10.848 L10.063,0.874 L10.045,20.875 Z");

        var ResultCloseBtn = layer2.append("text")
            .attr('x', ResultBubble.node().getBBox().x + ResultBubble.node().getBBox().width - 8) //
            .attr('y', ResultBubble.node().getBBox().y + 16)
            .attr('visibility', 'hidden')
            .attr('fill', '#979798')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text('X')
            .on('mouseover', function () {
                ResultCloseBtn.attr('fill', '#fff');
            })
            .on('mouseout', function () {
                ResultCloseBtn.attr('fill', '#979798');
            })
            .on('click', function () {
                // ResultView.remove();
                alert("Closing");
                debugger;
                // Settings.isExpired = true;  
                // Settings.ExpirationSettings.isExpired = false;
                // Settings.isExpiring = false;
            });

        var _tmpResultPrice = 0.00;

        this.SetData = function (data) {
            // debugger;
            if (data < 0) {
                _result = "result-loss";
                _resultPrice = "-$" + data.toString().slice(1);
                // _resultPrice = "-$" + String(_tmpResultPrice + parseFloat(data.toString().slice(1)));
                // _tmpResultPrice = parseFloat("-" + _resultPrice.toString().slice(2));
                _color = "#DA4830";
            } else {
                _result = "result-win";
                _resultPrice = "$" + parseFloat(data);
                // _resultPrice = "$" +  String(_tmpResultPrice + parseFloat(data));
                // _tmpResultPrice = parseFloat(_resultPrice.toString().slice(1));
                _color = "#40b240";
            }
        }

        this.Update = function () {
            if (!this.Data) return;
            isOptionsExpired = this.Data.isExpired;
            var _endline = new Date(this.Data.ExpiryTime.tick);
            // var _endline = new Date(this.Data.PurchaseTime.tick + (3 * 1000));
            var _purchaseLine = new Date(this.Data.PurchaseTime.tick);
            PurchaseTimer.text(this.Data.PurchaseTime.string);
            var pt = this.Data.PurchaseTime.InSecond;
            var et = this.Data.RemainingTime.InSecond;
            var timer_id = null;
            if (this.Data.hasOpenOptions == false && this.Data.isExpired == false) {
                timer_id = this.PrePurchase();
            } else {
                timer_id = this.PostPurchase(pt);
            }
            if (et > 0 && pt < 0 && this.Data.isExpired == false) {
                timer_id = this.Expiring(et);
            } else {
                this.Expired();
            }
            this.Position({
                e: xCoordinate(_endline),
                p: xCoordinate(_purchaseLine),
                duration: 0
            })

        }

        var whiteTimer = con.append('path').style({
            'stroke': '#ffffff',
            'fill': 'none',
            'stroke-width': 3
        });

        var redTimer = con.append('path').style({
            'stroke': '#FA4225',
            'fill': 'none',
            'stroke-width': 3
        });
        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

            return {
                x: centerX + (radius * Math.cos(angleInRadians)),
                y: centerY + (radius * Math.sin(angleInRadians))
            };
        }

        function describeArc(x, y, radius, startAngle, endAngle) {

            var start = polarToCartesian(x, y, radius, endAngle);
            var end = polarToCartesian(x, y, radius, startAngle);

            var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

            var d = [
                "M", start.x, start.y,
                "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
            ].join(" ");

            return d;
        }

        function ComputeDinaminator(insecond) {
            var isLess = false;
            var i = 1;
            var temp = 0;
            do {
                temp = 60 * i;
                i++;
            } while (insecond >= temp);
            return temp;
        }

        function FormatTimer(time) {
            var min = Math.floor(time / 60);
            return ":" + (min > 0 ? min + "m" : time < 10 ? "0" + time : time);
        }

        this.PrePurchase = function () {
            PurchaseTimer.attr('visibility', 'visible');
            PurchaseTimeLabel.attr('visibility', 'visible');
            whiteIcon.text("\uf017");
            whiteIcon.attr('font-size', '20px');
            whiteIconLabel.attr('visibility', 'hidden');
            whiteTimer.attr('visibility', 'hidden');
            return '#' + PurchaseTimer.attr('id');
        }

        this.PostPurchase = function (data) {
            PurchaseTimer.attr('visibility', 'hidden');
            PurchaseTimeLabel.attr('visibility', 'hidden');
            if (this.Data.PurchaseTime.InSecond >= 0) {
                WhitePoint.style({
                    'fill': 'black',
                    'stroke': 'black',
                    'stroke-width': 2
                });
                whiteIcon.attr('font-family', 'Helvetica').attr('font-size', '14px').attr('fill', 'white');
                whiteIcon.attr('x', -(pointSize / 2) - 4).attr('y', height - (pointSize / 2) - 3);
                whiteIcon.text(FormatTimer(this.Data.PurchaseTime.InSecond));
                whiteIconLabel.attr('visibility', 'visible');
                whiteTimer.attr('visibility', 'visible');
                var whiteAngle = (360 * data) / ComputeDinaminator(data);
                if (whiteAngle > 0) whiteTimer.attr('d', describeArc(0, height - pointSize, pointSize + 3, 0, whiteAngle));
            } else {
                WhitePoint.style({
                    'fill': 'white',
                    'stroke': 'none',
                    'stroke-width': 0
                });
                whiteIcon.attr('font-family', FontAwesome.fontFamily);
                whiteIcon.attr('font-size', '20px').attr('fill', 'black');
                whiteIcon.attr('x', -(pointSize / 2) - 1.5).attr('y', height - (pointSize / 2));
                whiteIcon.text("\uf017");
                whiteIconLabel.attr('visibility', 'hidden');
            }
            return '#' + whiteIcon.attr('id');
        }

        this.Expiring = function (data) {
            redPoint.style({
                'fill': 'black',
                'stroke': 'black',
                'stroke-width': 2
            });
            redIcon.attr('font-family', 'Helvetica').attr('font-size', '14px').attr('fill', 'white');
            redIcon.text(FormatTimer(this.Data.RemainingTime.InSecond));
            redIcon.attr('x', -(pointSize / 2) - 4).attr('y', height - (pointSize / 2) - 2.5)
            redIconLabel.attr('visibility', 'visible');
            redTimer.attr('visibility', 'visible');
            var redAngle = (360 * data) / ComputeDinaminator(data);
            if (redAngle > 0) redTimer.attr('d', describeArc(0, height - pointSize, pointSize + 3, 0, redAngle * 2));
            return '#' + redIcon.attr('id');
        }

        this.Expired = function () {
            redPoint.style({
                'fill': '#FA4225',
                'stroke': 'none',
                'stroke-width': 0
            });
            redIcon.attr('x', -(pointSize / 2) - 1.5).attr('y', height - (pointSize / 2) - 1)
            redIcon.attr('font-family', FontAwesome.fontFamily);
            redIcon.attr('font-size', '16px');
            redIcon.text("\uf11e");
            redIconLabel.attr('visibility', 'hidden');
            redTimer.attr('visibility', 'hidden');
        }

        this.Position = function (data) {
            if (!Settings.ChartData.length) return;
            var quote = Settings.ChartData.find(x => x.stamp <= new Date(this.Data.ExpiryTime.tick))
            if (quote == undefined) return;
            var price = quote.price;
            var Xexpriry = xCoordinate(Settings.ChartData.find(x => x.stamp <= new Date(this.Data.ExpiryTime.tick)).stamp);
            var Yexpiry = yCoordinate(price);
            var easeEffect = 'linear';
            if (self.IsAnimationStarted) {
                redLine.attr('transform', 'translate(' + data.e + ',0)');
                whiteLine.attr('transform', 'translate(' + data.p + ',0)');
                WhitePoint.attr('transform', 'translate(' + data.p + ',0)');
                whiteIcon.attr('transform', 'translate(' + data.p + ',0)');
                whiteIconLabel.attr('transform', 'translate(' + data.p + ',0)');
                redPoint.attr('transform', 'translate(' + data.e + ',0)');
                redIcon.attr('transform', 'translate(' + data.e + ',0)');
                redIconLabel.attr('transform', 'translate(' + data.e + ',0)');
                PurchaseTimeLabel.attr('transform', 'translate(' + data.p + ',0)');
                PurchaseTimer.attr('transform', 'translate(' + data.p + ',0)');
                whiteTimer.attr('transform', 'translate(' + data.p + ',0)');
                redTimer.attr('transform', 'translate(' + data.e + ',0)');
            } else {
                redLine.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.e + ',0)');
                whiteLine.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.p + ',0)');
                WhitePoint.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.p + ',0)');
                whiteIcon.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.p + ',0)');
                whiteIconLabel.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.p + ',0)');
                redPoint.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.e + ',0)');
                redIcon.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.e + ',0)');
                redIconLabel.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.e + ',0)');
                PurchaseTimeLabel.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.p + ',0)');
                PurchaseTimer.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.p + ',0)');
                whiteTimer.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.p + ',0)');
                redTimer.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + data.e + ',0)');
                if (Settings.ExpirationSettings.isExpired) {
                    // ResultView = con.append('g').attr('class','ResultBubbleView');                    
                    priceLine.attr('visibility', 'visible');
                    priceLine.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(0,' + Yexpiry + ')');

                    priceIndicator.View.attr('visibility', 'visible');
                    priceIndicator.Text(price);
                    priceIndicator.View.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + (width - priceIndicator.Width) + ',' + Yexpiry + ')');

                    ExpirationTick.attr('visibility', 'visible');
                    ExpirationTick.transition().duration(data.duration).ease(easeEffect).attr('transform', 'translate(' + Xexpriry + ',' + Yexpiry + ')');

                    ProcessingResult.attr('visibility', 'visible');
                    // ProcessingResult.attr('transform','translate('+ (Xexpriry + 10) + ',' + (Yexpiry - 20)  +')');
                    ProcessingResult.attr('x', (Xexpriry + 10));
                    ProcessingResult.attr('y', (Yexpiry - 20));

                    ResultPointer.attr('visibility', 'visible');
                    ResultPointer.attr('fill', _color);
                    ResultPointer.attr('transform', 'translate(' + (Xexpriry + 10) + ',' + (Yexpiry - 11) + ')');
                    if (_resultPrice != "") {
                        ProcessingResult.attr('visibility', 'hidden');
                        ResultCloseBtn.attr('visibility', 'hidden'); //ResultCloseBtn.attr('visibility','visible');
                        ResultCloseBtn.attr('transform', 'translate(' + (Xexpriry + 144) + ',' + (Yexpiry - 24) + ')');
                        ResultBubble.attr('visibility', 'visible');
                        ResultBubble.html('<div class="' + _result + '"><p class="result-details">RESULT (P\L)<br>' + _resultPrice + '</p></div>');
                        ResultBubble.attr('transform', 'translate(' + (Xexpriry + 10) + ',' + (Yexpiry - 25) + ')');
                    }
                } else {
                    priceLine.attr('visibility', 'hidden');
                    ExpirationTick.attr('visibility', 'hidden');
                    priceIndicator.View.attr('visibility', 'hidden');
                    _resultPrice = "";
                    _color = "#2f2f32";
                    ResultPointer.attr('visibility', 'hidden');
                    ProcessingResult.attr('visibility', 'hidden');
                    ResultCloseBtn.attr('visibility', 'hidden');
                    ResultBubble.attr('visibility', 'hidden');
                }
            }
        }

        return this;
    }

    function AnimateTimer(timer_id) {
        d3.select(timer_id).transition()
            .duration(1000)
            .style('opacity', '0')
            .transition()
            .duration(1000)
            .style('opacity', '1');
        // .on("end", AnimateTimer(timer_id));
    }

    function DrawLoadingView(parent, data) {

        var _width = data == undefined ? 10 : xCoordinate(data.End) - xCoordinate(data.Start);
        this._width = _width > width ? width : _width;

        this.UpdateLoadingView = function () {
            body.attr("height", height);

            __line.attr("y2", height);
        }

        var con = parent.append("g");
        var body = con.append("rect")
            .attr("width", this._width)
            .attr("height", height)
            .attr('opacity', 0.2)
            .style("fill", "rgba(128, 128, 128, 0.5)");

        var __line = con.append('line').attr("x1", this._width)
            .attr("y1", 0)
            .attr("x2", this._width)
            .attr("y2", height)
            .style('stroke', 'grey')
            .style('stroke-width', 2)
            .attr("stroke-dasharray", '5 3')
            .attr('class', 'loadingline');
        this.View = con;

        this.Position = function (data) {
            this._width = data[1];
            body.attr('width', this._width)
                // .attr('transform', 'translate(' + data[0] + ', 0)')
                ;
            __line.attr("x1", this._width)
                .attr("y1", 0)
                .attr("x2", this._width)
                .attr("y2", height)
        }

        this.Model = data;

        return this;
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
            width: 70,
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


        var v_text = con.append("text")
            .attr('y', height + 11)
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .text('')

        this.Position = function (point) {
            var stampMouseData = isNaN(xCoordinate.invert(point[0])) ? 'no data' : FormatTime(xCoordinate.invert(point[0]), "y-m-d-hh-mm-ss");
            v_text.attr('y', height + 11);
            vLinelabel.attr('y', height);

            vLine.attr("x1", point[0])
                .attr("y1", 0)
                .attr("x2", point[0])
                .attr("y2", height);
            hLine.attr("x1", 0)
                .attr("y1", point[1])
                .attr("x2", width)
                .attr("y2", point[1]);
            hLinelabel.View.attr('transform', 'translate(' + (width - hLinelabel.Width) + ', ' + point[1] + ')');
            hLinelabel.Text(yCoordinate.invert(point[1]));
            vLinelabel.attr('transform', 'translate(' + (point[0] - vLinelabelSize / 2) + ', 0)');
            v_text.attr('transform', 'translate(' + (point[0] - v_text.node().getBoundingClientRect().width / 2) + ', 0)');
            v_text.text(stampMouseData);

        }

        this.Visibility = function (isVisible) {
            con.attr('opacity', isVisible ? 1 : 0);
        }
        return this;
    }

    function DrawTickPointerView(parent, parent1) {
        this.UpdateTick = function () {
            Line.attr("x2", width);
            //polygon.View.attr('transform', 'translate('+ (width - polygon.Width) +', ' + yCoordinate(ExpiredLastQuote.price) + ')');
            HoverDown.attr("width", width);
            HoverDown.attr("height", height / 3);
            HoverUp.attr("width", width);
            HoverUp.attr("height", height / 3);
        }

        var LineGroup = parent.append('g').attr('class', 'TickLineGroup');
        var Line = LineGroup.append('line').attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", width)
            .attr("y2", 0).attr('class', 'TickPointer Tickline');

        var HoverDown = LineGroup.append("rect")
            .attr("width", width)
            .attr("height", height / 3)
            // .style("opacity", 0)
            .attr("visibility", 'hidden')
            .style("opacity", 0.2)
            .style("fill", "url(#HoverDown)");

        var HoverDownGradient = LineGroup.append("defs")
            .append("linearGradient")
            .attr("id", "HoverDown")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");

        HoverDownGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#DA4830")//#ef9509
            .attr("stop-opacity", 1);
        HoverDownGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "transparent")
            .attr("stop-opacity", 1);

        var HoverUp = LineGroup.append("rect")
            .attr("width", width)
            .attr("height", height / 3)
            // .style("opacity", 0)            
            .attr("visibility", 'hidden')
            .style("opacity", 0.2)
            .style("fill", "url(#HoverUp)");

        var HoverUpGradient = LineGroup.append("defs")
            .append("linearGradient")
            .attr("id", "HoverUp")
            .attr("x1", "0%").attr("y1", "100%")
            .attr("x2", "0%").attr("y2", "0%");

        HoverUpGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#2BAB3F")//#ef9509
            .attr("stop-opacity", 1);
        HoverUpGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "transparent")
            .attr("stop-opacity", 1);

        var polygon = new DrawPolygonView(parent, {
            height: 30,
            width: 90,
            FontStyle: {
                color: 'black',
                size: 15,
                weight: 'bold'
            },
            Style: {
                fill: 'white'
            }
        }, true);

        var pointerCon = parent1.append('g');

        var PointAnimation = pointerCon.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 15)
            .attr('opacity', 0.5)
            .style('fill', '#2ec4ff');
        // .style('stroke-width', 2.5)
        // .style('stroke', 'white');

        function TickTransition() {
            if (isOptionsExpired) return;
            PointAnimation.attr('r', 0)
                .attr('opacity', 0.8)
                // .transition().duration(duration)
                .transition().duration(1000)
                .attr('r', 25)
                .attr('opacity', 0)
                .each("end", TickTransition);
        }
        this.TickTransition = TickTransition;

        TickTransition();

        var Point = pointerCon.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 3)
            .style('fill', 'white');

        this.Position = function (x, y) {
            if (x == undefined || y == undefined) return;
            if (!isOptionsExpired) {
                TickTransition();
                Line.attr('visibility', 'visible');
                Line.transition().duration(50).delay(0).attr('transform', 'translate(0, ' + y + ')');
                HoverDown.attr('transform', 'translate(0, ' + y + ')');
                HoverUp.attr('transform', 'translate(0, ' + (y - (height / 3)) + ')');
                polygon.View.attr('visibility', 'visible');
                polygon.View.transition().duration(50).delay(0).attr('transform', 'translate(' + (width - polygon.Width) + ', ' + y + ')');
                polygon.Text(yCoordinate.invert(y));
                Point.attr('visibility', 'visible');
                Point.attr('transform', 'translate(' + x + ', ' + y + ')');
                PointAnimation.attr('transform', 'translate(' + x + ', ' + y + ')')
            } else {
                if (ExpiredLastQuote == undefined) return;
                Line.attr('visibility', 'hidden');
                Line.transition().duration(50).delay(0).attr('transform', 'translate(0, ' + yCoordinate(ExpiredLastQuote.price) + ')');
                HoverDown.attr('transform', 'translate(0, ' + yCoordinate(ExpiredLastQuote.price) + ')');
                polygon.View.attr('visibility', 'hidden');
                polygon.View.transition().duration(50).delay(0).attr('transform', 'translate(' + (width - polygon.Width) + ', ' + yCoordinate(ExpiredLastQuote.price) + ')');
                polygon.Text(yCoordinate.invert(yCoordinate(ExpiredLastQuote.price)));
                Point.attr('visibility', 'hidden');
                Point.attr('transform', 'translate(' + x + ', ' + y + ')');
            }
        }

        Settings.OnButtonHover = function (arg) {
            var color;
            if (arg == 1) {
                // HoverUp.style("opacity", 0.2);
                HoverUp.attr("visibility", 'visible');
                color = "#2BAB3F";
            }
            else {
                // HoverDown.style("opacity", 0.2);
                HoverDown.attr("visibility", 'visible');
                color = "#DA4830";
            }
            Line.style('stroke', color);
            polygon.View.select('polygon').style('fill', color);
            Point.style('fill', color);
            polygon.View.select('text').style('fill', 'white');
        };

        Settings.OnUnHover = function () {
            Line.style('stroke', 'white');
            Point.style('fill', 'white');
            polygon.View.select('polygon').style('fill', 'white');
            polygon.View.select('text').style('fill', 'black');
            HoverDown
                // .style("opacity", 0.0);
                .attr("visibility", 'hidden');
            HoverUp
                // .style("opacity", 0.0);
                .attr("visibility", 'hidden');
        }

        return this;
    }

    function DrawPolygonView(parent, data, isAnimate) {
        var _h = data.height;
        var _w = data.width;
        var _fontStyle = data.FontStyle;
        var _Style = data.Style;
        var _slantwidth = _w * .15;
        var y = 0;
        var _points = [
            [0, y],
            [0 + _slantwidth, y - (_h / 2)],
            [_w, y - (_h / 2)],
            [_w, y + (_h / 2)],
            [_slantwidth, y + (_h / 2)],
            [0, y]
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
                        var _val = Math.round(i(t) * round) / round;
                        this.textContent = isNaN(_val) ? 0 : GetPriceFormat(_val);
                    };
                });
        };

        con.attr('transform', 'translate(' + (width - _w) + ',0)');

        this.Width = _w;
        this.View = con;

        return this;
    }

    function DrawBalloon(parent, data) {
        this.con = parent.append('g');
        var __x = 100;
        var __y = 110;
        var __rx = 10;
        var __ry = 15;
        var __padding = 5;
        var _opacity = 1;

        var body = this.con.append("rect").attr('opacity', _opacity);
        // var corner = con.append("polygon").attr('opacity', _opacity);
        var _text = this.con.append("text")
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .text("$1");

        var _contextWidth = _text.node().getBoundingClientRect().width;
        var _contextHeight = _text.node().getBoundingClientRect().height;

        var ballonWidth = _contextWidth + __padding * 2;
        var ballonHeight = _contextHeight + __padding * 2;

        _text.attr('x', __x + (ballonWidth / 2) - _contextWidth / 2)
            .attr('y', __y + (ballonHeight / 2) + _contextHeight / 4)


        // corner.data([[[__x, __y], [__x, __y + __ry], [__x + __rx, __y]]])
        //     .attr('points', function (d, i) {
        //         return d;
        //     })
        //     .attr('fill', '#40b240')
        this.DrawBalloon = function () {
            this.con.select("polygon").remove();
        }

        this.DrawBalloon();

        return this;
    }

    function DrawNewOption(parent, parent1, data) {
        // debugger;
        var newOpt = this;
        var _color = data.optionType == "1" ? '#DA4830' : '#40b240';

        // debugger;
        // var utcNow = Date.utcNow();
        // var _strLocalTime = String(new Date(Date.now()));
        var _now = new Date()
        var _offSet = _now.getTimezoneOffset() / 60;

        var y = yCoordinate(Number(data.openQuote));
        var x = xCoordinate(new Date(data.openTime + ((_offSet * 60) * 60000)));

        var OptionPriceView = parent.append('g').attr('class', 'NewOptionPriceView');
        var OptionStampView = parent1.append('g').attr('class', 'NewOptionStampView');
        var openLine = OptionPriceView.append('line').attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", width)
            .attr("y2", 0)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", '4 2')
            .attr("stroke", _color);

        openLine.attr('transform', 'translate(0,' + y + ')');

        var polyLine = new DrawPolygonView(OptionPriceView, {
            height: 20,
            width: 70,
            FontStyle: {
                color: '#fff',
                size: 12,
                weight: 'normal'
            },
            Style: {
                fill: _color
            }
        }, false);

        polyLine.View.attr('transform', 'translate(' + (width - polyLine.Width) + ',' + y + ')');
        polyLine.Text(data.openQuote);

        var layer1 = OptionStampView.append('g');
        var layer2 = OptionStampView.append('g');
        // var _bubbleText = data.state != "11" ? data.state : data.price;
        // var _amount = Number.isInteger(parseFloat(data.price)) ? parseInt(data.price) : data.price; // Determine with or without decimal places

        var _bubbleText = data.state;
        if (_bubbleText != "11") {
            _bubbleText = data.state
        } else {
            _bubbleText = Number.isInteger(parseFloat(data.price)) ? parseInt(data.price) : data.price;
            _bubbleText = "$" + _bubbleText.toString()
        }

        //dummy only
        var purchasePrice = OptionStampView.append('text')
            .text(_bubbleText)
            .attr('x', -Math.abs(3))
            .attr('y', -20)
            .attr("text-anchor", "end")
            .attr('visibility', 'hidden');

        var xCoor = purchasePrice.node().getBBox().width;
        var transType = data.optionType == "1" ? "balloon-down" : "balloon-up";

        var purchaseBalloon = OptionStampView.append('foreignObject')
            .html('<div class="' + transType + '"><p>' + _bubbleText + '</p></div>')
            .attr("x", -Math.abs(xCoor + 15))
            .attr("y", data.optionType == "1" ? 3.5 : -37.5);

        var openPoint = OptionStampView.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 7)
            .style('stroke', '#fff')
            .style('stroke-width', 1.5)
            .style('fill', _color);

        var pointIcon = OptionStampView.append("text")
            .attr('x', 0 - (7 / 2) - 0.7)
            .attr('y', data.optionType == "1" ? (7 / 2) - 1.8 : (7 / 2) - 0.1)
            .attr('fill', '#fff')
            .attr('font-size', '13px')
            .attr('font-family', FontAwesome.fontFamily)
            .text(data.optionType == "1" ? '\uf0dd' : '\uf0d8');

        OptionStampView.attr('transform', 'translate(' + x + ',' + y + ')');

        newOpt.Update = function (model) {
            // debugger;         
            y = yCoordinate(Number(data.openQuote));
            x = xCoordinate(new Date(data.openTime + ((_offSet * 60) * 60000)));

            openLine.attr('transform', 'translate(0,' + y + ')');
            // var newAmount = Number.isInteger(parseFloat(model.price)) ? parseInt(model.price) : model.price; // Determine with or without decimal places
            // var newPrice = model.count > 1 ? newAmount + "x" + model.count : newAmount;

            var _newBubbleText = model.state;
            if (_newBubbleText != "11") {
                _newBubbleText = model.state
            } else {
                _newBubbleText = Number.isInteger(parseFloat(model.price)) ? parseInt(model.price) : model.price;
                _newBubbleText = model.count > 1 ? "$" + _newBubbleText.toString() + "x" + model.count.toString() : "$" + _newBubbleText.toString()
                // _newBubbleText = "$" + _newBubbleText.toString()
            }

            purchasePrice.text(_newBubbleText);
            var newXCoor = purchasePrice.node().getBBox().width;

            purchaseBalloon.html('<div class="' + transType + '"><p>' + _newBubbleText + '</p></div>').attr("x", -Math.abs(newXCoor + 15));

            OptionStampView.attr('transform', 'translate(' + x + ',' + y + ')');
            polyLine.View.attr('transform', 'translate(' + (width - polyLine.Width) + ',' + y + ')');
        }

        newOpt.Remove = function () {
            OptionPriceView.remove();
            OptionStampView.remove();
        };

        return newOpt;
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
        if (!Settings.IsInitDataReady) {
            svg.selectAll('g').attr('opacity', 0);
            yAx.attr('opacity', 0);
        }
        else {
            d3.select('svg#chartLoader-logo').attr('class', 'ChartNoData');
            svg.selectAll('g').attr('opacity', 1);
            yAx.attr('opacity', 1);
        }
        // NewLive();
        var _duration = GetAnimationSpan();
        self.IsAnimationStarted = true;
        if (_liveBar) {
            if (_liveBar.stamp == Settings.ChartData[0].stamp) {
                self.IsAnimationStarted = false;
            }
        } else if (!Settings.ChartData.length) {
            chartTimeout();
            return;
        }
        _liveBar = Settings.ChartData[0];
        self.SymbolDigit = GetSymbolDigit(_liveBar.price);
        var _allow = GetPipsAllowance(self.SymbolDigit, 0.3);
        if (ExpirationLine.Data != undefined && self.BoardProperty.Max > new Date(ExpirationLine.Data.ExpiryTime.tick + (1000 * 60)) || !self.CurrentVisible) self.IsAnimationStarted = false;
        else if (!isOptionsExpired) {
            xCoordinate.domain(GetBoardRange());
            ExpiredLastQuote = undefined;
        }
        else {
            self.IsAnimationStarted = false;
            if (ExpiredLastQuote == undefined) {
                ExpiredLastQuote = Settings.ChartData[1];
            }
        }
        var _datarange = GetDataToDraw(0);
        var middlePoint = 0
        var newMin = d3.min(_datarange, function (d) {
            return d.price;
        })
        var newMax = d3.max(_datarange, function (d) {
            return d.price;
        })

        var pointDiff = (newMax - newMin);
        var middlePoint = pointDiff == 0 ? _allow : pointDiff / 4;
        var maxValWithAllowance = newMax + (middlePoint);
        var minValWithAllowance = newMin - (middlePoint);


        yCoordinate.domain([minValWithAllowance, maxValWithAllowance]);
        Settings.MinPrice = minValWithAllowance;
        Settings.MaxPrice = maxValWithAllowance;
        ReDrawLineGraph(GetDataToDraw(10));
        lastDomain = yCoordinate.domain();
        axis.ReDraw(_duration);
        yAx.ReDraw(_duration);
        var linegraphanimationX = xCoordinate(min + _duration);
        if (self.IsAnimationStarted) {
            paths.attr('transform', 'translate(' + (xCoordinate(Settings.TimeNow) - xCoordinate(Settings.TimeNow - _duration)) + ',0)')
                .transition()
                .duration(_duration)
                .ease('linear')
                .attr('transform', 'translate(' + (isNaN(linegraphanimationX) ? 0 : linegraphanimationX) + ')')
                .each('end', function (d, i) {
                    self.AnimateChart();
                });
        } else {
            chartTimeout();
        }
        TickPointer.Position(xCoordinate(_liveBar.stamp), yCoordinate(_liveBar.price));
        if (Settings.ChartData.length < 2) return;
        var oldestDataX = xCoordinate(Settings.ChartData[Settings.ChartData.length - 1].stamp);
        if (oldestDataX > 0) {
            NoDataView.Position([0, oldestDataX]);
            NoDataView.View.attr('opacity', 1);
        }
        else {
            NoDataView.View.attr('opacity', 0);
            // Settings.ChartData.pop();
        }
        if (self.BoardProperty.Min != undefined || self.BoardProperty.Max != undefined) {
            var lastData = (Settings.ChartData[Settings.ChartData.length - 1].stamp).getTime();
            var leftBounds = self.BoardProperty.Min.getTime() - (self.BoardProperty.Max.getTime() - self.BoardProperty.Min.getTime())
            var rightBounds = self.BoardProperty.Max.getTime() + (self.BoardProperty.Max.getTime() - self.BoardProperty.Min.getTime())
            var epochHour = 3600000;
            function splice_hour(ticks) {
                excess = (ticks % epochHour);
                affix = ticks - excess;
                return affix
            }
            //left
            if (lastData > leftBounds) {
                if (!Settings.IsHistoryRequested) {
                    // console.log('request history now!');
                    var req = {};
                    tailrange = self.BoardProperty.Min.getTime() - ((self.BoardProperty.Max.getTime() - self.BoardProperty.Min.getTime()) * 2);
                    req[Settings.Symbol] = {
                        end: lastData,
                        start: tailrange,
                    }
                    Settings.TickService.RequestTickHistory(req);
                    Settings.IsHistoryRequested = true;
                }
            }
            function get_object_index(arr, value) {
                retval = 0;
                for (var i = 0, iLen = arr.length; i < iLen; i++) {
                    toSee = arr[i]['stamp'].getTime();
                    v = [];
                    if (toSee <= value) {
                        retval = i;
                        break;
                    }
                }
                return retval;
            }
            if ((lastData + epochHour) <= leftBounds) {
                toMove = splice_hour(lastData + epochHour);
                toMoveStart = splice_hour(lastData);
                toMoveEnd = splice_hour(leftBounds);
                filterIndex = get_object_index(Settings.ChartData, toMove) + 1;
                Settings.ChartData = Settings.ChartData.slice(0, filterIndex);
                unviewData = {
                    symbol: Settings.Symbol,
                    start: toMoveStart,
                    end: toMoveEnd
                }
                Settings.Unview.Unviewing(unviewData);

            }
            //right
            // current_time = Settings.TimeNow.getTime();
            // initData = (Settings.ChartData[0].stamp).getTime();
            // barrier = splice_hour(initData);

            // if (barrier < rightBounds && current_time >= rightBounds) {
            //     if (!Settings.IsFutureRequested) {
            //         // console.log('request history now!');
            //         var req = {};
            //         eDate = rightBounds + epochHour;
            //         req[Settings.Symbol] = {
            //             end: eDate,
            //             start: barrier,
            //         }
            //         Settings.TickFuture.RequestTickFuture(req);
            //         Settings.IsFutureRequested = true;
            //     }
            // }

            // if(barrier >= rightBounds){
            //     self.LiveBarsStop = true;
            //     bStart = splice_hour(barrier);
            //     bEnd = initData;
            //     barrierIndex = get_object_index(Settings.ChartData,barrier);
            //     Settings.ChartData = Settings.ChartData.slice(barrierIndex,Settings.ChartData.length);
            //     unviewData = {
            //         symbol:Settings.Symbol,
            //         start:bStart,
            //         end:bEnd
            //     }
            //     Settings.Unview.Unviewing(unviewData);
            //     console.log('ding dong');
            // }
            //self.LiveBarsStop = false;
        }


        ExpirationLine.Update();
        for (var iii = 0; iii < Settings.OpenOptionsCollection.length; iii++) {
            Settings.OpenOptionsCollection[iii].View.Update(Settings.OpenOptionsCollection[iii].Model);
        }
        if (mouselocation) CursorPointer.Position(mouselocation);
    }

    function NewLive() {
        if (Settings.Bid == 0) return;
        currentPrice = {
            price: Settings.Bid,
            stamp: Settings.TimeNow
        };

        if (Settings.ChartData.length) {
            if (currentPrice.stamp.getTime() == Settings.ChartData[0].stamp.getTime()) {
                Settings.ChartData[0] = currentPrice;
            } else {
                Settings.ChartData.unshift(currentPrice);
            }
        } else {
            Settings.ChartData.unshift(currentPrice);
        }
    }
    

    setInterval(NewLive, 100);


    function chartTimeout() {
        _timeout = setTimeout(function () {
            clearTimeout(_timeout);
            _timeout = null;
            self.AnimateChart();
        }, GetAnimationSpan());
    }

    function ReDrawLineGraph(data) {
        lineGraph.path.attr("d", line(data));
        areapath.attr('d', area(data));
        Settings.VisibleChartData = data;
    }

    function areaTweening(d, indx) {
        var interp = d3.interpolate(this._current, d); // this will return an interpolater
        //  function that returns values
        //  between 'this._current' and 'd'
        //  given an input between 0 and 1

        this._current = d; // update this._current to match the new value

        return function (t) { // returns a function that attrTween calls with
            //  a time input between 0-1; 0 as the start time,
            //  and 1 being the end of the animation

            var tmp = interp(t); // use the time to get an interpolated value
            //  (between this._current and d)

            return area(tmp, indx); // pass this new information to the accessor
            //  function to calculate the path points.
            //  make sure sure you return this.

            // n.b. we need to manually pass along the
            //  index to drawArc so since the calculation of
            //  the radii depend on knowing the index. if your
            //  accessor function does not require knowing the
            //  index, you can omit this argument
        }
    }

    function Zooming(scale, type) {
        // xCoordinate.domain(GetBoardRange());
        // var msx = d3.mouse(this)[0];
        xCoordinate.domain(GetBoardRange());
        if (scale >= 1) {
            this.Animate = false;
            var _interval;
            for (let i = 0; i < self.BoardProperty.TickProperties.length; i++) {
                var _item = self.BoardProperty.TickProperties[i];
                if (_item.active) {
                    self.BoardProperty.TickProperties[i].active = false;
                    var _index = type == "in" ? i != 0 ? i - 1 : 0 : i < self.BoardProperty.TickProperties.length - 1 ? i + 1 : self.BoardProperty.TickProperties.length - 1;
                    var _active = self.BoardProperty.TickProperties[_index];
                    _active.active = true;
                    self.BoardProperty.ActiveLevel = _active;


                    GetBoardScope(self.BoardProperty.ActiveLevel, width, TickpointLocation);
                    RefreshChartZoomLevel();
                    this.Animate = true;
                    break;
                }
            }
        }
    }

    function RefreshChartZoomLevel() {
        duration = 1;
        var _active = self.BoardProperty.ActiveLevel;
        xCoordinate.axis.ticks(d3.time[_active.format], _active.interval).tickFormat(function (d, e) {
            var formatter = d3.time.format("%H:%M:%S");
            var dayFormatter = d3.time.format('%d');
            var _f = formatter(d);
            if (_f == "00:00:00" && _active.format != "day" && _active.format != "month" && _active.format != "year") formatter = d3.time.format("%b-%d");
            else if (_active.format == "day" && _f == "00:00:00" && dayFormatter(d) == "01") formatter = d3.time.format("%b");
            else if (_active.format == "month" && d3.time.format('%B')(d) == "January") formatter = d3.time.format("%Y");
            else formatter = _active.tickformat;
            _f = formatter(d);
            return _f;
        });
        Settings.OnChangeTimeFrame(_active);
        self.BoardProperty.Min = new Date(Settings.TimeNow.getTime() - _active.lscope);
        self.BoardProperty.Max = new Date(Settings.TimeNow.getTime() + _active.rscope);
        xCoordinate.domain(GetBoardRange());
        ForceChartAnimate();
    }

    function zoomed(d, e, a) {
        duration = 1;
        if (d3.event.sourceEvent.type == "mousemove") return;
        var _scale = zoom.scale();
        var _translate = zoom.translate();
        if (d3.event.sourceEvent.wheelDelta / 120 > 0) {
            Zooming(_scale, "in");
        } else {
            Zooming(_scale, "out");
        }
        axis.ReDraw(duration);
        ForceChartAnimate();
        ExpirationLine.Update();
        duration = 1000;
    }


    function draggstart(d, e, a) {
        // debugger;
        ChartDrag = true;
        lastdragposition = d3.mouse(this)[0];
        d3.event.sourceEvent.stopPropagation();
    }

    function dragging(d, e, a) {
        // debugger;
        if (ChartDrag) {
            var x = d3.event.x;
            var active = self.BoardProperty.ActiveLevel;
            xCoordinate.domain(GetBoardRange());
            var vectorTicks = xCoordinate.invert(x).getTime() - xCoordinate.invert(lastdragposition).getTime();
            var vectorX = x - lastdragposition;
            lastdragposition = x;
            self.BoardProperty.CurrentLocation += vectorX;
            active.lscope += vectorTicks;
            active.rscope -= vectorTicks;
            self.BoardProperty.Min = new Date(Settings.TimeNow.getTime() - active.lscope);
            self.BoardProperty.Max = new Date(Settings.TimeNow.getTime() + active.rscope);
            TickpointLocation = (active.lscope / active.ticklvl) * 100;
        }

    }

    function draggend(d, e, a) {
        // debugger;
        ChartDrag = false;
        // self.AnimateChart();
        lastdragposition = 0;
    }

    function OnMouseMove(d, e) {
        // debugger;
        var mouse = d3.mouse(this);
        mouselocation = mouse;
        CursorPointer.Position(mouse);
        if (Settings.IsInitDataReady) CursorPointer.Visibility(true);
        if (mouse[1] >= height - (height * .20) && mouse[1] <= height) Settings.ShowChartNavigator = true;
        else Settings.ShowChartNavigator = false;

    }

    function OnMouseUp(d, e) {
        // debugger;
        duration = 1000;
    }
    function OnMouseDown(d, e) {
        // debugger;       
        duration = 0;
        ForceChartAnimate();
    }

    function ForceChartAnimate() {
        //axis.ReDraw(duration);
        //yAx.ReDraw(duration);
        var linegraphanimationX = xCoordinate(min + duration);
        if (self.IsAnimationStarted) {

            paths.attr('transform', 'translate(' + (xCoordinate(Settings.TimeNow) - xCoordinate(Settings.TimeNow - duration)) + ',0)')
                .transition()
                .duration(duration)
                .ease('linear')
                .attr('transform', 'translate(' + (isNaN(linegraphanimationX) ? 0 : linegraphanimationX) + ')')
                .each('end', function (d, i) {
                    self.AnimateChart();
                });
        } else {
            chartTimeout();
        }
        ExpirationLine.Update();
        TickPointer.TickTransition();
    }

    function OnMouseOut(d, e) {
        CursorPointer.Visibility(false);
    }

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

    function CheckCurrentIsVisible() {
        var xCoor = xCoordinate(Settings.ChartData[0].stamp);
        if (!Settings.ChartData.length || isNaN(xCoor) || (xCoordinate(Settings.ChartData[0].stamp) > 0 && xCoordinate(Settings.ChartData[0].stamp) < width - ylabelallowance)) self.CurrentVisible = true;
        else self.CurrentVisible = false;
    }

    function GetDataVisibleRange() {
        var _first;
        var _last;
        CheckCurrentIsVisible();
        if (!self.CurrentVisible) {
            var _fTemp = xCoordinate.invert(width);
            var first_index = Settings.ChartData.findIndex(x => x.stamp <= _fTemp);
            if (first_index < 0) _first = 0;
            else _first = first_index;
        } else _first = 0;
        var _temp = xCoordinate.invert(0);
        var _index = Settings.ChartData.findIndex(x => x.stamp <= _temp);
        if (_index < 0) _last = Settings.ChartData.length;
        else _last = _index;

        return [_first, _last];
    }

    function GetDataToDraw(_dataallowance) {
        _dataallowance = _dataallowance == undefined ? 0 : _dataallowance;
        var _range = GetDataVisibleRange();
        var _r1 = _range[0] - _dataallowance;
        var _r2 = _range[1] + _dataallowance;
        _r1 = _r1 < 0 ? 0 : _r1;
        _r2 = _r2 > Settings.ChartData.length - 1 ? Settings.ChartData.length - 1 : _r2;
        if (_r1 == _r2) _r2++;
        _data = Settings.ChartData.slice(_r1, _r2);
        return _data;
    }

    function GetBoardRange() {
        return [self.BoardProperty.Min, self.BoardProperty.Max];
    }

    function GetZoomProperties(zoomlevel) {
        var retval;
        if (zoomlevel % 1 === 0) {
            retval = self.BoardProperty.TickProperties[zoomlevel];
        } else {
            if (zoomlevel < Settings.MinLevel) {
                retval = self.BoardProperty.TickProperties[0];
                retval.lscope -= 500;
                retval.rscope -= 500;
            } else {
                retval = self.BoardProperty.TickProperties[self.BoardProperty.TickProperties.length - 1];
                retval.lscope += 500;
                retval.rscope += 500;
            }
        }
        return retval;
    }

    function UpdateBoardRange() {
        xCoordinate.axis.ticks(d3.time[self.BoardProperty.ActiveLevel.format], self.BoardProperty.ActiveLevel.interval);
        self.BoardProperty.Min = new Date(Settings.TimeNow.getTime() - self.BoardProperty.ActiveLevel.lscope);
        self.BoardProperty.Max = new Date(Settings.TimeNow.getTime() + self.BoardProperty.ActiveLevel.rscope);
    }

    // Draw transact Label balloon
    function DrawTransactLabel() {
        var x = 0;
        var y = 0;
        var radius = 60;
        var padding = 30;

        var svg = d3.select("body").append("svg:svg")
            .attr("width", 1000)
            .attr("height", 1000);

        var layer1 = svg.append('g')
        var layer2 = svg.append('g')
        var layer3 = svg.append('g')

        var text = layer3.append("svg:text")
            .attr("x", x + padding)
            .attr("y", y)
            .attr("dy", "1em")
            .attr("text-anchor", "start")
            .style("font", "100px sans-serif")
            .style("fill", "white")
            .text("$1x5");

        var bbox = text.node().getBBox();

        var rect = layer1.append("svg:rect")

            // top-left
            // .attr("x", bbox.x - padding)
            // .attr("y", bbox.y )

            // top-right
            // .attr("x", bbox.x * 3)
            // .attr("y", bbox.y )

            // bottom-left
            .attr("x", bbox.x - padding)
            .attr("y", bbox.y + padding * 2)

            // bottom-right
            // .attr("x", bbox.x * 3)
            // .attr("y", bbox.y + padding * 2)


            .attr("width", bbox.width - padding)
            .attr("height", 52)
            .style("fill", "#ff0000")

        var rect = layer2.append("svg:rect")
            .attr("x", bbox.x - padding)
            .attr("y", bbox.y)
            .attr("rx", radius)
            .attr("ry", radius)
            .attr("width", bbox.width + padding * 2)
            .attr("height", bbox.height)
            .style("fill", "#ff0000")
    }



    var isInit = true;
    Settings.ChartData = [];
    self.OnLiveBars = function (data) {
        if (data.Stamp == undefined) return;
        if (self.LiveBarsStop) return;
        var Stamp = new Date(Number(data.Stamp));
        currentPrice = {
            price: data.Bid,
            stamp: Stamp
        };
        if (isInit) {
            Settings.ChartData.unshift(currentPrice);
            self.AnimateChart();
            isInit = false;
        }
        if (Settings.ChartData[0].stamp.getTime() == data.Stamp.getTime()) {
            Settings.ChartData[0] = currentPrice;
        } else {
            Settings.ChartData.unshift(currentPrice);
            //Settings.ChartData.push(currentPrice);
        }
        // self.AnimateChart();
        // svg.attr('opacity', xCoordinate.invert(Settings.ChartData[Settings.ChartData.length - 1].stamp) > 0 ? 0 : 1);
    }


    /// statistics
    self.OnStatistics = function (data) {
        // StatisticsView.UpdateChartStatistics(data);
        // StatisticsView = new DrawStatisticsView(svg);
        // StatisticsView.UpdateChartStatistics([100,0]);
        // StatisticsView.UpdateChartStatistics([100,0]);
        // self.AnimateChart();
        // svg.attr('opacity', xCoordinate.invert(Settings.ChartData[Settings.ChartData.length - 1].stamp) > 0 ? 0 : 1);
    }

    self.TimeUpdates = function (data, slctdIndex) {
        Settings.TimeNow = new Date(data.Tick);
        Settings.ZoomLevel = Settings.ZoomLevel < 1 ? Settings.MinLevel : Settings.ZoomLevel > 10 ? Settings.MaxLevel : Settings.ZoomLevel;
        UpdateBoardRange();
        ExpirationLine.Data = data.ExpirationTime[slctdIndex];
    }

    self.OnZoomChart = function (val) {
        var _active = self.BoardProperty.ActiveLevel;
        var _activeIndex = self.BoardProperty.TickProperties.findIndex(x => x.interval == _active.interval && x.format == _active.format);
        if (_activeIndex == undefined) return;
        if (val > 0) _activeIndex++;
        else _activeIndex--;
        if (_activeIndex < 0) self.BoardProperty.ActiveLevel = self.BoardProperty.TickProperties[0];
        else if (_activeIndex >= self.BoardProperty.TickProperties.length) self.BoardProperty.ActiveLevel = self.BoardProperty.TickProperties[self.BoardProperty.TickProperties.length - 1];
        else self.BoardProperty.ActiveLevel = self.BoardProperty.TickProperties[_activeIndex];
        RefreshChartZoomLevel();
    }

    self.LocateCurrentPrice = function () {
        var active = self.BoardProperty.ActiveLevel;
        GetBoardScope([active], width);
        self.BoardProperty.Min = new Date(Settings.TimeNow.getTime() - active.lscope);
        self.BoardProperty.Max = new Date(Settings.TimeNow.getTime() + active.rscope);
        xCoordinate.domain(GetBoardRange());
    }

    self.OnChangeTimeFrame = function (args) {
        var _currentIndex = self.BoardProperty.TickProperties.findIndex(x => x.active);
        self.BoardProperty.TickProperties[_currentIndex].active = false;
        var _activeIndex = self.BoardProperty.TickProperties.findIndex(x => x.timeframe == args);
        self.BoardProperty.TickProperties[_activeIndex].active = true;
        self.BoardProperty.ActiveLevel = self.BoardProperty.TickProperties[_activeIndex];

        RefreshChartZoomLevel();
        // self.AnimateChart();
    };

    self.OnResize = function () {
        width = Settings.cWidth;
        height = Settings.cHeight - 55;
        ResizeUpdateChart();
    }

    function ResizeUpdateChart() {


        svg
            .attr("width", width)
            .attr("height", height);

        clipBoard.width = width;
        clipBoard.height = height;



        image.attr("height", height);
        image.attr("width", width + 100);


        TickPointer.UpdateTick();

        ExpirationLine.UpdateLineLaber();

        NoDataView.UpdateLoadingView();

        xCoordinate.range([0, width - ylabelallowance]);
        axis.attr('transform', 'translate(0,' + height + ')');
        xCoordinate.axis.innerTickSize(-height);


        yAx.attr("transform", "translate(" + (width - ylabelallowance) + "," + (0) + ")");
        yCoordinate.axis.innerTickSize(-width, -width, -width);
        yCoordinate.range([height, 0]);

        ExpirationLine.Update();

    }

    self.OnNewOption = function (args) {
        // debugger;
        var isDrawn = false;
        if (Settings.OpenOptionsCollection.length) {
            for (var x = 0; x < Settings.OpenOptionsCollection.length; x++) {
                if (Settings.OpenOptionsCollection[x].Model.openTime == args.openTime &&
                    Settings.OpenOptionsCollection[x].Model.optionType == args.optionType && args.state == "11" &&
                    Settings.OpenOptionsCollection[x].Model.optionId != args.optionId) {
                    Settings.OpenOptionsCollection[x].Model.count++;
                    Settings.OpenOptionsCollection[x].Model.TotalAmount += parseFloat(Settings.OpenOptionsCollection[x].Model.price);
                    Settings.OpenOptionsCollection[x].View.Update(Settings.OpenOptionsCollection[x].Model);
                    isDrawn = true;
                    for (var y = 0; y < Settings.OpenOptionsCollection.length; y++) {
                        if (Settings.OpenOptionsCollection[y].Model.optionId == args.optionId && Settings.OpenOptionsCollection[y].Model.state == "Confirmed") {
                            Settings.OpenOptionsCollection[x].Model.TotalAmount -= parseFloat(Settings.OpenOptionsCollection[y].Model.TotalAmount)
                            Settings.OpenOptionsCollection[y].View.Remove();
                            isDrawn = true;
                            break;
                        }
                    }
                }

                if (Settings.OpenOptionsCollection[x].Model.optionId == args.optionId && Settings.OpenOptionsCollection[x].Model.state == "Confirmed") {
                    Settings.OpenOptionsCollection[x].Model.state = args.state;
                    Settings.OpenOptionsCollection[x].Model.openTime = args.openTime;
                    isDrawn = true;
                    break;
                }
            }
        }
        if (isDrawn) return;
        args.count = 1;
        // debugger;
        args.TotalAmount = parseFloat(args.price);
        var _newOption = new DrawNewOption(OptionsSVGGroup, OptionsPATHGroup, args);
        Settings.OpenOptionsCollection.push({
            View: _newOption,
            Model: args
        });
    };


    self.OnCloseOption = function (args) {
        // debugger;
        ExpirationLine.SetData(args.TotalProfitLossOnExpiration);
    };

    self.AnimateChart();

    return self;
}

function GetZoomLevelData(width) {
    var leveldata = [
        //2M
        {
            interval: 5,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '2M',
            ticklvl: (1000 * 60) + (1000 * (30 * 0)),
            active: true
        },
        {
            interval: 5,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '2M',
            ticklvl: (1000 * 60) + (1000 * (30 * 1)),
            active: false
        },
        {
            interval: 15,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '2M',
            ticklvl: (1000 * 60) + (1000 * (30 * 2)),
            active: false
        },
        {
            interval: 15,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '2M',
            ticklvl: (1000 * 60) + (1000 * (30 * 3)),
            active: false
        },
        {
            interval: 15,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '2M',
            ticklvl: (1000 * 60) + (1000 * (30 * 4)),
            active: false
        },
        {
            interval: 15,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '2M',
            ticklvl: (1000 * 60) + (1000 * (30 * 5)),
            active: false
        },
        {
            interval: 15,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '2M',
            ticklvl: (1000 * 60) + (1000 * (30 * 6)),
            active: false
        },
        {
            interval: 30,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '2M',
            ticklvl: (1000 * 60) + (1000 * (30 * 7)),
            active: false
        },
        {
            interval: 30,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '2M',
            ticklvl: (1000 * 60) + (1000 * (30 * 8)),
            active: false
        },
        //5m
        {
            interval: 30,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 9)),
            active: false
        },
        {
            interval: 30,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 10)),
            active: false
        },
        {
            interval: 30,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 11)),
            active: false
        },
        {
            interval: 30,
            format: "second",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 12)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 13)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 14)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 15)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 16)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 17)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 18)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 19)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 20)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 21)),
            active: false
        },
        {
            interval: 1,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 22)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 23)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 24)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 25)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 26)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 27)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '5M',
            ticklvl: (1000 * 60) + (1000 * (30 * 28)),
            active: false
        },
        //15m
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (30 * 29)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (30 * 30)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (30 * 31)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (30 * 32)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (30 * 33)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (30 * 34)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 18)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 19)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 20)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 21)),
            active: false
        },
        {
            interval: 2,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 23)),
            active: false
        },
        {
            interval: 5,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 24)),
            active: false
        },
        {
            interval: 5,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 25)),
            active: false
        },
        {
            interval: 5,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 26)),
            active: false
        },
        {
            interval: 5,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 27)),
            active: false
        },
        {
            interval: 5,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 28)),
            active: false
        },
        {
            interval: 5,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '15M',
            ticklvl: (1000 * 60) + (1000 * (60 * 29)),//30m
            active: false
        },

        //30m
        {
            interval: 5,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 7)),
            active: false
        },
        {
            interval: 5,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 8)),
            active: false
        },
        {
            interval: 10,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 9)),
            active: false
        },
        {
            interval: 10,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 10)),
            active: false
        },
        {
            interval: 10,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 11)),
            active: false
        },
        {
            interval: 10,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 12)),//1h
            active: false
        },
        {
            interval: 10,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 13)),
            active: false
        },
        {
            interval: 10,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 14)),//1h10m
            active: false
        },
        {
            interval: 10,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 15)),
            active: false
        },
        {
            interval: 10,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 16)),//1h20m
            active: false
        },
        {
            interval: 15,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 17)),
            active: false
        },
        {
            interval: 15,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 18)),//1h30m
            active: false
        },
        {
            interval: 15,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 19)),
            active: false
        },
        {
            interval: 15,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 20)),//1h40m
            active: false
        },
        {
            interval: 15,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 21)),
            active: false
        },
        {
            interval: 15,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 22)),//1h50m
            active: false
        },
        {
            interval: 15,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 23)),
            active: false
        },
        {
            interval: 15,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 5) * 24)),//2h
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 13)),//2h10m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 14)),//2h20m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 15)),//2h30m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 16)),//2h40m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 17)),//2h50m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 18)),//3h
            active: false
        },
        //3h
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 19)),//3h10m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 20)),//3h20m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 21)),//3h30m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 22)),//3h40m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 23)),//3h50m
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 24)),//4h
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 25)),
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 26)),
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 27)),
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 28)),
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 29)),
            active: false
        },
        {
            interval: 30,
            format: "minute",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '30M',
            ticklvl: (1000 * ((60 * 10) * 30)),//5h
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 11)),
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 12)),//6h
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 13)),
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 14)),//7h
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 15)),
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 16)),//8h
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 17)),
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 18)),//9h
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 19)),
            active: false
        },
        {
            interval: 1,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 30) * 20)),//10h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 11)),//11h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 12)),//12h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 13)),//13h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 14)),//14h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 15)),//15h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 16)),//16h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 17)),//17h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 18)),//18h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 19)),//19h
            active: false
        },
        {
            interval: 2,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 20)),//20h
            active: false
        },
        {
            interval: 4,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 21)),//21h
            active: false
        },
        {
            interval: 4,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 22)),//22h
            active: false
        },
        {
            interval: 4,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 23)),//23h
            active: false
        },
        {
            interval: 4,
            format: "hour",
            tickformat: d3.time.format('%H:%M:%S'),
            timeframe: '3H',
            ticklvl: (1000 * ((60 * 60) * 24)),//24h
            active: false
        },
        // //1d
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 25)),//1d1h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 26)),//1d2h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 27)),//1d3h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 28)),//1d4h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 29)),//1d5h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 30)),//1d6h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 31)),//1d7h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 32)),//1d8h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 33)),//1d9h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 34)),//1d10h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 35)),//1d11h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 36)),//1d12h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 37)),//1d13h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 38)),//1d14h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 39)),//1d15h
        //     active:false
        // },
        // {
        //     interval: 4,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * 60) * 40)),//1d16h
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 2) * 21))),//1d18h
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 2) * 22))),//1d20h
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 2) * 23))),//1d22h
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 2) * 24))),//2d 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 17))),//2d3h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 18))),//2d6h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 19))),//2d9h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 20))),//2d12h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 21))),//2d15h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 22))),//2d18h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 23))),//2d21h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 24))),//3d 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 25))),//3d3h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 26))),//3d6h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 27))),//3d9h 
        //     active:false
        // },
        // {
        //     interval: 8,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 3) * 28))),//3d12h 
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 15))),//3d18h 
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 16))),//4d 
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 17))),//
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 18))),//
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 19))),//
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 20))),//5d 
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 21))), 
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 22))), 
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 23))), 
        //     active:false
        // },
        // {
        //     interval: 12,
        //     format: "hour",
        //     tickformat: d3.time.format('%H:%M:%S'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 6) * 24))),//6d 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 13))),//6d12h 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 14))),//7d 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 15))), 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 16))),//8d 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 17))), 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 18))),//9d 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 19))), 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 20))),//10d 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 21))), 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 22))),//11d 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 23))), 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 24))),//12d 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 25))), 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 26))),//13d 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 27))), 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 28))),//14d 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 29))), 
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 12) * 30))),//15d 
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 16))),//16d
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 17))),//17
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 18))),//18
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 19))),//19
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 20))),//20
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 21))),//21
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 22))),//22
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 23))),//23
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 24))),//24
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 25))),//25
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 26))),//26
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 27))),//27
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 28))),//28
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 29))),//29
        //     active:false
        // },
        // {
        //     interval: 2,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '1D',
        //     ticklvl:(1000 * ((60 * (60 * 24) * 30))),//30d
        //     active:false
        // },
        // //30d
        // {
        //     interval: 5,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (60 * 48) * 16))),//1m2d
        //     active:false
        // },
        // {
        //     interval: 5,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (60 * 48) * 17))),
        //     active:false
        // },
        // {
        //     interval: 5,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (60 * 48) * 18))),
        //     active:false
        // },
        // {
        //     interval: 5,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (60 * 48) * 19))),
        //     active:false
        // },
        // {
        //     interval: 5,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (60 * 48) * 20))),
        //     active:false
        // },
        // {
        //     interval: 5,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (60 * 48) * 21))),
        //     active:false
        // },
        // {
        //     interval: 5,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (60 * 48) * 22))),//1m14d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 12))),//1m18d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 13))),//1m22d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 14))),//1m26d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 15))),//2m
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 16))),
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 17))),
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 18))),
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 19))),
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 20))),
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 21))),
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 4) * 22))),//2m28d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 8) * 11))),//3m2d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 8) * 12))),//3m10d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 8) * 13))),//3m18d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 8) * 14))),//3m26d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 8) * 15))),//4m4d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 8) * 16))),//4m12d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 16) * 8))),//4m28d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 16) * 9))),//5m14d
        //     active:false
        // },
        // {
        //     interval: 15,
        //     format: "day",
        //     tickformat: d3.time.format('%d'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 16) * 10))),//6m
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "month",
        //     tickformat: d3.time.format('%B'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 16) * 11))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "month",
        //     tickformat: d3.time.format('%B'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 16) * 12))),//7m2d
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "month",
        //     tickformat: d3.time.format('%B'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 16) * 13))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "month",
        //     tickformat: d3.time.format('%B'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 16) * 14))),//8m4d
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "month",
        //     tickformat: d3.time.format('%B'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 9))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "month",
        //     tickformat: d3.time.format('%B'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 10))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "month",
        //     tickformat: d3.time.format('%B'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 11))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "month",
        //     tickformat: d3.time.format('%B'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 12))),//1y
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 13))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 14))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 15))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 16))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 17))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * ((60 * 24) * 30) * 18))),//1y6m
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (((60 * 24) * 30) * 2) * 10))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (((60 * 24) * 30) * 2) * 11))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (((60 * 24) * 30) * 2) * 12))),//2y
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (((60 * 24) * 30) * 6) * 5))),//2y6m
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (((60 * 24) * 30) * 6) * 6))),//3y
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (((60 * 24) * 30) * 6) * 7))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (((60 * 24) * 30) * 6) * 8))),//4y
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (((60 * 24) * 30) * 6) * 9))),
        //     active:false
        // },
        // {
        //     interval: 1,
        //     format: "year",
        //     tickformat: d3.time.format('%Y'),
        //     timeframe: '30D',
        //     ticklvl:(1000 * ((60 * (((60 * 24) * 30) * 6) * 10))),//5y
        //     active:false
        // },
        // //year
    ];

    for (var x = 0; x < leveldata.length; x++) {
        GetBoardScope(leveldata[x], width, 70);
    }

    return leveldata;
}

function GetBoardScope(_iter, width, LeftPercentage) {
    var gridspace = 95;
    var _min = 60;
    var _hour = _min * 60;
    var _day = _hour * 24;
    var _mon = _day * 31;
    var _year = _mon * 12;
    var _interval = _iter.interval;
    if (_iter.format == "minute") _interval *= _min;
    else if (_iter.format == "hour") _interval *= _hour;
    else if (_iter.format == "day") _interval *= _day;
    else if (_iter.format == "month") _interval *= _mon;
    else if (_iter.format == "year") _interval *= _year;
    // var _temp = (width / gridspace) / 60;
    // _temp *= _interval;
    var _l = _iter.ticklvl * (LeftPercentage / 100);
    var _r = _iter.ticklvl - _l;
    _iter.lscope = _l;
    _iter.rscope = _r;
}
