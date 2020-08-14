document.addEventListener('DOMContentLoaded', createRadio());
document.getElementById('current_location').addEventListener("click", function(){
  getLocation();
  document.getElementById('current_location').submit();
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};
// dynamically create radio buttons


function updateMetric(event, id){
  let req = new XMLHttpRequest();
  const url = '/changeMetric';

  req.open('POST', url + "?metric=" + id, true);
  req.setRequestHeader('Content-Type', 'application/json');

  req.addEventListener('load',function(){
		if(req.status >= 200 && req.status < 400){
      localStorage.setItem('metric', id);
			$( "#accordion" ).load(window.location.href + " #accordion");
      $( ".weather-widget" ).load(window.location.href + " .weather-widget");
		}
    else {
			console.log("Error in network request: " + req.statusText);
		}
  });
	req.send(null);
};

function sendPosition(position) {
  let req = new XMLHttpRequest();
  const url = '/location';
  req.open('POST', url + "?latitude=" + position.coords.latitude + "&longitude=" + position.coords.longitude, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.send(null);
};

function createRadio(){
    let metricName = document.getElementsByClassName("temp")[0].innerHTML;
    metricName = metricName.charAt(metricName.length-1);
    let metricType;

    if (metricName != null || metricName != undefined){
        if (metricName === 'F'){
            localStorage.setItem('metric','imperial');
            metricType = localStorage.getItem('metric');
        }
        else if (metricName === 'C'){
            localStorage.setItem('metric','metric');
            metricType = localStorage.getItem('metric');
        }
    }

    if (metricType === null || metricType == undefined){
        localStorage.setItem('metric','imperial');
        metricType = localStorage.getItem('metric');
    }

    let radio_div = document.getElementsByClassName("radio-col")[0];
    radio_div.style.paddingBottom = "1em";
    let btn_div = document.createElement("div");
    btn_div.classList.add("btn-group", "btn-group-toggle");
    btn_div.setAttribute("data-toggle", "buttons");

    let metrics = ['imperial', 'metric'];
    let names = ['Fahrenheit', 'Celsius'];

    for (let i = 0; i < metrics.length; i++){
        let btn_label = document.createElement("label");
        btn_label.classList.add("btn", "btn-secondary", "metric-button", "btn-sm");

        let btn_input = document.createElement("input");
        btn_input.setAttribute("type", "radio");
        btn_input.setAttribute("name", "metric");
        btn_input.setAttribute("id", metrics[i]);
        btn_input.addEventListener("click", ()=>updateMetric(event, metrics[i]));
        btn_input.setAttribute("autocomplete", "off");
        btn_label.innerHTML = names[i];

        btn_div.appendChild(btn_label);
        btn_label.appendChild(btn_input);
        radio_div.appendChild(btn_div);

        if (metricType === metrics[i].toLowerCase()){
            btn_label.classList.add("active");
            btn_input.setAttribute("checked", "true");
        }
    }
};
