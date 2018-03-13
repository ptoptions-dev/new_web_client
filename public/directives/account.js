var acct = function (quoteService, common) {
    var ctrl = function ($scope) {
        $scope["showLogin"] = function () {
            $scope.$emit(common.msg.s_auth);
        };
        $scope["logout"] = function () {
            $scope.$emit(common.msg.logout);
        };
    };
    return {
        restrict: "A",
        replace: true,
        template: '<div>\
                <div><a href="#login" ng-click="showLogin()">Login</a></div>\
                <div><a href="#logout" ng-click="logout()" >Logout</a></div>\
                </div>',
        controller: ctrl
    };
};
mainApp.directive('acctDir', ["quoteService", "common", acct]);