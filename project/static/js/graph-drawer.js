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
var bar_w = $("#class-bar-chart").width();
var bar_h = bar_w - 50;
var line_w = bar_w;
var line_h = bar_h; 
var pi_w = $("#speciality_piechart").width() - 80;
var pi_h= pi_w;
var radar_w = $("#class-bar-chart").width() - 70;
var radar_h = radar_w;
var bubble_w = $("#bubble_chart").width();
var bubble_h = bubble_w/2;
var color = d3.scale.category10();
var outerRadius = pi_w / 2;
var innerRadius = 0;
var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
//references to various charts. Can be used later for modification/resizing on update etc.
var radar_svg;
var bar_graph;
var recalls_chart;
var radar_chart;
var preview;
var circle_radius = bubble_h - 30;
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

//function to set slider ticks
function set_slider_ticks(){
    var $slider =  $('#timeline');
    var max =  $slider.slider("option", "max");    
    var spacing =  $slider.width() / (max);

    $slider.find('.ui-slider-tick-mark').remove();
        for (var i = 0; i <= max ; i++) {
            $('<span class="ui-slider-tick-mark"></span>')
                .text(pJson["StartYear"]+i)
                .css('left', ((spacing * i)-5) + 'px')
                .appendTo($slider);                    
        }
}

