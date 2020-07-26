function updateMetric(event, id){
    let req = new XMLHttpRequest();
    const url = '/changeMetric';

    req.open('POST', url + "?metric=" + id, true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load',function(){
		if(req.status >= 200 && req.status < 400){
			location.reload();
		} else {
			console.log("Error in network request: " + req.statusText);
		}});
	req.send(null);
};