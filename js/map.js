import {colorsMap} from './variables.js'

function getLineWidth(color) {
    return {
        "line-color": color,
        "line-width": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            11,
            ["*", ["get", "line_width"], ["^", 2, -6]],
            14,
            ["*", ["get", "line_width"], ["^", 2, 8]],
            15,
            ["*", ["get", "line_width"], ["^", 2, 10]],
            16,
            ["*", ["get", "line_width"], ["^", 2, 16]],
            17,
            ["*", ["get", "line_width"], ["^", 2, 16]],
            18,
            ["*", ["get", "line_width"], ["^", 2, 16]],
            19,
            ["*", ["get", "line_width"], ["^", 3, 20]],
            20,
            ["*", ["get", "line_width"], ["^", 3, 20]],
            21,
            ["*", ["get", "line_width"], ["^", 3, 22]],
            22,
            ["*", ["get", "line_width"], ["^", 3, 22]],
        ],
    };
}

function setLayerSource (map, layerId, source, sourceLayer) {
    const oldLayers = map.getStyle().layers
    const layerIndex = oldLayers.findIndex(l => l.id === layerId)
    const layerDef = oldLayers[layerIndex]
    const before = oldLayers[layerIndex + 1] && oldLayers[layerIndex + 1].id
    layerDef.source = source
    if (sourceLayer) {
        layerDef['source-layer'] = sourceLayer
    }
    map.removeLayer(layerId)
    map.addLayer(layerDef, before)
}

function updateLayersTileset(
    map,
    urlMapbox,
    layerTileset,
    layerTilesetOwner,
    zoom
  ) {
    const zoomInMax = 12;
    const zoomInMin = 12;
    //   add teselas
    if (map.getSource("tilesets")) {
      map.getSource("tilesets").setUrl(urlMapbox);
    } else {
      map.addSource("tilesets", {
        type: "vector",
        url: urlMapbox,
      });
      // map.getSource('tilesets')
    }

    // START TESELAS
    // teselas con bonos

    if (map.getLayer("tilesets-data")) {
      setLayerSource(map, "tilesets-data", "tilesets", layerTileset);
      setLayerSource(map, "tilesets-data-line", "tilesets", layerTileset);
    } else {
      map.addLayer({
        id: "tilesets-data",
        type: "fill",
        source: "tilesets",
        "source-layer": layerTileset,
        // minzoom: zoom,
        paint: {
          "fill-color": colorsMap.availableBonosInitial.fillColor,
          "fill-opacity": colorsMap.availableBonosInitial.fillOpacity,
        },
      });
      map.addLayer({
        id: "tilesets-data-line",
        type: "line",
        source: "tilesets",
        "source-layer": layerTileset,
        // minzoom: zoom,
        paint: getLineWidth(
          colorsMap.availableBonosInitial.fillOutlineColor
        ),
      });
    }

    // teselas with owner
    if (map.getLayer("tilesets-owner")) {
      setLayerSource(map, "tilesets-owner", "tilesets", layerTilesetOwner);
    } else {
      map.addLayer({
        id: "tilesets-owner",
        type: "fill",
        source: "tilesets",
        "source-layer": layerTilesetOwner,
        // minzoom: zoom,
        paint: {
          "fill-outline-color": colorsMap.retiredBonos.fillOutlineColor,
          "fill-color": colorsMap.retiredBonos.fillColor,
          "fill-opacity": colorsMap.retiredBonos.fillOpacity,
        },
      });
      // map.addLayer({
      //   id: 'tilesets-owner-line',
      //   type: 'line',
      //   source: 'tilesets',
      //   'source-layer': layerTilesetOwner,
      //   minzoom: zoomInMin,
      //   paint: getLineWidth(colorsMap.retiredBonos.fillOutlineColor)
      // })
    }

    if (map.getLayer("tilesets-highlighted")) {
      setLayerSource(map, "tilesets-highlighted", "tilesets", layerTileset);
      setLayerSource(
        map,
        "tilesets-highlighted-line",
        "tilesets",
        layerTileset
      );
    } else {
      map.addLayer({
        id: "tilesets-highlighted",
        type: "fill",
        source: "tilesets",
        "source-layer": layerTileset,
        // minzoom: zoom,
        paint: {
          // 'fill-outline-color': colorsMap.availableBonosSelected.fillOutlineColor,
          "fill-color": colorsMap.availableBonosSelected.fillColor,
          "fill-opacity": colorsMap.availableBonosSelected.fillOpacity,
        },
        filter: ["in", "ID", ""],
      });
      map.addLayer({
        id: "tilesets-highlighted-line",
        type: "line",
        source: "tilesets",
        "source-layer": layerTileset,
        // minzoom: zoom,
        paint: getLineWidth(
          colorsMap.availableBonosSelected.fillOutlineColor
        ),
      });
    }

    /** * LAYERS LOAD SECTION ***/
  }

