// generate random numbers 0 - 100
function randomnumber(){
	return Math.floor(Math.random() * 100);
}
// color object
let colormap = [
	{color: "black", code:"#000000"},
	{color: "purple", code: "#AE81FF"},
	{color: "blue", code: "#66D9EF"},
	{color: "orange", code: "#FD971F"},
	{color: "pink", code: "#F92672"},
	{color: "green", code: "#A6E22E"}
];
// defines margin lengths
const margin = {top:5, right:20, bottom:60, left:85};
var height = 630 - margin.top - margin.bottom,
		width = 650 - margin.right - margin.left;
// makes a svg group within the svg, and transforms it so that the graph is centered with the correct margins
d3.select("#chartcontainer").append("svg").attr("id", "chart")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr("id", "transform");
let axes = new Vue({
	el: "#placeholder",
	data: {
		minX: 0,
		maxX: 100,
		minY: 0,
		maxY: 100,
		yShift: 0,
		xShift: 0,
		xArray: [
			[0],
			[1],
			[2],
			[3],
			[4],
			[5],
		]
	},
	methods: {
		updateAxis: function(){
			// update axes
			d3.select(".x").transition().duration(500).call(d3.axisBottom(this.xScale())).attr("transform", "translate(0, "+ (this.xShift) +")");
			d3.select(".y").transition().duration(500).call(d3.axisLeft(this.yScale())).attr("transform", "translate("+this.yShift+", 0)");
			// EXIT: delete removed data
			// dataSelection.exit().remove();
		},
		xScale: function(){
			var xMap;
			// if there is a negative value
			if(this.minX<0){
				// if all values of x are negative
				if(this.maxX<0){
					// maps domain of the smallest number to 0 to the range of the graph width
					xMap = d3.scaleLinear().domain([this.minX, 0]).range([0, width]).nice(); // nice means that the numbers are nice
					// the y axis is shifted to the left where 0 is. xMap is a function that takes the value 0 and turns it into a pixel value relative to the svg coordinate space, where (0,0) is in the top left corner
					this.yShift = xMap(0);
					return xMap;
				}
				// if there are both positive and negative x values
				else {
					// similar to above, d3.extent is just the array from the minimum to maximum x value
					xMap = d3.scaleLinear().domain([this.minX, this.maxX]).range([0, width]).nice();
					// yShift is still needed, as we have negative x values
					this.yShift = xMap(0);
					return xMap;
				}
			}
			// all x values are positive
			else{
				this.yShift = 0;
				return d3.scaleLinear().domain([0, this.maxX]).range([0, width]).nice();
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
			// if(this.detectLinearization.length == 1 && this.minY == 0){
			// 	this.xShift = height;
			// 	return d3.scaleLinear().domain([1, 0]).range([0, height]).nice();
			// }
			if(this.minY<0){
				if(this.maxY<0){
					yMap = d3.scaleLinear().domain([0, this.minY]).range([0, height]).nice();
					this.xShift = yMap(0);
					return yMap;
				}
				else{
					yMap = d3.scaleLinear().domain([this.maxY, this.minY]).range([0, height]).nice();
					this.xShift = yMap(0);
					return yMap;
				}
			}
			else{
				this.xShift = height;
				return d3.scaleLinear().domain([this.maxY, 0]).range([0, height]).nice();
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
		updateMinMax: function(array){
			console.log(array);
		},
		addXArray: function(array){

		}
	},
	mounted: function(){
		scaleX = this.xScale();
		scaleY = this.yScale();
		this.xAxis(d3.select("#transform"));
		this.yAxis(d3.select("#transform"));
		// d3.select("#transform").append("path").attr("stroke-width", 1).attr("stroke", "black");
	},
	watch: {
		minX: function(){
			this.updateAxis();
		},
		maxX: function(){
			this.updateAxis();
		},
		minY: function(){
			this.updateAxis();
			this.updateAxis();
		},
		maxY: function(){
			this.updateAxis();
			this.updateAxis();
		},
	},
});

new Vue({
	el: "#chartcontainer",
	data: {
		edit: false,
		xLabel: "x axis (units)",
		yLabel: "y axis (units)"
	}
});
// new component definition
Vue.component('coordinate-list', {
	props: ["colorcode"],
	data: function(){
		return {
			/*coordinates: [
				{x: 43, y: 99},
				{x: 21, y: 65},
				{x: 25, y: 79},
				{x: 42, y: 75},
				{x: 57, y: 87},
				{x: 59, y: 81}
			],*/
			coordinates: [
				{x: 100, y: 100},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
			],
			edit: false,
			linearization: [],
			visibility: true,
			mode: "Physics",
			sdMode: "Population",
		};
	},
	methods: {
		deleteRow: function(item, index){
			if(index > 1){
				this.coordinates.splice(index, 1);
				// this.$emit("update-axis");
			}
		},
		addRow: function(){
			this.coordinates.push({x: null, y: null});
			this.detectLinearization.push({x: null, y: null});
		},
		update: function(){
			// JOIN: select chart and bind data to circles
			let dataSelection = d3.select("#transform").selectAll("."+colormap[this.colorcode].color+".dot").data(this.detectLinearization);
			// UPDATE: old elements
			dataSelection.attr("r", 3).transition().duration(500).attr("cx", axes.xMap).attr("cy", axes.yMap);
			// ENTER: append new circles to new data
			dataSelection.enter().append("circle").attr("r", 3).attr("fill", colormap[this.colorcode].color).attr("cx", axes.xMap).attr("cy", axes.yMap).attr("class", colormap[this.colorcode].color+" dot");
			dataSelection.exit().remove();
			// update line by calling this function
			// this.updateLineReg(this.lineReg);
		},
		visibleupdate: function(){
			if(this.visibility == false){
				d3.selectAll("."+colormap[this.colorcode].color).attr("visibility", "hidden");
			}
			else if(this.visibility == true){
				d3.selectAll("."+colormap[this.colorcode].color).attr("visibility", "visible");
			}
		}
	},
	computed: {
		xArray: function(){
			return this.detectLinearization.map(item => item.x);
		},
		yArray: function(){
			return this.detectLinearization.map(item => item.y);
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
					obj.x = 1 / i.x;
					obj.y = i.y;
					return obj;
				});
			}
			if (this.linearization.includes("1/y")==true){
				newCoords = newCoords.map((i) => {
					var obj = {};
					obj.x = i.x;
					obj.y = 1 / i.y;
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
			var a = ((n * sumXY) - (sumX * sumY)) / ((n * sumX2) - (Math.pow(sumX, 2)));
			var b = ((sumY * sumX2) - (sumX * sumXY)) / (n * (sumX2) - (Math.pow(sumX, 2)));
			var yMean = sumY / yArray.length;
			var xMean = sumX / xArray.length;
			var sdY;
			var sdX;
			if (this.sdMode == "Population"){
				sdY = Math.sqrt(yArray.map(y => Math.pow(y - yMean, 2))
					.reduce((a,b) => a + b) / yArray.length);
				sdX = Math.sqrt(xArray.map(x => Math.pow(x - xMean, 2))
					.reduce((a,b) => a + b) / xArray.length);
			}
			else{
				sdY = Math.sqrt(yArray.map(y => Math.pow(y - yMean, 2))
					.reduce((a,b) => a + b) / (yArray.length - 1));
				sdX = Math.sqrt(xArray.map(function(x){return Math.pow(x - xMean, 2);})
					.reduce((a,b) => a + b) / (xArray.length - 1));
			}
			var r = xArray.map(function(x){return (x - xMean)/Math.sqrt(xArray.map(x => Math.pow(x - xMean, 2))
				.reduce((a,b) => a + b) / xArray.length);})
				.reduce((a,b,i) => a + b * yArray.map(function(y){return (y - yMean)/Math.sqrt(yArray.map(function(y){return Math.pow(y - yMean, 2);}).reduce((a,b) => a + b) / yArray.length);})[i], 0) / xArray.length;
			return [a, b, yMean, xMean, sdY, sdX, r, Math.pow(r, 2)];
		},
	},
	directives: {
		focus: {
			// directive definition
			// when a new element is inserted into the DOM, the browser focus is placed on the element to ease faster data entering
			inserted: function (el) {
				el.focus();
			}
		}
	},
	watch: {
		coordinates: {
			deep: true,
			handler: function(val){
				//insert d3 chart update
				this.update();
				// this.$emit("update-minmax", this.detectLinearization);
				// this.$emit("update-axis");
			}
		},
		visibility: function(){
			this.visibleupdate();
		},
		detectLinearization: {
			deep: true,
			handler: function(val){
				//insert d3 chart update
				this.update();
			}
		}
	},
	template: `
	<div id="coordinatelist">
		<div @click="visibility = false" v-show="visibility == true" class="add">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path d="M0 0h24v24H0z" fill="none"/>
					<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
			</svg>
		</div>
		<div @click="visibility = true" v-show="visibility == false" class="add">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			    <path d="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z" fill="none"/>
			    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
			</svg>
		</div>
		<table>
			<th v-html="changeX"></th>
			<th v-html="changeY"></th>
			<tr>
			</tr>
			<tr v-for="(item, index) in coordinates">
				<td v-on:click="edit=true">
					<div v-show="edit==false">{{+parseFloat(detectLinearization[index].x).toFixed(4)}}</div>
					<input v-show="edit" v-model.number="item.x" v-on:keyup.esc="edit=false" type="number" v-focus @keyup.enter="addRow">
				</td>
				<td v-on:click="edit=true">
					<div v-show="edit==false">{{+parseFloat(detectLinearization[index].y).toFixed(4)}}</div>
					<input v-show="edit" v-model.number="item.y" v-on:keyup.esc="edit=false" type="number" @keyup.enter="addRow">
				</td>
				<td v-show="index > 1" class="delete" v-on:click="deleteRow(item, index)">
					<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
						<path d="M0 0h24v24H0z" fill="none"></path>
					</svg>
				</td>
			</tr>
		</table>
		<button v-show="edit" v-on:click="addRow"> Add row </button>
		<button v-show="edit==false" v-on:click="edit = true">Edit</button>
		<button id="done" v-show="edit" v-on:click="edit = false">Done</button>
		<h3>Linearization Buttons</h3>
		<input type="checkbox" :id="'squarex'+this.colorcode" v-model="linearization" value="Square x"><label :for="'squarex'+this.colorcode">Square x</label>
		<input type="checkbox" :id="'squarey'+this.colorcode" v-model="linearization" value="Square y"><label :for="'squarey'+this.colorcode">Square y</label>
		<input type="checkbox" :id="'1/x'+this.colorcode" v-model="linearization" value="1/x"><label :for="'1/x'+this.colorcode">1/x</label>
		<input type="checkbox" :id="'1/y'+this.colorcode" v-model="linearization" value="1/y"><label :for="'1/y'+this.colorcode">1/y</label>
		<h3>Equation</h3>
		<p> <span v-html="changeY"></span> = {{+parseFloat(lineRegEq[0]).toFixed(4)}}<span v-html="changeX"></span> + {{+parseFloat(lineRegEq[1]).toFixed(4)}}</p>
		<p> r = {{+parseFloat(lineRegEq[6]).toFixed(4)}}</p>
		<p> r<sup>2</sup> = {{+parseFloat(lineRegEq[7]).toFixed(4)}}</p>
		<div>
			<h3> Mode </h3>
			<input type="radio" name="mode" id="Physics" v-model="mode" value="Physics" checked><label for="Physics">Physics Mode</label>
			<input type="radio" name="mode" id="Stats" v-model="mode" value="Stats"><label for="Stats">Statistics Mode</label>
			<h3>Equation</h3>
			<p> <span v-html="changeY"></span> = {{+parseFloat(lineRegEq[0]).toFixed(4)}}<span v-html="changeX"></span> + {{+parseFloat(lineRegEq[1]).toFixed(4)}}</p>
			<p> r = {{+parseFloat(lineRegEq[6]).toFixed(4)}}</p>
			<p> r<sup>2</sup> = {{+parseFloat(lineRegEq[7]).toFixed(4)}}</p>
			<div v-if="mode == 'Stats'">
				<h3> Statistic Info </h3>
				<p> If Sample is selected, Standard Deviation will be adjusted <br> using Bessel's correction </p>
				<input type="radio" name="sample" id="Population" v-model="sdMode"  value="Population" checked><label for="Population">Entire Population</label>
				<input type="radio" name="sample" id="Sample" v-model="sdMode" value="Sample"><label for="Sample">Sample</label>
				<p> Standard Deviation of X: {{+parseFloat(lineRegEq[5]).toFixed(4)}} </p>
				<p> Standard Deviation of Y: {{+parseFloat(lineRegEq[4]).toFixed(4)}} </p>
				<p> Mean of X = {{+parseFloat(lineRegEq[3]).toFixed(4)}}</p>
				<p> Mean of Y = {{+parseFloat(lineRegEq[2]).toFixed(4)}}</p>
			</div>
		</div>
	</div>
	`,
	mounted: function(){
		d3.select("#transform").selectAll("."+colormap[this.colorcode].color+".dot").data(this.detectLinearization).enter().append("circle").attr("r", 3).attr("fill", colormap[this.colorcode].code).attr("cx", axes.xMap).attr("cy", axes.yMap).attr("class", colormap[this.colorcode].color+" dot");
	}
});

let app = new Vue({
	el: '#app',
	data: {
		graphs: [0, 1],
		isActive: 0,
		colormap: [
			{color: "black", code:"#000000"},
			{color: "purple", code: "#AE81FF"},
			{color: "blue", code: "#66D9EF"},
			{color: "orange", code: "#FD971F"},
			{color: "pink", code: "#F92672"},
			{color: "green", code: "#A6E22E"}
		],
	},
	methods: {
		addGraph: function(){
			if(this.graphs.length < colormap.length){
				let i = 0;
				while(this.graphs[i]==i){
					i++;
				}
				this.graphs.splice(i, 0, i);
				// this.graphs.push(this.graphs.length);
			}
		},
		deleteGraph: function(item, index){
			if (index == this.graphs.length - 1){
				this.graphs.splice(index, 1);
			}
			else {
				this.graphs.splice(index, 1);
				// this.graphs = this.graphs.map((item, index)=> index);
			}
			// this.isActive = index - 2;
			d3.selectAll("."+colormap[item].color+".dot").remove();
		},
	},
	computed: {
		color: function(){
			return LightenDarkenColor(colormap[this.isActive].code, 120);
		},
	},
});
function LightenDarkenColor(col, amt) {
	var usePound = false;

	if (col[0] == "#") {
			col = col.slice(1);
			usePound = true;
	}

	var num = parseInt(col,16);

	var r = (num >> 16) + amt;

	if (r > 255) r = 255;
	else if  (r < 0) r = 0;

	var b = ((num >> 8) & 0x00FF) + amt;

	if (b > 255) b = 255;
	else if  (b < 0) b = 0;

	var g = (num & 0x0000FF) + amt;

	if (g > 255) g = 255;
	else if (g < 0) g = 0;

	return (usePound?"#":"") + String("000000" + (g | (b << 8) | (r << 16)).toString(16)).slice(-6);
}