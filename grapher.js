var names = ['John', 'Tim', 'Sam', 'Greg', 'Charles'],
    hotdogs = [8, 4, 9, 12, 11],
    margins = {left:200, right:30, top:20, bottom:30},
    chart,
    width = 700;
    height = 500;


chart = d3.select("body")
        .append("svg")
        .attr('width', width)
        .attr('height', height)
        .attr('class', "chart");
var x, y;
x = d3.scale.linear()
    .domain([0, 15])
    .range([0, width - (margins.left + margins.right)]);

y = d3.scale.ordinal()
     .domain(hotdogs)
     .rangeBands([margins.top, height - (margins.bottom)], 0.2);

ylabel = d3.scale.ordinal()
     .domain(names)
     .rangeBands([margins.top, height - (margins.bottom)], 0.2);

var line = chart.selectAll("line")
    .data(x.ticks(15));

    line.enter().append("line")
        .attr("x1", function(d) { return x(d) + margins.left; })
        .attr("x2", function(d) { return x(d) + margins.left; })
        .attr("y1", margins.top)
        .attr("y2", height-margins.bottom);

    line
        .attr("x1", function(d) { return x(d) + margins.left; })
        .attr("x2", function(d) { return x(d) + margins.left; })
        .attr("y1", margins.top)
        .attr("y2", height-margins.bottom);

    line.exit().remove();



var rule = chart.selectAll(".rule")
    .data(x.ticks(d3.max(hotdogs)));
    rule
        .enter().append("text")
        .attr("class", "rule")
        .attr("x", function(d) { return x(d) + margins.left; })
        .attr("y", 20)
        .attr("dy", -6)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .text(String); 
    rule
        .attr("class", "rule")
        .attr("x", function(d) { return x(d) + margins.left; })
        .attr("y", 20)
        .attr("dy", -6)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .text(String); 

    rule
        .exit().remove();

var rect = chart.selectAll("rect")
    .data(hotdogs);
    
    rect.enter().append("rect")
    .attr("x", margins.left)
    .attr("y", y)
    .attr("width", x)
    .attr("height", y.rangeBand());

    rect
    .attr("x", margins.left)
    .attr("y", y)
    .attr("width", x)
    .attr("height", y.rangeBand());

    rect
    .exit().remove();

var score = chart.selectAll(".score")
      .data(hotdogs);

      score.enter().append("text")
      .attr("x", function(d){ return x(d) + margins.left})
      .attr("y", function(d){ return y(d)+ y.rangeBand()/2} )
      .attr("dx", -5)
      .attr("dy", ".36em")
      .attr("text-anchor", "end")
      .text(String);

      score
      .attr("x", function(d){ return x(d) + margins.left})
      .attr("y", function(d){ return y(d)+ y.rangeBand()/2} )
      .attr("dx", -5)
      .attr("dy", ".36em")
      .attr("text-anchor", "end")
      .text(String);

      score.exit().remove();


var label = chart.selectAll("text.label")
      .data(names);

      label
      .enter().append("text")
      .attr("x", 100)
      .attr("y", function(d){ return ylabel(d)+ ylabel.rangeBand()/2} )
      .attr("dx", -5)
      .attr("dy", ".36em")
      .attr("text-anchor", "end")
      .text(String);

      label
      .enter().append("text")
      .attr("x", 100)
      .attr("y", function(d){ return ylabel(d)+ ylabel.rangeBand()/2} )
      .attr("dx", -5)
      .attr("dy", ".36em")
      .attr("text-anchor", "end")
      .text(String);

      label.exit().remove();

