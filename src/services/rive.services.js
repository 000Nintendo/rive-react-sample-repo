import RiveCanvas from "@rive-app/canvas-advanced";

let RiveModule = null;
let isLoadingModule = false;
const callbacks = [];

async function loadRiveModule(cb) {
  if (isLoadingModule) {
    callbacks.push(cb);
  } else if (RiveModule) {
    cb(RiveModule);
  } else {
    console.log("loading module");
    isLoadingModule = true;

    const rive = await RiveCanvas({
      locateFile: (_) =>
        "<https://unpkg.com/@rive-app/canvas-advanced@2.17.3/rive.wasm>",
    });

    isLoadingModule = false;
    RiveModule = rive;
    cb(RiveModule);
    for (let cb of callbacks) {
      cb(RiveModule);
    }

    // Rive({
    //   locateFile: (file) => `https://unpkg.com/rive-canvas@0.6.10/${file}`,
    // }).then((module) => {
    //   isLoadingModule = false;
    //   RiveModule = module;
    //   cb(RiveModule);
    //   for (let cb of callbacks) {
    //     cb(RiveModule);
    //   }
    // });
  }
}

export default function loadRive(url) {
  return new Promise((resolve, reject) => {
    loadRiveModule((rive) => {
      const { load } = rive;
      const assetRequest = new Request(url);

      fetch(assetRequest)
        .then((response) => {
          return response.arrayBuffer();
        })
        .then((buffer) => {
          // Load Rive file from buffer.
          const file = load(new Uint8Array(buffer));
          resolve({ rive, file });
        });
    });
  });
}
