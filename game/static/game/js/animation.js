'use strict';

var ocargo = ocargo || {};

var ANIMATION_LENGTH = 500;

ocargo.Animation = function(model, decor, numVans) {
	this.model = model;
	this.decor = decor;
	this.numVans = numVans;

	this.resetAnimation();
};

ocargo.Animation.prototype.resetAnimation = function() {
	this.animationQueue = [];
	this.animationTimestamp = 0;
	this.isPlaying = false;

	clearPaper();
	renderMap(this.model.map);
	renderDecor(this.decor);
	renderTrafficLights(this.model.trafficLights);
	renderVans(this.model.map.getStartingPosition(), this.numVans);
};

ocargo.Animation.prototype.stepAnimation = function() {
	var maxDelay = 0;
	// do all things in this timestep
	while (this.animationQueue.length > 0 && animationQueue[0].timestamp <= this.animationTimestamp) {
		var a = animationQueue.splice(0, 1)[0];
		// animation length is either default or may be custom set
		var animationLength = a.animationLength  || ANIMATION_LENGTH;

		switch (a.type) {
			case 'callable':
				animationLength = a.animationLength || 0;
				a.functionCall();
				break;
			case 'van':
				// Set all current animations to the final position, so we don't get out of sync
				var vanID = a.id;
                var anims = vanImages[vanID].status();
                for (var i = 0, ii = anims.length; i < ii; i++) {
                    vanImages[vanID].status(anims[i].anim, 1);
                }

                scrollToShowVanImage(vanImages[vanID]);

                // move van
                switch (a.vanAction) {
                	case 'FORWARD':
                		moveForward(vanID, animationLength);
                		break;
                	case 'TURN_LEFT':
                		moveLeft(vanID, animationLength);
                		break;
                	case 'TURN_RIGHT':
                		moveRight(vanID, animationLength);
                		break;
                	case 'TURN_AROUND':
                		turnAround(vanID, animationLength);
                		break;
                	case 'WAIT':
                		wait(vanID, animationLength);
                		break;
                	case 'OBSERVE':
                		break;
                }
                // Check if fuel update present
                if (typeof a.fuel != 'undefined') {
                	// update fuel gauge
                	var rotation = 'rotate(' + (((a.fuel/100)*240)-120) + 'deg)';
    				document.getElementById('fuelGaugePointer').style.transform=rotation;
    				document.getElementById('fuelGaugePointer').style.webkitTransform=rotation;
                }
				break;
			case 'popup':
				var title = "";
				var leadMsg = a.popupMessage;
				// sort popup...
				switch (a.popupType) {
					case 'WIN':
						title = ocargo.messages.winTitle;
						var levelMsg = "";
						if (level.nextLevel != null) {
					        levelMsg = ocargo.messages.nextLevelButton(level.nextLevel);
					    } 
					    else {
					        if (level.nextEpisode != null && level.nextEpisode !== "") {
					            levelMsg = ocargo.messages.nextEpisodeButton(level.nextEpisode);
					        } else {
					            levelMsg = ocargo.messages.lastLevel;
					        }
					    }
					    leadMsg = leadMsg + levelMsg;
						break;
					case 'FAIL':
						title = ocargo.messages.failTitle;
						leadMsg = leadMsg + ocargo.messages.closebutton(ocargo.messages.tryagainLabel);
						break;
					case 'WARNING':
						title = ocargo.messages.ohNo;
						leadMsg = leadMsg + ocargo.messages.closebutton(ocargo.messages.tryagainLabel);
						break;
				}
				if (a.popupHint) {
					var hintBtns = $("#hintPopupBtn");
					var otherMsg = "";
			        if (hintBtns.length === null || hintBtns.length === 0) {
			            otherMsg = '<p id="hintBtnPara">' +
			                '<button id="hintPopupBtn">' + ocargo.messages.needHint + '</button>' + 
			                '</p><p id="hintText">' + HINT + '</p>'
			            $("#myModal > .mainText").append('<p id="hintBtnPara">' +
			                '<button id="hintPopupBtn">' + ocargo.messages.needHint + '</button>' + 
			                '</p><p id="hintText">' + HINT + '</p>');
        			}
				}
				startPopup(title, leadMsg, otherMsg);
				if (a.popupHint) {
					if(level.hintOpened){
		                $("#hintBtnPara").hide();
		            } else {
		                $("#hintText" ).hide();
		                $("#hintPopupBtn").click( function(){
		                    $("#hintText").show(500);
		                    $("#hintBtnPara").hide();
		                    level.hintOpened = true;
		                });
		            }
		        }
				break;
			case 'trafficlight':
				var lightID = a.id;
				if (a.colour == ocargo.TrafficLight.GREEN) {
                    lightImages[lightID][0].animate({ opacity : 1 }, animationLength/4, 'linear');
                    lightImages[lightID][1].animate({ opacity : 0 }, animationLength/2, 'linear');
                }
                else {
                    lightImages[lightID][0].animate({ opacity : 0 }, animationLength/2, 'linear');
                    lightImages[lightID][1].animate({ opacity : 1 }, animationLength/4, 'linear');
                }
				break;
			case 'console':
				ocargo.consoleOutput.text(ocargo.consoleOutput.text() + a.text);
				break;
		}
		// Calculate maximum animation length
		if (animationLength > maxDelay) {
			maxDelay = animationLength;
		}
	}

	this.animationTimestamp ++;

	if (this.isPlaying) {
		if (this.animationQueue.length > 0) {
			// set timeout for longest animation
			setTimeout(this.stepAnimation, maxDelay);
		} else {
			// finished animation, stop playing
			this.isPlaying = false;
		}
	}
};

ocargo.Animation.prototype.playAnimation = function() {
	if (!this.isPlaying && this.animationQueue.length > 0) {
		this.isPlaying = true;
		this.stepAnimation();
	}
};

ocargo.Animation.prototype.pauseAnimation = function() {
	this.isPlaying = false;
};

ocargo.Animation.prototype.queueAnimation = function(a) {
	// Find correct position to insert into animation queue in time ascending order
	// (backwards linear search likely to be better for one van setup at least...)
	var found = false;
	var index = this.animationQueue.length;
	while (!found && index > 0) {
		if (this.animationQueue[index - 1].timestamp > a.timestamp) {
			index --;
		}
		else {
			found = true;
		}
	}
	this.animationQueue.splice(index, 0, a);

	// Remove duplicate animations... or make any animations that could potentially appear twice idempotent... Undecided...
};

ocargo.Animation.prototype.queueAnimations = function(as) {
	for (var i = 0; i < as.length; i++) {
		this.queueAnimation(as[i]);
	}
};
