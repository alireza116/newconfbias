const express = require("express");
const router = express.Router();
const randomstring = require("randomstring");
const mongoose = require("mongoose");
// const csv = require("csv-parser");
const fs = require("fs");
const math = require("mathjs");
// console.log(__dirname);
let variables;
let rawdata = fs.readFileSync("./public/data/finalSimData.json");
let jsonData = JSON.parse(rawdata);
// console.log(jsonData);
let dataList = Object.keys(jsonData).map(function(d) {
  return jsonData[d];
});

// stages are whether scatterplot or uncertainty vis.
//states are whether it is initial elicitation, data visualization, or secondary elicitation
// visgroups are line band hop and scatter, self explanatory

let set1 = dataList.filter(function(d) {
  return d["set"] === 1;
});
let set2 = dataList.filter(function(d) {
  return d["set"] === 2;
});

let datasets = [set1, set2];

let states = ["draw1", "dataViz", "draw2"];
let visGroups = ["line", "band", "hop"];

// let variables = Object.keys(jsonData).map(function(d) {
//   return jsonData[d]["vars"];
// });
// console.log(variables);

const url =
  "mongodb://markant:emotion2019@ds159025.mlab.com:59025/markantstudy";

mongoose.connect(url);
mongoose.promise = global.Promise;

// const db = mongoose.anchoring;

const Schema = mongoose.Schema;

const responseSchema = new Schema({
  usertoken: {
    type: String,
    required: true,
    unique: true
  },
  variables: Schema.Types.Mixed,
  stage: String,
  visGroup: String,
  date: {
    type: Date,
    default: Date.now
  },

  prequestionnaire: Schema.Types.Mixed,
  postquestionnaire: Schema.Types.Mixed,
  responses: Schema.Types.Array,
  paid: { type: Boolean, Defult: false }
});

const Response = mongoose.model("newconfbias", responseSchema);

router.get("/api/consent", function(req, res) {
  // 0 is low 1 is high 2 is control //
  // for order 0 is basic anchoring first, then with map visualization and 1 is map visualization first and then basic anchoring//

  if (!req.session.userid) {
    let token = randomstring.generate(8);
    let datasetIndex = getRandomInt(2);
    variables = datasets[datasetIndex].map(function(d) {
      // console.log(d);
      return d["vars"];
    });
    // console.log(variables);
    req.session.uncertainty = false;
    req.session.datasetIndex = datasetIndex;
    req.session.visGroup = "scatter";
    req.session.userid = token;
    req.session.completed = false;
    req.session.postQuestion = false;
    req.session.preQuestion = false;
    req.session.varIndex = 0;
    req.session.variables = shuffle(variables);
    req.session.stateIndex = 0;
    req.session.state = states[req.session.stateIndex];

    let newResponse = new Response({
      usertoken: token,
      variables: req.session.variables,
      visGroup: req.session.visGroup
    });

    newResponse.save(function(err) {
      if (err) console.log(err);
      res.send({
        user: token
      });
    });
  } else {
    res.send("consent already given");
  }
});

router.get("/api/userinfo", function(req, res) {
  if (req.session.userid) {
    res.json({
      token: req.session.userid
    });
  } else {
    res.send("please give consent first");
  }
});

router.get("/api/data", function(req, res) {
  let vars = req.session.variables[req.session.varIndex];
  var dataset = jsonData[`${vars[0]}_${vars[1]}`];
  let d = {
    state: req.session.state,
    vars: vars,
    data: dataset.data.data,
    rho: dataset.rho,
    N: dataset.N,
    visGroup: req.session.visGroup
  };
  res.status(200).send(d);
});

// router.post("/api/intermission", function(req, res) {
//   let token = req.session.userid;
//   let data = req.body;
//   // console.log(data);
//   Response.findOneAndUpdate(
//     { usertoken: token },
//     {
//       intermission: data
//     },
//     function(err, doc) {
//       if (err) return res.send(500, { error: err });
//       console.log("yeaah");
//       return res.send("successfully saved!");
//     }
//   );
// });

