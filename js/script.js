// script.js

// Attempt to create a file
CoreOne.fileSystem.createFile('/docs/vedant.txt', 'Hello, again!', (message) => {
  console.log(message); // Logs success or error message
});

CoreOne.sys.log("hello");

document.addEventListener("DOMContentLoaded", () => {
  // List of image URLs to preload
  const images = [
    'icons/apps.png',
    'icons/files.png',
    'icons/settings.png',
    // Add other images if needed
  ];

  // Preload images and show desktop once done
  preloadImages(images, () => {
    document.getElementById('boot-screen').style.display = 'none';
    document.getElementById('desktop').style.display = 'flex';
    document.getElementById('taskbar').style.display = 'flex';
    document.getElementById('fullscreen-modal').style.display = 'flex'; // Show fullscreen prompt
  });
});

// Function to preload images
function preloadImages(sources, callback) {
  let loadedCount = 0;
  const total = sources.length;

  sources.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedCount++;
      if (loadedCount === total) {
        callback(); // All images are loaded
      }
    };
  });
}

// Fullscreen request function
function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { // Firefox
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE/Edge
    elem.msRequestFullscreen();
  }
  document.getElementById('fullscreen-modal').style.display = 'none'; // Hide modal after fullscreen
}

// Function to open a new window with the given app name
function openWindow(appName) {
  new WinBox({
    title: appName,
    bottom: 40,
    background: '#21212d',
  });
}

// Warning function with modal
function warn(text) {
  new WinBox({
    title: "Warning",
    modal: true,
    x: "center",
    y: "center",
    height: "30%",
    width: "40%",
    background: "#ffcccc", // Optional styling for warning
    content: text,
  });
}

// Launch Apps, Settings, and Files windows
function launch_apps() {
  new WinBox({
    title: "Apps",
    modal: true,
    x: "center",
    y: "center",
    height: "50%",
    width: "60%",
    bottom: 40,
    icon: "icons/apps.png",
    background: "#21212d",
  });
}

function launch_settings() {
  new WinBox({
    title: "Settings",
    modal: false,
    x: "center",
    y: "center",
    height: "50%",
    width: "60%",
    bottom: 40,
    icon: "icons/settings.png",
    background: "#21212d",
  });
}

function launch_files() {
  new WinBox({
    title: "Files",
    modal: false,
    x: "center",
    y: "center",
    height: "400px",
    width: "200px",
    bottom: 40,
    icon: "icons/files.png",
    background: "#21212d",
    url: "apps/filemanager.html", // URL for file manager
  });
}

// Function to open Apps modal with dynamic content
function openAppsModal() {
  const appsModal = new WinBox({
    title: "Apps",
    width: 450,
    height: 350,
    modal: true,
    x: "center",
    y: "center",
    background: "#21212d",
    class: ["no-full", "no-resize"], // Optional styling classes
    mount: document.createElement("div"),
  });

  const modalContent = appsModal.body;
  modalContent.innerHTML = "<h3>Select an App</h3>";

  const appGrid = document.createElement("div");
  appGrid.classList.add("app-grid");

  CoreOne.availableApps.forEach(app => {
    const appCard = document.createElement("div");
    appCard.classList.add("app-card");

    const icon = document.createElement("img");
    icon.src = app.icon;
    icon.alt = `${app.name} Icon`;
    icon.classList.add("app-icon");

    const label = document.createElement("span");
    label.textContent = app.name;
    label.classList.add("app-label");

    appCard.appendChild(icon);
    appCard.appendChild(label);
    
    // Open app when clicked
    appCard.onclick = () => app.openFunction();
    appGrid.appendChild(appCard);
  });

  modalContent.appendChild(appGrid);
}

// Hook up the Apps icon in HTML to open the Apps modal
document.querySelector(".app-icon.apps").addEventListener("click", openAppsModal);
