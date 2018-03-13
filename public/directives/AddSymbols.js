var symbolNav = function () { /* optTrans = angular service */
    // debugger;
    return {        
        restrict: "AEC",
        template: SymbolTemplate,
        scope: true,
        link: function ($scope) {},
        controller: function ($scope) {
            // $scope.symbols = optTrans.Data;

            $scope.symbols = ["EURUSD", "CADCHF", "USDJPY", "AUDJPY"]; //combobox
            $scope.symbolist = [];
            // alert($scope.symbol);

            $scope.displayChart = function (obj) {

                $scope.$emit('addGraph', {
                    sym: obj
                });
                // alert(obj);
            }

            $scope.AddSymbols = function () {
                    $scope.$emit('addGraph', {
                        sym: $scope.symbol
                    });

                    $scope.symbolist.push({
                        symbolist: $scope.symbol
                    });
                },
                $scope.Remove = function (index) {
                    if($scope.symbolist.length <= 1) return;
                    $scope.symbolist.splice(index, 1);
                    $scope.$emit('addGraph', {
                        sym: $scope.symbolist[$scope.symbolist.length - 1].symbolist
                    });
                };

        },




    }
};
mainApp.directive('symbolNav', symbolNav); //symbolNav