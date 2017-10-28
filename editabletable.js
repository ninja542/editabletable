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
		coordinates: [
			{x: 43, y: 99},
			{x: 21, y: 65},
			{x: 25, y: 79},
			{x: 42, y: 75},
			{x: 57, y: 87},
			{x: 59, y: 81}
		],
		xShift: 0,
		yShift: 0
	},
	methods: {
		update: function(){
			// JOIN select chart and bind data to circles
			var dataSelection = svgSelection.selectAll("circle").data(this.coordinates);
			// UPDATE old elements
			dataSelection.attr("r", 3).attr("fill", "black").transition().duration(500).attr("cx", this.xMap).attr("cy", this.yMap);
			// ENTER append new circles to new data
			dataSelection.enter().append("circle").attr("r", 3).attr("fill", "black").attr("cx", this.xMap).attr("cy", this.yMap);
			// EXIT delete removed data
			dataSelection.exit().remove();
			// update axes
			svgSelection.select(".x").transition().duration(500).call(d3.axisBottom(this.xScale())).attr("transform", "translate(0, "+ (this.xShift) +")");
			svgSelection.select(".y").transition().duration(500).call(d3.axisLeft(this.yScale())).attr("transform", "translate("+this.yShift+", 0)");
		},
		addRow: function(){
			this.coordinates.push({x: null, y: null});
		},
		deleteRow: function(item){
			this.coordinates.splice(this.coordinates.indexOf(item), 1);
			this.update();
		},
		xScale: function(){
			// var xArray = this.coordinates.map(function(x){return x.x;});
			if(d3.min(this.xArray)<0){
				var xMap = d3.scaleLinear().domain(d3.extent(this.xArray)).range([0, width]).nice();
				this.yShift = xMap(0);
				return xMap;
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
			// var yArray = this.coordinates.map(function(x){return x.y;});
			if(d3.min(this.yArray)<0){
				var yMap = d3.scaleLinear().domain([d3.max(this.yArray), d3.min(this.yArray)]).range([0, height]).nice();
				this.xShift = yMap(0);
				return yMap;
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
		drawLineReg: function(){
			scaleX = this.xScale();
			scaleY = this.yScale();
		}
	},
	mounted: function(){
		svgSelection.selectAll("circle").data(this.coordinates).enter().append("circle").attr("r", 3).attr("fill", "black").attr("cx", this.xMap).attr("cy", this.yMap);
		this.xAxis(svgSelection);
		this.yAxis(svgSelection);
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
		lineReg: function(){
			var yArray = this.coordinates.map(function(x){return x.y;});
			var xArray = this.coordinates.map(function(x){return x.x;});
			var sumY = this.yArray.reduce((a,b) => a + b);
			var sumX = this.xArray.reduce((a,b) => a + b);
			var sumY2 = this.yArray.map(function(x){return Math.pow(x, 2);}).reduce((a,b) => a + b);
			var sumX2 = this.xArray.map(function(x){return Math.pow(x, 2);}).reduce((a,b) => a + b);
			var sumXY = this.yArray.reduce((a,b,i) => a + b*xArray[i], 0);
			var n = this.yArray.length;
			var a = ((n*sumXY)-(sumX*sumY))/((n*sumX2)-(Math.pow(sumX, 2)));
			var b = ((sumY*sumX2)-(sumX*sumXY))/(n*(sumX2)-(Math.pow(sumX, 2)));
			return {"a": a, "b": b};
		}
	}
});