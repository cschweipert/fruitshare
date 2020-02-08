// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/fruitshareDB", {
  useNewUrlParser: true
});

const addressesSchema = {
  fruit: String,
  street: String,
  zip: Number,
  city: String,
  latitude: Number,
  longitude: Number
};

const Address = mongoose.model("Address", addressesSchema);

app.get("/", function(req, res) {
  console.log("received first get request");
  // executes, passing results to callback
  Address.find({}, function(err, foundItems) {
    var myArray = foundItems;
    console.log(myArray);
    console.log(myArray.length);

    res.render('map', {
      ejsarray: myArray
    });
    console.log(err);
  });
});

app.post("/", function(req, res) {
  console.log("received first post request");

  let url = "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?";
  let fruit = req.body.fruit;
  let street = req.body.street;
  let city = req.body.city;
  let state = req.body.state;
  let zip = req.body.zip;
  let yourAddress = "Address=" + street.replace(" ", "+") + "&City=" + city.replace(" ", "+") + "&Zip=" + zip;
  let parameters = "&category=&outFields=*&forStorage=false&f=json";
  //http request to an external server
  request(url + yourAddress + parameters, function(error, response, body) {
    //turns the JSON into a JS object
    let data = JSON.parse(body);
    console.log(data);

    const longitude = data.candidates[0].location.x;
    const latitude = data.candidates[0].location.y;
    console.log(longitude);
    console.log(latitude);

    const address = new Address({
      fruit: fruit,
      street: street,
      zip: zip,
      city: city,
      latitude: latitude,
      longitude: longitude
    });

    console.log(address);

    // address.save();

    address.save(function(err) {
      if (!err) {
        res.send("Successfully saved a new address.");
      } else {
        res.send(err);
      }
    });
    
    // res.render('map', {
    //   ejslon: longitude,
    //   ejslat: latitude,
    // });
  });
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
