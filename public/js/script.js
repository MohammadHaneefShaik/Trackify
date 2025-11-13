// Create bus icon
/*const busIcon = L.icon({
  iconUrl: "/images/bus.png",
  iconSize: [50, 50],
  iconAnchor: [20, 20],
});*/
const busIcon = L.divIcon({
  html: `
    <div class="bus-wrapper">
      <img src="/images/bus.png" class="bus-img">
    </div>
  `,
  className: "bus-marker",
  iconSize: [52, 52],
  iconAnchor: [26, 26],
});



const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 3000,
      maximumAge: 0,
    }
  );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Haneef",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude], 16);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    // add bus icon instead of default marker
    markers[id] = L.marker([latitude, longitude], { icon: busIcon }).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
