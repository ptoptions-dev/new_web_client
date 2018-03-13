//Chart
// template:
// '<div class="uk-active chart-panel" ng-click="Click($event)">\
// <h1 aria-hidden="true" class="uk-active" style="animation-duration: 200ms;" ng-bind="ChartSetting.Symbol"></h1>\
// <h2 aria-hidden="true" class="uk-active" style="animation-duration: 200ms;" ng-bind="ChartSetting.TimeFrame"></h2>\
// </div>',
mainApp.directive("dirChart", ["ptodata", "common", "$rootScope", "dummy", function (ptodata, common, $rootScope, dummy) {
    return {
        restrict: "EA",
        // template: '<div class="uk-active chart-panel" ng-click="Click($event)"></div>',
        scope: { settings: '=' },
        require: '^dirChartdisplay',
        link: function ($scope, $element, $attrs) {
            $element.attr('id', $scope.ChartSetting.ChartID);
            $element.css({ "width": "100%", "height": "calc(100% - 40px)" });

            // $rootScope.$on(common.msg.act_expTime, getExpirationTime);
            $rootScope.$on(common.msg.rqts_bars_result, SetBars)
            // $rootScope.$on(common.msg.r_quotes, SetQuotes);
            // debugger;
            function getExpirationTime(args, e) {
            }
            var options = {
                cWidth: $element.parent().width(),
                cHeight: $element.parent().height(),
                mainContainerColor: 0x000000,
                StartTime: ptodata.CurrentTime,//Math.max.apply(Math, dummy.BarsHolder.map(function (val) { return val.EndTime; })),//ptodata.ServerDateTime.Tick ? ptodata.ServerDateTime.Tick : new Date().getTime(),
                //dummyBars: dummy.BarsHolder,
                GraphType: $scope.$parent.ChartDisplaySettings.ActiveGraphType.name,
                Container: '#' + $scope.ChartSetting.ChartID
            };

            $scope.Settings = $.extend($scope.$parent.ChartDisplaySettings, options);
            
            $scope.ChartManager = new D3ChartManager($scope.Settings);
            
            // setInterval(function () {
            //     $.ajax({
            //         type: 'POST',
            //         data: JSON.stringify({ 'EURUSD': [5], 'USDJPY': [5] }),
            //         url: 'http://localhost:1234/LiveBars',
            //         success: function (data) {
            //             var newData = JSON.parse(data);
            //             for (let x = 0; x < collection.length; x++) {
            //                 for (let prop in newData) {
            //                     if (collection[x].Symbol != prop) continue
            //                     for (var interval in newData[prop]) {
            //                         collection[x].OnLiveBars(newData[prop][interval]);
            //                     }
            //                 }
            //             }
            //         }
            //     });
            // }, 1000);
            // $scope.ChartManager.startAnimation();

            $scope.SubscribeToExp = function (data) {
                if (!$scope.ChartManager) return;
                $scope.ChartManager.TimeUpdates(data, $scope.$parent.TradePanel.SlctdIndexTime);
                // $scope.ChartManager.Render();
            }
            //Remove this when executing on main
            // setInterval(function () {
            //     var randomMax = RandomNum(3.10000, 2.79505);
            //     var randomMin = RandomNum(2.10000, 1.79505);
            //     var bar = RandomBar({ Stamp: ptodata.CurrentTime }, [randomMax, randomMin]);
            //     $scope.ChartManager.OnLiveBars(bar);
            // }, 500);

            // var _randomizer = setInterval(RandomBars, 500);

            function RandomBars() {
                if (!ptodata.IsDebug) {
                    clearInterval(_randomizer);
                    _randomizer = null;
                    return;
                }
                var randomMax = RandomNum(3.10000, 2.79505);
                var randomMin = RandomNum(2.10000, 1.79505);
                var bar = RandomBar({ Stamp: ptodata.CurrentTime }, [randomMax, randomMin]);
                $scope.ChartManager.OnLiveBars(bar);
            }

            // function SetQuotes(symbol) {
            //     var currentQuote = ptodata.QuotesD[$scope.$parent.Symbol];
            //     //$scope.ChartManager.UpdateQuoteData(currentQuote);
            //     // console.log(currentQuote.Bid + " " + currentQuote.Stamp);
            // }

            function SetBars(args, e) {
                if (e.length === 0) {
                    $scope.ChartManager.RequestData(ptodata.CurrentTime);
                    return;
                }
                // debugger;
                ptodata.BarsData = e;
                // $scope.ChartManager.SetBarsData();
                // $scope.ChartManager.Render();
            }

            $rootScope.$on(common.msg.chart_chngeStmp, function (args, params) {
                // $scope.ChartManager.RequestData(params);
                // $scope.ChartManager.ChangeChartStamp(params);
            });

            $scope.Dispose = function () {
                $scope.ChartManager.Dispose();
                $scope = null;
            }

            $scope.OnResize = function () {
                $scope.Settings.cWidth = $element.parent().width();
                $scope.Settings.cHeight = $element.parent().height();
                $scope.ChartManager.OnResize();
            }

            $scope.$parent.ChartPanel = $scope;
        },
        controller: function ($scope, $element, $attrs) {
            $scope.ChartSetting = $scope.settings;
        }
    }
}]);