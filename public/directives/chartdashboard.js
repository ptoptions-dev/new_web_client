var wdth;
var bgr;
function dirChartDashboard($rootScope, $compile, common, ptodata) {
  var self = this;

  return {
    restrict: "EA",
    template: '<div id="ChartDashboard" class="st-optionchart-mcont"></div>',
    replace: true,
    scope: true,
    link: function(){},
    controller: function(){}
  };
} 
mainApp.directive("chartDashboard", [
  "$rootScope",
  "$compile",
  "common",
  "ptodata",
  dirChartDashboard
]);

var dirsideBarNav = function ($rootScope, common, ptodata) {
  var cntrlSideBarNav = function ($scope, $rootScope, $element, $attrs) {
    $scope.tryy = function () {
      // alert('try');
      // $scope.settings.cwidth = $element.parent().width();
      // $rootScope.Settings.cWidth = 1416;
      // $('.st-optionchart').width();
      bgr();
      bgr();
    };
  };

  return {
    restrict: "EA",
    scope: false,
    link: function ($scope, $rootScope) { },
    controller: cntrlSideBarNav
  };
};

mainApp.directive("sideBarNav", [
  "$rootScope",
  "$compile",
  "common",
  "ptodata",
  dirsideBarNav
]);
