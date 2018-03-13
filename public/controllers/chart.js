mainApp.service('optCharts', ChartSettings);
function ChartSettings() {
    this.Symbol = "Symbol";
    this.Timeframe = 15;
    this.Bars = [{}];
};