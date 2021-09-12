//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const _ = require('lodash');
require('dotenv').config();

// const date = require(__dirname + "/date.js")

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}))

app.use(express.static("public"));

// const items = ["Study Ejs","Do programming"];
// const workItems = [];
const uri = "mongodb+srv://shashank:shekhars027@cluster0.ibjzn.mongodb.net/todolistDB"
mongoose
     .connect( uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
     .then(() => console.log( 'Database Connected' ))
     .catch(err => console.log( err ));

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name: "Study Mongoose"
})

const item2 = new Item({
    name: "Learn native mongoDb Driver"
})

const item3 = new Item({
    name: "Play Chess"
})

const defaultItems = [item1,item2,item3];


const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);



app.get("https://frozen-cove-38739.herokuapp.com/",function(req,res){

    // const day = date.getDate();
    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err) console.log(err);
                else console.log("Saved data item to the database");
            });
            res.redirect("https://frozen-cove-38739.herokuapp.com/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });  

        }
    });

});

app.get("https://frozen-cove-38739.herokuapp.com/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                //create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("https://frozen-cove-38739.herokuapp.com/"+customListName);

            } else{
                // show an existing list
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
            }
        }
    })
    
   
})

app.post("https://frozen-cove-38739.herokuapp.com/",function(req,res){
    // console.log(req.body)

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === 'Today'){
        item.save();
        res.redirect("https://frozen-cove-38739.herokuapp.com/")
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("https://frozen-cove-38739.herokuapp.com/"+listName);
        })
    }



    // if(req.body.list === "work") {
    //     workItems.push(item);
    //     res.redirect("/work")
    // } else {
    //     items.push(item);
    //     res.redirect("/");
    // } 
})


app.post("https://frozen-cove-38739.herokuapp.com/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === 'Today'){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err) console.log(err);
            else console.log("Delete item successfully");
        })
        res.redirect("https://frozen-cove-38739.herokuapp.com/")
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("https://frozen-cove-38739.herokuapp.com/"+listName);
            }
        })
    }
    
})


app.get("https://frozen-cove-38739.herokuapp.com/about", function(req,res){
    res.render("about");
})

app.post("https://frozen-cove-38739.herokuapp.com/work",function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("https://frozen-cove-38739.herokuapp.com/work")
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server has started successfully!");
});