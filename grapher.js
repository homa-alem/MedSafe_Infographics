
var chart = d3.select("body")
            .append("svg")
            .attr('width', 700)
            .attr('height', 500)
            .attr('class', "chart");
var width = 700, height = 500;
var margins = {left:200, right:30, top:20, bottom:30};
function draw_chart(labels, values){
    var x, y;
    x = d3.scale.linear()
        .domain([0, d3.max(values)])
        .range([0, width - (margins.left + margins.right)]);

    y = d3.scale.ordinal()
         .domain(values)
         .rangeBands([margins.top, height - (margins.bottom)], 0.2);

    ylabel = d3.scale.ordinal()
         .domain(labels)
         .rangeBands([margins.top, height - (margins.bottom)], 0.2);

    //svg lines drawn on graph for reference
    var line = chart.selectAll("line")
        .data(x.ticks(d3.max(values)));
        //enter
        line.enter().append("line")
            .attr("x1", function(d) { return x(d) + margins.left; })
            .attr("x2", function(d) { return x(d) + margins.left; })
            .attr("y1", margins.top)
            .attr("y2", height-margins.bottom);
        //update section
        line
            .attr("x1", function(d) { return x(d) + margins.left; })
            .attr("x2", function(d) { return x(d) + margins.left; })
            .attr("y1", margins.top)
            .attr("y2", height-margins.bottom);
        //enter section
        

        //exit section
        line.exit().remove();


    //svg rules above the lines
    var rule = chart.selectAll(".rule")
        .data(x.ticks(d3.max(values)));
        //update
        rule
            .attr("class", "rule")
            .attr("x", function(d) { return x(d) + margins.left; })
            .attr("y", 20)
            .attr("dy", -6)
            .attr("text-anchor", "middle")
            .attr("font-size", 10)
            .text(String); 

        //enter
        rule
            .enter().append("text")
            .attr("class", "rule")
            .attr("x", function(d) { return x(d) + margins.left; })
            .attr("y", 20)
            .attr("dy", -6)
            .attr("text-anchor", "middle")
            .attr("font-size", 10)
            .text(String); 
        //exit
        rule
            .exit().remove();

    var rect = chart.selectAll("rect")
        .data(values);
        //enter
    rect.enter().append("rect")
        .attr("x", margins.left)
        .attr("y", y)
        .attr("width", x)
        .attr("height", y.rangeBand());
        //update
    rect
        .attr("x", margins.left)
        .attr("y", y)
        .attr("width", x)
        .attr("height", y.rangeBand());
        //exit
    rect
        .exit().remove();


    var score = chart.selectAll(".score")
          .data(values);

    //enter selection
    score.enter().append("text")
        .attr('class', 'score')
        .attr("x", function(d){ return x(d) + margins.left})
        .attr("y", function(d){ return y(d)+ y.rangeBand()/2} )
        .attr("dx", -5)
        .attr("dy", ".36em")
        .attr("text-anchor", "end")
        .text(String);
    //update selection
    score
        .attr("x", function(d){ return x(d) + margins.left})
        .attr("y", function(d){ return y(d)+ y.rangeBand()/2} )
        .attr("dx", -5)
        .attr("dy", ".36em")
        .attr("text-anchor", "end")
        .text(String);
    //exit selection
    score.exit().remove();


    var label = chart.selectAll(".label")
          .data(labels);

    label.enter().append("text")
        .attr('class', 'label')
        .attr("x", 100)
        .attr("y", function(d){ return ylabel(d)+ ylabel.rangeBand()/2} )
        .attr("dx", -5)
        .attr("dy", ".36em")
        .attr("text-anchor", "end")
        .text(String);

    label
          .attr("x", 100)
          .attr("y", function(d){ return ylabel(d)+ ylabel.rangeBand()/2} )
          .attr("dx", -5)
          .attr("dy", ".36em")
          .attr("text-anchor", "end")
          .text(String);

          label.exit().remove();
}
draw_chart(['John', 'Tim', 'Sam', 'Greg', 'Charles', 'jit'], [8, 4, 9, 12, 13, 13]);
d3.select("#transition")
    .on("click", function() {
        draw_chart(['John', 'Tim', 'Sam'], [8, 4, 9]);
    });
