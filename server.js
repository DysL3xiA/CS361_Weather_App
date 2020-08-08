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

// Home Page. Set Search to User's Location
app.get("/", function(req,res){
      res.redirect("/weather");
});

//Clear Search History. Redirect to Home Page to set User's Location. Triggered by 'Clear History' button.
app.post("/clearhistory", function(req,res){
      search = new Array(" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ");
      res.redirect("/");
});

//Explicit Search. Triggered by 'Get Weather' button.
app.post("/newsearch", function(req,res){
  previousSearch = currentSearch;
  currentSearch = req.body.location;
  let googleApiKey = 'AIzaSyBBPH7E-1UWMVO13QgYk3kVfYYpqqM-oLQ';
   let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${currentSearch}&key=${googleApiKey}`;
  request(url, function (err, response, body) {
    if(err){
      console.log('error:', error);
    }
    else {
      location_data = JSON.parse(body);
      console.log(location_data.results[0]);
      console.log(location_data);
      if (location_data.status == 'OK'){
        search.unshift(currentSearch);
        search.pop();
      }
    }
    res.redirect("/weather");
  });
});

app.post("/changeMetric", function(req,res)
{
  units = req.query.metric;
  res.send(null);
});

//Main Route - Render Weather Information
app.get("/weather", function(req, res)
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

    var context={};
      context.currentLocation= city;

      context.time= date.format('h:mm:ss');
      context.date= date.format('M-D-YYYY');

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

      context.todayTemperature= Math.round(weather_data.current.temp) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayTwoTemperature= weather_data.daily[1].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayThreeTemperature= weather_data.daily[2].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayFourTemperature= weather_data.daily[3].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayFiveTemperature= weather_data.daily[4].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.daySixTemperature= weather_data.daily[5].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.daySevenTemperature= weather_data.daily[6].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C');

      context.current_high_temp= Math.round(weather_data.daily[0].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.current_low_temp= Math.round(weather_data.daily[0].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayTwo_high_temp = Math.round(weather_data.daily[1].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayTwo_low_temp= Math.round(weather_data.daily[1].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayThree_high_temp= Math.round(weather_data.daily[2].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayThree_low_temp= Math.round(weather_data.daily[2].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayFour_high_temp= Math.round(weather_data.daily[3].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayFour_low_temp= Math.round(weather_data.daily[3].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayFive_high_temp= Math.round(weather_data.daily[4].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.dayFive_low_temp= Math.round(weather_data.daily[4].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.daySix_high_temp= Math.round(weather_data.daily[5].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.daySix_low_temp= Math.round(weather_data.daily[5].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.daySeven_high_temp= Math.round(weather_data.daily[6].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C');
      context.daySeven_low_temp= Math.round(weather_data.daily[6].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C');
    
      context.current_day_temp= Math.round(weather_data.daily[0].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.current_night_temp= Math.round(weather_data.daily[0].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.dayTwo_day_temp= Math.round(weather_data.daily[1].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.dayTwo_night_temp= Math.round(weather_data.daily[1].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.dayThree_day_temp= Math.round(weather_data.daily[2].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.dayThree_night_temp= Math.round(weather_data.daily[2].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.dayFour_day_temp= Math.round(weather_data.daily[3].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.dayFour_night_temp= Math.round(weather_data.daily[3].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.dayFive_day_temp= Math.round(weather_data.daily[4].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.dayFive_night_temp= Math.round(weather_data.daily[4].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.daySix_day_temp= Math.round(weather_data.daily[5].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.daySix_night_temp= Math.round(weather_data.daily[5].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.daySeven_day_temp= Math.round(weather_data.daily[6].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	context.daySeven_night_temp= Math.round(weather_data.daily[6].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),

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

      context.todayWind= Math.round(weather_data.current.wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec');
      context.dayTwoWind= Math.round(weather_data.daily[1].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec');
      context.dayThreeWind= Math.round(weather_data.daily[2].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec');
      context.dayFourWind= Math.round(weather_data.daily[3].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec');
      context.dayFiveWind= Math.round(weather_data.daily[4].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec');
      context.daySixWind=Math.round(weather_data.daily[5].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec');
      context.daySevenWind= Math.round(weather_data.daily[6].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec');

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
