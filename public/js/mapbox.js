export const displayMap = locations => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiaXJhc2hwZXJlcmEiLCJhIjoiY2xyODBpcTBzMGlqNTJpbnhyMW1veXlsdCJ9.4dVfiXeXbxpNZkwGwKKfUg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/irashperera/clr95m5ck003g01qq7ojmayq7',
    scrollZoom:false
  });
  
  const bounds = new mapboxgl.LngLatBounds();
  
  locations.forEach(loc => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';
    
    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map)
  
    //add popup
    new mapboxgl.Popup({
      offset:30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map)
  
    bounds.extend(loc.coordinates);
  });
  
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      left: 100,
      right: 100,
      bottom:150
  }})
  
}
