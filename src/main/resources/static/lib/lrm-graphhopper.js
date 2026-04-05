(function () {
  "use strict";
  L.Routing = L.Routing || {};
  L.Routing.GraphHopper = L.Class.extend({
    options: {
      url: "http://localhost:8989/route",
      profile: "car",
      locale: "en",
      debug: false,
    },
    initialize: function (apiKey, options) {
      this._apiKey = apiKey;
      L.Util.setOptions(this, options);
    },
    route: function (waypoints, callback, context, options) {
      var url = this.options.url + "?" + this._buildQueryParams(waypoints);
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.message || !data.paths) {
            var errorMsg = data.message || (data.hints && data.hints[0] ? data.hints[0].message : "Unknown Routing Error");
            callback.call(context || callback, { message: errorMsg });
            return;
          }
          // මෙහිදී waypoints දත්තත් සමඟ parseResponse එකට යවනවා
          var result = this._parseResponse(data, waypoints);
          callback.call(context || callback, null, result);
        })
        .catch((err) => callback.call(context || callback, { message: err.message }));
    },
    _buildQueryParams: function (waypoints) {
      var params = ["profile=" + (this.options.profile || "car"), "locale=" + this.options.locale, "debug=" + this.options.debug, "points_encoded=false"];
      if (this._apiKey) params.push("key=" + this._apiKey);
      waypoints.forEach((wp) => params.push("point=" + wp.latLng.lat + "," + wp.latLng.lng));
      return params.join("&");
    },
    _parseResponse: function (data, inputWaypoints) {
      var routes = data.paths.map((path) => {
        return {
          name: "GraphHopper Route",
          summary: { totalDistance: path.distance, totalTime: path.time / 1000 },
          coordinates: L.GeoJSON.coordsToLatLngs(path.points.coordinates),
          instructions: this._parseInstructions(path.instructions),
          // මෙන්න මේ පේළි දෙක තමයි අත්‍යවශ්‍ය වෙන්නේ
          inputWaypoints: inputWaypoints,
          waypointIndices: [0, path.points.coordinates.length - 1],
        };
      });
      return routes;
    },
    _parseInstructions: function (instructions) {
      if (!instructions) return [];
      return instructions.map((instr) => {
        return { text: instr.text, distance: instr.distance, time: instr.time / 1000 };
      });
    },
  });

  L.Routing.graphhopper = function (apiKey, options) {
    return new L.Routing.GraphHopper(apiKey, options);
  };
})();
