// Using the core $.ajax() method
var pJson;
function ajax_caller(){
    $.ajax({
    // the URL for the request
    url: "http://web.engr.illinois.edu/~msaxena2/visualization/backend/csv_processor.php",

    type: "GET",
    // the type of data we expect back
    dataType : "json",
    // code to run if the request succeeds;
    // the response is passed to the function
    success: function( json ) {
        pJson=json;
        labels = json.labels.slice(0, 12);
        values = json.values.slice(0, 12);
        values = values.map(function (element){return (element * 100).toFixed(2);})
        draw_chart();
        $('#sideDiv').fadeIn(1000);
        $('#headingDiv').fadeIn(1000);
        $('#waitDiv').hide();
    },

    });
}
$(function() {
    $('#sideDiv').hide();
    $('#headingDiv').hide();
    ajax_caller();
});
$("#kSelector").change(function(){
var selectedValue = $(this).find(":selected").val();
    labels = pJson.labels.slice(0, parseInt(selectedValue));
    values = pJson.values.slice(0, parseInt(selectedValue));
    values = values.map(function (element){return (element * 100).toFixed(2);})
    draw_chart();
});