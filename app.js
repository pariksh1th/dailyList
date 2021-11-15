//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const today = date.getDate();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Data base setup

mongoose.connect("mongodb://localhost:27017/todolistDB");

const tasksSchema = {
  name: String,
};

const listSchema = {
  name: String,
  tasks: [tasksSchema],
};

const List = mongoose.model("List", listSchema);

const Task = mongoose.model("Task", tasksSchema);

// --------------+--------------

// default list

const item1 = new Task({
  name: "Welcome to todolist",
});
const item2 = new Task({
  name: "Click on + button to add a task",
});

const defaultList = [item1, item2];

// --------------+--------------

// workday list

const task1 = new Task({
  name: "Meditation",
});
const task2 = new Task({
  name: "Workout",
});
const task3 = new Task({
  name: "Fresh up",
});
const task4 = new Task({
  name: "Code for 2 hours",
});
const task5 = new Task({
  name: "Read book",
});
const workday = [task1, task2, task3, task4, task5];

// --------------+--------------

// get rout part

app.get("/", function (req, res) {
  Task.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Task.insertMany(workday, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully add items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: today, newListItems: foundItems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //creat a new list
        const list = new List({
          name: customListName,
          tasks: defaultList,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //show an existing list
        res.render("list", {
          listTitle: customListName,
          newListItems: foundList.tasks,
        });
      }
    }
  });
});

// --------------+--------------

// post rout part

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;

  const newTask = new Task({
    name: item,
  });

  if (listName === today) {
    newTask.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.tasks.push(newTask);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
  }
});

app.post("/delete", function (req, res) {
  const clickedId = req.body.clicked;
  const listName = req.body.listName;
  if (listName == today) {
    Task.findByIdAndRemove(clickedId, function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { tasks: { _id: clickedId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// --------------+--------------

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
