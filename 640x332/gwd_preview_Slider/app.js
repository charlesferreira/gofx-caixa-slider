window.app = window.app || {};
window.config = window.config || {};

config.maxDeltaTime = 100;
config.autoplayDelay = 1000;
config.autoplayDuration = 2500;
config.autoplayEasing = easing.inOutQuad;
config.progress = function(x) {
	return (x - this.sliderMinX) / (this.sliderMaxX - this.sliderMinX);
}

var dragX = config.sliderMinX;
var autoplaying = false;
var autoplayDelay = config.autoplayDelay;

app.onSliderDrag = function(event) {
	autoplaying = false
	autoplayDelay = config.autoplayDelay;
	dragX = event.clientX;
}

var sliderX = config.sliderMinX;
var galleryX = 0;
var deltaTime;
var previousTime = 0;
var w_2;

var autoplayCurrentTime;
var autoplayStartX
var autoplayCurrentX;

function updateTime(now) {
	deltaTime = now - previousTime;
	previousTime = now;
}

function skipStep() {
	return deltaTime > config.maxDeltaTime;
}

function setupElements() {
	window.photos = window.photos || document.getElementById('gallery');
	window.slider = window.slider || document.getElementById('slider-thumb');
	if (slider) w_2 = slider.width / 2;
	return photos && slider;
}

function autoplay() {
	autoplayCurrentTime = Math.min(config.autoplayDuration, autoplayCurrentTime + deltaTime);
	dragX = config.autoplayEasing(autoplayCurrentTime, autoplayStartX, autoplayCurrentX, config.autoplayDuration);
}

function setupAutoplay() {
	autoplaying = true;
	dragX = sliderX + w_2;
	autoplayCurrentTime = 0;
	autoplayStartX = dragX;
	autoplayCurrentX = config.sliderMaxX + w_2 - sliderX;
}

function updateAutoplay() {
	autoplayDelay -= deltaTime;
	if (autoplayDelay <= 0 && !autoplaying) {
		setupAutoplay();
	} else if (autoplaying) {
		autoplay();
	}
}

function updateSlider() {
	sliderX = Math.max(config.sliderMinX, Math.min(config.sliderMaxX, dragX - w_2));
	helper.transform(slider, "translateX(" + sliderX + "px)");
}

function updatePhotos() {
	var progress = config.progress(sliderX);
	var targetX = (photos.width - config.pageWidth) * progress * -1;
	galleryX = galleryX + (targetX - galleryX) * deltaTime / 200;
	helper.transform(photos, "translateX(" + galleryX + "px)");
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
	updatePhotos();
})(0);