//function to calculate data for radar graph
function calculate_radar_data(begin_year_index, end_year_index){
    data = [];
    for (cls = 1; cls <= 3; ++cls){
        var data_obj = {
                    className: String(cls),
                    axes:[]
                  };
    
        for (year = (begin_year + begin_year_index); year <= (begin_year + end_year_index); ++year){
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
    console.log("here");
    //remove prevoius chart
    d3.select("#radar_chart svg").remove();
    //redraw the chart with new data. The Chart needs to be redrawn since the 
    // the layout of the chart changes completely
    var data = calculate_radar_data(begin_year_index, end_year_index);
    radar_chart = RadarChart.chart();
    radar_chart.config({w: radar_w, h:radar_h});
    radar_svg = d3.select("#radar_chart").append('svg')
                        .attr("viewBox", ("0 " + "0 " + String(radar_w) + " " + String(radar_h)))
                        .attr("preserveAspectRatio", "none");

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

function calculate_bubble_data(begin_year, end_year){
    var recalls_count = [0, 0, 0];
    console.log(begin_year);
    for (year = begin_year; year <= end_year; ++year){
        recalls_count[0] += pJson["Data"][year]["SubmissionType"]["510(k)"];
        recalls_count[1] += pJson["Data"][year]["SubmissionType"]["510(K) Exempt"];
        recalls_count[2] += pJson["Data"][year]["SubmissionType"]["PMA"];
    }
    console.log(recalls_count);
    var total = 0;
    for(var i = 0;i < recalls_count.length; ++i){
        total += recalls_count[i];
    }
    return recalls_count.map(function(count){
        return (count/total) * circle_radius;
    });

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

    var radiology_stack = [], cardiovascular_stack = [],
        orthopedic_stack = [], general_hospital_stack = [],
        clinical_chemistry_stack = [], plastic_surgery_stack = [];

    for(year = begin_year; year <= end_year; ++year){
        radiology_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["Radiology"].MergedCount});
        cardiovascular_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["Cardiovascular"].MergedCount});
        orthopedic_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["Orthopedic"].MergedCount});
        general_hospital_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["General Hospital"].MergedCount});
        clinical_chemistry_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["Clinical Chemistry"].MergedCount});
        plastic_surgery_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["General & Plastic Surgery"].MergedCount});
    }
    recalls_chart = new Rickshaw.Graph( {
        element: document.querySelector("#total-recalls-chart"),
        renderer: 'line',
        width: line_w,
        height: line_h,
        padding: {left: 0.15, right: 0.04, bottom:0.10},
        interpolation: 'linear',
        series: [{
                data: radiology_stack,
                color: color(0),
                name: "Radiology"
            },
            {
                data: cardiovascular_stack,
                color: color(1),
                name: "Cardiovascular",
            },
            {
                data: orthopedic_stack,
                color: color(2),
                name: "Orthopedic"
            },
            {
                data: general_hospital_stack,
                color: color(3),
                name: "Genral Hospital"
            },
            {
                data: clinical_chemistry_stack,
                color: color(4),
                name: "Clinical Chemistry"
            },
            {
                data: plastic_surgery_stack,
                color: color(5),
                name: "General & Plastic Surgery"
            }

        ],
        
    });

    var x_ticks = new Rickshaw.Graph.Axis.X( {
        graph: recalls_chart,
        orientation: 'top',
        tickFormat: format
    } );

    var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: recalls_chart,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticks: 12
    });
    yAxis.render();
    recalls_chart.render();
    
    var legend = new Rickshaw.Graph.Legend({
        graph: recalls_chart,
        element: document.querySelector('#piechart_legend')
    });

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: recalls_chart,
        legend: legend
    });

    var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
        graph: recalls_chart,
        legend: legend
    });
}
function redraw_piechart(dataset2){
    var paths = d3.selectAll(".arc path");
    paths.data(pie(dataset2))
         .attr("d", arc);
    var text = d3.selectAll(".arc text");
    text.data(pie(dataset2))
        .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";})
        .attr("text-anchor", "middle")
        .classed('pi_label', true)
        .html(function(d) {
            return d.value + " %";
    });
}
function draw_piechart(begin_year, end_year){
     var dataset = calculate_percentages(begin_year, end_year);
    //Create SVG element
    var svg = d3.select("#speciality_piechart")
            .append("svg")
            .attr("width", pi_w)
            .attr("height", pi_h);
            /*
            .attr("viewBox", ("0 " + "0 " + String(pi_w) + " " + String(pi_h)))
            .attr("preserveAspectRatio", "none");*/

    //Set up groups
    var arcs = svg.selectAll("g.arc")
              .data(pie(dataset))
              .enter()
              .append("g")
              .attr("class", "arc")
              .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    //Draw arc paths
    arcs.append("path")
    .attr("fill", function(d, i) {
        return color(i);
    })
    .attr("d", arc);

    //Labels
    arcs.append("text")
    .attr("transform", function(d) {
        return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .classed('pi_label', true)
    .text(function(d) {
        return d.value + " %";
    });
}

function draw_timeline(){
    preview = new Rickshaw.Graph.RangeSlider({
        //hack since d3 graphs controlled from rickshaw.js. Fix later.
        graph: [bar_graph, recalls_chart],
        element: document.querySelector('#timeline'),

    });
}
function init_radar_chart(begin_year, end_year){
    data = calculate_radar_data(0, end_year - begin_year);
    radar_chart = RadarChart.chart();
    radar_chart.config({w: radar_w, h:radar_h});
    var radar_svg = d3.select("#radar_chart").append('svg')
    /*
                        .attr("viewBox", ("0 " + "0 " + String(radar_w) + " " + String(radar_h)))
                        .attr("preserveAspectRatio", preserveAspectRatio="xMinYMin meet");*/
                    .attr("width", radar_w)
                    .attr("height", radar_h);
    radar_svg.append('g').classed('single', 1).datum(data).call(radar_chart);
}
function draw_bubble_chart(begin_year, end_year){
    var prev_boundary = 10;
    var radius_data = calculate_bubble_data(begin_year, end_year);
    var svg = d3.select("#bubble_chart")
                .append("svg")
                .attr("width", bubble_w)
                .attr("height", bubble_h);
    var circle = svg.selectAll("circle")
                    .data(radius_data)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d, i){
                        var x = prev_boundary + d/2;
                        prev_boundary += d + 10;
                        return x;
                    })
                    .attr("cy", (bubble_h/2))
                    .attr("r", function(d, i){
                        return d/2;
                    })
                    .attr("fill", function(d, i){
                        return color(i);
                    });
}

function draw_charts(begin_year, end_year){
    draw_class_bar_chart(begin_year, end_year);
    draw_recalls_line_chart(begin_year, end_year);
    draw_piechart(begin_year, end_year);
    init_radar_chart(begin_year, end_year);
    draw_timeline();
    set_slider_ticks();
    draw_bubble_chart(begin_year, end_year);

}
//make the main ajax call
ajax_caller();
//functions to resize the graph
function resize_controller(){
    bar_w = $('#class-bar-chart').width();
    bar_h = bar_w - 50;
    bar_graph.configure({
        width: (bar_w),
        height: (bar_h)
    })
    bar_graph.render();
    line_w = $("#total-recalls-chart").width();
    line_h = line_w - 50; 
    recalls_chart.configure({
        width: (line_w),
        height: (line_h)
    })
    recalls_chart.render();
    
}
window.addEventListener('resize', resize_controller); 
