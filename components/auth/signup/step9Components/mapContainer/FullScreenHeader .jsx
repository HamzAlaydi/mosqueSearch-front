"use client";
// This is just the specific fullscreen functionality part to fix
// for the MapContainer component

// Constants for map container styling
const MAP_CONTAINER_STYLE_DEFAULT = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
  transition: "height 0.3s ease-in-out",
};

const MAP_CONTAINER_STYLE_FULLSCREEN = {
  width: "100%",
  height: "85vh", // Adjust as needed for fullscreen header/footer
  borderRadius: "0",
  transition: "height 0.3s ease-in-out",
};

// Fix for fullscreen toggle functionality
const toggleFullScreen = (isFullScreen, setIsFullScreen, fitMapToBounds) => {
  const mapElement = document.getElementById("google-map-container");
  if (!mapElement) return;

  // Create a fullscreen container if it doesn't exist yet
  let fullscreenContainer = document.getElementById("fullscreen-map-container");
  if (!fullscreenContainer && !isFullScreen) {
    fullscreenContainer = document.createElement("div");
    fullscreenContainer.id = "fullscreen-map-container";
    fullscreenContainer.className =
      "fixed inset-0 z-50 bg-white overflow-hidden flex flex-col";
    document.body.appendChild(fullscreenContainer);
  }

  if (!isFullScreen) {
    // Going fullscreen
    document.body.style.overflow = "hidden"; // Prevent body scrolling

    // Create header for fullscreen mode if it doesn't exist
    let header = document.getElementById("fullscreen-map-header");
    if (!header) {
      header = document.createElement("div");
      header.id = "fullscreen-map-header";
      header.className =
        "p-4 border-b flex justify-between items-center bg-white shadow-sm";
      header.innerHTML = `
        <button id="exit-fullscreen-btn" class="flex items-center text-gray-700 hover:text-gray-900 text-sm font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m15 19-7-7 7-7"></path></svg>
          <span>Back</span>
        </button>
        <div class="text-center flex-grow">
          <h2 class="font-semibold text-lg">Select Mosques</h2>
        </div>
        <div class="w-20"></div>
      `;
      fullscreenContainer.appendChild(header);
    }

    // Create or get the map content container
    let mapContent = document.getElementById("fullscreen-map-content");
    if (!mapContent) {
      mapContent = document.createElement("div");
      mapContent.id = "fullscreen-map-content";
      mapContent.className = "flex-grow relative";
      fullscreenContainer.appendChild(mapContent);
    }

    // Move the map to the fullscreen container
    mapContent.appendChild(mapElement);

    // Add event listener to exit button
    const exitBtn = document.getElementById("exit-fullscreen-btn");
    if (exitBtn) {
      exitBtn.onclick = () =>
        toggleFullScreen(true, setIsFullScreen, fitMapToBounds);
    }
  } else {
    // Exiting fullscreen
    document.body.style.overflow = ""; // Restore scrolling

    // Find the original map container
    const originalContainer = document.querySelector(".mb-4.relative > div");
    if (originalContainer) {
      originalContainer.appendChild(mapElement);
    }

    // Remove the fullscreen container if it exists
    if (fullscreenContainer) {
      document.body.removeChild(fullscreenContainer);
    }

    // Let the map resize and re-fit the bounds
    setTimeout(() => {
      if (fitMapToBounds && typeof fitMapToBounds === "function") {
        fitMapToBounds();
      }
    }, 100);
  }

  // Update the fullscreen state
  setIsFullScreen(!isFullScreen);

  // Manually resize the map to ensure proper redrawing
  setTimeout(() => {
    const mapInstance = window.google?.maps?.event;
    if (mapInstance && mapElement.__gm && mapElement.__gm.map) {
      mapInstance.trigger(mapElement.__gm.map, "resize");
    }
  }, 200);
};

// Export this functionality to use in your MapContainer component
export {
  toggleFullScreen,
  MAP_CONTAINER_STYLE_DEFAULT,
  MAP_CONTAINER_STYLE_FULLSCREEN,
};
