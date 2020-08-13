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
  var user_latitude = req.query.latitude;
  var user_longitude = req.query.longitude;
  console.log(user_latitude);
  console.log(user_longitude);
  if (user_latitude) {
    address = user_latitude + ", " + user_longitude;
  }
  else if (req.body.location){
    currentSearch = req.body.location;
    address = req.body.location;
    search.unshift(currentSearch);
    search.pop();
  }
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
});

app.post("/changeMetric", function(req,res)
{
  units = req.query.metric;
  res.send(null);
});

//Main Route - Render Weather Information
app.get("/", function(req, res)
{
  var weather_data;
  let apiKey = '364c1375ab235fcd9a6e5c2a537733e6';
  if (location_data){
    if (location_data.status == 'OK')
    {
      city = location_data.results[0].formatted_address;
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

    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    var date = moment.unix(weather_data.current.dt).tz(weather_data.timezone);
    var dayTwoDate = moment.unix(weather_data.daily[1].dt).tz(weather_data.timezone);
    var dayThreeDate = moment.unix(weather_data.daily[2].dt).tz(weather_data.timezone);
    var dayFourDate = moment.unix(weather_data.daily[3].dt).tz(weather_data.timezone);
    var dayFiveDate = moment.unix(weather_data.daily[4].dt).tz(weather_data.timezone);
    var daySixDate = moment.unix(weather_data.daily[5].dt).tz(weather_data.timezone);
    var daySevenDate = moment.unix(weather_data.daily[6].dt).tz(weather_data.timezone);
    var locationLatitude = lat;
    var locationLongitude = lon;

    var context={};
    context.currentLocation= city;
    context.locationLatitude=locationLatitude,
    context.locationLongitude=locationLongitude,

    context.date= date.format('MMM D, YYYY hh:mm A');

    context.todayDay= days[date.day()];
    context.dayTwoDay= days[dayTwoDate.day()];
    context.dayThreeDay= days[dayThreeDate.day()];
    context.dayFourDay= days[dayFourDate.day()];
    context.dayFiveDay= days[dayFiveDate.day()];
    context.daySixDay= days[daySixDate.day()];
    context.daySevenDay= days[daySevenDate.day()];

    context.todayDayShort= daysShort[date.day()];
    context.dayTwoDayShort= daysShort[dayTwoDate.day()];
    context.dayThreeDayShort= daysShort[dayThreeDate.day()];

    context.todayDate= date.format('D');
    context.dayTwoDate= dayTwoDate.format('D');
    context.dayThreeDate= dayThreeDate.format('D');
    context.dayFourDate= dayFourDate.format('D');
    context.dayFiveDate= dayFiveDate.format('D');
    context.daySixDate= daySixDate.format('D');
    context.daySevenDate= daySevenDate.format('D');

    var currentUnits = getTempUnits();

    context.todayTemperature= Math.round(weather_data.current.temp)+ currentUnits;
    context.dayTwoTemperature= weather_data.daily[1].temp.day + currentUnits;
    context.dayThreeTemperature= weather_data.daily[2].temp.day + currentUnits;
    context.dayFourTemperature= weather_data.daily[3].temp.day + currentUnits;
    context.dayFiveTemperature= weather_data.daily[4].temp.day + currentUnits;
    context.daySixTemperature= weather_data.daily[5].temp.day + currentUnits;
    context.daySevenTemperature= weather_data.daily[6].temp.day + currentUnits;

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
