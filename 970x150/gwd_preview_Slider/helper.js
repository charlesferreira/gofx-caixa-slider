window.helper = window.helper || {};

helper.transform = function(obj, transform) {
  obj.style.WebkitTransform = transform;
  obj.style.msTransform = transform;
  obj.style.transform = transform;
}