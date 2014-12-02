window.exo = {
	
	collection: [],
	
	init: function(url) {
		var self = this;
		
		var exoplanets = document.createElement("div");
		document.body.appendChild(exoplanets);
		
		var space = new Kinetic.Stage({
			width: window.innerWidth,
			height: window.innerHeight,
			container: exoplanets,
			draggable: true
		});
		
		// TEMP UNTIL API IS FIXED
		self.planets(space, window.tempdata.response.results);
		
		/*var xhr = new XMLHttpRequest(); 
		xhr.onload = function() {
			self.planets(new Kinetic.Stage({
				width: window.innerWidth,
				height: window.innerHeight,
				container: document.body
			}), JSON.parse(xhr.responseText).response.results);	
		};
		xhr.onerror = function() {
			console.log("error");
		};
		xhr.open("GET", url, true);
		xhr.send();*/
		
		window.addEventListener("wheel", function(e) {
			var i = 0, count = self.collection.length;
			while (i < count) {
				var planet = self.collection[i];
				var x = planet.offsetX();
				if (e.deltaY >= 1) {
					if (x <= 0) {
						planet.hide();
					};
					planet.offsetX(planet.offsetX() - 50);
				} else if (e.deltaY <= -1) {
					if (x >= 0) {
						planet.show();
					};
					planet.offsetX(planet.offsetX() + 50);
				};
				space.batchDraw();
				i++;
			};
		});
		
		var planetInfo = document.getElementById("planetInfo");
		planetInfo.getElementsByClassName("close")[0].addEventListener("click", function() {
			planetInfo.style.display = "none";
		});
	},
	
	getInfo: function(planet) {
		
		var planet = JSON.parse(planet.getId());
		for (var prop in planet) {
			var capProp = prop[0].toUpperCase() + prop.slice(1);
			if (document.getElementById("planet" + capProp)) {
				document.getElementById("planet" + capProp).textContent = planet[prop];
			};
		};
		
		console.log(planet);
		
	},
	
	planets: function(space, planets) {
		var self = this;
		
		this.parsecs(space);
		
		var planetCollection = new Kinetic.Layer();
		
		var i = 0, count = planets.length, _ = self.collection;
		while (i < count) {
			var planet = planets[i];
			if (planet.star.distance) {
				var circle = new Kinetic.Circle({
					x: window.innerWidth/2,
					y: window.innerHeight/2,
					radius: planet.radius/1.5 > 1 ? planet.radius/1.5 : 1,
					fill: this.zone(planet.zone_class),
					stroke: /*this.habitable(planet.habitable, planet.hab_moon) ? "white" :*/ "transparent",
					offset: {
						x: planet.star.distance * 5,
						y: 2
					},
					rotation: planet.period % 360 + 180,
					id: JSON.stringify({
						name: planet.name,
						zone: planet.zone_class,
						type: planet.mass_class,
						compo: planet.composition_class,
						atmo: planet.atmosphere_class,
						radius: (planet.radius * 69911000).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + " m", // radius * jupiter's radius
						mass: planet.mass,
						gravity: planet.gravity,
						year: planet.period + " days",
						distance: planet.star.distance,
						habitable: (function() {
							if (planet.habitable) {
								return "Yes";
							} else if (planet.hab_moon) {
								return "Moon";
							} else {
								return "No"
							};
						})(),
						moon: planet.hab_moon,
						esi: planet.esi
					})
				});
				planet = circle;
				planet.on("mouseenter", function() {
					document.body.style.cursor = "pointer";
					this.stroke("white");
					this.draw();
				});
				planet.on("click", function() {
					self.getInfo(this);
					document.getElementById("planetInfo").style.display = "block";
				});
				planet.on("mouseleave", function() {
					document.body.style.cursor = "move";
					this.stroke("transparent");
					planetCollection.batchDraw();
				});
				planetCollection.add(planet);
				_.push(planet);
			};
			i++;
		};
		space.add(planetCollection);
		/*var rotate = new Kinetic.Animation(function(f) {
			i = 0, count = _.length;
			while (i < count) {
				var planet = _[i];
				planet.rotate(f.timeDiff * (360 / (planet.offsetX()/5)) / 1000)
				i++;
			};
		}, planetCollection);
		rotate.start();*/
	},
	
	zone: function(zone) {
		switch(zone) {
			case "Hot":
				return "rgba(255, 25, 0, 0.66)";
			case "Warm":
				return "rgba(153, 212, 19, 0.66)";
			case "Cold":
				return "rgba(30, 142, 255, 0.66)";
			default:
				return "rgba(150, 150, 150, 0.66)";
		};
	},
	
	habitable: function(habitable, habitableMoon) {
		if (habitable || habitableMoon) {
			return true;
		} else {
			return false;
		};
	},
	
	parsecs: function(space) {
		var parsecRuler = new Kinetic.Layer();
		
		var i = 2, count = window.innerWidth, parsecs = [];
		while (i < count) {
			parsecRuler.add(new Kinetic.Circle({
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
				radius: i,
				stroke: "rgba(255, 255, 255, 0.33)",
				strokeWidth: 1,
				dash: [10, 5],
				points: [
					i, 0,
					i, window.innerHeight
				]
			}));
			i += 50;
		}
		
		space.add(parsecRuler);
		
		parsecs.forEach(function(parsec) {
			parsec.cache();
		});
	}
	
};