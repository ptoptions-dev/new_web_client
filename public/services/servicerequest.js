var cls_srvc_rqt = function ($http) {
    var self = this;
    var protocol = "http://localhost:1234";
    var method = "Authorize";

    var _getbars = function (data) {
        debugger;
    }

    var _authorize = function (data) {
        debugger;
        $http.post({
            method: "POST",
            url: protocol + method,
            data: {
                password: data.password,
                username: data.username
            }
        }).then(_authorizesuccess, _authorizeerror);
    }
    var _authorizesuccess = function (rspnc) {
        debugger;
    }
    var _authorizeerror = function (rspnc) {
        debugger;
    }
    self.GetBars = _getbars;
    self.Authorize = _authorize;
}
mainApp.service('srvc_rqt', ['$http', cls_srvc_rqt]);