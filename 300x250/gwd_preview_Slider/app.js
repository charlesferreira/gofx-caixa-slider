window.app = window.app || {};
window.config = window.config || {};

config.maxDeltaTime = 100;
config.maxInteractionTime = 5000;
config.autoplayDelay = 1000;
config.autoplayDuration = 10000;
config.autoplayEasing = easing.linear;
config.progress = function(x) {
	return (x - this.sliderMinX) / (this.sliderMaxX - this.sliderMinX);
}

var dragX = config.sliderMinX;
var autoplaying = false;
var autoplayDelay = config.autoplayDelay;
var controlsOff= false;

app.onSliderDrag = function(event) {
	if (controlsOff) return;
	autoplaying = false
	autoplayDelay = config.autoplayDelay;
	dragX = event.clientX;
}

var thumbX = config.sliderMinX;
var galleryX = 0;
var deltaTime;
var previousTime = 0;
var totalTime = 0;
var thumbHalfWidth;
var galleryWidth;

var autoplayCurrentTime;
var autoplayCurrentDuration;
var autoplayStartX
var autoplayCurrentX;

function updateTime(now) {
	deltaTime = now - previousTime;
	previousTime = now;
}

function skipStep() {
	return deltaTime > config.maxDeltaTime;
}

function setupTexts() {
	window.texts = window.texts || [];
	if (window.texts.length > 0) return;
	if (!document.getElementById('text0')) return;

	for (var i in config.textLimits) {
		window.texts.push({
			element: document.getElementById('text' + i),
			limits: {
				min: config.textLimits[i][0],
				max: config.textLimits[i][1]
			}
		});
	}
}

function setupElements() {
	setupTexts();
	window.background = window.background || document.getElementById('background');
	window.gallery = window.gallery || document.getElementById('gallery');
	window.thumb = window.thumb || document.getElementById('slider-thumb');
	window.slider = window.slider || document.getElementById('slider');
	if (thumb) thumbHalfWidth = thumb.width / 2;
	if (background) galleryWidth = background.width;
	return background && gallery && thumb && slider;
}

function autoplay() {
	if (totalTime > config.maxInteractionTime)
		hideControls();

	autoplayCurrentTime = Math.min(autoplayCurrentDuration, autoplayCurrentTime + deltaTime);
	dragX = config.autoplayEasing(autoplayCurrentTime, autoplayStartX, autoplayCurrentX, autoplayCurrentDuration);
}

function hideControls() {
	if (controlsOff) return;
	controlsOff = true;
	setTimeout(function() {
		slider.parentNode.removeChild(slider);
	}, 500);
	slider.classList.add('slider-fade-out');
}

function setupAutoplay() {
	autoplaying = true;
	dragX = thumbX + thumbHalfWidth;
	autoplayCurrentTime = 0;
	autoplayCurrentDuration = config.autoplayDuration * (1 - config.progress(thumbX));
	autoplayStartX = dragX;
	autoplayCurrentX = config.sliderMaxX + thumbHalfWidth - thumbX;
}

function updateAutoplay() {
	totalTime += deltaTime;
	autoplayDelay -= deltaTime;
	if (autoplayDelay <= 0 && !autoplaying) {
		setupAutoplay();
	} else if (autoplaying) {
		autoplay();
	}
}

function updateSlider() {
	thumbX = Math.max(config.sliderMinX, Math.min(config.sliderMaxX, dragX - thumbHalfWidth));
	helper.transform(thumb, "translateX(" + thumbX + "px)");
}

function updateGallery() {
	var progress = config.progress(thumbX);
	var targetX = (galleryWidth - config.pageWidth) * progress * -1;
	var newX = galleryX + (targetX - galleryX) * deltaTime / 200;
	if (isNaN(newX)) return;
	galleryX = newX;
	helper.transform(gallery, "translateX(" + (Math.round(galleryX * 100) / 100) + "px)");
}

function updateTexts() {
	var windowLimits = {
		min: -galleryX,
		max: config.pageWidth - galleryX
	};

	if (isNaN(windowLimits.min) || isNaN(windowLimits.max)) return;

	console.log(windowLimits);

	texts.forEach(function(text) {
		if (windowLimits.max > text.limits.min && windowLimits.min < text.limits.max) {
			if (text.element.classList.contains('hidden')) {
				text.element.classList.remove('hidden');
				text.element.classList.add('text-fade-in');
			}
		} else {
			text.element.classList.remove('text-fade-in');
			text.element.classList.add('hidden');
		}
	});
}

(function update(now) {
	requestAnimationFrame(update);
	updateTime(now);
	if (skipStep())
		return;
	
	if (!setupElements())
		return;
	
	updateAutoplay();
	updateSlider();
	updateGallery();
	updateTexts();
})(0);