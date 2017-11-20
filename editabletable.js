// defines margin lengths
const margin = {top:52, right:52, bottom:52, left:52};
var height = 650 - margin.top - margin.bottom,
		width = 650 - margin.right - margin.left;
// makes a svg group within the svg, and transforms it so that the graph is centered with the correct margins
var svgSelection = d3.select("#body").append("svg").attr("id", "chart")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// declares Vue App
var app = new Vue({
	el: "#app",
	data: {
		// whether the table is being edited or not
		edit: false,
		// this stores the coordinates, this is the initial values, but when the user updates coordinates, the vue object also updates
		coordinates: [
			{x: 43, y: 99},
			{x: 21, y: 65},
			{x: 25, y: 79},
			{x: 42, y: 75},
			{x: 57, y: 87},
			{x: 59, y: 81}
		],
		table2coord: [
			{x: 0, y: 0},
			{x: 1, y: 1}
		],
		isActive: 1,
		xShift: 0,
		yShift: 0,
		// settings for conditionally rendering specific data
		linearization2: [],
		mode: "Physics",
		sdMode: "Population"
	},
	// methods are functions defined in the Vue object
	methods: {
		update: function(){
			// JOIN select chart and bind data to circles
			var dataSelection = svgSelection.selectAll("circle").data(this.detectLinearization);
			// UPDATE old elements
			dataSelection.attr("r", 3).attr("fill", "black").transition().duration(500).attr("cx", this.xMap).attr("cy", this.yMap);
			// ENTER append new circles to new data
			dataSelection.enter().append("circle").attr("r", 3).attr("fill", "black").attr("cx", this.xMap).attr("cy", this.yMap);
			// update line
			this.updateLineReg(this.lineReg);
			// update axes
			svgSelection.select(".x").transition().duration(500).call(d3.axisBottom(this.xScale())).attr("transform", "translate(0, "+ (this.xShift) +")");
			svgSelection.select(".y").transition().duration(500).call(d3.axisLeft(this.yScale())).attr("transform", "translate("+this.yShift+", 0)");
			// EXIT delete removed data
			dataSelection.exit().remove();
		},
		addRow: function(){
			this.coordinates.push({x: null, y: null});
			// focus();
		},
		deleteRow: function(item){
			this.coordinates.splice(this.coordinates.indexOf(item), 1);
			this.update();
		},
		xScale: function(){
			var xMap;
			if(d3.max(this.xArray) == 0 && d3.min(this.xArray) == 0){
				this.yShift = 0;
				return d3.scaleLinear().domain([0, 1]).range([0, width]).nice();
			}
			if(d3.min(this.xArray)<0){
				if(d3.max(this.xArray)<0){
					xMap = d3.scaleLinear().domain([d3.min(this.xArray), 0]).range([0, width]).nice();
					this.yShift = xMap(0);
					return xMap;
				}
				else {
					xMap = d3.scaleLinear().domain(d3.extent(this.xArray)).range([0, width]).nice();
					this.yShift = xMap(0);
					return xMap;
				}
			}
			else{
				this.yShift = 0;
				return d3.scaleLinear().domain([0, d3.max(this.xArray)]).range([0, width]).nice();
			}
		},
		xAxis: function(container){
			var xAxis = d3.axisBottom(this.xScale());
			container.append("g")
				.attr("transform", "translate(0,"+(this.xShift)+")")
				.attr("class", "x axis")
				.call(xAxis);
		},
		xMap: function(d){
			scale = this.xScale();
			return scale(d.x);
		},
		yScale: function(){
			var yMap;
			if(this.detectLinearization.length == 1 && d3.min(this.yArray) == 0){
				this.xShift = height;
				return d3.scaleLinear().domain([1, 0]).range([0, height]).nice();
			}
			if(d3.min(this.yArray)<0){
				if(d3.max(this.yArray)<0){
					yMap = d3.scaleLinear().domain([0, d3.min(this.yArray)]).range([0, height]).nice();
					this.xShift = yMap(0);
					return yMap;
				}
				else{
					yMap = d3.scaleLinear().domain([d3.max(this.yArray), d3.min(this.yArray)]).range([0, height]).nice();
					this.xShift = yMap(0);
					return yMap;
				}
			}
			else{
				this.xShift = height;
				return d3.scaleLinear().domain([d3.max(this.yArray), 0]).range([0, height]).nice();
			}
		},
		yAxis: function(container){
			var yAxis = d3.axisLeft(this.yScale());
			container.append("g").call(yAxis)
				.attr("transform", "translate("+this.yShift+", 0)")
				.attr("class", "y axis");
		},
		yMap: function(d){
			scale = this.yScale();
			return scale(d.y);
		},
		updateLineReg: function(lineData){
			scaleX = this.xScale();
			scaleY = this.yScale();
			var line = d3.line().x(function(d){return scaleX(d.x);}).y(function(d){return scaleY(d.y);});
			svgSelection.transition().duration(500).select(".line")
				.attr("d", line(lineData));
		},
	},
	mounted: function(){
		svgSelection.selectAll("circle").data(this.coordinates).enter().append("circle").attr("r", 3).attr("fill", "black").attr("cx", this.xMap).attr("cy", this.yMap);
		this.xAxis(svgSelection);
		this.yAxis(svgSelection);
		scaleX = this.xScale();
		scaleY = this.yScale();
		var line = d3.line().x(function(d){return scaleX(d.x);}).y(function(d){return scaleY(d.y);});
		// draws the line
		svgSelection.append("path")
				.attr("d", line(this.lineReg))
				.attr("stroke-width", 1)
				.attr("stroke", "black")
				.attr("class", "line");
	},
	computed: {
		xArray: function(){
			return this.detectLinearization.map(x => x.x);
		},
		yArray: function(){
			return this.detectLinearization.map(x => x.y);
		},
		lineRegEq: function(){
			var yArray = this.detectLinearization.map(x => x.y);
			var xArray = this.detectLinearization.map(x => x.x);
			var sumY = yArray.reduce((a,b) => a + b);
			var sumX = xArray.reduce((a,b) => a + b);
			var sumY2 = yArray.map(x =>  Math.pow(x, 2)).reduce((a,b) => a + b);
			var sumX2 = xArray.map(x =>  Math.pow(x, 2)).reduce((a,b) => a + b);
			var sumXY = yArray.reduce((a,b,i) => a + b*xArray[i], 0);
			var n = yArray.length;
			var a = ((n*sumXY)-(sumX*sumY))/((n*sumX2)-(Math.pow(sumX, 2)));
			var b = ((sumY*sumX2)-(sumX*sumXY))/(n*(sumX2)-(Math.pow(sumX, 2)));
			var yMean = sumY/yArray.length;
			var xMean = sumX/xArray.length;
			var sdY;
			var sdX;
			if (this.sdMode == "Population"){
				sdY = Math.sqrt(yArray.map(y => Math.pow(y - yMean, 2))
					.reduce((a,b) => a+b)/yArray.length);
				sdX = Math.sqrt(xArray.map(x => Math.pow(x - xMean, 2))
					.reduce((a,b) => a+b)/xArray.length);
			}
			else{
				sdY = Math.sqrt(yArray.map(y => Math.pow(y - yMean, 2))
					.reduce((a,b) => a+b)/(yArray.length-1));
				sdX = Math.sqrt(xArray.map(function(x){return Math.pow(x - xMean, 2);})
					.reduce((a,b) => a+b)/(xArray.length-1));
			}
			var r = xArray.map(function(x){return (x - xMean)/Math.sqrt(xArray.map(x => Math.pow(x - xMean, 2)).reduce((a,b) => a+b)/xArray.length);})
				.reduce((a,b,i) => a + b*yArray.map(function(y){return (y - yMean)/Math.sqrt(yArray.map(function(y){return Math.pow(y - yMean, 2);}).reduce((a,b) => a+b)/yArray.length);})[i], 0)/xArray.length;
			return [a, b, yMean, xMean, sdY, sdX, r, Math.pow(r, 2)];
		},
		lineReg: function(){
			a = this.lineRegEq[0];
			b = this.lineRegEq[1];
			x1 = this.xScale().domain()[0];
			y1 = a*x1 + b;
			x2 = this.xScale().domain()[1];
			y2 = a*x2 + b;
			return [{x: x1, y: y1}, {x: x2, y: y2}];
		},
		detectLinearization: function(){
			// IMPORTANT: Maybe add a new coordinate system, so you can return back
			var newCoords = [];
			if (this.linearization.includes("Square x")==true){
				// change coordinates
				if (newCoords.length == 0){
					for (var i=0; i<this.coordinates.length; i++){
						// square x coordinates
						newCoords.push({x: Math.pow(this.coordinates[i].x, 2), y: this.coordinates[i].y});
					}
				}
				else {
					for (var a=0; a<this.coordinates.length; a++){
						newCoords[a].x = Math.pow(newCoords[a], 2);
					}
				}
			}
			if (this.linearization.includes("Square y")==true){
				// tests if anything else was manipulated
				if (newCoords.length==0){
					// adds x points and squares y points
					for (var j=0; j<this.coordinates.length; j++){
						newCoords.push({x: this.coordinates[j].x, y: Math.pow(this.coordinates[j].y, 2)});
					}
				}
				else {
					// changes y points to sqaure
					for (var k=0; k<this.coordinates.length; k++){
						newCoords[k].y = Math.pow(newCoords[k].y, 2);
					}
				}
			}
			if (this.linearization.includes("1/x")==true){
				// tests if anything else was manipulated
				if (newCoords.length==0){
					// adds x points and squares y points
					for (var l=0; l<this.coordinates.length; l++){
						newCoords.push({x: 1/(this.coordinates[l].x), y: this.coordinates[l].y});
					}
				}
				else {
					// takes reciprocal of y
					for (var m=0; m<this.coordinates.length; m++){
						newCoords[m].x = (1/newCoords[m].x);
					}
				}
			}
			if (this.linearization.includes("1/y")==true){
				// tests if anything else was manipulated
				if (newCoords.length==0){
					// adds x points and squares y points
					for (var b=0; b<this.coordinates.length; b++){
						newCoords.push({x: this.coordinates[b].x, y: (1/this.coordinates[b].y)});
					}
				}
				else {
					// takes reciprocal of y
					for (var c=0; c<this.coordinates.length; c++){
						newCoords[c].y = (1/newCoords[c].y);
					}
				}
			}
			else if (this.linearization.length==0){
				return this.coordinates;
			}
			return newCoords;
		},
		changeX: function(){
			if (this.linearization.includes("Square x")==true){
				if (this.linearization.includes("1/x")==true){
					return "(<sup>1</sup>&frasl;<sub>x<sup>2</sup></sub>)";
				}
				else {
					return "(x<sup>2</sup>)";
				}
			}
			else if (this.linearization.includes("1/x")==true){
				return "(<sup>1</sup>&frasl;<sub>x</sub>)";
			}
			else{
				return "x";
			}
		},
		changeY: function(){
			if (this.linearization.includes("Square y")==true){
				if (this.linearization.includes("1/y")==true){
					return "(<sup>1</sup>&frasl;<sub>y<sup>2</sup></sub>)";
				}
				else {
					return "(y<sup>2</sup>)";
				}
			}
			else if (this.linearization.includes("1/y")==true){
				return "(<sup>1</sup>&frasl;<sub>y</sub>)";
			}
			else{
				return "y";
			}
		},
		detectLinearization2: function(){
			// IMPORTANT: Maybe add a new coordinate system, so you can return back
			var newCoords = [];
			if (this.linearization2.includes("Square x")==true){
				// change coordinates
				if (newCoords.length == 0){
					for (var i=0; i<this.table2coord.length; i++){
						// square x coordinates
						newCoords.push({x: Math.pow(this.table2coord[i].x, 2), y: this.table2coord[i].y});
					}
				}
				else {
					for (var a=0; a<this.table2coord.length; a++){
						newCoords[a].x = Math.pow(newCoords[a], 2);
					}
				}
			}
			if (this.linearization2.includes("Square y")==true){
				// tests if anything else was manipulated
				if (newCoords.length==0){
					// adds x points and squares y points
					for (var j=0; j<this.table2coord.length; j++){
						newCoords.push({x: this.table2coord[j].x, y: Math.pow(this.table2coord[j].y, 2)});
					}
				}
				else {
					// changes y points to sqaure
					for (var k=0; k<this.table2coord.length; k++){
						newCoords[k].y = Math.pow(newCoords[k].y, 2);
					}
				}
			}
			if (this.linearization2.includes("1/x")==true){
				// tests if anything else was manipulated
				if (newCoords.length==0){
					// adds x points and squares y points
					for (var l=0; l<this.table2coord.length; l++){
						newCoords.push({x: 1/(this.table2coord[l].x), y: this.table2coord[l].y});
					}
				}
				else {
					// takes reciprocal of y
					for (var m=0; m<this.table2coord.length; m++){
						newCoords[m].x = (1/newCoords[m].x);
					}
				}
			}
			if (this.linearization2.includes("1/y")==true){
				// tests if anything else was manipulated
				if (newCoords.length==0){
					// adds x points and squares y points
					for (var b=0; b<this.table2coord.length; b++){
						newCoords.push({x: this.table2coord[b].x, y: (1/this.table2coord[b].y)});
					}
				}
				else {
					// takes reciprocal of y
					for (var c=0; c<this.table2coord.length; c++){
						newCoords[c].y = (1/newCoords[c].y);
					}
				}
			}
			else if (this.linearization2.length==0){
				return this.table2coord;
			}
			return newCoords;
		},
	},
	watch: {
		coordinates: {
			deep: true,
			handler: function(val){
				//insert d3 chart update
				this.update();
			}
		},
		detectLinearization: {
			deep: true,
			handler: function(val){
				//insert d3 chart update
				this.update();
			}
		},
	},
	directives: {
	  focus: {
	    // directive definition
	    inserted: function (el) {
	      el.focus();
	    }
	  }
	},
	filters: {
		linearizeX: function(value){
		}
	}
});