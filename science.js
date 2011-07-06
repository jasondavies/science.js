(function(){science = {version: "0.0.2"}; // semver
science.functor = function(v) {
  return typeof v === "function" ? v : function() { return v; };
};
})()