var xx = 0;
var yy = 9;
var zz = -6;

var maxX = 10;
var maxY = 10;
var maxZ = 6;
var maxHeightValue = 1000;
var canvasWidth = 1280;
var canvasHeight = 1280;

var keywords = [];

var recs = {};
recs['ios'] = 0;
recs['size'] = 0;
recs['fee'] = 0;
recs['btc'] = 0;
recs['sts'] = 0;
recs['ios2'] = Number.MAX_SAFE_INTEGER;
recs['size2'] = Number.MAX_SAFE_INTEGER;
recs['fee2'] = Number.MAX_SAFE_INTEGER;
recs['btc2'] = Number.MAX_SAFE_INTEGER;
recs['sts2'] = Number.MAX_SAFE_INTEGER;

function TX (payload) {
	if (payload.double_spend) {
		alert('ds');
		console.log(payload);
	}

	this.hash = payload.txid;
	this.num_ios = payload.input_count + payload.output_count;
	this.version = payload.version;
	this.locktime = payload.locktime;
	this.coinbase = payload.coinbase;
	this.base_size = Math.ceil(Math.sqrt(this.num_ios));
	this.ios = [];
	this.size = payload.size;
	this.vsize = payload.vsize;
	this.fee_int = payload.fee_int;
	this.fee_spb = parseFloat(payload.fee_size);
	this.input_amount_int = payload.input_amount_int;
	var i,ioX,ioY;
	var ioSize = (this.num_ios <= maxX * maxY ? 1 : maxX / this.base_size);
	keywords = [];

	for (i = 0; i < payload.inputs.length; i++) {
		ioX = maxX - ioSize - (i % this.base_size) * ioSize;
		ioY = maxY - ioSize - Math.floor(i / this.base_size) * ioSize;
		this.ios.push(new IO(0, payload.inputs[i], ioSize, ioSize, ioX, ioY));
		keywords.push(payload.inputs[i].type);
	}
	for (i = 0; i < payload.outputs.length; i++) {
		ioX = maxX - ioSize - ((payload.inputs.length + i) % this.base_size) * ioSize;
		ioY = maxY - ioSize - Math.floor((payload.inputs.length + i) / this.base_size) * ioSize;
		this.ios.push(new IO(1, payload.outputs[i], ioSize, ioSize, ioX, ioY));
		keywords.push(payload.outputs[i].type);
	}
	
	if (this.locktime) keywords.push('locktime');
	if (this.coinbase) keywords.push('coinbase');
	
	this.checkRecs = function () {
		if (this.num_ios <= recs['ios2']) {
			recs['ios2'] = this.ios.length;
			this.addToRecs('IOs2');
		}
		if (this.size <= recs['size2']) {
			recs['size2'] = this.size;
			this.addToRecs('Size2');
		}
		if (this.fee_spb <= recs['fee2']) {
			recs['fee2'] = this.fee_spb;
			this.addToRecs('Fee2');
		}
		if (this.input_amount_int <= recs['btc2']) {
			recs['btc2'] = this.input_amount_int;
			this.addToRecs('Btc2');
		}

		if (this.num_ios >= recs['ios']) {
			recs['ios'] = this.ios.length;
			this.addToRecs('IOs');
		}
		if (this.size >= recs['size']) {
			recs['size'] = this.size;
			this.addToRecs('Size');
		}
		if (this.fee_spb >= recs['fee']) {
			recs['fee'] = this.fee_spb;
			this.addToRecs('Fee');
		}
		if (this.input_amount_int >= recs['btc']) {
			recs['btc'] = this.input_amount_int;
			this.addToRecs('Btc');
		}

		let aux = '';
		let cnt = 0;
		for (let i = 0; i < this.ios.length; i++) {
			if (aux.indexOf(this.ios[i].type) === -1) {
				cnt++;
				aux = aux+this.ios[i].type;
			}
		}
		if (cnt >= recs['sts']) {
			recs['sts'] = cnt;
			this.addToRecs('Sts');
		}
		if (cnt <= recs['sts2']) {
			recs['sts2'] = cnt;
			this.addToRecs('Sts2');
		}
	}
	
	this.addToRecs = function (type) {
		let aux = document.getElementById('recs' + type);
		while (aux.childNodes.length >= 4) {
			aux.removeChild(aux.childNodes[1]);
		}
		let oldCanvas = document.getElementById(this.hash);
		let p1 = oldCanvas.parentNode.parentNode.cloneNode(true);
		aux.appendChild(p1);
		let newCanvas = aux.childNodes[aux.childNodes.length-1].firstChild.firstChild;
		newCanvas.id = type + '_' + newCanvas.id;
		var context = newCanvas.getContext('2d');
		newCanvas.width = oldCanvas.width;
		newCanvas.height = oldCanvas.height;
		context.drawImage(oldCanvas, 0, 0);
	}

	
	this.draw = function () {
		var Shape = Isomer.Shape;
		var Point = Isomer.Point;
		var Color = Isomer.Color;
		var cnv = createCanvas(this.hash, [this.input_amount_int, this.fee_spb, this.size, this.vsize], canvasWidth, canvasHeight);
		var iso = new Isomer(cnv);
		
		/*
		for (i = 0; i < this.version; i++) {
			iso.add(Shape.Prism(Point(xx+9,yy-9,zz+i*0.25+(i*0.25)), 1, 1, 0.25), new Color(40,40,40));
		}
		*/
		
		
		var sizecap = 170000;
		if (this.vsize != this.size) {
			iso.add(Shape.Prism(Point(xx+9,yy-9,zz), 1, 1, (this.vsize > sizecap ? sizecap : this.vsize)/10240), new Color(140,140,140));
			iso.add(Shape.Prism(Point(xx+9,yy-9,zz + (this.vsize > sizecap ? sizecap : this.vsize)/10240), 1, 1, (this.size - this.vsize)/10240), new Color(40,40,40));
		} else {
			iso.add(Shape.Prism(Point(xx+9,yy-9,zz), 1, 1, (this.size > sizecap ? sizecap : this.size)/10240), new Color(40,40,40));
		}
		
		
		if (this.locktime) {
			iso.add(Shape.Cylinder(Point(xx+8.5,yy-7.5,zz), 0.5, 24, 0.25), new Color(30,30,30));
			iso.add(Shape.Prism(Point(xx+8.75,yy-7.25,zz), 0.3, 0.1, 0.01), new Color(140,140,140));
			iso.add(Shape.Prism(Point(xx+8.75,yy-7.25,zz), 0.1, 0.3, 0.01), new Color(140,140,140));
		}
		
		//iso.add(Shape.Prism(Point(xx+1,yy-1,zz), 1, 1, this.fee_int * 17 / 100000000), new Color(100,100,parseInt(this.fee_int * 255 / 100000000)));
		//iso.add(Shape.Prism(Point(xx,yy,zz), 1, 1, this.size * 17 / 500000), new Color(10,10,parseFloat(this.size * 255 / 500000)));
		var feecap = 3400;
		if (this.fee_spb > 0) {
			for (i = 0; i * 100 < this.fee_spb && i * 100 < feecap; i++) {
				iso.add(Shape.Cylinder(Point(xx,yy,zz +0.5+i*0.25+i*0.25), 0.5, 24, 0.25), new Color(100,100,0));
			}			
		}
		
		if (this.coinbase) {
			iso.add(Octahedron(new Point(xx+18, yy, 1)), new Color(255,128,0));
		}
		
		for (i = 0; i < this.ios.length; i++) {
		 this.ios[i].draw(iso);
		}

	}
}

