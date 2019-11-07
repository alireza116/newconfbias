/**
 * Created by fablab on 6/7/2017.
 */
var express = require("express");
var app = express();
var cors = require("cors");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var bodyparser = require("body-parser");

app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 6000000
    }
  })
);

var routes = require("./api/routes/index");

port = process.env.PORT || 3005;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

app.use("/", routes);
app.use("/", express.static(__dirname + "/public"));
var router = express.Router();

app.use("/api", router);
app.listen(port);
console.log("api running on " + port);
