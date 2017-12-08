var $body,
	$demos,
	coverflowFaces,
	shadeAmount,
	tintAmount,
	light,
	currentCover,
	renderTimer,
	isLit,
	domTransformProperty,
	cssTransformProperty,
	domTransitionProperty,
	cssTransitionProperty,
	transitionEndEvent,
	transitionEndEvents = {
		'WebkitTransition' : 'webkitTransitionEnd',
		'MozTransition'    : 'transitionend',
		'OTransition'      : 'oTransitionEnd',
		'msTransition'     : 'MSTransitionEnd',
		'transition'       : 'transitionend'
	};

$(document).ready(function() {
	$body = $('body');
	$demos = $('.demo');
	light = new Photon.Light();
	shadeAmount = .5;
	tintAmount = 0;
	coverflowFaces = [];
	currentCover = 0;
	$toggleBtn = $('.toggle-btn');
	$toggleOn = $('.toggle .label-on');
	$toggleOff = $('.toggle .label-off');
	isLit = true;
	domTransformProperty = Modernizr.prefixed('transform');
	cssTransformProperty = domToCss(domTransformProperty);
	domTransitionProperty = Modernizr.prefixed('transition');
	cssTransitionProperty = domToCss(domTransitionProperty);
	transitionEndEvent = transitionEndEvents[domTransitionProperty];

	setupLightControls();
	setupCoverflow();

	// demo menu
	$('.example-menu a').bind('click', onDemoNav);

	if(cssTransformProperty !== '-webkit-transform') 
		showCoverflow();
});

/*---------------------------------

	Light Controls

---------------------------------*/

function setupLightControls() {
	$('.toggle a').bind('click', toggleLight);
}

function toggleLight(e) {
	e.preventDefault();

	switch($(e.target).attr('id')) {
		case 'label-on':
			isLit = true;
			$toggleBtn.addClass('on');
			$toggleOn.addClass('current');
			$toggleOff.removeClass('current');
			$('.photon-shader').show();
			break;
		case 'label-off':
			isLit = false;
			$toggleBtn.removeClass('on');
			$toggleOn.removeClass('current');
			$toggleOff.addClass('current');
			$('.photon-shader').hide();
			break;
		case 'toggle-btn':
			isLit = !isLit;
			$toggleBtn.toggleClass('on');
			$toggleOn.toggleClass('current');
			$toggleOff.toggleClass('current');
			$('.photon-shader').toggle();
			break;
	}
}

/*---------------------------------

	Menus

---------------------------------*/

function onDemoNav(e) {
	e.preventDefault();

	var demo = $(e.target).attr('data-demo');

	$('.example-menu .current').removeClass('current');
	$(this).addClass('current');

	switch(demo) {
		case 'coverflow':
			hideCrane();
			hideMap();
			showCoverflow();
			renderCurrent = renderCoverflow;
			break;
	}
}

/*---------------------------------

	Coverflow

---------------------------------*/

function setupCoverflow() {
	$coverflow = $('.coverflow');
	var $coverflowItems = $coverflow.find('li');

	$coverflowItems.each(function(i) {
		coverflowFaces[i] = new Photon.Face($(this)[0], shadeAmount);
	});

	console.log(transitionEndEvent);
	$coverflowItems.eq(1).bind(transitionEndEvent, stopRenderTimer);
	
	setCoverTransforms();
}

function changeCover() {
	currentCover = currentCover < coverflowFaces.length - 1 ? currentCover + 1 : 0;
	setCoverTransforms(true);
}

function setCoverTransforms(animate) {
	if(!renderTimer && animate) {
		renderTimer = setInterval(renderCoverflow, 34);
	}
	for(var i = 0; i < coverflowFaces.length; i++) {
		var element = coverflowFaces[i].element;
		var offset = Math.abs(currentCover - i);
		var x = i == currentCover ? 0 : (150 + (100 * offset)) * (i < currentCover ? -1 : 1);
		var z = i == currentCover ? 0 : -200;

		var rotationY = i == currentCover ? 0 : (80 + (offset * -5)) * (i < currentCover ? 1 : -1);

		$(element).css(cssTransformProperty, 'translateX(' + x +'px) translateZ(' + z + 'px) rotateY(' + rotationY + 'deg)');
	}
}

function rotateCoverflow(e) {
	var xPer = e.pageX / $body.width();

	var newIndex = (coverflowFaces.length -1) - Math.round((coverflowFaces.length -1) * xPer);

	if(!renderTimer && newIndex != currentCover) {
		renderTimer = setInterval(renderCoverflow, 34);
		currentCover = newIndex;
	}
	for(var i = 0; i < coverflowFaces.length; i++) {
		var element = coverflowFaces[i].element;
		var offset = Math.abs(currentCover - i);
		var x = i == currentCover ? 0 : (150 + (100 * offset)) * (i < currentCover ? -1 : 1);
		var z = i == currentCover ? 0 : -200;

		var rotationY = i == currentCover ? 0 : (80 + (offset * -5)) * (i < currentCover ? 1 : -1);

		$(element).css(cssTransformProperty, 'translateX(' + x +'px) translateZ(' + z + 'px) rotateY(' + rotationY + 'deg)');
	}
}

function stopRenderTimer() {
	if(renderTimer) {
		clearInterval(renderTimer);
		renderTimer = null;
	}
}

function renderCoverflow() {	
	for(var i = 0; i < coverflowFaces.length; i++) {
		coverflowFaces[i].render(light, true);
	}
}

function hideCoverflow() {
	$coverflow.hide();
	$body.unbind();
}

function showCoverflow() {
	$coverflow.show();
	$body.bind('mousemove', rotateCoverflow);
}

/*---------------------------------

	Utilities

---------------------------------*/

function domToCss(property) {
	var css = property.replace(/([A-Z])/g, function (str, m1) {
		return '-' + m1.toLowerCase();
	}).replace(/^ms-/,'-ms-');

	return css;
}

function clamp(val, min, max) {
    if(val > max) return max;
    if(val < min) return min;
    return val;
}
