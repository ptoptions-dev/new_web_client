var openPosDir = function (common, ptodata, $rootScope, dummy, $compile) {

    var openPosController = function ($scope) {
    };
    var lnk = function ($scope, elem) {
    };

    return {
        restrict: "E",
        templateUrl: 'view/openPos.html',
        scope: true,
        link: lnk,
        controller: openPosController
    };
};
mainApp.directive("openPosDir", ["common", 'ptodata', '$rootScope', 'dummy', '$compile', openPosDir]);
