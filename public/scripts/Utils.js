function FormatTime(time, format) {
    switch(typeof time){
        case "string":
            time = new Date(Number(time));
            break;
        case "number":
            time = new Date(time);
            break;
    }
    var h = time.getHours(),
        m = time.getMinutes(),
        s = time.getSeconds(),
        y = time.getFullYear(),
        mon = time.getMonth() + 1,
        d = time.getDate();
    var months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'July',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    var _hms = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    var _ymd = y + "." + (mon < 10 ? "0" + mon : mon) + "." + (d < 10 ? "0" + d : d);
    var _textTime;
    switch (format) {
        case "mm-ss":
            _textTime = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
            break;
        case "hh-mm":
            _textTime = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
            break;
        case "hh-mm-ss":
            _textTime = _hms;
            break;
        case "d-m":
            _textTime = d + " " + months[mon - 1];
            break;
        case "M-D-Y":
            _textTime = months[mon - 1] + ". " + d + " " + y;
            break;
        case "y-m-d-hh-mm-ss":
            _textTime = _ymd + " " + _hms;
            break;
        case "d-m-hh-mm-ss":
            _textTime = d + " " + months[mon-1] + " " + _hms
            break;
    }
    return _textTime;
}