
(function () {
    var optionsocket = function ($rootScope, $http, dummy) {
        var self = this;
        //Connect to socket.io.server
        var socket = io.connect('http://localhost:7766');

        self.ServerTime = new _ServerTime();

        socket.on('connect', function (data) {
            console.log('Connected to Server!');
            socket.emit('join', { symbols: dummy.symbols });
        });

        socket.on('servertime', function (date) {
            self.ServerTime.SetTime(date);
            console.log(date);
        });

        socket.on('newquote', function(quotes){
            // console.log(quotes);
        });

    }
    mainApp.service('optionsocket', ['$rootScope', '$http', 'dummy', optionsocket]);


    function _ServerTime() {
        var _time;
        var _methodSubscriber = [];
        return {
            Now: _now,
            SetTime: _setTime,
            Subscribe: _subscribeToTime
        };

        function _now() {
            return _time;
        }

        function _setTime(date) {
            _time = new Date(date);
            for (var i = 0; i < _methodSubscriber.length; i++) {
                _methodSubscriber[i](_time);
            }
        }

        function _subscribeToTime(method) {
            _methodSubscriber.push(method);
        }
    }
})();