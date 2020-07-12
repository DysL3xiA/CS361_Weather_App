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
    let timestamp = weather_data.daily[0].dt;
    let a = new Date(timestamp*1000);
    console.log(a);
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let dayNum = a.getDay();
    let dayArray = [];
    let currentDayOfWeek = days[dayNum]
    dayArray.push(currentDayOfWeek);

    for (let i = 1; i < 7; i++){
      dayNum++;
      dayNum %= 7;
      dayArray.push(days[dayNum]);
    }

    res.render("index", {
      currentLocation: '---',

      time: '7:00 PM',
      date: '7/10/20',
      timeZone: 'PST',

      todayDay: `${dayArray[0]}`,
      dayTwoDay: `${dayArray[1]}`,
      dayThreeDay: `${dayArray[2]}`,
      dayFourDay: `${dayArray[3]}`,
      dayFiveDay: `${dayArray[4]}`,
      daySixDay: `${dayArray[5]}`,
      daySevenDay: `${dayArray[6]}`,

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

      todayHumidity: '--%',
      dayTwoHumidity: '--%',
      dayThreeHumidity: '--%',
      dayFourHumidity: '--%',
      dayFiveHumidity: '--%',
      daySixHumidity: '--%',
      daySevenHumidity: '--%',

      todayWind: `${weather_data.current.wind_speed}` + ((units == 'imperial') ? ' miles/hour' : ' metres/sec'),
      dayTwoWind: `${weather_data.daily[1].wind_speed}` + ((units == 'imperial') ? ' miles/hour' : ' metres/sec'),
      dayThreeWind: `${weather_data.daily[2].wind_speed}` + ((units == 'imperial') ? ' miles/hour' : ' metres/sec'),
      dayFourWind: `${weather_data.daily[3].wind_speed}` + ((units == 'imperial') ? ' miles/hour' : ' metres/sec'),
      dayFiveWind: `${weather_data.daily[4].wind_speed}` + ((units == 'imperial') ? ' miles/hour' : ' metres/sec'),
      daySixWind: `${weather_data.daily[5].wind_speed}` + ((units == 'imperial') ? ' miles/hour' : ' metres/sec'),
      daySevenWind: `${weather_data.daily[6].wind_speed}` + ((units == 'imperial') ? ' miles/hour' : ' metres/sec'),

      todayIcon: `http://openweathermap.org/img/wn/${weather_data.current.weather[0].icon}@2x.png`,

      developer: 'Weather Avengers',
      courseName: 'CS 361 - Summer 2020'

    });
  });
});
