var pJson;
var pie = d3.layout.pie();
//Width and height
var w = 300;
var h = 300;
var color = d3.scale.category10();
var outerRadius = w / 2;
var innerRadius = 0;
var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
function setSliderTicks(){
    var $slider =  $('#timeline');
    var max =  $slider.slider("option", "max");    
    var spacing =  $slider.width() / (max);

    $slider.find('.ui-slider-tick-mark').remove();
        for (var i = 0; i <= max ; i++) {
            $('<span class="ui-slider-tick-mark"></span>').text(pJson["StartYear"]+i).css('left', ((spacing * i)-5) + 'px').appendTo($slider);                    
        }
}
function ajax_caller(){
    $.ajax({
    // the URL for the request
    url: "http://localhost:8888/data-visualization/project/backend/csv_processor.php",

    type: "GET",
    // the type of data we expect back
    dataType : "json",
    // code to run if the request succeeds;
    // the response is passed to the function
    success: function( json ) {
        pJson=json;
        draw_charts(pJson["StartYear"], pJson["EndYear"]);
        
    },

    });
}
function calculate_percentages(begin_year, end_year){
    console.log("here");
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
function redraw_piechart(dataset2){
    var paths = d3.selectAll(".arc path");
    paths.data(pie(dataset2))
         .attr("d", arc);
    var text = d3.selectAll(".arc text");
    text.data(pie(dataset2))
        .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";})
        .attr("text-anchor", "middle")
        .html(function(d) {
            return d.value + " %";
    });
}
function process_piechart(begin_index, end_index){
    var start_year = parseInt(begin_index + pJson["StartYear"]);
    var end_year = parseInt(end_index + pJson["StartYear"]);
    var percentages = calculate_percentages(start_year, end_year);
    redraw_piechart(percentages);
}
function draw_charts(begin_year, end_year){
    //recall class chart using rickshaw
    var computer_related_recalls = 0;
    var non_computer_related_recalls = 0;
    var computer_related_recalls_stack = [];
    var max_recall_type_count = 0;
    var not_computer_related_recalls_stack = [];
    var radiology_stack = [], cardiovascular_stack = [],
        orthopedic_stack = [], general_hospital_stack = [],
        clinical_chemistry_stack = [], plastic_surgery_stack = [];
    var class1_stack = [], class2_stack = [], class3_stack = [];
    var class1_merged_stack = [], class2_merged_stack = [], class3_merged_stack = [];
    for(year = begin_year; year <= end_year; ++year){
        computer_related_recalls_stack.push({x: year - begin_year, y : pJson.Data[year].ComputerClassRecalls});
        not_computer_related_recalls_stack.push({x: year - begin_year, y : pJson.Data[year].NotComputerClassRecalls});
        //total_recalls_stack.push({x: year - begin_year, y : pJson.Data[year].TotalRecalls});
        radiology_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["Radiology"].MergedCount});
        cardiovascular_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["Cardiovascular"].MergedCount});
        orthopedic_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["Orthopedic"].MergedCount});
        general_hospital_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["General Hospital"].MergedCount});
        clinical_chemistry_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["Clinical Chemistry"].MergedCount});
        plastic_surgery_stack.push({x: year  - begin_year, y : pJson.Data[year].SpecialityCounts["General & Plastic Surgery"].MergedCount});
        class1_stack.push({x: year  - begin_year, y : pJson.Data[year].SeverityClassCounts["1"].RecallEvents});
        class2_stack.push({x: year  - begin_year, y : pJson.Data[year].SeverityClassCounts["2"].RecallEvents});
        class3_stack.push({x: year  - begin_year, y : pJson.Data[year].SeverityClassCounts["3"].RecallEvents});
        class1_merged_stack.push({x: year  - begin_year, y : pJson.Data[year].SeverityClassCounts["1"].MergedCount});
        class2_merged_stack.push({x: year  - begin_year, y : pJson.Data[year].SeverityClassCounts["2"].MergedCount});
        class3_merged_stack.push({x: year  - begin_year, y : pJson.Data[year].SeverityClassCounts["3"].MergedCount});
    }
    var bar_graph = new Rickshaw.Graph( {
        element: document.querySelector("#class-bar-chart"),
        renderer: 'bar',
        stack: false,
        width: 450,
        height: 350,
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

    //recalls chart

    



    var recalls_chart = new Rickshaw.Graph( {
        element: document.querySelector("#total-recalls-chart"),
        renderer: 'line',
        width: 450,
        height: 350,
        padding: {left: 0.15, right: 0.04, bottom:0.10},
        interpolation: 'linear',
        series: [{
                data: radiology_stack,
                color: "steelblue",
                name: "Radiology"
            },
            {
                data: cardiovascular_stack,
                color: "darkorange",
                name: "Cardiovascular",
            },
            {
                data: orthopedic_stack,
                color: "green",
                name: "Orthopedic"
            },
            {
                data: general_hospital_stack,
                color: "red",
                name: "Genral Hospital"
            },
            {
                data: clinical_chemistry_stack,
                color: "purple",
                name: "Clinical Chemistry"
            },
            {
                data: plastic_surgery_stack,
                color: "brown",
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

    // severity barchart
    var recall_max = 0;
    var merged_min = Number.MAX_VALUE;  
    
    var merged_max =0
    for(year = pJson["StartYear"]; year < end_year; ++year){
        var current_recall_max = pJson.Data[year].SeverityClassCounts["2"].RecallEvents;
        var current_min = pJson.Data[year].SeverityClassCounts["1"].MergedCount;
        if (current_recall_max > recall_max){
            recall_max = current_recall_max;
        }
        var current_merged_max = pJson.Data[year].SeverityClassCounts["2"].MergedCount;
        if (current_merged_max > merged_max){
            merged_max = current_merged_max;
        }
        if (merged_min > current_min){
            merged_min = current_min 
        }

    }
    console.log(recall_max);
    console.log(merged_max);
    console.log(merged_min);
    var scale_1 = d3.scale.linear().domain([0, recall_max]).nice();
    var scale_2 = d3.scale.linear().domain([merged_min, merged_max]).nice();

    var severity_graph = new Rickshaw.Graph( {
        element: document.querySelector("#severity_chart"),
        renderer: 'multi',
        stack: false,
        width: 450,
        height: 350,
        padding: {left: 0.15, right: 0.04, bottom: 0.10},
        series: [{
                data: class1_stack,
                color: 'green',
                name: 'Class 1 Recalls',
                renderer: 'bar',
                scale: scale_1
        }, {
                data: class2_stack,
                color: 'darkorange',
                name: 'Class 2 Recalls',
                renderer: 'bar',
                scale: scale_1
        }, {
                data: class3_stack,
                color: 'red',
                name: 'Class 3 Recalls',
                renderer: 'bar',
                scale: scale_1

        }, {
                data: class1_merged_stack,
                color: 'green',
                name: 'Class 1 Merged Count',
                renderer: 'line',
                scale: scale_2

        }, {
                data: class2_merged_stack,
                color: 'orange',
                name: 'Class 2 Merged Count',
                renderer: 'line',
                scale: scale_2

        }, {
                data: class1_merged_stack,
                color: 'red',
                name: 'Class 3 Merged Count',
                renderer: 'line',
                scale: scale_2

        },

        ],
        
    });
    var x_ticks = new Rickshaw.Graph.Axis.X( {
    graph: severity_graph,
    orientation: 'top',
    tickFormat: format
    } );

    
    var legend = new Rickshaw.Graph.Legend( {
    graph: severity_graph,
    element: document.getElementById('severity_chart_legend')

    } );

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
    graph: severity_graph,
    legend: legend
    } );

    var order = new Rickshaw.Graph.Behavior.Series.Order( {
    graph: severity_graph,
    legend: legend
    } );

    var highlight = new Rickshaw.Graph.Behavior.Series.Highlight( {
    graph: severity_graph,
    legend: legend
    } );
    new Rickshaw.Graph.Axis.Y.Scaled({
      element: document.getElementById('axis_0'),
      graph: severity_graph,
      orientation: 'left',
      scale: scale_1,
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT
    });

    new Rickshaw.Graph.Axis.Y.Scaled({
      element: document.getElementById('axis_1'),
      graph: severity_graph,
      grid: false,
      orientation: 'right',
      scale: scale_2,
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT
    });
    severity_graph.render();

    //pie chart using d3


    var dataset = calculate_percentages(begin_year, end_year);

    

    

    //Create SVG element
    var svg = d3.select("#speciality_piechart")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

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
    .text(function(d) {
        return d.value + " %";
    });

    var preview = new Rickshaw.Graph.RangeSlider({
        graph: [bar_graph, recalls_chart, severity_graph],
        element: document.querySelector('#timeline'),

    });
    setSliderTicks();


}
ajax_caller();