function checkLinks() {
	var list = document.getElementsByClassName('btn btn-sm btn-outline-secondary');
	for (var i = 0; i < list.length; i++) {
		if (list[i].value == "TX") {
			if (!list[i].onclick) {
				list[i].onclick = function(){
					window.open("https://www.smartbit.com.au/tx/" + this.id.split('_')[1], "_blank");
				};
			}
		} else if (list[i].value == "IMG") {
			if (!list[i].onclick) {
				list[i].onclick = function(){
					var win = window.open('', "_blank");
					var id = this.id.split('_')[1];
					var cnv = this.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling;
					win.document.body.innerHTML = '<p>'+id+'</p><img src="' + cnv.toDataURL() + '" style="background:#222" id="' + id + '">';
				};
			}
		}
	}
}

function Octahedron(origin) {
	var center = origin.translate(0.5, 0.5, 0.5);
	var faces = [];

	var upperTriangle = new Isomer.Path([
		origin.translate(0, 0, 0.5),
		origin.translate(0.5, 0.5, 1),
		origin.translate(0, 1, 0.5)
	]);

	var lowerTriangle = new Isomer.Path([
		origin.translate(0, 0, 0.5),
		origin.translate(0, 1, 0.5),
		origin.translate(0.5, 0.5, 0)
	]);

	for (var i = 0; i < 4; i++) {
		faces.push(upperTriangle.rotateZ(center, i * Math.PI / 2));
		faces.push(lowerTriangle.rotateZ(center, i * Math.PI / 2));
	}
	return new Isomer.Shape(faces).scale(center, Math.sqrt(2)/2, Math.sqrt(2)/2, 1);
}

