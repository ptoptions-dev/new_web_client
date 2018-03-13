// mainApp.filter('groupBy', function () {
//     function generateSortFn(prop, reverse) {
//         return function (a, b) {
//             if (a[prop] < b[prop]) return reverse ? 1 : -1;
//             if (a[prop] > b[prop]) return reverse ? -1 : 1;
//             return 0;
//         };
//     }
//     return function (list, group_by) {

//         var filtered = [];
//         var prev_item = null;
//         var group_changed = false;
//         // this is a new field which is added to each item where we append "_CHANGED"
//         // to indicate a field change in the list
//         var new_field = group_by + '_CHANGED';

//         // loop through each item in the list
//         angular.forEach(list.sort(generateSortFn('PopularityRate', true)), function (item) {
//             group_changed = false;

//             // if not the first item
//             if (prev_item !== null) {

//                 // check if the group by field changed
//                 if (prev_item[group_by] !== item[group_by]) {
//                     group_changed = true;
//                 }

//                 // otherwise we have the first item in the list which is new
//             } else {
//                 group_changed = true;
//             }

//             // if the group changed, then add a new field to the item
//             // to indicate this
//             if (group_changed) {
//                 item[new_field] = true;
//             } else {
//                 item[new_field] = false;
//             }

//             filtered.push(item);
//             prev_item = item;

//         });

//         return filtered;
//     };
// });
var symlistDirective = function (common, ptodata) {

    var symlistController = function ($scope, $rootScope) {
        $scope.ListofSymbols = ptodata.Symbols; // ["EURUSD", "CADCHF", "USDJPY", "AUDJPY", "CHFJPY"]; //combobox   
        $scope.AddSymbol = function (SelectedSymbol) {
            if ($scope.ListofSymbols <= 1) return;
            if ($("#st-add-asset").data("Functionality")) {
                var activeSymbols = $scope.$parent.$$childHead.ActiveSymbols;
                for (let x = 0; x < activeSymbols.length; x++) {
                    if (activeSymbols[x].isActive) {
                        activeSymbols[x].Symbol = SelectedSymbol.SymbolName;
                        activeSymbols[x].Percentage = SelectedSymbol.FastPercentageValue;
                        $rootScope.$emit(common.msg.chgn_sym, { Index: x, Symbol: SelectedSymbol.SymbolName, ChartID: CreateChartID() });
                        break;
                    }
                }
            } else {

                $scope.$emit(common.msg.add_symbol, {
                    Symbol: SelectedSymbol.SymbolName,
                    Type: "Turbo",
                    Time: "20:20",
                    Amount: "99999",
                    Percentage: SelectedSymbol.FastPercentageValue,
                    Trade: "Call",
                    ChartID: CreateChartID(),
                    isActive: true
                });
            }
            $("#st-add-asset").data("Functionality", false);

        }

    }


    return {
        restrict: "E",
        templateUrl: 'view/symlist.html',
        replace: true,
        scope: true,
        link: function ($scope) { },
        controller: symlistController
    }
};
mainApp.directive('symList', ['common', 'ptodata', symlistDirective]);

