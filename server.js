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
  let city = 'portland';
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

    // get day of week
    // let timestamp = weather_data.daily[0].dt;
    // let a = new Date(timestamp*1000);
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    // let dayNum = a.getDay();
    // let dayArray = [];
    // let currentDayOfWeek = days[dayNum]
    // dayArray.push(currentDayOfWeek);
    //
    // for (let i = 1; i < 7; i++){
    //   dayNum++;
    //   dayNum %= 7;
    //   dayArray.push(days[dayNum]);
    // }

    var date = new Date(weather_data.current.dt*1000);
    var dayTwoDate = new Date(weather_data.daily[1].dt*1000);
    var dayThreeDate = new Date(weather_data.daily[2].dt*1000);
    var dayFourDate = new Date(weather_data.daily[3].dt*1000);
    var dayFiveDate = new Date(weather_data.daily[4].dt*1000);
    var daySixDate = new Date(weather_data.daily[5].dt*1000);
    var daySevenDate = new Date(weather_data.daily[6].dt*1000);

    res.render("index", {
      currentLocation: '---',

      time: date.toLocaleTimeString('en-US'),
      date: date.toDateString(),
      timeZone: weather_data.timezone,

      todayDay: days[date.getDay()],
      dayTwoDay: days[dayTwoDate.getDay()],
      dayThreeDay: days[dayThreeDate.getDay()],
      dayFourDay: days[dayFourDate.getDay()],
      dayFiveDay: days[dayFiveDate.getDay()],
      daySixDay: days[daySixDate.getDay()],
      daySevenDay: days[daySevenDate.getDay()],

      todayDate: date.getDate(),
      dayTwoDate: dayTwoDate.getDate(),
      dayThreeDate: dayThreeDate.getDate(),
      dayFourDate: dayFourDate.getDate(),
      dayFiveDate: dayFiveDate.getDate(),
      daySixDate: daySixDate.getDate(),
      daySevenDate: daySevenDate.getDate(),

      todayTemperature: weather_data.current.temp,
      dayTwoTemperature: weather_data.daily[1].temp.day,
      dayThreeTemperature: weather_data.daily[2].temp.day,
      dayFourTemperature: weather_data.daily[3].temp.day,
      dayFiveTemperature: weather_data.daily[4].temp.day,
      daySixTemperature: weather_data.daily[5].temp.day,
      daySevenTemperature: weather_data.daily[6].temp.day,

      todayPrecipitation: '--%',
      dayTwoPrecipitation: '--%',
      dayThreePrecipitation: '--%',
      dayFourPrecipitation: '--%',
      dayFivePrecipitation: '--%',
      daySixPrecipitation: '--%',
      daySevenPrecipitation: '--%',

      todayHumidity: '--%',
      dayTwoHumidity: '--%',
      dayThreeHumidity: '--%',
      dayFourHumidity: '--%',
      dayFiveHumidity: '--%',
      daySixHumidity: '--%',
      daySevenHumidity: '--%',

      todayWind: weather_data.current.wind_speed + ((units == 'imperial') ? 'mph' : ' metres/sec'),
      dayTwoWind: weather_data.daily[1].wind_speed + ((units == 'imperial') ? 'mph' : ' metres/sec'),
      dayThreeWind: weather_data.daily[2].wind_speed + ((units == 'imperial') ? 'mph' : ' metres/sec'),
      dayFourWind: weather_data.daily[3].wind_speed + ((units == 'imperial') ? 'mph' : ' metres/sec'),
      dayFiveWind: weather_data.daily[4].wind_speed + ((units == 'imperial') ? 'mph' : ' metres/sec'),
      daySixWind: weather_data.daily[5].wind_speed + ((units == 'imperial') ? 'mph' : ' metres/sec'),
      daySevenWind: weather_data.daily[6].wind_speed + ((units == 'imperial') ? ' mph' : ' metres/sec'),

      todayIcon: `http://openweathermap.org/img/wn/${weather_data.current.weather[0].icon}@2x.png`,

      developer: 'Weather Avengers',
      courseName: 'CS 361 - Summer 2020'

    });
  });
});