function addPolygon(map, polygon, zoom) {
  const zoomInMax = 12;
  const zoomInMin = 12;

  // all polygon
  if (!map.getSource("polygon")) {
    map.addSource("polygon", {
      type: "geojson",
      data: polygon,
      generateId: true, // This ensures that all features have unique IDs
    });
  } else {
    map.getSource("polygon").setData(polygon);
  }
  // Add a new layer to visualize the polygon of project area.
  // console.log(zoom)
  map.addLayer({
    id: "ADP",
    type: "line",
    source: "polygon",
    minzoom: 10,
    // maxzoom: zoom,
    layout: {},
    paint: {
      "line-color": colorsMap.polygon.lineColor,
      "line-width": colorsMap.polygon.lineWidth,
    },
    filter: ["==", "layer", "ADP"],
  });
}

function loadImages(map) {
  map.loadImage('../images/State=enabled, n° projects=+1.png', function (error, image) {
    if (error) throw error
    map.addImage('multiple', image)
  })
  map.loadImage('../images/State=hover, n° projects=+1.png', function (error, image) {
      if (error) throw error
      map.addImage('multiple-hover', image)
  })
  map.loadImage('../images/State=pressed, n° projects=+1.png', function (error, image) {
      if (error) throw error
      map.addImage('multiple-pressed', image)
  })


  map.loadImage('../images/State=enabled, n° projects=1.png', function (error, image) {
      if (error) throw error
      map.addImage('simple', image)
  })
  map.loadImage('../images/State=hover, n° projects=1.png', function (error, image) {
      if (error) throw error
      map.addImage('simple-hover', image)
  })
  map.loadImage('../images/State=pressed, n° projects=1.png', function (error, image) {
      if (error) throw error
      map.addImage('simple-pressed', image)
  })
}

function addStatesPines(map) {
  // Hover state point
  map.on('mouseover', 'unclustered-point', function (e) {
    if (e.features.length === 0) return;
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
    map.getCanvas().style.cursor = 'pointer'
    map.setLayoutProperty('unclustered-point', 'icon-image',[
        'match',
        ['get', 'id'],
        e.features[0].properties.id,
        'simple-hover',
        'simple',
      ])
  })
  // Pressed state point
  map.on('mousedown', 'unclustered-point', function (e) {
      map.setLayoutProperty('unclustered-point', 'icon-image', [
        'match',
        ['get', 'id'],
        e.features[0].properties.id,
        'simple-pressed',
        'simple'
      ])
    })
  // before hover state point
  map.on('mouseleave', 'unclustered-point', function () {
    map.getCanvas().style.cursor = ''
    map.setLayoutProperty('unclustered-point', 'icon-image', 'simple')
  })


  // Hover state clusters
  map.on('mouseover', 'clusters', function (e) {
      // Change the cursor style as a UI indicator.
      if (e.features.length === 0) return;
      map.getCanvas().style.cursor = 'pointer'
      map.setLayoutProperty('clusters', 'icon-image',[
          'match',
          ['id'],
          e.features[0].id,
          'multiple-hover',
          'multiple',
        ])
  })
  // Pressed state clusters
  map.on('mousedown', 'clusters', function (e) {
      map.setLayoutProperty('clusters', 'icon-image', [
        'match',
        ['id'],
        e.features[0].id,
        'multiple-pressed',
        'multiple'
      ])
    })
  // before hover state clusters
  map.on('mouseleave', 'clusters', function () {
    map.getCanvas().style.cursor = ''
    map.setLayoutProperty('clusters', 'icon-image', 'multiple')
  })
}

function controlZoomEnd(map) {
  map.on('zoomend', () => {
    const zoomEnd = map.getZoom()
    // console.log('zoomEnd: ', zoomEnd)
    if(zoomEnd >= 11 && zoomEnd < 13) {
        map.setLayerZoomRange('unclustered-point', 10, map.getZoom());

        map.setLayerZoomRange('tilesets-data', map.getZoom(), 16);
        map.setLayerZoomRange('tilesets-data-line', map.getZoom(), 16);

        map.setLayerZoomRange('tilesets-owner', map.getZoom(), 16);

        map.setLayerZoomRange('tilesets-highlighted', map.getZoom(), 16);
        map.setLayerZoomRange('tilesets-highlighted-line', map.getZoom(), 16);
        map.setLayerZoomRange('polygon', map.getZoom(), 13);
        return
    }
    map.setLayerZoomRange('unclustered-point', 2, 12);
  })
}

export {addPolygon, updateLayersTileset, addStatesPines, controlZoomEnd, loadImages}