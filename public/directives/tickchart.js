var dirTickchart = function (ptodata) {
    var cntrllr = function ($scope) {
    }
    var lnk = function ($scope, $element) {

        var ChartInstance = new TickChart({
            ChartElement: $element.find("#chart_trans_history")
        });
        var PlotTransHistory = function (data) {
        }

        $scope.TransChart.PlotTransHistory = PlotTransHistory;
    }


    //Tick Chart Class
    var TickChart = function (data) {
        var self = this;
        //Initialize Chart
        var InitializeChart = function () {

            var mainGraphics = new PIXI.Graphics();
            var ygrid = GetGridY();


        }
        //Change Symbol
        var ChangeSymbol = function (symbol) {

        }

        var GetGridY = function () {
            var yDrawing = new PIXI.Graphics();
            yDrawing.lineStyle(1, 0xffffff, 0.09);
            var gridYCount = 4;

            var gapY = self.Height / gridYCount;
            var i = 0;

            while (i < self.Height) {
                i += gapY;
                yDrawing.moveTo(0, i);
                yDrawing.lineTo(self.Width, i);
            }

            return yDrawing;
        }

        // chart properties
        self.ChartElement = data.ChartElement;
        self.Width = data.ChartElement.width();
        self.Height = data.ChartElement.height();

        var mainCanvas = new PIXI.Container();
        
        var renderer = new PIXI.autoDetectRenderer(self.Width, self.Height, {
            view: self.ChartElement[0],
            antialias: true
        });

        var gridY = GetGridY();
        

        mainCanvas.addChild(gridY);

        self.Render = function () {
            renderer.render(mainCanvas);
        };       

        self.ChangeSymbol = ChangeSymbol;
        
        self.Render();
        InitializeChart();
    }




    return {
        restrict: 'EA'
        , replace: true
        , template: "<div class='st-history-chart'><canvas id='chart_trans_history'/></div>"
        , controller: cntrllr
        , link: lnk
    }
}
mainApp.directive('dirTickchart', ['ptodata', dirTickchart])