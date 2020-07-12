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
  let url = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
  request(url, function (err, response, body) {
    if(err){
      console.log('error:', error);
    }
    else {
      weather_data = JSON.parse(body)
    }
    res.render("index", {
      currentLocation: '---',

      time: '7:00 PM',
      date: '7/10/20',
      timeZone: 'PST',

      todayDay: 'Friday',
      dayTwoDay: 'Saturday',
      dayThreeDay: 'Sunday',
      dayFourDay: 'Monday',
      dayFiveDay: 'Tuesday',
      daySixDay: 'Wednesday',
      daySevenDay: 'Thursday',

      todayDate: '10',
      dayTwoDate: '11',
      dayThreeDate: '12',
      dayFourDate: '13',
      dayFiveDate: '14',
      daySixDate: '15',
      daySevenDate: '16',

      todayTemperature: `${weather_data.current.temp}`,
      dayTwoTemperature: '--',
      dayThreeTemperature: '--',
      dayFourTemperature: '--',
      dayFiveTemperature: '--',
      daySixTemperature: '--',
      daySevenTemperature: '--',

      todayPrecipitation: '--%',
      dayTwoPrecipitation: '--%',
      dayThreePrecipitation: '--%',
      dayFourPrecipitation: '--%',
      dayFivePrecipitation: '--%',
      daySixPrecipitation: '--%',
      daySevenPrecipitation: '--%',

      todayIcon: `http://openweathermap.org/img/wn/${weather_data.current.weather[0].icon}@2x.png`,

      developer: 'Weather Avengers',
      courseName: 'CS 361 - Summer 2020'

    });
  });
});
