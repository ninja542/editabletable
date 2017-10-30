const margin = {top:52, right:52, bottom:52, left:52};
var height = 650 - margin.top - margin.bottom,
		width = 650 - margin.right - margin.left;
var svgSelection = d3.select("#body").append("svg").attr("id", "chart")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var app = new Vue({
	el: "#app",
	data: {
		edit: false,
		input: [
			{x: 43, y: 99},
			{x: 21, y: 65},
			{x: 25, y: 79},
			{x: 42, y: 75},
			{x: 57, y: 87},
			{x: 59, y: 81}
		],
		coordinates: [
			{x: 43, y: 99},
			{x: 21, y: 65},
			{x: 25, y: 79},
			{x: 42, y: 75},
			{x: 57, y: 87},
			{x: 59, y: 81}
		],
		xShift: 0,
		yShift: 0,
		linearization: [],
		mode: "Physics",
		sdMode: "Population"
	},
	methods: {
		update: function(){
			// JOIN select chart and bind data to circles
			var dataSelection = svgSelection.selectAll("circle").data(this.coordinates);
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
			if(this.coordinates.length == 1 && d3.min(this.yArray) == 0){
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
		detectLinearization: function(){
			// IMPORTANT: Maybe add a new coordinate system, so you can return back
			if (this.linearization.includes("Square x")==true){
				//change coordinates
				console.log("changing coords");
			}
			return this.linearization.includes("Square x") == true;
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
	watch: {
		coordinates: {
			deep: true,
			handler: function(val){
				//insert d3 chart update
				this.update();
			}
		}
	},
	computed: {
		xArray: function(){
			return this.coordinates.map(function(x){return x.x;});
		},
		yArray: function(){
			return this.coordinates.map(function(x){return x.y;});
		},
		lineRegEq: function(){
			var yArray = this.coordinates.map(function(x){return x.y;});
			var xArray = this.coordinates.map(function(x){return x.x;});
			var sumY = yArray.reduce((a,b) => a + b);
			var sumX = xArray.reduce((a,b) => a + b);
			var sumY2 = yArray.map(function(x){return Math.pow(x, 2);}).reduce((a,b) => a + b);
			var sumX2 = xArray.map(function(x){return Math.pow(x, 2);}).reduce((a,b) => a + b);
			var sumXY = yArray.reduce((a,b,i) => a + b*xArray[i], 0);
			var n = yArray.length;
			var a = ((n*sumXY)-(sumX*sumY))/((n*sumX2)-(Math.pow(sumX, 2)));
			var b = ((sumY*sumX2)-(sumX*sumXY))/(n*(sumX2)-(Math.pow(sumX, 2)));
			var yMean = sumY/yArray.length;
			var xMean = sumX/xArray.length;
			var sdY;
			var sdX;
			if (this.sdMode == "Population"){
				sdY = Math.sqrt(yArray.map(function(y){return Math.pow(y - yMean, 2);})
					.reduce((a,b) => a+b)/yArray.length);
				sdX = Math.sqrt(xArray.map(function(x){return Math.pow(x - xMean, 2);})
					.reduce((a,b) => a+b)/xArray.length);
			}
			else{
				sdY = Math.sqrt(yArray.map(function(y){return Math.pow(y - yMean, 2);})
					.reduce((a,b) => a+b)/(yArray.length-1));
				sdX = Math.sqrt(xArray.map(function(x){return Math.pow(x - xMean, 2);})
					.reduce((a,b) => a+b)/(xArray.length-1));
			}
			var r = xArray.map(function(x){return (x - xMean)/sdX;})
				.reduce((a,b,i) => a + b*yArray.map(function(y){return (y - yMean)/sdY;})[i], 0)/xArray.length;
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
		}
	},
	directives: {
	  focus: {
	    // directive definition
	    inserted: function (el) {
	      el.focus();
	    }
	  }
	}
});