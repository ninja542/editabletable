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
let radius = 4;
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
const store = new Vuex.Store({
	state: {
		xShift: 0,
		yShift: 0,
		coordinates: [
			[
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
			],
			[
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
			],
			[],
			[],
			[],
			[]
		],
		lincoords: [
			[],
			[],
			[],
			[],
			[],
			[]
		]
	},
	mutations: {
		addRow (state, index){
			state.coordinates[index].push({x: null, y: null});
		},
		deleteRow (state, info){
			state.coordinates[info.item].splice(info.index, 1);
		},
		removeGraph (state, info){
			state.coordinates[info].splice(0, state.coordinates[info].length);
		},
		addGraph (state, info){
			state.coordinates[info].push(
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()},
				{x: randomnumber(), y: randomnumber()}
			);
		},
		clearGraph(state, info){
			state.coordinates[info].forEach((a)=>{a.x = 0; a.y = 0;});
		},
		copyGraph(state, info){
			store.commit('removeGraph', info.graph);
			for(let i = 0; i < state.coordinates[info.copy].length; i++){
				let x = state.coordinates[info.copy][i].x;
				let y = state.coordinates[info.copy][i].y;
				state.coordinates[info.graph].push({x: x, y: y});
			}
		},
		changelinearcoords(state, info){
			state.lincoords[info.index].splice(0, state.lincoords[info.index].length);
			for(let i = 0; i < info.graph.length; i++){
				let x = info.graph[i].x;
				let y = info.graph[i].y;
				state.lincoords[info.index].push(
					{x: x, y: y}
				);
			}
		}
	},
	getters: {
		xArray: state => {
			array = [];
			for(let i = 0; i < state.lincoords.length; i++){
				for(let j = 0; j < state.lincoords[i].length; j++){
					array.push(state.lincoords[i][j].x);
				}
			}
			return array;
		},
		yArray: state => {
			array = [];
			for(let i = 0; i < state.lincoords.length; i++){
				for(let j = 0; j < state.lincoords[i].length; j++){
					array.push(state.lincoords[i][j].y);
				}
			}
			return array;
		},
		minX: (state, getters) => {
			return d3.min(getters.xArray);
		},
		maxX: (state, getters) => {
			return d3.max(getters.xArray);
		},
		minY: (state, getters) => {
			return d3.min(getters.yArray);
		},
		maxY: (state, getters) => {
			return d3.max(getters.yArray);
		},
		xScale: (state, getters) => {
			var xMap;
			if(getters.minX<0){
				if(getters.maxX<0){
					xMap = d3.scaleLinear().domain([getters.minX, 0]).range([0, width]).nice();
					state.yShift = xMap(0);
					return xMap;
				}
				else {
					xMap = d3.scaleLinear().domain([getters.minX, getters.maxX]).range([0, width]).nice();
					state.yShift = xMap(0);
					return xMap;
				}
			}
			else{
				state.yShift = 0;
				return d3.scaleLinear().domain([0, getters.maxX]).range([0, width]).nice();
			}
		},
		yScale: (state, getters) => {
			var yMap;
			if(getters.minY<0){
				if(getters.maxY<0){
					yMap = d3.scaleLinear().domain([0, getters.minY]).range([0, height]).nice();
					state.xShift = yMap(0);
					return yMap;
				}
				else{
					yMap = d3.scaleLinear().domain([getters.maxY, getters.minY]).range([0, height]).nice();
					state.xShift = yMap(0);
					return yMap;
				}
			}
			else{
				state.xShift = height;
				return d3.scaleLinear().domain([getters.maxY, 0]).range([0, height]).nice();
			}
		}
	}
});
let axes = new Vue({
	el: "#placeholder",
	data: {
		yShift: 0,
		xShift: 0,
	},
	methods: {
		updateAxis: function(){
			// update axes
			d3.select(".x").transition().duration(500).call(d3.axisBottom(store.getters.xScale)).attr("transform", "translate(0, "+ (store.state.xShift) +")");
			d3.select(".y").transition().duration(500).call(d3.axisLeft(store.getters.yScale)).attr("transform", "translate("+store.state.yShift+", 0)");
		},
		xAxis: function(container){
			var xAxis = d3.axisBottom(store.getters.xScale);
			container.append("g")
				.attr("transform", "translate(0,"+(store.state.xShift)+")")
				.attr("class", "x axis")
				.call(xAxis);
		},
		xMap: function(d){
			scale = store.getters.xScale;
			return scale(d.x);
		},
		yAxis: function(container){
			var yAxis = d3.axisLeft(store.getters.yScale);
			container.append("g").call(yAxis)
				.attr("transform", "translate("+store.state.yShift+", 0)")
				.attr("class", "y axis");
		},
		yMap: function(d){
			scale = store.getters.yScale;
			return scale(d.y);
		}
	},
	computed: {
		xScale: function(){
			return store.getters.xScale;
		},
		yScale: function(){
			return store.getters.yScale;
		}
	},
	mounted: function(){
		scaleX = store.getters.xScale;
		scaleY = store.getters.yScale;
		this.xAxis(d3.select("#transform"));
		this.yAxis(d3.select("#transform"));
	},
	watch: {
		xScale: function(){
			this.updateAxis();
		},
		yScale: function(){
			this.updateAxis();
		}
	}
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
			edit: false,
			linearization: [],
			visibility: true,
			mode: "Physics",
			sdMode: "Population",
		};
	},
	methods: {
		deleteRow: function(item, index){
			store.commit('deleteRow', {index: index, item: this.colorcode});
		},
		addRow: function(){
			store.commit('addRow', this.colorcode);
		},
		clearAll: function(){
			store.commit('clearGraph', this.colorcode);
		},
		update: function(){
			// JOIN: select chart and bind data to circles
			let dataSelection = d3.select("#transform").selectAll("."+colormap[this.colorcode].color+".dot").data(this.detectLinearization);
			// UPDATE: old elements
			dataSelection.attr("r", 4).transition().duration(500).attr("cx", axes.xMap).attr("cy", axes.yMap).select("title").text(function(d){return "x: "+d.x+", y: "+d.y;});
			// ENTER: append new circles to new data
			dataSelection.enter().append("circle").attr("r", radius).attr("fill", colormap[this.colorcode].code).attr("cx", axes.xMap).attr("cy", axes.yMap).attr("class", colormap[this.colorcode].color+" dot")
				.append("svg:title")
					.text(function(d){return "x: "+d.x+", y: "+d.y;});
			dataSelection.exit().remove();
			// update line by calling this function
			this.updateLineReg(this.lineReg);
		},
		updateLineReg: function(lineData){
			scaleX = store.getters.xScale;
			scaleY = store.getters.yScale;
			var line = d3.line().x(function(d){return scaleX(d.x);}).y(function(d){return scaleY(d.y);});
			d3.select("#transform").transition().duration(500).select("."+colormap[this.colorcode].color+".line")
				.attr("d", line(lineData));
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
		coordinates: function(){
			return store.state.coordinates[this.colorcode];
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
		lineReg: function(){
			a = this.lineRegEq[0];
			b = this.lineRegEq[1];
			x1 = store.getters.xScale.domain()[0];
			y1 = a*x1 + b;
			x2 = store.getters.xScale.domain()[1];
			y2 = a*x2 + b;
			return [{x: x1, y: y1}, {x: x2, y: y2}];
		},
		xScale: function(){
			return store.getters.xScale;
		},
		yScale: function(){
			return store.getters.yScale;
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
	},
	watch: {
		coordinates: {
			deep: true,
			handler: function(val){
				//insert d3 chart update
				this.update();
			}
		},
		visibility: function(){
			this.visibleupdate();
		},
		detectLinearization: {
			deep: true,
			handler: function(val){
				store.commit('changelinearcoords', {graph: this.detectLinearization, index: this.colorcode});
				//insert d3 chart update
				this.update();
			}
		},
		xScale: function(){
			this.update();
		},
		yScale: function(){
			this.update();
		}
	},
	template: `<div id="coordinatelist">
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
		<button v-on:click="clearAll()">Clear All</button>
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
			<input type="radio" name="mode" :id="'Physics'+this.colorcode" v-model="mode" value="Physics" checked><label :for="'Physics'+this.colorcode">Physics Mode</label>
			<input type="radio" name="mode" :id="'Stats'+this.colorcode" v-model="mode" value="Stats"><label :for="'Stats'+this.colorcode">Statistics Mode</label>
			<h3>Equation</h3>
			<p> <span v-html="changeY"></span> = {{+parseFloat(lineRegEq[0]).toFixed(4)}}<span v-html="changeX"></span> + {{+parseFloat(lineRegEq[1]).toFixed(4)}}</p>
			<p> r = {{+parseFloat(lineRegEq[6]).toFixed(4)}}</p>
			<p> r<sup>2</sup> = {{+parseFloat(lineRegEq[7]).toFixed(4)}}</p>
			<div v-if="mode == 'Stats'">
				<h3> Statistic Info </h3>
				<p> If Sample is selected, Standard Deviation will be adjusted <br> using Bessel's correction </p>
				<input type="radio" name="sample" :id="'Population'+this.colorcode" v-model="sdMode"  value="Population" checked><label :for="'Population'+this.colorcode">Entire Population</label>
				<input type="radio" name="sample" :id="'Sample'+this.colorcode" v-model="sdMode" value="Sample"><label :for="'Sample'+this.colorcode">Sample</label>
				<p> Standard Deviation of X: {{+parseFloat(lineRegEq[5]).toFixed(4)}} </p>
				<p> Standard Deviation of Y: {{+parseFloat(lineRegEq[4]).toFixed(4)}} </p>
				<p> Mean of X = {{+parseFloat(lineRegEq[3]).toFixed(4)}}</p>
				<p> Mean of Y = {{+parseFloat(lineRegEq[2]).toFixed(4)}}</p>
			</div>
		</div>
	</div>`,
	mounted: function(){
		store.commit('changelinearcoords', {graph: this.detectLinearization, index: this.colorcode});
		d3.select("#transform").selectAll("."+colormap[this.colorcode].color+".dot").data(this.detectLinearization).enter().append("circle").attr("r", radius).attr("fill", colormap[this.colorcode].code).attr("cx", axes.xMap).attr("cy", axes.yMap).attr("class", colormap[this.colorcode].color+" dot")
			.append("svg:title")
				.text(function(d){return "x: "+d.x+", y: "+d.y;});
		scaleX = store.getters.xScale;
		scaleY = store.getters.yScale;
		var line = d3.line().x(function(d){return scaleX(d.x);}).y(function(d){return scaleY(d.y);});
		d3.select("#transform").append("path")
				.attr("d", line(this.lineReg))
				.attr("stroke-width", 1)
				.attr("stroke", colormap[this.colorcode].code)
				.attr("class", colormap[this.colorcode].color+" line");
	}
});

new Vue({
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
				store.commit("addGraph", i);
				// this.graphs.push(this.graphs.length);
			}
		},
		deleteGraph: function(item, index){
			this.graphs.splice(index, 1);
			store.commit("removeGraph", index);
			d3.selectAll("."+colormap[item].color).remove();
		},
		copyGraph: function(item){
			store.commit("copyGraph", {graph: this.isActive, copy: item});
		}
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