(function () {
    var svc = function ($rootScope, common, dummy, optionsocket) {
        var self = this;
        //declare pto properties
        self.init = function () {
            var _symbols = dummy.symbols;

            for (var i = 0; i < _symbols.length; i++) {
                var symName = common.GetSymbolName(_symbols[i]);
                self.SymbolDetails[symName] = {
                    SymbolName: symName
                };
            }
        };

        self.SymbolDetails = {};

        function onCurrentQuotes(data) {
            try {
                self.Quotes = data;
                for (var i = 0; i < data.length; i++)
                    self.QuotesD[data[i].symbol] = data[i];

                $rootScope.$emit(common.msg.r_quotes, self.Quotes);
            } catch (error) {
                console.log(error);
            }
        }
    };

    mainApp.service('ptodata', ["$rootScope", 'common', 'dummy', 'optionsocket', svc]);
})();