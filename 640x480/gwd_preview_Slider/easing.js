window.easing = window.easing || {};

easing.inOutQuad = function (t, b, c, d) {
  if ((t/=d/2) < 1) return c/2*t*t + b;
  return -c/2 * ((--t)*(t-2) - 1) + b;
};

easing.linear = function (t, b, c, d) {
	return c*t/d + b;
};