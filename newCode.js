function changeView(){
	var name = document.getElementById('view');
	if(name.innerHTML == "Mall Entrance View") {
		name.innerHTML ="Mall Exit View";
		document.getElementById('exit').style.display = "block";
		document.getElementById('entrance').style.display = "none";
	} else {
		name.innerHTML = "Mall Entrance View";
		document.getElementById('exit').style.display = "none";
		document.getElementById('entrance').style.display = "block";
	}
}