var symbolNavDirective = function (ptodata, common, $rootScope) { /* optTrans = angular service */


    var symbolNavController = function ($scope, $rootScope) {
        $scope.ActiveSymbols = []; // Default Active Symbol        
        $scope.displayChart = function (sym, index) {
            $scope.$emit(common.msg.sel_symbol, { Index: index, Data: sym });
            setActiveSymbol(index);
        }

        function setActiveSymbol(index) {
            for (let x = 0; x < $scope.ActiveSymbols.length; x++) {
                $scope.ActiveSymbols[x].isActive = false;
            }
            $scope.ActiveSymbols[index].isActive = true;
        }

        $rootScope.$on(common.msg.add_symbol, function (event, args) {
            if ($scope.ActiveSymbols.length == 8) return;
            else {
                for (let x = 0; x < $scope.ActiveSymbols.length; x++) {
                    $scope.ActiveSymbols[x].isActive = false;
                }
                $scope.ActiveSymbols.push(args);
            }
        });

        $rootScope.$on(common.msg.chgn_sym, function (args, params) {
            setActiveSymbol(params.Index);
        });


        $scope.Remove = function (index) {
            if ($scope.ActiveSymbols.length <= 1) return;
            $scope.ActiveSymbols.splice(index, 1);
            // $scope.$emit(common.msg.del_symbol, {
            //     sym: $scope.ActiveSymbols[$scope.ActiveSymbols.length - 1]
            // });
            setActiveSymbol($scope.ActiveSymbols.length - 1);
            $scope.$emit(common.msg.del_symbol, index);
        }
        var symitem = {};

        if (!$.isEmptyObject(ptodata.SymbolDetails)) {
            for (var sym in ptodata.SymbolDetails) {
                symitem = {
                    SymbolName: sym,
                    FastPercentageValue: 87
                }
            }
        } else {
            symitem = ptodata.SymbolDetails["EURUSD"];
        }

    };

    return {
        restrict: "E",
        templateUrl: 'view/symbolNav.html',
        replace: true,
        scope: true,
        link: function ($scope) { },
        controller: symbolNavController
    }
};
mainApp.directive('symbolNav', ['ptodata', 'common', symbolNavDirective]); //symbolNav '$rootScope', remove for while cause of 3 instance of default active symbol


function CreateChartID() {
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4();
    }

    return "Chart-" + guid();
}

function dirCtrlLayout($rootScope) {
    function lnkCtrlLayout(params) {

    }

    function cntCtrlLayout($scope, $element) {
        $scope.clickbutton = function ($event) {
            $scope.$emit("ShowControlLayout", "1");
        }
    }
    return {
        restrict: "E",
        replace: true,
        templateUrl: 'view/gridlayout.html',
        link: lnkCtrlLayout,
        controller: cntCtrlLayout
    }
}
mainApp.directive("dirGridlayout", ['$rootScope', dirCtrlLayout])


function dirCntrlLayoutPopup($rootScope) {
    var elem = "";

    function lnk($scope, $element) {
        elem = $element;
    };

    function ctrllr($scope) {
        $scope.click = function ($event, $element) {
            $scope.$emit("ChangeGridLayout", $event.target.innerHTML);
        }
    }
    $rootScope.$on('ShowControlLayout', function ($element) {
        var test = elem;
    })
    return {
        restrict: "E",
        replace: true,
        template: '<div class="popuplayoutoption">\
        <span class="optionslayout uk-dropdown-close" ng-click="click($event)" >1</span>\
        <span class="optionslayout uk-dropdown-close" ng-click="click($event)" >2</span>\
        </div>',
        link: lnk,
        controller: ctrllr
    }
};

mainApp.directive("dirGridoptions", ['$rootScope', dirCntrlLayoutPopup]);

//DateTime
function dirServertime(ptodata, common, $rootScope) {
    function cntrl($scope) {
        $scope.Time = {};

        function Timer(args) {
            $scope.Time.HMS = FormatTime(args, "hh-mm-ss");
            $scope.Time.MYD = FormatTime(args, "M-D-Y") + " (UTC)";
        }
        // ptodata.SubscribeToTime(Timer);
    }
    return {
        restrict: 'E',
        // template: //'<div class="st-footer-timedate"><span class="st-servertime-hms">{{Time.MYD}}{{Time.HMS}}</span><span class="st-servertime-hms " style="right: 300px;">Market: Sydney, Tokyo</span></div>',
        template: '<div class="st-footer-timedate"><span class="st-servertime-hms">{{Time.MYD}} {{Time.HMS}}</span><span class="st-servertime-mdy"></span></div>',
        replace: true,
        controller: cntrl,
    }
}
mainApp.directive('dirServertime', ['ptodata', 'common', '$rootScope', dirServertime]);