/** js file responsible for drawing all the d3 and rickshaw graphs
*   To add a graph, add the object to the global space, and then add the graph
*   drawing function.
**/

//globals
var pJson;
var pie = d3.layout.pie();
var begin_year;
var end_year;
//Width and height
var bar_w = 350;
var bar_h = 300;
var pi_w = 200;
var pi_h= 200;
var radar_w = 300;
var radar_h = 300;
var color = d3.scale.category10();
var outerRadius = pi_w / 2;
var innerRadius = 0;
var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
var radar_svg;
var bar_graph;
var format = function(n) {

    var map = {
    0: '2007',
    1: '2008',
    2: '2009',
    3: '2010',
    4: '2011',
    5: '2012'
    };

    return map[n];
}

function ajax_caller(){
    $.ajax({
    // the URL for the request
    url: "backend/csv_processor.php",

    type: "GET",
    // the type of data we expect back
    dataType : "json",
    // code to run if the request succeeds;
    // the response is passed to the function
    success: function( json ) {
        pJson=json;
        begin_year = pJson["StartYear"];
        end_year = pJson["EndYear"];
        draw_charts(begin_year, end_year);
        
    },

    });
}

//function to calculate data for radar graph
function calculate_radar_data(begin_year, end_year){
    console.log(begin_year);
    console.log(end_year);
    data = [];
    for (cls = 1; cls <= 3; ++cls){
        var data_obj = {
                    className: String(cls),
                    axes:[]
                  };
    
        for (year = begin_year; year <= end_year; ++year){
            //class 1
            var total_recall_time = pJson["Data"][year]["SeverityClassCounts"][cls]["TerminationTime"];
            var merged_count = pJson["Data"][year]["SeverityClassCounts"][cls]["RecallEvents"];
            var average = total_recall_time / merged_count;
            var axis_obj = {
                                axis: String(year),
                                value: average
                           };
            data_obj.axes.push(axis_obj);
        }
        data.push(data_obj);
    }
    return data;
}

//radar chart drawing fucntion
function draw_radar_chart(begin_year_index, end_year_index){
    //remove prevoius chart
    d3.select("#radar_chart").remove();
    //redraw the chart with new data. The Chart needs to be redrawn since the 
    // the layout of the chart changes completely
    var data = calculate_radar_data(begin_year+begin_year_index, begin_year+end_year_index);
    var radar_chart = RadarChart.chart();
    var cfg = radar_chart.config();
    radar_chart.config({
        radar_w: radar_w,
        radar_h: radar_h
    });
    radar_svg = d3.select("#radar_chart_div").append('svg')
                        .attr('id', 'radar_chart')
                        .attr('width', radar_w)
                        .attr('height', radar_h);
    radar_svg.append('g').classed('single', 1).datum(data).call(radar_chart);

}

//data processing function for the pi chart
function calculate_percentages(begin_year, end_year){
    var percentage_array = [0, 0, 0, 0, 0, 0];
    var total_recalls = 0;
    for(year = begin_year; year <= end_year; ++year){
        total_recalls += pJson.Data[year].ComputerClassRecalls + pJson.Data[year].NotComputerClassRecalls;
        for(i =0 ; i < pJson.SpecialityLabels.length; ++i){
            speciality_label = pJson.SpecialityLabels[i];
            percentage_array[i] += pJson.Data[year].SpecialityCounts[speciality_label].RecallEvents;
        }
    }
    return percentage_array.map(function(total){
        return Math.round((total/total_recalls) * 10000) / 100;
    })
}

function process_piechart(begin_index, end_index){
    var start_year = parseInt(begin_index + pJson["StartYear"]);
    var end_year = parseInt(end_index + pJson["StartYear"]);
    var percentages = calculate_percentages(start_year, end_year);
    redraw_piechart(percentages);
}

function draw_class_bar_chart(begin_year, end_year){
    var computer_related_recalls = 0;
    var non_computer_related_recalls = 0;
    var computer_related_recalls_stack = [];
    var not_computer_related_recalls_stack = [];
    for(year = begin_year; year <= end_year; ++year){
            computer_related_recalls_stack.push({x: year - begin_year, y : pJson.Data[year].ComputerClassRecalls});
            not_computer_related_recalls_stack.push({x: year - begin_year, y : pJson.Data[year].NotComputerClassRecalls});
    }
    bar_graph = new Rickshaw.Graph( {
        element: document.querySelector("#class-bar-chart"),
        renderer: 'bar',
        stack: false,
        width: bar_w,
        height: bar_h,
        veiwBox: '0 0 350 300',
        preserveAspectRatio: 'xMinYMin meet',
        padding: {left: 0.15, right: 0.04, bottom: 0.10},
        series: [{
                data: computer_related_recalls_stack,
                color: 'steelblue',
                name: 'Computer Related Recalls',
                renderer: 'bar',
        }, {
                data: not_computer_related_recalls_stack,
                color: 'darkorange',
                name: 'Not Computer Related Recalls',
                renderer: 'bar',
        }
        ],
        
    });
    var x_ticks = new Rickshaw.Graph.Axis.X( {
    graph: bar_graph,
    orientation: 'top',
    tickFormat: format
    } );

    var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: bar_graph,
        ticks: 12
    });

    yAxis.render();


    
    var legend = new Rickshaw.Graph.Legend( {
    graph: bar_graph,
    element: document.getElementById('legend')

    } );

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
    graph: bar_graph,
    legend: legend
    } );

    var order = new Rickshaw.Graph.Behavior.Series.Order( {
    graph: bar_graph,
    legend: legend
    } );

    var highlight = new Rickshaw.Graph.Behavior.Series.Highlight( {
    graph: bar_graph,
    legend: legend
    } );

    bar_graph.render();
}

function draw_recalls_line_chart(begin_year, end_year){
    
}

function draw_charts(begin_year, end_year){
    console.log("here");
    draw_class_bar_chart(begin_year, end_year);

}
ajax_caller();

