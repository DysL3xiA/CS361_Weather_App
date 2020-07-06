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
  res.render("index");
});