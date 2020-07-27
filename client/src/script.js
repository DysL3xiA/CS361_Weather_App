document.addEventListener('DOMContentLoaded', createRadio());

// dynamically create radio buttons

function updateMetric(event, id){
    let req = new XMLHttpRequest();
    const url = '/changeMetric';

    req.open('POST', url + "?metric=" + id, true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load',function(){
		if(req.status >= 200 && req.status < 400){
            localStorage.setItem('metric', id);
			location.reload();
		} else {
			console.log("Error in network request: " + req.statusText);
		}});
	req.send(null);
};

function createRadio(activeMetric){
    let metricType = localStorage.getItem('metric');
    if (metricType === null){
        localStorage.setItem('metric','imperial');
    }

    let radio_div = document.getElementsByClassName("radio-col")[0];
    let btn_div = document.createElement("div");
    btn_div.classList.add("btn-group", "btn-group-toggle");
    btn_div.setAttribute("data-toggle", "buttons");

    let metrics = ['imperial', 'metric'];
    let names = ['Farenheit', 'Celsius'];

    for (let i = 0; i < metrics.length; i++){
        let btn_label = document.createElement("label");
        btn_label.classList.add("btn", "btn-secondary", "metric-button");

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
}