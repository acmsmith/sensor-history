var TempChart = null;
var HumChart = null;
var TempChartData = null;
var HumChartData = null;
var yAxisLabelTemp = "Temperature (°)";
var yAxisLabelHum = "Humidity (%)";
var selectedTimeRange = 24;
var SensorInfo = null;

function addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
}
function addHours(date, hours) {
    const copy = new Date(Number(date))
    copy.setTime(date.getTime() + hours * 60 * 60 * 1000);
    return copy
}

async function getSensorInfo(){
    const response = await fetch('/getallsensors');
    this.SensorInfo = await response.json();
    getSensorDataRaw('/gettemperaturelog','TempChart');
    getSensorDataRaw('/gethumiditylog','HumChart');
}

async function getSensorDataRaw(endpoint, chart)
{
    const response = await fetch(endpoint);
    const rawdata = await response.text();
    var trimmed = '[' + rawdata.slice(0,-2) + ']';
    getSensorDatasets(JSON.parse(trimmed), chart);     
}

function getSensorDatasets(data, chart){
    let result_map = new Map();
    
    for (var i = 0; i < data.length; i++) 
    {
        let item = data[i];
        //let id = SeriesMap.get(item.id);
        let sensor = SensorInfo[item.id];
        let id = sensor.name;
        if(!result_map.has(id)){
            let dataset = {
                label: id,
                data: [],
                pointHitRadius: 20,
            };
            result_map.set(id,dataset)
        }
        item.timestamp = item.timestamp+"Z";
        result_map.get(id).data.push(item);

    }
    let datasets = [];
    result_map.forEach (function(value, key) {
        value.data.sort((a,b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
        datasets.push(value);
    })

    setupChart(datasets, chart);

}

function getConfig(data, axisYLable, xAxisMinHours){
    let config = {
        type: 'line',
        data: data,
        maintainAspectRatio: false,
        responsive:true,
        options: {
            parsing: {
                xAxisKey: 'timestamp',
                yAxisKey: 'value'
            },
            scales: {
                x: {
                    type: 'time',
                    min: addHours(new Date, xAxisMinHours*-1),
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'dd-MMM ha'
                        },                       
                    },
                },
                y: {
                    display: true,
                    title: {
                      display: true,
                      text: axisYLable,
                    }
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        }
    };
    return config
}

function setupChart(chart_ds, chart){
    let data = {
        datasets: chart_ds
    };

    let axisYLable = "";
    if(chart=="HumChart"){
        axisYLable = yAxisLabelHum;
        HumChartData = data;
    }
    else{
        axisYLable = yAxisLabelTemp;
        TempChartData = data;
    }
   
    let config = getConfig(data, axisYLable, selectedTimeRange);
    
    let myChart = new Chart(
        document.getElementById(chart),
        config
    );
    
    if(chart=="HumChart"){
        HumChart = myChart;
    }
    else{
        TempChart = myChart;
    }
    
}

function updateXAxis(hours){
    document.getElementById(selectedTimeRange+"hDropDown").classList.toggle('active');
    document.getElementById(hours+"hDropDown").classList.toggle('active');
    selectedTimeRange = hours;
    TempChart.options.scales.x.min = addHours(new Date, hours*-1);
    TempChart.update();
    HumChart.options.scales.x.min = addHours(new Date, hours*-1);
    HumChart.update();
}

getSensorInfo();


