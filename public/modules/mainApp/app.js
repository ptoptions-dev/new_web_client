var mainApp = angular.module("ptoapp", []);
mainApp.run(["ptodata", function (ptodata) {
	setTimeout(function () { ptodata.init(); }, 1000);
}]);
$(function () {
	try {

		setTimeout(function () {
			$("#loading", parent.document.body).fadeOut(300, function () { $(this).hide(); });
		}, 1000);
		

	} catch (error) {

	}
});