function IO (dir, data, w, h, x, y, temp) {

	this.type = data.type;
	this.height = data.value * maxZ / maxHeightValue;
	this.color = getColorByScriptType(dir, this.type);
	this.w = w;
	this.h = h;
	this.x = x;
	this.y = y;
	this.num_wit = 0;
	
	if (data.witness) {
		this.num_wit = data.witness.length;
		keywords.push('witness');
	}
	
	if (this.height > maxZ) {
		this.height = maxZ;
	}
	
	this.draw = function (iso) {
		var Shape = Isomer.Shape;
		var Point = Isomer.Point;
		var Color = Isomer.Color;
		var offset = this.w/2;
		var p1 = Point(this.x, this.y);
		var p2 = Point(offset + this.x, offset + this.y);
		switch(this.type) {
			case "nonstandard":						 iso.add(Shape.Cylinder(p2, this.w/2, 9, this.height), this.color); break;
			case "nulldata":								iso.add(Shape.Cylinder(p2, this.w/2, 4, this.height), this.color); break;
			case "multisig":								iso.add(Shape.Cylinder(p2, this.w/2, 5, this.height), this.color); break;
			case "pubkey":									iso.add(Shape.Cylinder(p2, this.w/2, 6, this.height), this.color); break;
			case "pubkeyhash":							iso.add(Shape.Prism(p1, this.w, this.h, this.height), this.color); break;
			case "scripthash":							iso.add(Shape.Cylinder(p2, this.w/2, 24, this.height), this.color); break;
			case "witness_v0_keyhash":			iso.add(Shape.Cylinder(p2, this.w/2, 7, this.height), this.color); break;
			case "witness_v0_scripthash":	 iso.add(Shape.Cylinder(p2, this.w/2, 3, this.height), this.color); break;
			default: console.log('unknown script type', this.type);
		}
		for (var i = 0; i < this.num_wit; i++) {
			iso.add(Shape.Pyramid(Point(offset + this.x, offset + this.y, this.height + (i / 4)), this.w / 4, this.h / 4, 1 / 4), (new Color(103+(20*i),103+(20*i),0)));
			//iso.add(Shape.Prism(Point(7*offset/8 + this.x, 7*offset/8 + this.y, this.height + (i / 8)), this.w/8, this.h/8, 1/8), new Color(103+(20*i),103+(20*i),0))
		}
	}
}

function getColorByScriptType(i, t) {
	var c;
	var Color = Isomer.Color;
	switch(t) {
		case "nonstandard":				c = (i === 0 ? new Color(30, 0, 0) : new Color(0, 30, 0)); break;
		case "nulldata":				c = (i === 0 ? new Color(60, 0, 0) : new Color(0, 60, 0)); break;
		case "multisig":				c = (i === 0 ? new Color(90, 0, 0) : new Color(0, 90, 0)); break;
		case "scripthash":				c = (i === 0 ? new Color(120, 0, 0) : new Color(0, 120, 0)); break;
		case "pubkeyhash":				c = (i === 0 ? new Color(150, 0, 0) : new Color(0, 150, 0)); break;
		case "pubkey":					c = (i === 0 ? new Color(180, 0, 0) : new Color(0, 180, 0)); break;
		case "witness_v0_keyhash":		c = (i === 0 ? new Color(210, 0, 0) : new Color(0, 210, 0)); break;
		case "witness_v0_scripthash":	c = (i === 0 ? new Color(240, 0, 0) : new Color(0, 240, 0)); break;
	}
	return c;
}

