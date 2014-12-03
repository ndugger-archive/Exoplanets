window.exo = {
	
	collection: [],
	ruler: [],
	maxDistance: 0,
	zoom: 0,
	
	init: function(url, animate) {
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

		this.parsecs(space);
		
		window.addEventListener("wheel", function(e) {
			var i = 0, count = self.collection.length;
			while (i < count) {
				var planet = self.collection[i];
				var x = planet.offsetX();
				if (e.deltaY >= 1) {
					if (x <= 0) {
						planet.hide();
					};
					planet.offsetX(planet.offsetX() / 1.25);
					//planet.radius(planet.radius() / 1.25);
				} else if (e.deltaY <= -1) {
					if (x >= 0) {
						planet.show();
					};
					planet.offsetX(planet.offsetX() * 1.25);
					//planet.radius(planet.radius() * 1.25);
				};
				i++;
			};
			i = 0, count = self.ruler.length;
			while (i < count) {
				var circle = self.ruler[i];
				var r = circle.radius();
				if (e.deltaY >= 1) {
					if (r <= 2) {
						//circle.hide();
					};
					circle.radius(circle.radius() / 1.25);
				} else if (e.deltaY <= -1) {
					if (r >= 2) {
						circle.show();
					};
					circle.radius(circle.radius() * 1.25);
				};
				i++;
			};
			space.batchDraw();
		});
		
		var planetInfo = document.getElementById("planetInfo");
		planetInfo.getElementsByClassName("close")[0].addEventListener("click", function() {
			planetInfo.style.display = "none";
		});
		
		if (animate) {
			this.animate(space);
		}
	},
	
	animate: function(space) {
		var _ = self.collection;
		var rotate = new Kinetic.Animation(function(f) {
			i = 0, count = _.length;
			while (i < count) {
				var planet = _[i];
				planet.rotate(f.timeDiff * (360 / (planet.offsetX()/5)) / 1000)
				i++;
			};
		}, space.find("#planetCollection"));
		rotate.start();
	},
	
	getInfo: function(planet) {
		
		var planet = JSON.parse(planet.getId());
		for (var prop in planet) {
			var capProp = prop[0].toUpperCase() + prop.slice(1);
			if (document.getElementById("planet" + capProp) && planet[prop]) {
				document.getElementById("planet" + capProp).textContent = planet[prop];
			};
		};
		
		console.log(planet);
		
	},
	
	planets: function(space, planets) {
		var self = this;
		
		var planetCollection = new Kinetic.Layer();
		planetCollection.setId("planetCollection");
		
		var i = 0, count = planets.length, _ = self.collection;
		while (i < count) {
			var planet = planets[i];
			if (planet.star.distance) {
				self.maxDistance = planet.star.distance > self.maxDistance ? planet.star.distance : self.maxDistance;
				var circle = new Kinetic.Circle({
					x: window.innerWidth/2,
					y: window.innerHeight/2,
					radius: planet.radius/1.5 > 1 ? planet.radius/1.5 : 1,
					fill: this.habitable(planet.habitable, planet.hab_moon) ? "rgba(97, 253, 0, 0.66)" : this.zone(planet.zone_class),
					stroke: "transparent",
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
						radius: (planet.radius * 69911000).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + " m",
						mass: planet.mass,
						gravity: planet.gravity,
						year: planet.period ? planet.period + " days" : null,
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
	},
	
	zone: function(zone) {
		switch(zone) {
			case "Hot":
				return "rgba(255, 0, 0, 0.66)";
			case "Warm":
				return "rgba(255, 206, 0, 0.66)";
			case "Cold":
				return "rgba(27, 123, 255, 0.66)";
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
		var self = this;
		var parsecRuler = new Kinetic.Layer();
		
		var i = 2, count = self.maxDistance * 5, parsecs = [];
		while (i < count + 15000) {
			var parsec = new Kinetic.Circle({
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
			});
			parsecRuler.add(parsec);
			self.ruler.push(parsec);
			if (i <= 500) {
				i += 50;
			} else if (i <= 1000) {
				i += 100;
			} else if (i <= 2000) {
				i += 250;
			} else if (i <= 4000) {
				i += 500;
			} else if (i <= 8000) {
				i += 1000;
			} else if (i <= 16000) {
				i += 3000;
			} else if (i <= 32000) {
				i += 7500;
			} else {
				i += 15000;
			};
		};
		
		space.add(parsecRuler);
		parsecRuler.moveToBottom();
		
		parsecs.forEach(function(parsec) {
			parsec.cache();
		});
	}
	
};