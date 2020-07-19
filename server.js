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

//static files
app.use(express.static('client'));

//handlbars
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.listen(port, () => console.log(`Listening on port ${port}`));

/*******************************************
 * handle: for homepage load
 *
 * parameters: none
 *
 * returns: renders index page
 ********************************************/

app.get("/", function(req, res){
  var weather_data;
  let apiKey = '364c1375ab235fcd9a6e5c2a537733e6';
  let city = 'Portland, OR';
  let lat = 45.5202;
  let lon = -122.676483;
  let units = 'imperial'
  let url = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
  request(url, function (err, response, body) {
    if(err){
      console.log('error:', error);
    }
    else {
      weather_data = JSON.parse(body)
      // console.log(weather_data.daily);
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

      todayTemperature: Math.round(weather_data.current.temp),
      dayTwoTemperature: weather_data.daily[1].temp.day,
      dayThreeTemperature: weather_data.daily[2].temp.day,
      dayFourTemperature: weather_data.daily[3].temp.day,
      dayFiveTemperature: weather_data.daily[4].temp.day,
      daySixTemperature: weather_data.daily[5].temp.day,
      daySevenTemperature: weather_data.daily[6].temp.day,

    	current_high_temp: Math.round(weather_data.daily[0].temp.max),
    	current_low_temp: Math.round(weather_data.daily[0].temp.min),
    	dayTwo_high_temp : Math.round(weather_data.daily[1].temp.max),
    	dayTwo_low_temp: Math.round(weather_data.daily[1].temp.min),
    	dayThree_high_temp: Math.round(weather_data.daily[2].temp.max),
    	dayThree_low_temp: Math.round(weather_data.daily[2].temp.min),
    	dayFour_high_temp: Math.round(weather_data.daily[3].temp.max),
    	dayFour_low_temp: Math.round(weather_data.daily[3].temp.min),
    	dayFive_high_temp: Math.round(weather_data.daily[4].temp.max),
    	dayFive_low_temp: Math.round(weather_data.daily[4].temp.min),
    	daySix_high_temp: Math.round(weather_data.daily[5].temp.max),
    	daySix_low_temp: Math.round(weather_data.daily[5].temp.min),
    	daySeven_high_temp: Math.round(weather_data.daily[6].temp.max),
    	daySeven_low_temp: Math.round(weather_data.daily[6].temp.min),

      todayPrecipitation: '--%',
      dayTwoPrecipitation: '--%',
      dayThreePrecipitation: '--%',
      dayFourPrecipitation: '--%',
      dayFivePrecipitation: '--%',
      daySixPrecipitation: '--%',
      daySevenPrecipitation: '--%',

	todayHumidity: weather_data.current.humidity,

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
      courseName: 'CS 361 - Summer 2020'

    });
  });
});
