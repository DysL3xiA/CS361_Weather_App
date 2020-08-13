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

    context.current_high_temp= Math.round(weather_data.daily[0].temp.max) + currentUnits;
    context.current_low_temp= Math.round(weather_data.daily[0].temp.min) + currentUnits;
    context.dayTwo_high_temp = Math.round(weather_data.daily[1].temp.max) + currentUnits;
    context.dayTwo_low_temp= Math.round(weather_data.daily[1].temp.min) + currentUnits;
    context.dayThree_high_temp= Math.round(weather_data.daily[2].temp.max) + currentUnits;
    context.dayThree_low_temp= Math.round(weather_data.daily[2].temp.min) + currentUnits;
    context.dayFour_high_temp= Math.round(weather_data.daily[3].temp.max) + currentUnits;
    context.dayFour_low_temp= Math.round(weather_data.daily[3].temp.min) + currentUnits;
    context.dayFive_high_temp= Math.round(weather_data.daily[4].temp.max) + currentUnits;
    context.dayFive_low_temp= Math.round(weather_data.daily[4].temp.min) + currentUnits;
    context.daySix_high_temp= Math.round(weather_data.daily[5].temp.max) + currentUnits;
    context.daySix_low_temp= Math.round(weather_data.daily[5].temp.min) + currentUnits;
    context.daySeven_high_temp= Math.round(weather_data.daily[6].temp.max) + currentUnits;
    context.daySeven_low_temp= Math.round(weather_data.daily[6].temp.min) + currentUnits;

    context.current_day_temp= Math.round(weather_data.daily[0].temp.day) + currentUnits,
  	context.current_night_temp= Math.round(weather_data.daily[0].temp.night) + currentUnits,
  	context.dayTwo_day_temp= Math.round(weather_data.daily[1].temp.day) + currentUnits,
  	context.dayTwo_night_temp= Math.round(weather_data.daily[1].temp.night) + currentUnits,
  	context.dayThree_day_temp= Math.round(weather_data.daily[2].temp.day) + currentUnits,
  	context.dayThree_night_temp= Math.round(weather_data.daily[2].temp.night) + currentUnits,
  	context.dayFour_day_temp= Math.round(weather_data.daily[3].temp.day) + currentUnits,
  	context.dayFour_night_temp= Math.round(weather_data.daily[3].temp.night) + currentUnits,
  	context.dayFive_day_temp= Math.round(weather_data.daily[4].temp.day) + currentUnits,
  	context.dayFive_night_temp= Math.round(weather_data.daily[4].temp.night) + currentUnits,
  	context.daySix_day_temp= Math.round(weather_data.daily[5].temp.day) + currentUnits,
  	context.daySix_night_temp= Math.round(weather_data.daily[5].temp.night) + currentUnits,
  	context.daySeven_day_temp= Math.round(weather_data.daily[6].temp.day) + currentUnits,
  	context.daySeven_night_temp= Math.round(weather_data.daily[6].temp.night) + currentUnits,

    context.today_pressure= weather_data.current.pressure;
    context.dayTwo_pressure= weather_data.daily[1].pressure;
    context.dayThree_pressure= weather_data.daily[2].pressure
    context.dayFour_pressure= weather_data.daily[3].pressure;
    context.dayFive_pressure= weather_data.daily[4].pressure
    context.daySix_pressure= weather_data.daily[5].pressure;
    context.daySeven_pressure= weather_data.daily[6].pressure;

    context.todayHumidity= weather_data.current.humidity;
    context.dayTwoHumidity= weather_data.daily[1].humidity;
    context.dayThreeHumidity= weather_data.daily[2].humidity;
    context.dayFourHumidity= weather_data.daily[3].humidity;
    context.dayFiveHumidity= weather_data.daily[4].humidity;
    context.daySixHumidity= weather_data.daily[5].humidity;
    context.daySevenHumidity= weather_data.daily[6].humidity;

    var currWindUnits = getWindUnits();

    context.todayWind= Math.round(weather_data.current.wind_speed) + currWindUnits;
    context.dayTwoWind= Math.round(weather_data.daily[1].wind_speed) + currWindUnits;
    context.dayThreeWind= Math.round(weather_data.daily[2].wind_speed) + currWindUnits;
    context.dayFourWind= Math.round(weather_data.daily[3].wind_speed) + currWindUnits;
    context.dayFiveWind= Math.round(weather_data.daily[4].wind_speed) + currWindUnits;
    context.daySixWind=Math.round(weather_data.daily[5].wind_speed) + currWindUnits;
    context.daySevenWind= Math.round(weather_data.daily[6].wind_speed) + currWindUnits;

    context.todayIcon= weather_data.current.weather[0].icon;
    context.dayTwoIcon= weather_data.daily[1].weather[0].icon;
    context.dayThreeIcon= weather_data.daily[2].weather[0].icon;
    context.dayFourIcon= weather_data.daily[3].weather[0].icon;
    context.dayFiveIcon= weather_data.daily[4].weather[0].icon;
    context.daySixIcon= weather_data.daily[5].weather[0].icon;
    context.daySevenIcon= weather_data.daily[6].weather[0].icon;

    context.todaySunrise= weather_data.current.sunrise,
    context.dayTwoSunrise= weather_data.daily[1].sunrise,
    context.dayThreeSunrise= weather_data.daily[2].sunrise,
    context.dayFourSunrise= weather_data.daily[3].sunrise,
    context.dayFiveSunrise= weather_data.daily[4].sunrise,
    context.daySixSunrise= weather_data.daily[5].sunrise,
    context.daySevenSunrise= weather_data.daily[6].sunrise,

    context.todaySunset= weather_data.current.sunset,
    context.dayTwoSunset= weather_data.daily[1].sunset,
    context.dayThreeSunset= weather_data.daily[2].sunset,
    context.dayFourSunset= weather_data.daily[3].sunset,
    context.dayFiveSunset= weather_data.daily[4].sunset,
    context.daySixSunset= weather_data.daily[5].sunset,
    context.daySevenSunset= weather_data.daily[6].sunset,

    context.search= search;
    context.currentSearch= currentSearch;

    res.render("index",context);
  });
});
