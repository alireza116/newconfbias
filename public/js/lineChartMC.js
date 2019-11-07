function LineChartMC(chartID,variables){
    var line;
    // var cwidth = document.querySelector("#"+chartID).clientWidth;
    // var cheight = document.querySelector("#"+chartID).clientHeight;
    var cwidth = $("#"+chartID).width() * 0.9;
    var cheight = $("#"+chartID).height() * 0.9;
    // cwidth = cheight;
    cheight = cwidth;
    console.log(cwidth);
    console.log(cheight);
    var margin = {top: 90, right: 90, bottom: 90, left: 90}
        , width = cwidth - margin.left - margin.right // Use the window's width
        , height = cheight - margin.top - margin.bottom; // Use the window's height
    var slopeScale = d3.scaleLinear().domain([1,-1]).range([45,-45]);

// 5. X scale will use the index of our data
    var xScale = d3.scaleLinear()
        .domain([0, 1]) // input
        .range([0, width]); // output

// 6. Y scale will use the randomly generate number
    var yScale = d3.scaleLinear()
        .domain([0, 1]) // input
        .range([height, 0]); // output

// 7. d3's line generator
    var valueLine = d3.line()
        .x(function(d, i) { return xScale(d.x); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.y); }) // set the y values for the line generator
        .curve(d3.curveLinear); // apply smoothing to the line

// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
//    var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } });
    var dataset = [];
//    console.log(dataset);
// 1. Add the SVG to the page and employ #2


    var svg = d3.select("#"+chartID).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        // .attr("clip-path", "url(#rect-clip)");

    var helperDataset =
        [
            {x:0,y:0},
            {x:1,y:1},
            {x:1,y:0},
            {x:0,y:1}
        ];

    svg.append("path").data([helperDataset]).attr("class","helper").attr("d", valueLine)
        .attr("fill","white").attr("clip-path","url(#circle-clip)");

    svg.append("clipPath") // define a clip path
        .attr("id", "circle-clip") // give the clipPath an ID
        .append("circle") // shape it as an ellipse
        .attr("cx", width/2) // position the x-centre
        .attr("cy", height/2)
        .attr("r",width/2);

    if (chartID==="chart2"){
        svg.append("text").attr("id","M")
            .attr("text-anchor","middle")
            .attr("x",width/2)
            .attr("y",height+80)
            .attr("font-size",50)
            .text("M");
    } else {
        svg.append("text").attr("id","C")
            .attr("text-anchor","middle")
            .attr("x",width/2)
            .attr("y",height+80)
            .attr("font-size",50)
            .text("C");
    }


// 3. Call the x axis in a group tag
    var xAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height /2+ ")")
        .call(d3.axisBottom(xScale).ticks([])); // Create an axis component with d3.axisBottom



// 4. Call the y axis in a group tag
    var yAxis = svg.append("g")
        .attr("class", "y axis").attr("transform","translate("+width/2+",0)")
        .call(d3.axisLeft(yScale).ticks([])); // Create an axis component with d3.axisLeft
// 9. Append the path, bind the data, and call the line generator
    svg
        .append("clipPath") // define a clip path
        .attr("id", "rect-clip") // give the clipPath an ID
        .append("rect") // shape it as an ellipse
        .attr("width", width+margin.left) // position the x-centre
        .attr("height", height+margin.top)
        .attr("transform","translate("+-margin.left+","+-margin.top+")"); // position the y-centre


    var xstr;
    if (variables[0].indexOf("of a") != -1) {
        xstr = variables[0].replace("of a", "of");
    } else {
        xstr = variables[0];
    }

    var variableSplit = (xstr + " (high)").split(" ");
    variableSplit.forEach(function(v,i){
        svg.append("text").attr("id","x label")
            .attr("text-anchor","start")
            .attr("x",width+ 10)
            .attr("y",height/2+((i+1)*10+(i*5)))
            .text(v);
    });

    var variableSplit = (xstr + " (low)").split(" ");
    variableSplit.forEach(function(v,i){
        svg.append("text").attr("id","x label")
            .attr("text-anchor","end")
            .attr("x",-10)
            .attr("y",height/2+((i+1)*10+(i*5)))
            .text(v);
    });

    var ystr;
    if (variables[1].indexOf("of a") != -1) {
        ystr = variables[1].replace("of a", "of");
    } else {
        ystr = variables[1];
    }

    svg.append("text").attr("id","y label")
        .attr("text-anchor","middle")
        .attr("x",width/2 )
        .attr("y",-10)
        .text(ystr + " (high)");

    svg.append("text").attr("id","y label")
        .attr("text-anchor","middle")
        .attr("x",width/2 )
        .attr("y",height +20)
        .text(ystr + " (low)");




    // var pos = {x:0,y:0};
this.createChart = function(corr){

    var posDegree = slopeScale(corr);
    var pos1Radians = posDegree * Math.PI / 180;
    var pos2Radians = (posDegree + 180) * Math.PI / 180;
    var posy= Math.sin(pos1Radians) /2;
    var posx = Math.cos(pos1Radians) /2;
    var posy1 = Math.sin(pos2Radians)/2;
    var posx1 = Math.cos(pos2Radians)/2;
    var pos = {x:posx,y:posy};
    var pos1 = {x:posx1,y:posy1};
//                console.log(focusPoint);
    dataset.push(pos);
    dataset.push(pos1);
    var lineG = svg.append("g").attr("class","lineContainer");
    // lineG.attr("clip-path","url(#rect-clip)");
//                console.log(focusNumber);
    line = lineG.append("path")
        .data([dataset]) // 10. Binds data to the line
        .attr("class", "line") // Assign a class for styling
        .attr("d", valueLine)
        .attr("fill","none")
        .attr("stroke","#ffab00")
        .attr("stroke-width",5);

    // fill: none;
    // stroke: #ffab00;
    // stroke-width: 5;
    // pointer-events: none;
    // ; // 11. Calls the line generator

    line.attr("transform","translate("+width/2+","+ (-height/2)+")")
};

this.updateChart = function(corr){
    dataset = [];
    var posDegree = slopeScale(corr);
    var pos1Radians = posDegree * Math.PI / 180;
    var pos2Radians = (posDegree + 180) * Math.PI / 180;
    var posy= Math.sin(pos1Radians) /2;
    var posx = Math.cos(pos1Radians) /2;
    var posy1 = Math.sin(pos2Radians)/2;
    var posx1 = Math.cos(pos2Radians)/2;
    var pos = {x:posx,y:posy};
    var pos1 = {x:posx1,y:posy1};
    dataset.push(pos);
    dataset.push(pos1);
    line.data([dataset]).transition().attr("d",valueLine);

};

this.highlightLine = function(color){
    var oldStroke = xAxis.attr("stroke-width");
    //xAxis.select("path").transition().attr("stroke-width",5).duration(500).transition().attr("stroke-width",oldStroke).duration(500);
    //yAxis.select("path").transition().attr("stroke-width",5).duration(500).transition().attr("stroke-width",oldStroke).duration(500);
    //line.transition().attr("fill","red").duration(500).transition().attr("fill",oldStroke).duration(500);
    line.attr("stroke",color);
    line.attr("opacity", 1);
}

this.setOpacity = function(alpha){
    line.attr("opacity", alpha)
}


}
