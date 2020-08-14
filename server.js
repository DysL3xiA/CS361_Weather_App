/*******************************************************************************
 *
 * File:	server.js
 * Author:	Weather Avengers
 * Date:	6/15/2020
 *
 * Description:
 *
 *
 ******************************************************************************/

var express = require('express');
var request = require('request');

var app = express();
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

const port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var moment = require('moment-timezone');

app.use(express.static('client'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.listen(port, () => console.log(`Listening on port ${port}`));

var location_data;
var address;
let city;
let lat;
let lon;
let units = 'imperial';

//search history array
var search = new Array(" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ");
let previousSearch;
let currentSearch;

function getTempUnits() {
  if (units == 'imperial') {
    return '° F';
  }
  else {
    return '° C'
  }
}

function getWindUnits() {
  if (units == 'imperial') {
    return ' mph';
  }
  else {
    return ' metres/sec';
  }
}

//Clear Search History. Redirect to Home Page to set User's Location. Triggered by 'Clear History' button.
app.post("/clearhistory", function(req,res){
      search = new Array(" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ");
      res.redirect("/");
});

//Explicit Search. Triggered by 'Get Weather' button.
app.post("/newsearch", function(req,res){
  previousSearch = currentSearch;
  if (req.body.location) {
    currentSearch = req.body.location;
    address = req.body.location;
    search.unshift(currentSearch);
    search.pop();
  }
  else {
    address = currentSearch;
  }
  convertToGeocode(res);
});


function convertToGeocode(res){
  let googleApiKey = 'AIzaSyBBPH7E-1UWMVO13QgYk3kVfYYpqqM-oLQ';
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${googleApiKey}`;
  request(url, function (err, response, body) {
    if(err){
      console.log('error:', error);
    }
    else {
      location_data = JSON.parse(body);
    }
    res.redirect("/");
  });
};

app.post("/location", function(req,res) {
  var user_latitude = req.query.latitude;
  var user_longitude = req.query.longitude;
  if (user_latitude) {
    address = user_latitude + ", " + user_longitude;
  }
  convertToGeocode(res);
});


app.post("/changeMetric", function(req,res)
{
  units = req.query.metric;
  convertToGeocode(res);
});

//Main Route - Render Weather Information
app.get("/", function(req, res)
{
  var weather_data;
  let apiKey = '364c1375ab235fcd9a6e5c2a537733e6';
  if (location_data){
    if (location_data.status == 'OK')
    {
      city = get_city(location_data);
      lat = location_data.results[0].geometry.location.lat;
      lon = location_data.results[0].geometry.location.lng;
    }
    else
    {
      city = 'Portland, OR';
      lat = 45.523064;
      lon = -122.676483;
    }
  }
  else
  {
    city = 'Portland, OR';
    lat = 45.523064;
    lon = -122.676483;
  }

  let url = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;

  request(url, function (err, response, body){
    if(err)
    {
       console.log('error:', error);
    }
    else
    {
      weather_data = JSON.parse(body);
    }

    var context = {};
    context.current_location = city,
    context.location_latitude = lat,
    context.location_longitude = lon;

    var date = moment.unix(weather_data.current.dt).tz(weather_data.timezone);
    context.date = date.format('MMM D, YYYY hh:mm A');

    var dates = [];
    var day_short = [];
    var i;
    for (i = 0; i < 8; i++) {
      var tempDate = moment.unix(weather_data.daily[i].dt).tz(weather_data.timezone);
      dates.push(tempDate.format('ddd M/D'));
      day_short.push(tempDate.format('ddd'));
    }

    var currentUnits = getTempUnits();
    var temp = [];
    var i;
    temp.push(Math.round(weather_data.current.temp)+ currentUnits);
    for (i = 1; i < 8; i++) {
      temp.push(Math.round(weather_data.daily[i].temp.day) + currentUnits);
    }

    var high_temp = [];
    var i;
    for (i = 0; i < 8; i++) {
      high_temp.push(Math.round(weather_data.daily[i].temp.max) + currentUnits);
    }

    var low_temp = [];
    var i;
    for (i = 0; i < 8; i++) {
      low_temp.push(Math.round(weather_data.daily[i].temp.min) + currentUnits);
    }

    var pressure = [];
    var i;
    for (i = 0; i < 8; i++) {
      pressure.push(weather_data.daily[i].pressure);
    }

    var humidity = [];
    var i;
    for (i = 0; i < 8; i++) {
      humidity.push(weather_data.daily[i].humidity);
    }

    var currWindUnits = getWindUnits();
    var wind = [];
    var i;
    for (i = 0; i < 8; i++) {
      wind.push(weather_data.daily[i].wind_speed + currWindUnits);
    }

    var icons = [];
    var i;
    for (i = 0; i < 8; i++) {
      icons.push(weather_data.daily[i].weather[0].icon);
    }

    var sunrise = [];
    var i;
    for (i = 0; i < 8; i++) {
      sunriseDate = moment.unix(weather_data.daily[i].sunrise).tz(weather_data.timezone);
      sunriseDate = sunriseDate.format('hh:mm A');
      sunrise.push(sunriseDate);
    }

    var sunset = [];
    var i;
    for (i = 0; i < 8; i++) {
      sunsetDate = moment.unix(weather_data.daily[i].sunset).tz(weather_data.timezone);
      sunsetDate = sunsetDate.format('hh:mm A');
      sunset.push(sunsetDate);
    }

    context["dates"] = dates;
    context["day_short"] = day_short;
    context["temp"] = temp;
    context["high_temp"] = high_temp;
    context["low_temp"] = low_temp;
    context["pressure"] = pressure;
    context["humidity"] = humidity;
    context["wind"] = wind;
    context["icons"] = icons;
    context["sunrise"] = sunrise;
    context["sunset"] = sunset;
    context.search= search;
    context.currentSearch= currentSearch;

    res.render("index",context);
  });
});

function get_city(location_data) {
  var index;
  var city;
  for(var i = 0; i < location_data.results.length; i++) {
    if (location_data.results[i].types[0] == "locality" || location_data.results[i].types[0] == "postal_code"){
      city = location_data.results[i].formatted_address;
    }
    else {
      city = location_data.results[0].formatted_address;
    }
  }
  return city;
}