function createCanvas(id, arr, w, h) {
	var cnv = document.createElement('canvas');
	cnv.id = id;
	cnv.width = w;
	cnv.height = h;
	var ctx = cnv.getContext("2d");
	ctx.fillStyle = "#222";
	ctx.fillRect(0, 0, cnv.width, cnv.height);
	// cnv.style.backgroundColor = '#222';
	
	var d1 = document.createElement('div');
	d1.className = 'col-4 an';

	var d2 = document.createElement('div');
	d2.className = 'card mb-4 box-shadow';
	d1.appendChild(d2);
	
	cnv.className = 'card-img-top';
	d2.appendChild(cnv);
	
	var d3 = document.createElement('div');
	d3.className = 'card-body';
	d2.appendChild(d3);

	var p1 = document.createElement('p');
	p1.className = 'card-text';
	p1.style.minHeight = '50px';
	var unique = keywords.filter((v, i, a) => a.indexOf(v) === i); 
	p1.textContent = unique.join(', ');// id;//'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.';
	d3.appendChild(p1);

	var d4 = document.createElement('div');
	//d4.className = 'd-flex justify-content-between align-items-center';
	d3.appendChild(d4);

	var d6 = document.createElement('div');
	d6.className = 'row';
	d4.appendChild(d6);

	var d61 = document.createElement('div');
	d61.className = 'col-4';
	d6.appendChild(d61);
	var d62 = document.createElement('div');
	d62.className = 'col-3';
	d6.appendChild(d62);
	var d63 = document.createElement('div');
	d63.className = 'col-5 text-right';
	d6.appendChild(d63);


	
	var s2 = document.createElement('small');
	s2.className = 'text-muted';
	s2.textContent = arr[1].toFixed(2)+' sat/b';//this (amount/100000000) + ' BTC';// '9 mins';
	d61.appendChild(s2);

	var d5 = document.createElement('div');
	d5.className = 'btn-group';
	d62.appendChild(d5);
	
	var b1 = document.createElement('input');
	b1.id = 'txbtn_' + id;
	b1.type = 'button';
	b1.className = 'btn btn-sm btn-outline-secondary';
	b1.value = 'TX';
	// b1.onclick = function(){
		// window.open("https://www.smartbit.com.au/tx/" + id, "_blank");
	// };
	d5.appendChild(b1);

	var b2 = document.createElement('input');
	b2.id = 'imgbtn_' + id;
	b2.type = 'button';
	b2.className = 'btn btn-sm btn-outline-secondary';
	b2.value = 'IMG';
	// b2.onclick = function(){
		// var win = window.open('', "_blank");
		// win.document.body.innerHTML = '<p>'+id+'</p><img src="' + cnv.toDataURL() + '" style="background:#222" id="' + id + '">';
	// };
	d5.appendChild(b2);
	
	var s1 = document.createElement('small');
	s1.className = 'text-muted';
	s1.textContent = (arr[3] == arr[2] ? arr[2] : arr[3] +'/'+ arr[2]) + ' bytes';// (arr[0]/100000000) + ' BTC';// '9 mins';
	d63.appendChild(s1);

	var c1 = document.getElementById('cards');
	if (c1.children.length == 3) {
		c1.removeChild(c1.lastElementChild);
	}
	c1.insertBefore(d1, c1.firstChild);
	return cnv;
}

function startSocket() {
	if ("WebSocket" in window) 	{
		ws = new WebSocket("wss://ws.smartbit.com.au/v1/blockchain");
		console.log('Connecting...');
		ws.onopen = function() {
			ws.send(JSON.stringify({type: "new-transaction"}));
			console.log('Connected. Waiting for transactions...');
		};
		ws.onmessage = function(evt) {
			var msg = JSON.parse(evt.data);
			if (msg.type == "new-transaction") {
				//console.log(msg.payload);
				if (msg.payload.input_count + msg.payload.output_count > 0) {
					var tx = new TX(msg.payload);
					tx.draw();
					tx.checkRecs();
					checkLinks();

				}
			}
		};
		ws.onclose = function() { 
			console.log('Connection lost... Refresh to try again.');
			document.body.style.backgroundColor = 'red';
			// go();
		};
	} else {
		 console.log('WebSocket NOT supported by your Browser!');
	}
}

function go() {
	startSocket();
}