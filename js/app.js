const map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView([49, 27], 6);

map.setMinZoom(5);
map.setMaxZoom(7);

let correctAnswer = null;
let score = 0;
let mistakes = 0;
let geoLayer;

function styleDefault() {
  return {
    color: "black",
    weight: 1,
    fillColor: "white",
    fillOpacity: 1
  };
}

function highlight(layer, color) {
  layer.setStyle({
    fillColor: color,
    fillOpacity: 0.7
  });
}

function nextQuestion(features) {
  const random = features[Math.floor(Math.random() * features.length)];
  correctAnswer = random.properties.name;
  document.getElementById("question").innerText = "Klikni na: " + correctAnswer;
}

function updateScore() {
  document.getElementById("score").innerText =
    "Skóre: " + score + " | Chyby: " + mistakes;
}

function restartGame() {
  score = 0;
  mistakes = 0;
  updateScore();
  geoLayer.eachLayer(layer => layer.setStyle(styleDefault()));
  nextQuestion(geoLayer.toGeoJSON().features);
}

fetch("data/countries.geojson")
  .then(res => res.json())
  .then(data => {

    geoLayer = L.geoJSON(data, {
      style: styleDefault,
      onEachFeature: function(feature, layer) {
        layer.on("click", function() {

          if (feature.properties.name === correctAnswer) {
            highlight(layer, "green");
            score++;
          } else {
            highlight(layer, "red");
            mistakes++;
            geoLayer.eachLayer(l => {
              if (l.feature.properties.name === correctAnswer) {
                highlight(l, "green");
              }
            });
          }

          updateScore();
          setTimeout(() => {
            geoLayer.eachLayer(l => l.setStyle(styleDefault()));
            nextQuestion(data.features);
          }, 1000);

        });
      }
    }).addTo(map);

    nextQuestion(data.features);
  });
