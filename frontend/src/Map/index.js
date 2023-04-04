import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import axios from "axios";
import MapGL, { Source, Layer, Marker, LinearInterpolator } from "react-map-gl";
import ReactDOM from 'react-dom';
import Tooltip from '../Tooltip';
import 'mapbox-gl/dist/mapbox-gl.css';


mapboxgl.accessToken = 'pk.eyJ1IjoibWFwc3RlcnRlY2giLCJhIjoiY2s4M2U4eGJmMWJlejNsb3EyOXV4Zm1zaiJ9.aLWnB4UTvCto0wF5_9fePg';

function Map() {
  const mapContainerRef = useRef(null);
  //const popup = useRef(null);
  const tooltipRef = useRef(new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 15
  }));
  const [map, setMap] = useState(null);

  useEffect(() => {
    const res = fetch(`/api/provinces`)
      .then(res => res.json())
      .then(res => { console.log("first"); drawMap(res.data) })
  }, []);

  function drawMap(data) {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/empty-v8', // stylesheet location
      bounds: [
        [-142.43651641653042, 39.03798923031434],
        [-48.30904150845262, 68.77550837439571]
      ]
    });

    map.on('load', () => {
      drawProvinces(data, map);
    })
  }

  function drawProvinces(data, map) {
    fetch('assets/data/provinces.json').then(resp => resp.json()).then(response => {

      var centroidGeoJSON = {
        type: "FeatureCollection",
        features: []
      };
      var fillRange = [];

      response.features.forEach((feature) => {
        feature.id = feature.properties.cartodb_id;
        let provinceData = data.filter(item => item.province === feature.properties.abbreviation)[0];
        feature.properties.province_cases_total = provinceData.total_cases;
        // feature.properties.province_cases_per_population = provinceData.total_cases / (feature.properties.population / 100000);
        feature.properties.province_cases_per_population = (provinceData.total_cases - provinceData.total_fatalities - provinceData.total_recoveries) / (feature.properties.population / 100000);
        feature.properties.province_cases_active = provinceData.total_cases - provinceData.total_fatalities - provinceData.total_recoveries;
        feature.properties.province_deaths_total = provinceData.total_fatalities;
        feature.properties.province_hospitalizations_total = provinceData.total_hospitalizations;
        feature.properties.province_recoveries_total = provinceData.total_recoveries;
        feature.properties.province_tests_total = provinceData.total_tests;

        // Making centroids
        var centroidFeature = JSON.parse(JSON.stringify(feature));
        centroidFeature.geometry.coordinates = feature.properties.label_coords;
        centroidFeature.geometry.type = "Point";
        centroidGeoJSON.features.push(centroidFeature);

        if (fillRange.length === 0 || fillRange[0] > feature.properties.province_cases_per_population) {
          fillRange[0] = parseFloat(feature.properties.province_cases_per_population);
        }
        if (fillRange.length === 1 || fillRange[1] < feature.properties.province_cases_per_population) {
          fillRange[1] = parseFloat(feature.properties.province_cases_per_population);
        }
      })

      map.addSource('provinces', {
        type: 'geojson',
        data: response
      });
      map.addSource('provinces-centroids', {
        type: 'geojson',
        data: centroidGeoJSON
      });

      var fillColor = [
        'interpolate',
        ['linear'],
        ["number", ['get', 'province_cases_per_population']],
        fillRange[0], '#007000',
        fillRange[1] * 0.6, '#FFFF00',
        fillRange[1] * 0.7, '#FFA500',
        fillRange[1] * 0.8, '#FF0000',
        fillRange[1] * 0.9, '#ff0800'
      ];

      // var mapHTML = `
      //   <strong>Active Cases Per 100,000</strong>
      //   <div class="gradient-swatch"></div>
      //   <ul>
      //     <li style="text-align:left;">${fillRange[0].toFixed(1)}</li>
      //     <li style="text-align:center;">${(fillRange[1]*0.5).toFixed(1)}</li>
      //     <li style="text-align: right;">${fillRange[1].toFixed(1)}</li>
      //   </ul>
      //   <p>Total cases to date in red.</p>
      // `;

      // $('#map-overlay').html(mapHTML);

      map.addLayer({
        id: 'provinces-fill',
        type: 'fill',
        source: 'provinces',
        paint: {
          'fill-color': fillColor,
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.5,
            0.3
          ]
        }
      }, map.getSource('covid-cases') ? 'covid-cases' : null)

      map.addLayer({
        id: 'provinces-cases',
        type: 'symbol',
        source: 'provinces-centroids',
        layout: {
          'text-field': ["get", "province_cases_total"],
          'text-size': 12,
          'text-offset': [0, 0.6],
        },
        paint: {
          'text-color': '#b22525',
          'text-halo-color': '#FFF',
          'text-halo-width': 2
        }
      })

      map.addLayer({
        id: 'provinces-label',
        type: 'symbol',
        source: 'provinces-centroids',
        layout: {
          'text-field': ["get", "abbreviation"],
          'text-size': 15,
          'text-offset': [0, -0.6],
          'text-ignore-placement': true
        },
        paint: {
          'text-color': '#333',
          'text-halo-color': '#FFF',
          'text-halo-width': 2
        }
      })

      map.addLayer({
        id: 'provinces-line',
        type: 'line',
        source: 'provinces',
        paint: {
          'line-color': '#000',
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.5,
            0.3
          ]
        }
      })

      let hoveredStateId = false;
      map.on('mousemove', 'provinces-fill', (e) => {
        if (e.features.length > 0) {
          if (hoveredStateId) {
            map.setFeatureState({
              source: 'provinces',
              id: hoveredStateId
            }, {
              hover: false
            });
          }
          hoveredStateId = e.features[0].id;
          map.setFeatureState({
            source: 'provinces',
            id: hoveredStateId
          }, {
            hover: true
          });
        }

        let feature = e.features[0];
        const coordinates = e.features[0].geometry.coordinates.slice();
        console.log(e.features[0])
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
        // Create tooltip node
        const tooltipNode = document.createElement('div');
        ReactDOM.render(<Tooltip feature={feature} />, tooltipNode);

        // Set tooltip on map
       
        tooltipRef.current
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setDOMContent(tooltipNode)
          .addTo(map);
      });
      
      map.on('mouseleave', 'provinces-fill', function () {
        if (hoveredStateId) {
          map.setFeatureState({
            source: 'provinces',
            id: hoveredStateId
          }, {
            hover: false
          });
        }
        tooltipRef.current.remove();
        hoveredStateId = null;
      });
    })
  }


  return (
    <>
      <div className='map-container' ref={mapContainerRef} style={{
        width: '100%',
        height: '900px',
      }} />
    </>
  );
}

// const map_attributes = {
//   mapStyle: insetMapStyle,
//   interactiveLayerIds: ["provinces-fill"],
//   mapboxAccessToken: MAPBOX_TOKEN,
//   scrollZoom: false,
//   doubleClickZoom: false,
//   dragPan: false,
//   touchZoom: false,
//   touchRotate: false,
//   keyboard: false,
//   initialViewState: {
//     latitude: 28.0,
//     longitude: 84.2,
//     zoom: 4.9
//   }
// };

export default Map;
