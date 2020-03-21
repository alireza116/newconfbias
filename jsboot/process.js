var js_boot = require("./js_boot.js");
var js_boot = new js_boot();
var fs = require("fs");
console.log(js_boot);

let rawdata = fs.readFileSync("../public/data/finalSimData.json");
let jsonData = JSON.parse(rawdata);

let CIs = Object.keys(jsonData).map(key => {
  let dataset = jsonData[key];
  //   console.log(dataset.data.data);

  let boot = js_boot.boot_ci_pearsonr(dataset.data.data);
  boot["vars"] = key;
  boot["uncertainty_lower"] = boot.CI[0];
  boot["uncertainty_upper"] = boot.CI[1];
  return boot;
});
console.log(CIs);

let data = JSON.stringify(CIs);
fs.writeFileSync("bootstrap_results.json", data);
