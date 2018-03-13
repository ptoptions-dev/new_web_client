var OptionsService = function (socket) {
    var self = this;
    self.Data = [];

    var OptionsAPI = new socket._socketobject({
        "servicemethod": "/BuyOption",
        "method": "POST",
        "data": self.Data,
        "SuccessCallBack": function (data) {
            if (self.Callback) {
                //debugger;
                self.Callback(data);
            }
        }        
    });

    self.Request = function (data) {
        OptionsAPI["SetData"]({
            "data": data
        });
        OptionsAPI["Request"]();
    }
    return self;
}

