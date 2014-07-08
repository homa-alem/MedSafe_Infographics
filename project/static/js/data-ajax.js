// Using the core $.ajax() method
var pJson;
function ajax_caller(){
    $.ajax({
    // the URL for the request
    url: "http://web.engr.illinois.edu/~msaxena2/project/backend/csv_processor.php",

    type: "GET",
    // the type of data we expect back
    dataType : "json",
    // code to run if the request succeeds;
    // the response is passed to the function
    success: function( json ) {
        pJson=json;
        labels = json.specialityArray.labels.slice(0, 12);
        values = json.specialityArray.values.slice(0, 12);
        values = values.map(function (element){return (element * 100).toFixed(2);})
        draw_chart();
        draw_spec_chart(2007, 2011);
        $('#sideDiv').fadeIn(1000);
        $('#headingDiv').fadeIn(1000);
        $('#waitDiv').hide();
    },

    });
}
function draw_spec_chart(begin_year, end_year){
    var stack_1 = [];
    var stack_2 = [];
    var stack_3 = [];
    var computer_count, not_computer_count, total_device_count;
    var max_recall_type_count = 0, max_device_count = 0;
    for(year = begin_year; year <= end_year; ++year){
        computer_count = pJson.TypeArray[year].Computer;
        not_computer_count = pJson.TypeArray[year].Not_Computer;
        total_device_count = pJson.TypeArray[year].DeviceCount;
        console.log(total_device_count);
        var epoch_year = new Date(String(year)).getTime()/1000;
        stack_1.push({x : year - begin_year, y : computer_count});
        stack_2.push({x : year - begin_year, y : not_computer_count});
        stack_3.push({x : year - begin_year, y : total_device_count})
        if (computer_count + not_computer_count > max_recall_type_count){
            max_recall_type_count = computer_count + not_computer_count;
        }
        if (total_device_count > max_device_count){
            max_device_count = total_device_count;
        }

    }
    console.log(stack_1);
    console.log(stack_2);
    console.log(stack_3)
    var scale_1 = d3.scale.linear().domain([0, max_recall_type_count]).nice();
    var scale_2 = d3.scale.linear().domain([0, max_device_count]).nice();
    var graph = new Rickshaw.Graph( {
        element: document.querySelector("#chart"),
        renderer: 'multi',
        width: 450,
        height: 350,
        padding: {left: 0.15, right: 0.04, bottom:0.50},
        interpolation: 'linear',
        series: [{
                data: stack_1,
                color: 'steelblue',
                name: 'Computer Related Recalls',
                renderer: 'bar',
                scale: scale_1
        }, {
                data: stack_2,
                color: 'lightblue',
                name: 'Not Computer Related Recalls',
                renderer: 'bar',
                scale: scale_1
        },{
                data: stack_3,
                name: 'Total Devices Recalled',
                renderer: 'line',
                color: 'orange',
                scale: scale_2

        }],
        
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
    graph: graph,
    orientation: 'bottom',
    tickFormat: format
} );

new Rickshaw.Graph.Axis.Y.Scaled({
  graph: graph,
  orientation: 'right',
  scale: scale_1,
  tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
  ticks: 10
});

var preview = new Rickshaw.Graph.RangeSlider({
    graph: graph,
    element: document.querySelector('#timeline'),

});
var legend = new Rickshaw.Graph.Legend( {
    graph: graph,
    element: document.getElementById('legend')

} );

var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
    graph: graph,
    legend: legend
} );

var order = new Rickshaw.Graph.Behavior.Series.Order( {
    graph: graph,
    legend: legend
} );

var highlight = new Rickshaw.Graph.Behavior.Series.Highlight( {
    graph: graph,
    legend: legend
} );

var hoverDetail = new Rickshaw.Graph.HoverDetail( {
    graph: graph,
    yFormatter: function(y) { return parseInt(y);}
} );


graph.render();
}
$(function() {
    $('#sideDiv').hide();
    $('#headingDiv').hide();
    $('#specDiv').hide();
    
    ajax_caller();
});