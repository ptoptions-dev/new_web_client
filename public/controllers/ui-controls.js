
var notification = function (option) {
    var settings = $.extend({
        message: "Successful",
        timeout: 3000,
        status: "default",
        pos: "bottom-left"
    }, option);
    UIkit.notify(settings);
}