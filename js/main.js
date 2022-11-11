
import {fetchGeoJSON, getDataMapByProject, getDetailsProject} from './services.js'
import {updateLayersTileset, addPolygon, addStatesPines, controlZoomEnd, loadImages} from './map.js'
import {dataProjects} from './data.js'


mapboxgl.accessToken = "pk.eyJ1IjoiZmVybmFuZGFwYWxhY2lvcyIsImEiOiJja2lxaWQ3N2EwZW5xMnRvOHZ2aXE1MmhwIn0.UxzFICTl8Vs9NcXJW25gJg";
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/fernandapalacios/cks521hxl0zmw17munuy6b3u7",
    center: [-96.069634, 18.191211],
    zoom: 5,
});
const zoomInMax = 12

map.on("load", () => {
    map.addSource("main", {
        type: "geojson",
        data: dataProjects,
        cluster: true,
        clusterMaxZoom: 12, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
        generateId: true
    });

    loadImages(map)
    
    map.addLayer({
        id: "clusters",
        type: "symbol",
        source: "main",
        filter: ["has", "point_count"],
        layout: {
            'icon-image': 'multiple', // reference the image
            'icon-size': 1,
            'icon-allow-overlap': true,
        }
    });

    // map.addLayer({
    //     id: "cluster-count",
    //     type: "symbol",
    //     source: "main",
    //     filter: ["has", "point_count"],
    //     layout: {
    //         'icon-image': 'multiple', // reference the image
    //         'icon-size': 1,
    //         'icon-allow-overlap': true
    //     }
    // });

    map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "main",
        filter: ["!", ["has", "point_count"]],
        minzoom: 2,
        maxzoom: 12,
        layout: {
            'icon-image': 'simple', // reference the image
            'icon-size': 1,
            'icon-allow-overlap': true,
        }
    });

    // inspect a cluster on click
    map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map
        .getSource("main")
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;
                map.flyTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
            });
        });
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on("click", "unclustered-point", async (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        // console.log(coordinates);
        const projectID = e.features[0].properties.projectID;
        // console.log(projectID);
        const getProjectData = async () => {
        let APIerrors;

        // await createTilesetByProject(projectID)
        let teselas_by_year;
        getDataMapByProject(projectID)
            .then(async (dataMap) => {
                // actualizar la capa setteada
                updateLayersTileset(
                    map,
                    dataMap.teselas_by_year[0].url_mapbox,
                    dataMap.teselas_by_year[0].layer,
                    dataMap.teselas_by_year[0].layer_owner,
                    // map.getZoom()
                );
                teselas_by_year = dataMap.teselas_by_year;
                // setProject({ ...project, teselas_by_year })
                addPolygon(map, dataMap.polygon, map.getZoom());
                // addLayerCarbono(map, dataMap.layer_carbono)
                // addLayerUsd(map, dataMap.layer_usd)
                // addPointsMonotoring(map, dataMap.monitoring_Sites)


                // console.log('min', map.getZoom())
                // map.setLayerZoomRange('clusters', map.getZoom(), 10);

                const geojson = await fetchGeoJSON(dataMap.polygon);
                const bbox = turf.extent(geojson);
                map.fitBounds(bbox, {
                    padding: { top: 10, bottom: 50, left: 15, right: 5 },
                });

                // obtener teselas disponibles
                setTimeout(() => {
                    const layerBonos = dataMap.teselas_by_year[0].layer;
                    const separateIds = dataMap.teselas_by_year[0].separate_ids;
                    const selectedFeatures = map.querySourceFeatures("tilesets", {
                    sourceLayer: layerBonos,
                    });
                    const bonosId = selectedFeatures.map(
                    (feature) => feature.properties.ID
                    );
                    // setTeselasIds(
                    //   Array.from(new Set(orderTeselas(separateIds, bonosId)))
                    // )
                    // setTeselasAviablesIds(
                    //   Array.from(new Set(orderTeselas(separateIds, bonosId)))
                    // )
                }, 5000);
            })
            .catch((error) => {
                console.log("Error:", error);
                APIerrors = "Error desconocido";
            });

        const result = await getDetailsProject(projectID);

        if (typeof result === "number") {
            if (result === 500) {
            APIerrors = "Error al conectar con el servidor: 500";
            } else if (result === 404) {
            APIerrors = "Error al conectar con el servidor: 404";
            } else {
            APIerrors = "Error desconocido";
            }
        } else if (typeof result === "object") {
            // setProject({ ...result[0], teselas_by_year })
        } else if (typeof result === "string") {
            APIerrors = "Error desconocido";
        }

        return APIerrors;
        };
        await getProjectData();

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
    });

    // state pines
    addStatesPines(map)


    // zoom events
    controlZoomEnd(map)

});