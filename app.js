//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
// const lo= require("lodash");
const mongoose = require("mongoose");

var MongoClient = require('mongodb').MongoClient;





const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const url = "<add the link>";
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,

});

const taskscema = {
  task: String,
  note: String,
  date: String,
  time: String
};

const Itemmodel = mongoose.model("Itemmodel", taskscema);
var options = {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
};
var today = new Date();
var day = today.toLocaleDateString("en-US", options);





const listschema = {
  task: String,
  items: [taskscema]
};

const Listmodel = mongoose.model("listmodel", listschema);


app.get("/", function(req, res) {


  Itemmodel.find({}, function(err, result) {

    res.render("list", {
      day: day,
      newlisttitle: "Today",
      newListItems: result
    });

  });
});






app.get("/:topic", function(req, res) {
  var title = req.params.topic;
  Listmodel.findOne({
    task: title
  }, function(err, result) {
    if (!err) {
      if (result) {
        res.render("list", {
          day: day,
          newlisttitle: result.task,
          newListItems: result.items
        });
      } else {
        const list = Listmodel({
          task: title,
          items: []
        });
        list.save();
        res.redirect("/" + title);
      }
    } else {
      console.log(err);
    }
  });

});







app.post("/", function(req, res) {
  const listname = req.body.add;
  const item = new Itemmodel({
    task: req.body.name,
    note: req.body.explain,
    date: req.body.date,
    time: req.body.time
  });
  if (listname === "Today") {
    item.save();

    res.redirect("/");
  } else {
    Listmodel.findOne({
      task: listname
    }, function(err, result) {
      if (!err) {
        result.items.push(item);
        result.save();
        res.redirect("/" + listname);
      }
    });

  }





});


// <-----------Delete-------------------->



app.post("/delete", function(req, res) {
  const thisid = req.body.delete;
  const name = req.body.listname;
  if (name === "Today") {
    Itemmodel.findByIdAndRemove(thisid, function(err, result) {
      if (err) console.log(err);
    });
    res.redirect("/");
  } else {


    Listmodel.findOneAndUpdate({
      task: name
    }, {
      $pull: {
        items: {
          _id: thisid
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + name);
      }

    });
  }
});
// <---------------------------Dynamic list------------------->








app.listen(3000, function() {
  console.log("Server started on port 3000");
});
