let maxX = 0;
let minX = 0;
let maxY = 0;
let minY = 0;
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
var svgSelection = d3.select("#chartcontainer").append("svg").attr("id", "chart")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
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
			coordinates: [
				{x: 43, y: 99},
				{x: 21, y: 65},
				{x: 25, y: 79},
				{x: 42, y: 75},
				{x: 57, y: 87},
				{x: 59, y: 81}
			],
			edit: false,
			linearization: [],
			visibility: true,
		};
	},
	methods: {
		deleteRow: function(item, index){
			this.coordinates.splice(index, 1);
			this.update();
		},
		addRow: function(){
			this.coordinates.push({x: null, y: null});
			this.detectLinearization.push({x: null, y: null});
		},
	},
	computed: {
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
		// css: function(){
		// 	return {color: colormap[this.colorcode].code};
		// }
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
	template: `
	<div id="coordinatelist">
		<table>
			<tr>
			</tr>
			<tr v-for="(item, index) in coordinates">
				<td v-on:click="edit=true">
					<div v-show="edit==false">{{+parseFloat(detectLinearization[index].x).toFixed(4)}}</div>
					<input v-show="edit" v-model.number="item.x" v-on:keyup.esc="edit=false" type="number" v-focus>
				</td>
				<td v-on:click="edit=true">
					<div v-show="edit==false">{{+parseFloat(detectLinearization[index].y).toFixed(4)}}</div>
					<input v-show="edit" v-model.number="item.y" v-on:keyup.esc="edit=false" type="number">
				</td>
				<td v-show="index != 0" class="delete" v-on:click="deleteRow(item, index)">
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
	</div>
	`,
	mounted: function(){
		console.log([colormap[this.colorcode].color, colormap[this.colorcode].code]);
	}
});
/*			<th v-html="changeX"></th>
				<th v-html="changeY"></th>
*/
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
				this.graphs.push(this.graphs.length);
			}
		},
	},
	computed: {
		color: function(){
			return LightenDarkenColor(colormap[this.isActive].code, 120);
		}
	}
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