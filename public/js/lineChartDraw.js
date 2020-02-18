var beliefData;
var selected = false;
var uncertaintySelected = false;
var uncertaintyPaths;
function LineChartDraw(chartID, variables, unit = "person") {
  var line;
  var uncertainty;
  var lineG;
  var cwidth = $("#" + chartID).width();
  var cheight = $("#" + chartID).height();
  cwidth = cheight;

  var margin = { top: 120, right: 120, bottom: 120, left: 120 },
    width = cwidth - margin.left - margin.right, // Use the window's width
    height = cheight - margin.top - margin.bottom; // Use the window's height

  var lineColor = "#E74C3C";

  var slopeScale = d3
    .scaleLinear()
    .domain([1, -1])
    .range([45, -45]);

  // 5. X scale will use the index of our data
  var xScale = d3
    .scaleLinear()
    .domain([0, 1]) // input
    .range([0, width]); // output

  // 6. Y scale will use the randomly generate number
  var yScale = d3
    .scaleLinear()
    .domain([0, 1]) // input
    .range([height, 0]); // output

  // 7. d3's line generator
  var valueLine = d3
    .line()
    .x(function(d, i) {
      return xScale(d.x);
    }) // set the x values for the line generator
    .y(function(d) {
      return yScale(d.y);
    }) // set the y values for the line generator
    .curve(d3.curveLinear); // apply smoothing to the line

  // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
  //    var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } });
  var dataset = [];
  //    console.log(dataset);
  // 1. Add the SVG to the page and employ #2
  var svg = d3
    .select("#" + chartID)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("border", "solid white")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // .attr("clip-path", "url(#rect-clip)");
  var helperDataset = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ];
  var button = svg
    .append("rect")
    .attr("width", 100)
    .attr("height", 40)
    .attr("x", width / 2 - 50)
    .attr("y", height + margin.top / 2)
    .style("fill", "lightgrey");

  svg
    .append("text")
    .attr("width", 120)
    .attr("height", 40)
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.top / 2 + 25)
    .style("pointer-events", "none")
    .text("Reset");

  button
    .on("mouseover", function() {
      d3.select(this).style("fill", lineColor);
    })
    .on("mouseout", function() {
      d3.select(this).style("fill", "lightgrey");
    })
    .on("click", function() {
      uncertaintySelected = false;
      selected = false;
      uncertaintyPaths.selectAll("path").remove();
    });
  var legend = svg.append("g").style("font-weight", "500");

  legend
    .append("text")
    .attr("x", 0)
    .attr("y", -margin.top + 40)
    .attr("text-anchor", "middle")
    .text("This chart is interactive")
    .style("fill", lineColor);

  legend
    .append("text")
    .attr("x", width + margin.left - 40)
    .attr("y", -margin.top + 40)
    .attr("text-anchor", "end")
    .text("Relationship between");
  legend
    .append("text")
    .attr("x", width + margin.left - 40)
    .attr("y", -margin.top + 60)
    .attr("text-anchor", "end")
    .text(`${variables[0]} & ${variables[1]} of ${unit}`);
  svg
    .append("path")
    .data([helperDataset])
    .attr("class", "helper")
    .attr("d", valueLine)
    .attr("fill", "white")
    .attr("clip-path", "url(#circle-clip)");
  svg
    .append("clipPath") // define a clip path
    .attr("id", "circle-clip") // give the clipPath an ID
    .append("circle") // shape it as an ellipse
    .attr("cx", width / 2) // position the x-centre
    .attr("cy", height / 2)
    .attr("r", width / 2);

  // 3. Call the x axis in a group tag
  var xAxis = svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.axisBottom(xScale).ticks([])); // Create an axis component with d3.axisBottom

  // 4. Call the y axis in a group tag
  var yAxis = svg
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + width / 2 + ",0)")
    .call(d3.axisLeft(yScale).ticks([])); // Create an axis component with d3.axisLeft
  // 9. Append the path, bind the data, and call the line generator
  svg
    .append("clipPath") // define a clip path
    .attr("id", "rect-clip") // give the clipPath an ID
    .append("rect") // shape it as an ellipse
    .attr("width", width + margin.left) // position the x-centre
    .attr("height", height + margin.top)
    .attr("transform", "translate(" + -margin.left + "," + -margin.top + ")"); // position the y-centre

  svg
    .append("clipPath") // define a clip path
    .attr("id", "circle-clip") // give the clipPath an ID
    .append("circle") // shape it as an ellipse
    .attr("cx", width / 2) // position the x-centre
    .attr("cy", height / 2)
    .attr("r", width / 2);
  // .attr("transform","translate("+-margin.left+","+-margin.top+")"); // position the y-centre

  // svg.append("text").attr("id","x label")
  //     .attr("text-anchor","start")
  //     .attr("x",width+ 10)
  //     .attr("y",height/2+10)
  //     .text(variables[0]);

  var xstr;
  if (variables[0].indexOf("of a") != -1) {
    xstr = variables[0].replace("of a", "of");
  } else {
    xstr = variables[0];
  }

  var variableSplit = (xstr + " (high)").split(" ");
  variableSplit.forEach(function(v, i) {
    svg
      .append("text")
      .attr("id", "x label")
      .attr("text-anchor", "start")
      .attr("x", width + 10)
      .attr("y", height / 2 + ((i + 1) * 10 + i * 5))
      .text(v);
  });

  var variableSplit = (xstr + " (low)").split(" ");
  variableSplit.forEach(function(v, i) {
    svg
      .append("text")
      .attr("id", "x label")
      .attr("text-anchor", "end")
      .attr("x", -10)
      .attr("y", height / 2 + ((i + 1) * 10 + i * 5))
      .text(v);
  });

  var ystr;
  if (variables[1].indexOf("of a") != -1) {
    ystr = variables[1].replace("of a", "of");
  } else {
    ystr = variables[1];
  }

  svg
    .append("text")
    .attr("id", "y label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", -10)
    .text(ystr + " (high)");

  svg
    .append("text")
    .attr("id", "y label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 20)
    .text(ystr + " (low)");

  // var pos = {x:0,y:0};
  this.createChart = function(corr) {
    var posDegree = slopeScale(corr);
    var pos1Radians = (posDegree * Math.PI) / 180;
    var pos2Radians = ((posDegree + 180) * Math.PI) / 180;
    var posy = Math.sin(pos1Radians) / 2;
    var posx = Math.cos(pos1Radians) / 2;
    var posy1 = Math.sin(pos2Radians) / 2;
    var posx1 = Math.cos(pos2Radians) / 2;
    var pos = { x: posx, y: posy };
    var pos1 = { x: posx1, y: posy1 };
    //                console.log(focusPoint);
    dataset.push(pos);
    dataset.push(pos1);
    //console.log(dataset);
    lineG = svg.append("g").attr("class", "lineContainer");
    // lineG.attr("clip-path","url(#rect-clip)");
    //                console.log(focusNumber);
    uncertainty = lineG
      .append("path")
      .attr("class", "uncertainty")
      .attr("fill", "lightgrey")
      .attr("fill-opacity", 0);

    uncertaintyPaths = lineG.append("g");
    line = lineG
      .append("path")
      .data([dataset]) // 10. Binds data to the line
      .attr("class", "line") // Assign a class for styling
      .attr("d", valueLine)
      .attr("fill", "none")
      // .attr("stroke", "#ffab00")
      .attr("stroke", lineColor)
      .attr("stroke-width", 5);

    line.attr("transform", "translate(" + width / 2 + "," + -height / 2 + ")");
  };

  var center = [width / 2, height / 2];
  var xVector = [width - center[0], height / 2 - center[1]];
  var posDegree;
  var selectedAngle;
  var selectedUncertainty;
  beliefData = {};
  var centerPos;
  var centerPos1;
  var minAngle;
  var maxAngle;
  svg
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .attr("stroke", 0)
    .attr("fill-opacity", 0)
    .on("click", function() {
      //console.log("kir");
      if (!selected) {
        selected = true;
        beliefData["belief"] = slopeScale.invert(selectedAngle);
      } else if (!uncertaintySelected) {
        uncertaintySelected = true;
        beliefData["uncertainty"] = selectedUncertainty;
        //console.log(beliefData)
      }
    })
    .on("mousemove", function() {
      dataset = [];
      var m = d3.mouse(this);
      var mousPosVect = [m[0] - center[0], height - m[1] - center[1]];
      var angle =
        Math.atan2(mousPosVect[1], mousPosVect[0]) -
        Math.atan2(xVector[1], xVector[0]);
      // if (angle < 0) { angle += 2 * Math.PI; }
      posDegree = (angle * 180) / Math.PI;
      if (posDegree > 45 && posDegree < 90) {
        posDegree = 45;
      } else if (posDegree >= 90 && posDegree < 135) {
        posDegree = -45;
      } else if (posDegree < -45 && posDegree > -90) {
        posDegree = -45;
      } else if (posDegree <= -90 && posDegree > -135) {
        posDegree = 45;
      }
      // else if (posDegree < 135) {posDegree = -45}
      // else if (posDegree < -45 && posDegree > -90) {
      //     posDegree = -45
      // }
      if (posDegree > 45) {
        posDegree = -180 + posDegree;
      } else if (posDegree < -45) {
        posDegree = 180 + posDegree;
      }

      if (!selected) {
        var pos1Radians = (posDegree * Math.PI) / 180;
        var pos2Radians = ((posDegree + 180) * Math.PI) / 180;
        var posy = Math.sin(pos1Radians) / 2;
        var posx = Math.cos(pos1Radians) / 2;
        var posy1 = Math.sin(pos2Radians) / 2;
        var posx1 = Math.cos(pos2Radians) / 2;
        var pos = { x: posx, y: posy };
        var pos1 = { x: posx1, y: posy1 };
        centerPos = pos;
        centerPos1 = pos1;
        dataset.push(pos);
        dataset.push(pos1);
        line.data([dataset]).attr("d", valueLine);
        selectedAngle = posDegree;
      } else if (!uncertaintySelected) {
        var pos1Radians = (posDegree * Math.PI) / 180;
        var pos2Radians = ((posDegree + 180) * Math.PI) / 180;
        var angle1Diff = posDegree - selectedAngle;
        var otherAngle = posDegree - 2 * angle1Diff;
        minAngle = d3.min([posDegree, otherAngle]);
        maxAngle = d3.max([posDegree, otherAngle]);

        // if (minAngle > 45) {
        //     minAngle = 45
        // } else if (minAngle < -45){
        //     minAngle = -45
        // }
        //console.log(minAngle);
        //console.log(maxAngle);

        if (maxAngle > 45) {
          maxAngle = 45;
        }
        if (maxAngle < -45) {
          maxAngle = -45;
        }
        if (minAngle < -45) {
          minAngle = -45;
        }
        if (minAngle > 45) {
          minAngle = 45;
        }

        // console.log("ming angle");
        // console.log(minAngle);
        // console.log("max angle");
        // console.log(maxAngle);
        //console.log(minAngle);
        //console.log(maxAngle);

        selectedUncertainty = [
          slopeScale.invert(minAngle),
          slopeScale.invert(maxAngle)
        ];
        var pos3Radians = (otherAngle * Math.PI) / 180;
        var pos4Radians = ((otherAngle + 180) * Math.PI) / 180;
        var posy = Math.sin(pos1Radians) / 2;
        var posx = Math.cos(pos1Radians) / 2;
        var posy1 = Math.sin(pos2Radians) / 2;
        var posx1 = Math.cos(pos2Radians) / 2;
        var posy2 = Math.sin(pos4Radians) / 2;
        var posx2 = Math.cos(pos4Radians) / 2;
        var posy3 = Math.sin(pos3Radians) / 2;
        var posx3 = Math.cos(pos3Radians) / 2;
        var pos = { x: posx, y: posy };
        var pos1 = { x: posx1, y: posy1 };
        var pos2 = { x: posx2, y: posy2 };
        var pos3 = { x: posx3, y: posy3 };
        dataset.push(pos);
        dataset.push(pos1);
        dataset.push(centerPos1);
        dataset.push(pos2);
        dataset.push(pos3);
        dataset.push(centerPos);
        uncertainty.data([dataset]).attr("d", valueLine);
        uncertainty.attr(
          "transform",
          "translate(" + width / 2 + "," + -height / 2 + ")"
        );
        makeUncertainty(200);
        //console.log(beliefData);
      }
    });

  function makeUncertainty(n) {
    // var uniform = d3.randomNormal(selectedAngle,(maxAngle-selectedAngle)/1.97);
    //var uniform = d3.randomNormal(selectedAngle,(maxAngle-minAngle)/(2*1.97));
    var min_d = Math.abs(minAngle - selectedAngle);
    var max_d = Math.abs(maxAngle - selectedAngle);
    var d = d3.max([min_d, max_d]);
    var uniform = d3.randomNormal(selectedAngle, d / 1.97);

    // var uniform = d3.randomUniform(minAngle,maxAngle);

    // var opRange = [maxAngle-(minAngle+maxAngle)/2,0];
    // if (maxAngle > minAngle){
    //     var opRange = [0,maxAngle-selectedAngle];
    // } else {
    //     var opRange = [0,minAngle-selectedAngle];
    // }

    var opRange = [0, Math.abs(maxAngle - selectedAngle)];

    // console.log(opRange);
    var opScale = d3
      // .scalePow()
      .scaleLinear()
      // .scalePow()
      // .exponent(0.5)
      .domain(opRange)
      // .range([0.01,1]);
      .range([1, 0.05]);
    uncertaintyPaths.selectAll("path").remove();
    // console.log(opRange);
    // console.log([minAngle,maxAngle]);
    // console.log("uncertainty paths");
    for (var i = 0; i < n; i++) {
      var dataset = [];
      var posDegree = uniform();
      if (posDegree > minAngle && posDegree < maxAngle) {
        // console.log(posDegree);
        var pos1Radians = (posDegree * Math.PI) / 180;
        var pos2Radians = ((posDegree + 180) * Math.PI) / 180;
        var posy = Math.sin(pos1Radians) / 2;
        var posx = Math.cos(pos1Radians) / 2;
        var posy1 = Math.sin(pos2Radians) / 2;
        var posx1 = Math.cos(pos2Radians) / 2;
        var pos = { x: posx, y: posy };
        var pos1 = { x: posx1, y: posy1 };
        dataset.push(pos);
        dataset.push(pos1);
        uncertaintyPaths
          .append("path")
          .data([dataset])
          .attr("d", valueLine)
          .attr("class", "uncertaintyPaths")
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 3)
          .attr("stroke-opacity", function() {
            // return opScale(Math.abs(posDegree-Math.abs((minAngle+maxAngle)/2)));
            // return opScale(Math.abs(posDegree-selectedAngle));
            return 0.04;
          });
      }
    }
    uncertaintyPaths.attr(
      "transform",
      "translate(" + width / 2 + "," + -height / 2 + ")"
    );
  }
}