router.post("/api/study", function(req, res) {
  let token = req.session.userid;
  let data = req.body;

  data["state"] = states[req.session.stateIndex];
  data["variables"] = req.session.variables[req.session.varIndex];

  Response.findOneAndUpdate(
    { usertoken: token },
    {
      $push: { responses: data }
    },
    function(err, doc) {
      if (err) {
        return res.send(500, { error: err });
      }
      return res.send(200, `successfully saved study`);
    }
  );
});

router.post("/api/pre", function(req, res) {
  let token = req.session.userid;
  let data = req.body;
  // console.log(data);
  Response.findOneAndUpdate(
    { usertoken: token, prequestionnaire: { $exists: false } },
    {
      prequestionnaire: data
    },
    function(err, doc) {
      if (err) return res.send(500, { error: err });
      // console.log("yeaah");
      req.session.preQuestion = true;
      return res.send("successfully saved!");
    }
  );
});

router.post("/api/post", function(req, res) {
  let token = req.session.userid;
  let data = req.body;
  // console.log(data);
  Response.findOneAndUpdate(
    { usertoken: token, postquestionnaire: { $exists: false } },
    {
      postquestionnaire: data
    },
    function(err, doc) {
      if (err) return res.send(500, { error: err });
      // console.log("yeaah");
      req.session.postQuestion = true;
      return res.send("successfully saved!");
    }
  );
});

router.get("/", function(req, res) {
  if (req.session.completed) {
    res.render("debrief.html");
  } else {
    res.render("consent.html");
  }
});

router.get("/consent", function(req, res) {
  if (req.session.completed) {
    res.render("debrief.html");
  } else {
    res.render("consent.html");
  }
});

router.get("/intermission", function(req, res) {
  if (req.session.varIndex === variables.length && !req.session.uncertainty) {
    // req.session.completed = true;
    res.redirect("/next");
  } else if (
    req.session.varIndex === variables.length &&
    req.session.uncertainty
  ) {
    req.session.completed = true;
    res.redirect("/postforms");
  } else {
    res.render("intermission.html");
  }
});

router.get("/instructions/correlation", function(req, res) {
  if (req.session.completed) {
    res.render("debrief.html");
  } else {
    res.render("instructionsCorrelation.html");
  }
});

router.get("/instructions/task", function(req, res) {
  if (req.session.completed) {
    res.render("debrief.html");
  } else {
    res.render("instructionsTask.html");
  }
});

router.get("/instructions/uncertainty", function(req, res) {
  if (req.session.completed) {
    res.render("debrief.html");
  } else {
    res.render("instructionsUncertainty.html");
  }
});

// router.get("/instructions-MC", function(req, res) {
//   if (req.session.completed) {
//     res.render("debrief.html");
//   } else {
//     res.render("instructions-MC.html");
//   }
// });
router.get("/instructions/draw", function(req, res) {
  if (req.session.completed) {
    res.render("debrief.html");
  } else {
    res.render("instructionsDraw.html");
  }
});

router.get("/preforms", function(req, res) {
  if (!req.session.completed) {
    res.render("preforms.html");
  }
});

router.get("/postforms", function(req, res) {
  res.render("postforms.html");
});

// router.get("/instructions/draw", function(req, res) {
//   console.log(req.session.state);
//   res.render("instructionsDraw.html");
//   // if (req.session.state === "draw") {
//   //   res.render("instructions-LC.html");
//   // } else if (req.session.state === "mc") {
//   //   res.render("instructions-MC.html");
//   // } else {
//   //   res.send("error!");
//   // }
// });

router.get("/study", function(req, res) {
  console.log(req.session.state);
  if (req.session.stateIndex === 0) {
    res.render("lineChartDraw.html");
  } else if (req.session.stateIndex === 1) {
    res.render("dataViz.html");
  } else if (req.session.stateIndex === 2) {
    res.render("lineChartDraw.html");
  } else {
    res.send("error!");
  }
});

router.get("/dataviz", function(req, res) {
  res.render("dataViz.html");
});

