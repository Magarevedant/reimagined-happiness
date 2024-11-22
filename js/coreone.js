// coreone.js

const CoreOne = (() => {
  // IndexedDB setup for file storage
  const dbPromise = indexedDB.open("SeptOneFileSystem", 1);
  dbPromise.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("files", { keyPath: "path" });
  };

  // **System Utilities**
  const sys = {
    log: (message) => {
      console.log(`[CoreOne] ${message}`);
    },
    error: (message) => {
      console.error(`[CoreOne ERROR] ${message}`);
    }
  };

  // **File System Management**
  const fileSystem = {
   createFile: (path, content = "", callback) => {
  console.log("Attempting to create file:", path); // Log start of the process
  
  dbPromise.onsuccess = (event) => {
    const db = event.target.result;
    console.log("Database opened successfully:", db); // Log successful DB open

    const tx = db.transaction("files", "readwrite");
    const store = tx.objectStore("files");

    const request = store.get(path);
    request.onsuccess = () => {
      if (request.result) {
        console.log(`Error: File at path '${path}' already exists.`);
        callback && callback(`Error: File at path '${path}' already exists.`);
      } else {
        console.log(`Creating new file at path '${path}'`);
        const addRequest = store.put({ path, content });
        addRequest.onsuccess = () => {
          console.log(`File '${path}' created successfully.`);
          callback && callback(`File '${path}' created successfully.`);
        };
        addRequest.onerror = () => {
          console.log(`Error: Failed to create file at path '${path}'.`);
          callback && callback(`Error: Failed to create file at path '${path}'.`);
        };
      }
    };
    
    request.onerror = () => {
      console.log(`Error: Could not check for existing file at path '${path}'.`);
      callback && callback(`Error: Could not check for existing file at path '${path}'.`);
    };

    tx.onerror = () => {
      console.log(`Transaction failed: Could not create file at path '${path}'.`);
      callback && callback(`Transaction failed: Could not create file at path '${path}'.`);
    };
  };

  dbPromise.onerror = () => {
    console.log("Error: Database connection failed.");
    callback && callback("Error: Database connection failed.");
  };
},
    readFile: (path, callback) => {
      dbPromise.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction("files", "readonly");
        const store = tx.objectStore("files");

        const request = store.get(path);
        request.onsuccess = () => callback(request.result ? request.result.content : `Error: File '${path}' not found.`);
        request.onerror = () => sys.error(`Failed to read file: ${path}`);
      };
    },
    deleteFile: (path, callback) => {
      dbPromise.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction("files", "readwrite");
        const store = tx.objectStore("files");

        store.delete(path).onsuccess = () => {
          callback && callback(`File '${path}' deleted.`);
        };
      };
    },
    listFiles: (path, callback) => {
      // Here, 'path' is accepted but unused, as we are listing all files.
      dbPromise.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction("files", "readonly");
        const store = tx.objectStore("files");

        const request = store.getAll();
        request.onsuccess = () => {
          const files = request.result.map(file => ({
            name: file.path.split('/').pop(), // Extracts the file name from the path
            path: file.path,
          }));
          if (typeof callback === "function") {
            callback(files);
          } else {
            console.warn("Callback provided to listFiles is not a function.");
          }
        };
        request.onerror = () => {
          console.error("Error occurred while listing files.");
        };
      };
    },
    scanApps: (callback) => {
      dbPromise.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction("files", "readonly");
        const store = tx.objectStore("files");

        const request = store.getAll();
        request.onsuccess = () => {
          const apps = request.result.filter(file => file.path.endsWith(".txt"));
          callback && callback(apps);
        };
      };
    },
  };

  // **Window Management** with WinBox.js
  const windowManager = {
    openWindow: (title, content, options = {}) => {
      const win = new WinBox({
        title,
        background: options.background || "#ffffff",
        width: options.width || 400,
        height: options.height || 300,
        mount: document.createElement("div"),
        ...options
      });
      win.body.innerHTML = content;
      return win;
    },
    openAppWindow: (appName, appContent) => {
      return windowManager.openWindow(appName, appContent, { background: "#e0e0e0" });
    },
  };

  // **App Management** - dynamically load apps from SeptOne filesystem
  const appLoader = {
    loadApps: (callback) => {
      fileSystem.scanApps((apps) => {
        callback && callback(apps);
      });
    },
    runApp: (appFile) => {
      fileSystem.readFile(appFile.path, (content) => {
        if (content) {
          windowManager.openAppWindow(appFile.path, content);
        } else {
          sys.error(`App '${appFile.path}' could not be loaded.`);
        }
      });
    }
  };

  // **Data Storage** using localStorage
  const storage = {
    saveData: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        sys.log(`Data saved: ${key}`);
      } catch (error) {
        sys.error(`Failed to save data: ${error}`);
      }
    },
    getData: (key) => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (error) {
        sys.error(`Failed to retrieve data: ${error}`);
        return null;
      }
    },
    deleteData: (key) => {
      localStorage.removeItem(key);
      sys.log(`Data deleted: ${key}`);
    },
  };

  // **Example Apps** (Could be in separate files in the SeptOne filesystem)
  const availableApps = [
    {
      name: "Calculator",
      icon: "icons/calculator.png",
      openFunction: () => windowManager.openAppWindow("Calculator", "<h2>Calculator App</h2><p>Calculator content here</p>")
    },
    {
      name: "Notes",
      icon: "icons/notes.png",
      openFunction: () => windowManager.openAppWindow("Notes", "<h2>Notes App</h2><textarea rows='10' cols='30'>Take notes here...</textarea>")
    },
    {
      name: "Weather",
      icon: "icons/weather.png",
      openFunction: () => windowManager.openAppWindow("Weather", "<h2>Weather App</h2><p>Weather data here</p>")
    },
  ];

  // **App Management API** to scan and load dynamic app files in SeptOne
  const appManager = {
    getAvailableApps: () => availableApps,
    runAppByName: (appName) => {
      const app = availableApps.find(a => a.name === appName);
      app ? app.openFunction() : sys.error(`App '${appName}' not found.`);
    }
  };

  // **Public API for the Kernel**
  return {
    availableApps,
    sys,
    fileSystem,
    windowManager,
    storage,
    appLoader,
    appManager,
  };
})();
