function dirChartDisplay(ptodata, common, controller) {
    function lnkChartDisplay($scope, $element, $attrs) { }

    function NewChartSettings(settings) {
        var self = this;
        for (let prop in settings) {
            self[prop] = settings[prop];
        }
        return self;
    }

    function cntrChartDisplay($scope, $rootScope, $attrs) {
        var self = this;
        $scope.ChartDisplaySettings = new NewChartSettings($scope.settings);
        $scope.ChartDisplaySettings.ChartData = [];
        $scope.ChartDisplaySettings.Ask = 0.0;
        $scope.ChartDisplaySettings.Bid = 0.0;
        $scope.ChartDisplaySettings.Stamp = "";
        $scope.ChartDisplaySettings.CloseQuote = NaN;
        $scope.ChartDisplaySettings.OpenOptionsCollection = [];
        $scope.ChartDisplaySettings.ProfitLoss = 1.0;
        // $scope.ChartDisplaySettings = {};
        $scope.ChartDisplaySettings.BarCollection = [];
        $scope.ChartDisplaySettings.GraphType = [{
            name: "Area Graph",
            class: "uk-icon-area-chart",
            isDisabled: false
        },
        {
            name: "Line Graph",
            class: "uk-icon-line-chart",
            isDisabled: true
        },
        {
            name: "CandleStick",
            class: "uk-icon-bar-chart",
            isDisabled: true
        }
        ];
        $scope.selectedIndexG = 1;
        $scope.isLine = $scope.selectedIndexG == 2 ? false : true;
        $scope.ChartDisplaySettings.ActiveGraphType = $scope.ChartDisplaySettings.GraphType[$scope.selectedIndexG];
        $scope.selectedIndex = $scope.ChartDisplaySettings.ActiveGraphType.name == "CandleStick" ? $scope.ChartDisplaySettings.intervalIndex : 0;
        $scope.ChartDisplaySettings.ActiveInterval = $scope.ChartDisplaySettings.TimeIntervals[$scope.selectedIndex];
        $scope.Formatter = FormatTime;
        $scope.ChartDisplaySettings.ShowChartNavigator = false;
        $scope.ChartDisplaySettings.OnExpirationStateChanged = OnExpirationStateReset;
        $scope.ChartDisplaySettings.PurchaseTime = "00:00";
        $scope.ChartDisplaySettings.TotalInvestment = 0;
        $scope.ChartDisplaySettings.ExpectedProfit = 0;
        $scope.ChartDisplaySettings.isWinning = true;
        $scope.ChartDisplaySettings.isPurchaseTimeExceed = false;
        $scope.ChartDisplaySettings.isExpiring = false;
        $scope.ChartDisplaySettings.ShowActiveLabels = false;
        $scope.ChartDisplaySettings.RequestBars = ptodata.BarService.RequestBars;
        $scope.ChartDisplaySettings.isCurrentVisible = false;
        $scope.ChartDisplaySettings.StatisticsData = [];
        $scope.ChartDisplaySettings.OnChangeTimeFrame = function (args) {
            var _index = $scope.ChartDisplaySettings.TimeFrames.findIndex(x => x.value == args.timeframe);
            $scope.ChartDisplaySettings.TimeFrame = $scope.ChartDisplaySettings.TimeFrames[_index];
        };
        $scope.ChangeTimeFrame = function (time) {
            $scope.ChartDisplaySettings.TimeFrame = time;
            var _index = $scope.ChartDisplaySettings.ActiveGraphType.name == "CandleStick" ? GetCandleStickInterval(time.value) : GetLineGraphInterval(time.value);
            $scope.selectedIndex = _index;
            $scope.ChartDisplaySettings.ActiveInterval = $scope.ChartDisplaySettings.TimeIntervals[$scope.selectedIndex];
            OnChangeTimeInterval();
            $scope.ChartPanel.ChartManager.OnChangeTimeFrame(time.value);
        }
        $scope.ChangeSymbol = function (params) {
            $scope.ChartDisplaySettings.Symbol = params;
            $scope.ChartPanel.ChartManager.ChangedSymbol(params);
            $scope.TradePanel.ChangeSymbol(params);
            $rootScope.$emit(common.msg.on_chnge_interval);
        }

        // for testing of notification
        $scope.OpenNotify = function() {
            $rootScope.$emit("opennotify");
        }


        $scope.ForChangeSymbol = function ($scope) {
            $("#st-add-asset").data("Functionality", true);
            $("#assetLabel").text("Change Asset");
            $('[class*="st-sidebar-nav-mcont"] > .uk-icon-close').click();
        }

        $scope.ChangeGraphType = function (index) {
            var active = $scope.ChartDisplaySettings.GraphType[index];
            $scope.ChartPanel.ChartManager.ChangedGraphType(active.name);
            $scope.ChartDisplaySettings.ActiveGraphType = active;
            $scope.selectedIndexG = index;
            if (index < 2) {
                $scope.ChartDisplaySettings.ActiveInterval = $scope.ChartDisplaySettings.TimeIntervals[0];
                $scope.ChartDisplaySettings.ActiveInterval.isDisabled = true;
                $scope.isLine = true;
            } else {
                $scope.ChartDisplaySettings.ActiveInterval.isDisabled = false;
                $scope.selectedIndex = $scope.selectedIndex == 0 ? 1 : $scope.selectedIndex;
                $scope.ChartDisplaySettings.ActiveInterval = $scope.ChartDisplaySettings.TimeIntervals[$scope.selectedIndex];
                $scope.isLine = false;
            }
            OnChangeTimeInterval();
        };

        $scope.ChangeInterval = function (index) {
            var active = $scope.ChartDisplaySettings.TimeIntervals[index];
            $scope.ChartDisplaySettings.ActiveInterval = active;
            $scope.selectedIndex = index;
            OnChangeTimeInterval();
        };

        $scope.QuoteFormat = function (quote) {
            var _int = quote.toString().indexOf(".");
            var _temp = 8 - _int;
            var _string = parseFloat(quote).toFixed(_temp);
            return _string;
        };

        var SubscribeToExp = function (args) {
            // debugger;
            if (!$scope) return;
            $scope.TradePanel.SubscribeToExp(args);
            if ($scope.ChartPanel) $scope.ChartPanel.SubscribeToExp(args);
        }
        // debugger;
        $scope.ChartDisplaySettings.ExpirationSettings = new ptodata.OptionExpirationModel(ptodata.CurrentTime, SubscribeToExp, 0);
        $scope.OpenOption = function (newOpen) {
            // $scope.ChartPanel.ChartManager.OnOpenOption(newOpen);                        
            // debugger;
            // $scope.ChartPanel.ChartManager.OnNewOption(newOpen);
            // $scope.ChartDisplaySettings.ExpirationSettings.hasOpenOptions = true;
            // debugger;
            $scope.ChartPanel.ChartManager.OnNewOption(newOpen);
            if (newOpen["state"] == "11" || newOpen["state"] == "Confirmed") {
                $scope.ChartDisplaySettings.ExpirationSettings.hasOpenOptions = true;
            }            
        };

        $scope.CloseOption = function (newClose) {
            debugger;
            $scope.ChartPanel.ChartManager.OnCloseOption(newClose);
            $scope.ChartDisplaySettings.TotalInvestment = 0;
            $scope.ChartDisplaySettings.ExpectedProfit = 0;
            $('#Symbol-' + $scope.ChartDisplaySettings.ChartID).removeClass('sym-chart-losing').removeClass('sym-chart-winning');
            $scope.ChartDisplaySettings.ProfitLoss = parseFloat(newClose.TotalProfitLoss);
            $scope.ChartDisplaySettings.CloseQuote = parseFloat(newClose.TransactionValues[0].EndQuote);
        };

        $scope.OnLiveBars = function (data) {

            $scope.ChartPanel.ChartManager.OnLiveBars(data);
            UpdateActiveLabel();
        };
        //this is for statistics
        $scope.OnStatistics = function (data) {
            if ($scope.ChartDisplaySettings.StatisticsData.length) {
                if ($scope.ChartDisplaySettings.StatisticsData[0] == data[0]) return;
            }
            $("#up-stats").css({
                top: data[1] + '%',
                height: data[0] + '%'
            });
            $("#up-label").text(data[0] + '%');
            $("#down-label").text(data[1] + '%');
            $("#down-stats").css({
                height: (data[1] + 0) + '%'
            });
            $scope.ChartDisplaySettings.StatisticsData = data;
            // $scope.ChartPanel.ChartManager.OnStatistics(data);

        };
        var retry = 5;
        function get_object_index(arr,value){
            retval = 0;
            for (var i=0, iLen=arr.length; i<iLen; i++) {
                    toSee = arr[i]['stamp'].getTime(); 
                    v = [];
                    if (toSee <= value) {
                        retval = i;
                        break;
                    }    
                }
            return retval;
        }
        $scope.ChartDisplaySettings.TickService.Callback = function (args) {
            args = TransformTickHistory(args[$scope.ChartDisplaySettings.Symbol]);
            $scope.ChartDisplaySettings.IsHistoryRequested = false;
            if (args == undefined) {
                if(retry != 0) retry--;
                else{
                retry = 5;
                $scope.ChartDisplaySettings.IsInitDataReady = true;
                }
                return;
            }
            var chartData = $scope.ChartDisplaySettings.ChartData;
            firststamp = args[0]['stamp'];
            spIndex = get_object_index(chartData,firststamp);
            if(spIndex > 0){
                chartData = chartData.slice(0,spIndex);
            }
            $scope.ChartDisplaySettings.ChartData = chartData.concat(args);
            if (!$scope.ChartDisplaySettings.IsInitDataReady) $scope.ChartDisplaySettings.IsInitDataReady = true;
        };
        $scope.ChartDisplaySettings.TickFuture.Callback = function (args) {
            args = TransformTickHistory(args[$scope.ChartDisplaySettings.Symbol]);
            $scope.ChartDisplaySettings.IsFutureRequested = false;
            if (args == undefined) {
                if(retry != 0) retry--;
                else{
                retry = 5;
                $scope.ChartDisplaySettings.IsInitDataReady = true;
                }
                return;
            }
            var chartData = $scope.ChartDisplaySettings.ChartData;
            $scope.ChartDisplaySettings.ChartData = args + chart;
            if (!$scope.ChartDisplaySettings.IsInitDataReady) $scope.ChartDisplaySettings.IsInitDataReady = true;
        };

        function TransformTickHistory(args) {
            for (let item in args) {

                args[item] = { price: args[item]['Close'], stamp: new Date(Number(args[item]['Stamp'])) };

            }
            return args;
        }

        $scope.LocateCurrentPrice = function () {
            $scope.ChartPanel.ChartManager.LocateCurrentPrice();
        };

        $scope.ZoomChart = function (val) {
            $scope.ChartPanel.ChartManager.OnZoomChart(val);
        }

        $scope.CloseResultTransaction = function () {
            $scope.ChartPanel.ChartManager.OnCloseResultTransaction();
        };

        $scope.Resize = function () {
            $scope.ChartPanel.OnResize();
        }

        function OnExpirationStateReset() {
            $scope.ChartDisplaySettings.ExpirationSettings.hasOpenOptions = false;
        }

        function GetCandleStickInterval(timeframe) {
            var _index;
            switch (timeframe) {
                case "2M":
                    _index = 1;
                    break;
                case "5M":
                    _index = 3;
                    break;
                case "15M":
                    _index = 5;
                    break;
                case "30M":
                    _index = 7;
                    break;
                case "3H":
                    _index = 11;
                    break;
                default:
                    break;
            }
            return _index;
        }

        function GetLineGraphInterval(timeframe) {
            var _index;
            switch (timeframe) {
                case "2M":
                case "5M":
                    _index = 0;
                    break;
                case "15M":
                case "30M":
                    _index = 1;
                    break;
                case "3H":
                    _index = 6;
                    break;
                case "1D":

                    break;
                default:
                    break;
            }
            return _index;
        }

        function OnChangeTimeInterval() {
            // $scope.ChartPanel.ChartManager.ChangedTimeInterval($scope.ChartDisplaySettings.ActiveInterval.value);
            $rootScope.$emit(common.msg.on_chnge_interval);;
        }

        function GetExpectedProfit(type, start, current, amount, pecentage) {
            let retVal = 0;
            if (type == "0") {
                retVal = start < current ? amount * (pecentage / 100) : -amount;
            } else {
                retVal = start > current ? amount * (pecentage / 100) : -amount;
            }
            return retVal;
        }

        function UpdateActiveLabel() {
            let _currentQuote = parseFloat($scope.ChartDisplaySettings.Bid);
            let _totalAmnt = 0;
            let _prcntge;
            let _expctdPrft = 0;
            for (let x = 0; x < $scope.ChartDisplaySettings.OpenOptionsCollection.length; x++) {                                                
                var _item = $scope.ChartDisplaySettings.OpenOptionsCollection[x];
                if (_item.Model.state == "11")
                {
                    // debugger;
                    _totalAmnt += _item.Model.TotalAmount;  
                    // _prcntge = Number(_item.Model.Percentage);
                    // _expctdPrft += GetExpectedProfit(_item.Model.TransactionType, parseFloat(_item.Model.StartQuote), _currentQuote, Number(_item.Model.TotalAmount), _prcntge);
                    _prcntge = ((Number(_item.Model.value) - Number(_item.Model.price)) / Number(_item.Model.price)) * 100;
                    _expctdPrft += GetExpectedProfit(_item.Model.optionType, parseFloat(_item.Model.openQuote), _currentQuote, Number(_item.Model.TotalAmount), _prcntge);
                }                
            }
            $scope.ChartDisplaySettings.TotalInvestment = _totalAmnt;
            $scope.ChartDisplaySettings.ExpectedProfit = _expctdPrft >= 0 ? "+$" + _expctdPrft.toFixed(2) : "-$" + Math.abs(_expctdPrft).toFixed(2);
            if (_expctdPrft > 0) $('#Symbol-' + $scope.ChartDisplaySettings.ChartID).removeClass('sym-chart-losing').addClass('sym-chart-winning');
            else if (_expctdPrft < 0) $('#Symbol-' + $scope.ChartDisplaySettings.ChartID).removeClass('sym-chart-winning').addClass('sym-chart-losing');
            else $('#Symbol-' + $scope.ChartDisplaySettings.ChartID).removeClass('sym-chart-losing').removeClass('sym-chart-winning');
            $scope.ChartDisplaySettings.isWinning = _expctdPrft >= 0 ? true : false;
        }

        function ShowChart() {
        }

        $scope.Dispose = function () {
            // $scope.ChartPanel.Dispose();            
            $scope = null;
        };

        $scope.$parent.NewChartAdded($scope);
    }
    return {
        restrict: "EA",
        templateUrl: 'view/chartdisplay.html', //'<div class="container"><chart/><dir-trade/></div>',
        scope: {
            settings: '='
        },
        replace: true,
        link: lnkChartDisplay,
        controller: cntrChartDisplay
    }
}
mainApp.directive("dirChartdisplay", ['ptodata', 'common', dirChartDisplay]);