// router.get("/next", function(req, res) {
//   // req.session.varIndex += 1;
//   console.log(req.session.varIndex);
//   console.log(req.session.stateIndex);
//   if (req.session.varIndex < variables.length && req.session.stateIndex === 0) {
//     req.session.stateIndex += 1;
//     req.session.state = states[req.session.stateIndex];
//     res.redirect("/study");
//   } else if (
//     req.session.varIndex < variables.length &&
//     req.session.stateIndex === 1
//   ) {
//     req.session.stateIndex += 1;
//     req.session.state = states[req.session.stateIndex];
//     res.redirect("/study");
//   } else if (
//     req.session.varIndex < variables.length &&
//     req.session.stateIndex === 2
//   ) {
//     req.session.varIndex += 1;
//     req.session.stateIndex = 0;
//     req.session.state = states[req.session.stateIndex];
//     res.redirect("/intermission");
//   } else {
//     res.redirect("postforms");
//   }
// });

router.get("/next", function(req, res) {
  if (!req.session.uncertainty) {
    console.log("made it scatter!");
    if (
      req.session.varIndex < variables.length &&
      req.session.stateIndex === 0
    ) {
      req.session.stateIndex += 1;
      req.session.state = states[req.session.stateIndex];
      res.redirect("/study");
    } else if (
      req.session.varIndex < variables.length &&
      req.session.stateIndex === 1
    ) {
      req.session.stateIndex += 1;
      req.session.state = states[req.session.stateIndex];
      res.redirect("/study");
    } else if (
      req.session.varIndex < variables.length &&
      req.session.stateIndex === 2
    ) {
      req.session.varIndex += 1;
      req.session.stateIndex = 0;
      req.session.state = states[req.session.stateIndex];
      res.redirect("/intermission");
    } else {
      req.session.uncertainty = true;
      req.session.varIndex = 0;
      req.session.stateIndex = 0;
      req.session.state = states[req.session.stateIndex];
      if (req.session.datasetIndex === 0) {
        req.session.datasetIndex = 1;
      } else {
        req.session.datasetIndex = 0;
      }
      variables = datasets[req.session.datasetIndex].map(function(d) {
        // console.log(d);
        return d["vars"];
      });
      console.log(variables);
      req.session.variables = shuffle(variables);
      req.session.visGroup = visGroups[getRandomInt(visGroups.length)];
      res.redirect("/instructions/uncertainty");
    }
  } else if (req.session.uncertainty) {
    console.log("made it uncertainty");
    if (
      req.session.varIndex < variables.length &&
      req.session.stateIndex === 0
    ) {
      req.session.stateIndex += 1;
      req.session.state = states[req.session.stateIndex];
      res.redirect("/study");
    } else if (
      req.session.varIndex < variables.length &&
      req.session.stateIndex === 1
    ) {
      req.session.stateIndex += 1;
      req.session.state = states[req.session.stateIndex];
      res.redirect("/study");
    } else if (
      req.session.varIndex < variables.length &&
      req.session.stateIndex === 2
    ) {
      req.session.varIndex += 1;
      req.session.stateIndex = 0;
      req.session.state = states[req.session.stateIndex];
      res.redirect("/intermission");
    } else {
      res.redirect("/postforms");
    }
  }
});

router.get("/debrief", function(req, res) {
  if (
    req.session.completed &&
    req.session.postQuestion &&
    req.session.preQuestion
  ) {
    res.render("debrief.html");
  } else if (!req.session.preQuestion) {
    res.redirect("preforms");
  } else if (!req.session.postQuestion && !req.session.completed) {
    res.redirect("study");
  } else if (!req.session.postQuestion) {
    res.redirect("postforms");
  }
});

function zip() {
  let args = [].slice.call(arguments);
  let shortest =
    args.length === 0
      ? []
      : args.reduce(function(a, b) {
          return a.length < b.length ? a : b;
        });

  return shortest.map(function(_, i) {
    return args.map(function(array) {
      return array[i];
    });
  });
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = router;
