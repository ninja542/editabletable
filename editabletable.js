new Vue({
	el: "#chartcontainer",
	data: {
		edit: false,
		xLabel: "x axis (units)",
		yLabel: "y axis (units)"
	}
});
// defines margin lengths
const margin = {top:5, right:20, bottom:60, left:85};
var height = 630 - margin.top - margin.bottom,
		width = 650 - margin.right - margin.left;
// makes a svg group within the svg, and transforms it so that the graph is centered with the correct margins
var svgSelection = d3.select("#chartcontainer").append("svg").attr("id", "chart")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// declares Vue App
new Vue({
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
		// shifting the x and y axes for negative values
		xShift: 0,
		yShift: 0,
		// declares what types of linearization are being applied
		linearization: [],
		// settings for conditionally rendering specific data
		mode: "Physics",
		sdMode: "Population",
	},
	// methods are functions defined in the Vue object
	methods: {
		update: function(){
			// JOIN: select chart and bind data to circles
			var dataSelection = svgSelection.selectAll("circle").data(this.detectLinearization);
			// UPDATE: old elements
			dataSelection.attr("r", 3).attr("fill", "black").transition().duration(500).attr("cx", this.xMap).attr("cy", this.yMap);
			// ENTER: append new circles to new data
			dataSelection.enter().append("circle").attr("r", 3).attr("fill", "black").attr("cx", this.xMap).attr("cy", this.yMap);
			// EXIT: delete removed data
			dataSelection.exit().remove();
			// update line by calling this function
			this.updateLineReg(this.lineReg);
			// update axes
			svgSelection.select(".x").transition().duration(500).call(d3.axisBottom(this.xScale())).attr("transform", "translate(0, "+ (this.xShift) +")");
			svgSelection.select(".y").transition().duration(500).call(d3.axisLeft(this.yScale())).attr("transform", "translate("+this.yShift+", 0)");
		},
		// adds an extra row. Called when "Add Row" button is pressed
		addRow: function(){
			this.coordinates.push({x: null, y: null});
			// focus();
		},
		// similar to addRow
		deleteRow: function(item){
			// splicing removes from the index of the item that is going to deleted. 1 means that only one index gets deleted.
			this.coordinates.splice(this.coordinates.indexOf(item), 1);
			this.update();
		},
		// sets the x axis scale, the conditionals test whether there are negative values
		xScale: function(){
			var xMap;
			// if there is a negative value
			if(d3.min(this.xArray)<0){
				// if all values of x are negative
				if(d3.max(this.xArray)<0){
					// maps domain of the smallest number to 0 to the range of the graph width
					xMap = d3.scaleLinear().domain([d3.min(this.xArray), 0]).range([0, width]).nice(); // nice means that the numbers are nice
					// the y axis is shifted to the left where 0 is. xMap is a function that takes the value 0 and turns it into a pixel value relative to the svg coordinate space, where (0,0) is in the top left corner
					this.yShift = xMap(0);
					return xMap;
				}
				// if there are both positive and negative x values
				else {
					// similar to above, d3.extent is just the array from the minimum to maximum x value
					xMap = d3.scaleLinear().domain(d3.extent(this.xArray)).range([0, width]).nice();
					// yShift is still needed, as we have negative x values
					this.yShift = xMap(0);
					return xMap;
				}
			}
			// all x values are positive
			else{
				this.yShift = 0;
				return d3.scaleLinear().domain([0, d3.max(this.xArray)]).range([0, width]).nice();
			}
		},
		// this forms the xAxis
		xAxis: function(container){
			var xAxis = d3.axisBottom(this.xScale());
			container.append("g")
				// translates the x axis calculated from yScale up and down
				.attr("transform", "translate(0,"+(this.xShift)+")")
				.attr("class", "x axis")
				.call(xAxis);
		},
		// function to convert values, calls xScale to use the correct scale at all times
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
		// updates the line of best fit by grabbing the new scales and selecting the line and replacing with new point data
		updateLineReg: function(lineData){
			scaleX = this.xScale();
			scaleY = this.yScale();
			var line = d3.line().x(function(d){return scaleX(d.x);}).y(function(d){return scaleY(d.y);});
			svgSelection.transition().duration(500).select(".line")
				.attr("d", line(lineData));
		},
		clearAll: function(){
			this.coordinates.forEach((a)=>{a.x=0;a.y=0;});
		}
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
			// var sumY2 = yArray.map(x =>  Math.pow(x, 2)).reduce((a,b) => a + b);
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
			newCoords = this.coordinates.map((i) => {
				var obj = {};
				obj.x = i.x;
				obj.y = i.y;
				return obj;
			});
			if (this.linearization.includes("Square x")==true){
				// change coordinates
				newCoords = newCoords.map((i) => {
					var obj = {};
					obj.x = Math.pow(i.x, 2);
					obj.y = i.y;
					return obj;
				});
			}
			if (this.linearization.includes("Square y")==true){
				// tests if anything else was manipulated
				newCoords = newCoords.map((i) => {
					var obj = {};
					obj.x = i.x;
					obj.y = Math.pow(i.y, 2);
					return obj;
				});
			}
			if (this.linearization.includes("1/x")==true){
				// takes reciprocal of x
				newCoords = newCoords.map((i) => {
					var obj = {};
					obj.x = 1/i.x;
					obj.y = i.y;
					return obj;
				});
			}
			if (this.linearization.includes("1/y")==true){
				newCoords = newCoords.map((i) => {
					var obj = {};
					obj.x = i.x;
					obj.y = 1/i.y;
					return obj;
				});
			}
			return newCoords;
		},
		changeX: function(){
			var x = "x";
			if (this.linearization.includes("Square x") == true){
				x = x + "<sup>2</sup>";
			}
			if (this.linearization.includes("1/x") == true){
				x = "(<sup>1</sup>&frasl;<sub>" + x + "</sub>)";
			}
			return x;
		},
		changeY: function(){
			var y = "y";
			if (this.linearization.includes("Square y") == true){
				y = y + "<sup>2</sup>";
			}
			if (this.linearization.includes("1/y") == true){
				y = "(<sup>1</sup>&frasl;<sub>" + y + "</sub>)";
			}
			return y;
		}
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
		}
	},
	directives: {
	  focus: {
	    // directive definition
	    // when a new element is inserted into the DOM, the browser focus is placed on the element to ease faster data entering
	    inserted: function (el) {
	      el.focus();
	    }
	  }
	}
});