var d = function (common) {

    var ctrl = function ($scope) {
        $scope.Data = [];
        $scope.$on(common.msg.r_quotes, function (event, args) {
            $scope.Data = args;
            $scope.$digest();
        });
    };

    return {
        restrict: "E",
        template: '<ul ng-model="dmy" ng-repeat="obj in Data "><li>Symbol: {{obj.Symbol}}, Bid: {{obj.Bid}}, Ask: {{obj.Ask}}, Time : {{obj.Stamp}}</li> </ul',
        controller: ctrl,
        controllerAs: "dmy"
    };
};
mainApp.directive("dummyView", ["common", d]);


