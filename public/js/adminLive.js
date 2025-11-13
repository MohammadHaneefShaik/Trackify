const map = L.map("map").setView([17.4, 78.5], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const socket = io();

const buses = {};

socket.on("receive-location", data => {
  const { busId, latitude, longitude } = data;

  if (!buses[busId]) {
    buses[busId] = L.marker([latitude, longitude]).addTo(map);
  } else {
    buses[busId].setLatLng([latitude, longitude]);
  }
});
