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
      timeout: 10000,
      maximumAge: 1000,
    }
  );
} else {
  // Fallback to IP-based geolocation
  fetch("https://ipapi.co/json/")
    .then((response) => response.json())
    .then((data) => {
      console.log("IP-based location:", data);
      socket.emit("send-location", {
        latitude: data.latitude,
        longitude: data.longitude,
      });
    })
    .catch((error) =>
      console.error("Error fetching IP-based location:", error)
    );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Aastik Street Maps",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude], 16);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

socket.on("user-diconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
