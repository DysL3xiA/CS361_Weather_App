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

    res.render("index", {
      currentLocation: city,

      time: date.format('h:mm:ss'),
      date: date.format('M-D-YYYY'),

      todayDay: days[date.day()],
      dayTwoDay: days[dayTwoDate.day()],
      dayThreeDay: days[dayThreeDate.day()],
      dayFourDay: days[dayFourDate.day()],
      dayFiveDay: days[dayFiveDate.day()],
      daySixDay: days[daySixDate.day()],
      daySevenDay: days[daySevenDate.day()],

      todayDayShort: daysShort[date.day()],
      dayTwoDayShort: daysShort[dayTwoDate.day()],
      dayThreeDayShort: daysShort[dayThreeDate.day()],

      todayDate: date.format('D'),
      dayTwoDate: dayTwoDate.format('D'),
      dayThreeDate: dayThreeDate.format('D'),
      dayFourDate: dayFourDate.format('D'),
      dayFiveDate: dayFiveDate.format('D'),
      daySixDate: daySixDate.format('D'),
      daySevenDate: daySevenDate.format('D'),

      todayTemperature: Math.round(weather_data.current.temp) + '°' + ((units == 'imperial') ? ' F' : ' C'),
      dayTwoTemperature: weather_data.daily[1].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C'),
      dayThreeTemperature: weather_data.daily[2].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C'),
      dayFourTemperature: weather_data.daily[3].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C'),
      dayFiveTemperature: weather_data.daily[4].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C'),
      daySixTemperature: weather_data.daily[5].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C'),
      daySevenTemperature: weather_data.daily[6].temp.day + '°' + ((units == 'imperial') ? ' F' : ' C'),

    	current_high_temp: Math.round(weather_data.daily[0].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	current_low_temp: Math.round(weather_data.daily[0].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayTwo_high_temp : Math.round(weather_data.daily[1].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayTwo_low_temp: Math.round(weather_data.daily[1].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayThree_high_temp: Math.round(weather_data.daily[2].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayThree_low_temp: Math.round(weather_data.daily[2].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayFour_high_temp: Math.round(weather_data.daily[3].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayFour_low_temp: Math.round(weather_data.daily[3].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayFive_high_temp: Math.round(weather_data.daily[4].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayFive_low_temp: Math.round(weather_data.daily[4].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	daySix_high_temp: Math.round(weather_data.daily[5].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	daySix_low_temp: Math.round(weather_data.daily[5].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	daySeven_high_temp: Math.round(weather_data.daily[6].temp.max) + '°' + ((units == 'imperial') ? ' F' : ' C'),
      daySeven_low_temp: Math.round(weather_data.daily[6].temp.min) + '°' + ((units == 'imperial') ? ' F' : ' C'),
      
      current_day_temp: Math.round(weather_data.daily[0].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	current_night_temp: Math.round(weather_data.daily[0].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayTwo_day_temp : Math.round(weather_data.daily[1].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayTwo_night_temp: Math.round(weather_data.daily[1].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayThree_day_temp: Math.round(weather_data.daily[2].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayThree_night_temp: Math.round(weather_data.daily[2].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayFour_day_temp: Math.round(weather_data.daily[3].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayFour_night_temp: Math.round(weather_data.daily[3].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayFive_day_temp: Math.round(weather_data.daily[4].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	dayFive_night_temp: Math.round(weather_data.daily[4].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	daySix_day_temp: Math.round(weather_data.daily[5].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	daySix_night_temp: Math.round(weather_data.daily[5].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	daySeven_day_temp: Math.round(weather_data.daily[6].temp.day) + '°' + ((units == 'imperial') ? ' F' : ' C'),
    	daySeven_night_temp: Math.round(weather_data.daily[6].temp.night) + '°' + ((units == 'imperial') ? ' F' : ' C'),

      todaySunrise: weather_data.current.sunrise,
	    dayTwoSunrise: weather_data.daily[1].sunrise,
      dayThreeSunrise: weather_data.daily[2].sunrise,
      dayFourSunrise: weather_data.daily[3].sunrise,
      dayFiveSunrise: weather_data.daily[4].sunrise,
      daySixSunrise: weather_data.daily[5].sunrise,
      daySevenSunrise: weather_data.daily[6].sunrise,

      todaySunset: weather_data.current.sunset,
	    dayTwoSunset: weather_data.daily[1].sunset,
      dayThreeSunset: weather_data.daily[2].sunset,
      dayFourSunset: weather_data.daily[3].sunset,
      dayFiveSunset: weather_data.daily[4].sunset,
      daySixSunset: weather_data.daily[5].sunset,
      daySevenSunset: weather_data.daily[6].sunset,
      
	    today_pressure: weather_data.current.pressure,
	    dayTwo_pressure: weather_data.daily[1].pressure,
	    dayThree_pressure: weather_data.daily[2].pressure,
	    dayFour_pressure: weather_data.daily[3].pressure,
	    dayFive_pressure: weather_data.daily[4].pressure,
	    daySix_pressure: weather_data.daily[5].pressure,
	    daySeven_pressure: weather_data.daily[6].pressure,

	    todayHumidity: weather_data.current.humidity,
	    dayTwoHumidity: weather_data.daily[1].humidity,
      dayThreeHumidity: weather_data.daily[2].humidity,
      dayFourHumidity: weather_data.daily[3].humidity,
      dayFiveHumidity: weather_data.daily[4].humidity,
      daySixHumidity: weather_data.daily[5].humidity,
      daySevenHumidity: weather_data.daily[6].humidity,

      todayWind: Math.round(weather_data.current.wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec'),
      dayTwoWind: Math.round(weather_data.daily[1].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec'),
      dayThreeWind: Math.round(weather_data.daily[2].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec'),
      dayFourWind: Math.round(weather_data.daily[3].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec'),
      dayFiveWind: Math.round(weather_data.daily[4].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec'),
      daySixWind: Math.round(weather_data.daily[5].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec'),
      daySevenWind: Math.round(weather_data.daily[6].wind_speed) + ((units == 'imperial') ? ' mph' : ' metres/sec'),

      todayIcon: weather_data.current.weather[0].icon,
      dayTwoIcon: weather_data.daily[1].weather[0].icon,
      dayThreeIcon: weather_data.daily[2].weather[0].icon,
      dayFourIcon: weather_data.daily[3].weather[0].icon,
      dayFiveIcon: weather_data.daily[4].weather[0].icon,
      daySixIcon: weather_data.daily[5].weather[0].icon,

      daySevenIcon: weather_data.daily[6].weather[0].icon,

      developer: 'Weather Avengers',
      courseName: 'CS 361 - Summer 2020',
      search: search,
      currentSearch: currentSearch
    });
  });
});
