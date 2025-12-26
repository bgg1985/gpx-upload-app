const xml2js = require('xml2js');

function generateGPXFile(data, establishments) {
  const builder = new xml2js.Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });

  const allWaypoints = [...data.waypoints, ...establishments];

  const gpxObject = {
    gpx: {
      $: {
        version: '1.1',
        creator: 'GPX Route Pub Finder',
        xmlns: 'http://www.topografix.com/GPX/1/1',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd'
      },
      metadata: {
        name: data.metadata.name || 'Route with Drinking Establishments',
        time: new Date().toISOString()
      },
      wpt: allWaypoints.map(wpt => ({
        $: {
          lat: wpt.lat,
          lon: wpt.lon
        },
        name: wpt.name,
        cmt: isDrinkingEstablishment(wpt.type) ? wpt.type : undefined,
        desc: wpt.desc || '',
        type: isDrinkingEstablishment(wpt.type) ? 'food' : (wpt.type || 'generic'),
        sym: 'Dot'
      })),
      trk: {
        name: data.metadata.name || 'Track',
        trkseg: {
          trkpt: data.track.map(pt => ({
            $: {
              lat: pt.lat,
              lon: pt.lon
            },
            ele: pt.ele || undefined,
            time: pt.time || undefined
          }))
        }
      }
    }
  };

  return builder.buildObject(gpxObject);
}

function isDrinkingEstablishment(type) {
  const drinkingTypes = ['pub', 'bar', 'biergarten', 'nightclub'];
  return drinkingTypes.includes(type);
}

module.exports = { generateGPXFile };