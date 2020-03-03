function LineChartDraw(chartID, variables, sampleData, unit = "person") {
  var line;
  var uncertainty;
  var lineG;
  var points;
  var cwidth = $("#" + chartID).width();
  var cheight = $("#" + chartID).height();
  console.log(cwidth);
  console.log(cheight);
  var posDegree;
  var selectedAngle;
  var minAngle;
  var maxAngle;
  var n_uncertainty_paths = 200;
  var jsboot = new js_boot();
  var rhoBoot = jsboot.boot_ci_pearsonr(sampleData);
  //   console.log(testData.N);
  //   console.log(testData.rho);
  //   console.log(rhoBoot);
  var uncertaintyPaths;

  cwidth = cheight;
  //console.log(cwidth);
  //console.log(cheight);
  var margin = { top: 120, right: 100, bottom: 120, left: 100 },
    width = cwidth - margin.left - margin.right, // Use the window's width
    height = cwidth - margin.top - margin.bottom; // Use the window's height
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

  var xDataScale = d3.scaleLinear().range([0, width]);
  var yDataScale = d3.scaleLinear().range([height, 0]);
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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("background-color", "lightgrey");
  // .attr("clip-path", "url(#rect-clip)");

  var legend = svg.append("g").style("font-weight", "500");

  legend
    .append("text")
    .attr("class", "signifier")
    .attr("x", 0)
    .attr("y", -margin.top + 40)
    .attr("text-anchor", "middle")
    .text("This chart is not interactive")
    .style("fill", "orange");

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

  var helperDataset = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ];
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
  lineG = svg.append("g").attr("class", "lineContainer");
  uncertainty = lineG
    .append("path")
    .attr("class", "uncertainty")
    .attr("fill", "grey")
    .attr("fill-opacity", 0);
  uncertaintyPathsG = lineG.append("g").attr("class", "uncertaintyPaths");

  this.createLineChart = function(corr = rhoBoot.pearsonr) {
    posDegree = slopeScale(corr);
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

    // lineG.attr("clip-path","url(#rect-clip)");
    //                console.log(focusNumber);

    line = lineG
      .append("path")
      .data([dataset]) // 10. Binds data to the line
      .attr("class", "corrPath") // Assign a class for styling
      .attr("d", valueLine)
      .attr("fill", "none")
      .attr("stroke", "#ffab00")
      .attr("stroke-width", 3);

    line.attr("transform", "translate(" + width / 2 + "," + -height / 2 + ")");
  };

  this.createScatterChart = function(data = sampleData) {
    var xExtent = d3.extent(
      data.map(function(d) {
        return d.x;
      })
    );
    var yExtent = d3.extent(
      data.map(function(d) {
        return d.y;
      })
    );
    xDataScale.domain(xExtent);
    yDataScale.domain(yExtent);
    var xExtentDif = 1.5;
    var yExtentDif = 1.5;
    points = svg
      .append("g")
      .attr("class", "points")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        // console.log(d.x);
        // console.log(d.y);
        // console.log(xDataScale(d.x));
        // console.log(yDataScale(d.y));
        // console.log("-----");
        return xDataScale(d.x / xExtentDif);
      })
      .attr("cy", function(d) {
        return yDataScale(d.y / yExtentDif);
      })
      .attr("r", 3)
      .attr("fill", "teal");
  };

  this.createUncertaintyBand = function(
    boot_ci_results = rhoBoot,
    corr = rhoBoot.pearsonr
  ) {
    minAngle = slopeScale(boot_ci_results.CI[0]);
    maxAngle = slopeScale(boot_ci_results.CI[1]);
    posDegree = slopeScale(corr);
    selectedAngle = posDegree;
    console.log(minAngle);
    console.log(maxAngle);
    this.makeUncertainty(n_uncertainty_paths);
  };

  this.makeUncertainty = function(n) {
    var min_d = Math.abs(minAngle - selectedAngle);
    var max_d = Math.abs(maxAngle - selectedAngle);
    var d = d3.max([min_d, max_d]);
    var uniform = d3.randomNormal(selectedAngle, d / 1.97);

    var opRange = [0, Math.abs(maxAngle - selectedAngle)];

    // var opScale = d3
    //   .scaleLinear()
    //   .domain(opRange)
    //   .range([1, 0.05]);
    uncertaintyPathsG.selectAll("path").remove();
    var allUncertaintyData = [];
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
        allUncertaintyData.push(dataset);
      }
    }

    uncertaintyPaths = uncertaintyPathsG
      .selectAll("path")
      .data(allUncertaintyData)
      .enter()
      .append("path")
      .attr("d", valueLine)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", function() {
        // return opScale(Math.abs(posDegree-Math.abs((minAngle+maxAngle)/2)));
        // return opScale(Math.abs(posDegree-selectedAngle));
        return 0.04;
      });
    uncertaintyPaths.attr(
      "transform",
      "translate(" + width / 2 + "," + -height / 2 + ")"
    );
  };

  this.hop = function(hopSpeed = 500) {
    setInterval(function() {
      console.log(uncertaintyPaths.size());
      var index = Math.floor(Math.random() * uncertaintyPaths.size());
      uncertaintyPaths.style("stroke-opacity", function(d, i) {
        // console.log(i);
        if (i === index) {
          return 0.8;
        } else {
          return 0;
        }
      });
    }, hopSpeed);
  };

  this.hopAnimate = function(hopSpeed = 500) {
    setInterval(function() {
      dataset = [];
      var corr = d3.randomUniform(rhoBoot.CI[0], rhoBoot.CI[1])();
      // console.log(corr);
      var posDegree = slopeScale(corr);
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
      line
        .data([dataset])
        .transition()
        .attr("d", valueLine);
    }, hopSpeed);
  };

  this.turnOffHelper = function() {
    d3.select(".helper").style("display", "none");
  };

  this.turnOnHelper = function() {
    d3.select(".helper").style("display", "");
  };

  this.turnOffSignifier = function() {
    legend.select(".signifier").style("display", "none");
  };

  this.turnOnSignifier = function() {
    legend.select(".signifier").style("display", "");
  };
}
