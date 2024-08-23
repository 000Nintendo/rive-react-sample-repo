import RiveCanvas from "@rive-app/canvas-advanced";
import { registerTouchInteractions } from "./registerTouchInteractions";

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
        "https://unpkg.com/@rive-app/canvas-advanced@2.17.3/rive.wasm",
    });

    isLoadingModule = false;
    RiveModule = rive;
    cb(RiveModule);
    for (let cb of callbacks) {
      cb(RiveModule);
    }
  }
}

export class RiveServices {
  static eventCleanup = null;

  static loadRive = (url) => {
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
            resolve({ rive, file_buffer: buffer, file: file });
          });
      });
    });
  };

  /**
   * Setup Rive Listeners on the canvas
   * @param riveListenerOptions - Enables TouchEvent events on the canvas. Set to true to allow
   * touch scrolling on the canvas element on touch-enabled devices
   * i.e. { isTouchScrollEnabled: true }
   */
  static setupRiveListeners({
    riveListenerOptions,
    rive,
    stateMachines = [],
    canvas,
    artboard,
    renderer,
    layout,
  }) {
    if (!this.shouldDisableRiveListeners) {
      const activeStateMachines = (stateMachines || [])
        // .filter((sm) => sm.playing && rive.hasListeners(sm.instance))
        // .map((sm) => sm?.g?.u?.i);
        .map((sm) => sm);
      let touchScrollEnabledOption = this.isTouchScrollEnabled;

      if (
        riveListenerOptions &&
        "isTouchScrollEnabled" in riveListenerOptions
      ) {
        touchScrollEnabledOption = riveListenerOptions.isTouchScrollEnabled;
      }
      this.eventCleanup = registerTouchInteractions({
        canvas: canvas,
        artboard: artboard,
        stateMachines: activeStateMachines,
        renderer: renderer,
        rive: rive,
        fit: rive.Fit,
        alignment: rive.Alignment,
        isTouchScrollEnabled: touchScrollEnabledOption,
      });
    }
  }

  /**
   * Remove Rive Listeners setup on the canvas
   */
  static removeRiveListeners() {
    if (this.eventCleanup) {
      this.eventCleanup();
    }
  }
}
