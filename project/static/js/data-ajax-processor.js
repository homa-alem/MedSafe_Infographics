var pJson;
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
        console.log(json);
        /*labels = json.specialityArray.labels.slice(0, 12);
        values = json.specialityArray.values.slice(0, 12);
        values = values.map(function (element){return (element * 100).toFixed(2);})
        draw_chart();
        process_percent_chart(2007, 2011);
        $('#sideDiv').fadeIn(1000);
        $('#headingDiv').fadeIn(1000);
        $('#timeLineSlider').fadeIn(1000);
        $('#specDiv').fadeIn(1000);
        $('#slider').fadeIn(1000);
        $('#timeLineSlider').fadeIn(1000);
        $('#waitDiv').hide();*/
    },

    });
}
function draw_spec_chart(begin_year, end_year){
    var stack_1 = [];
    var stack_2 = [];
    for(year = begin_year; year <= end_year; ++year){
        stack_1.push({x : new Date(String(year)).getTime(), y : pJson.TypeArray[year].Computer});
        stack_2.push({x : new Date(String(year)).getTime(), y : pJson.TypeArray[year].Not_Computer});
    }
    var graph = new Rickshaw.Graph( {
        element: document.querySelector("#chart"),
        renderer: 'bar',
        series: [{
                data: stack_1
                color: 'steelblue'
        }, {
                data: stack_2
                color: 'lightblue'
        }]
    });
 
graph.render();
}