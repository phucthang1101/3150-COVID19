import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import ReactDOM from 'react-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import TooltipVac from '../Tooltip/TooltipVac.js';


mapboxgl.accessToken = 'pk.eyJ1IjoibWFwc3RlcnRlY2giLCJhIjoiY2s4M2U4eGJmMWJlejNsb3EyOXV4Zm1zaiJ9.aLWnB4UTvCto0wF5_9fePg';

function VacMap() {
  const mapContainerRef = useRef(null);
  //const popup = useRef(null);
  const tooltipRef = useRef(new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 15
  }));
  const [map, setMap] = useState(null);

  useEffect(() => {
    const res = fetch(`/api/reports`)
      .then(res => res.json())
      .then(res => { drawMap(res.data) })
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
        feature.properties.province_vaccinations_total = provinceData.total_vaccinations;
        feature.properties.province_vaccinations_per_population = (Math.floor(((provinceData.total_vaccinations) / (feature.properties.population / 100000)) * 10) / 10);

        // Making centroids
        var centroidFeature = JSON.parse(JSON.stringify(feature));
        centroidFeature.geometry.coordinates = feature.properties.label_coords;
        centroidFeature.geometry.type = "Point";
        centroidGeoJSON.features.push(centroidFeature);

        if (fillRange.length === 0 || fillRange[0] > feature.properties.province_vaccinations_per_population) {
          fillRange[0] = parseFloat(feature.properties.province_vaccinations_per_population);
        }
        if (fillRange.length === 1 || fillRange[1] < feature.properties.province_vaccinations_per_population) {
          fillRange[1] = parseFloat(feature.properties.province_vaccinations_per_population);
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
        ["number", ['get', 'province_vaccinations_per_population']],
        fillRange[0], '#F1FFEE',
        //  fillRange[1] * 0.4, '#233309', 
        fillRange[1] * 0.9, '#111905'
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
          'text-field': ["get", "province_vaccinations_total"],
          'text-size': 14,
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
        // Create tooltip node
        const tooltipNode = document.createElement('div');
        ReactDOM.render(<TooltipVac feature={feature} />, tooltipNode);

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

export default VacMap;
