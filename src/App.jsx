import { useEffect } from "react";
import "./index.css";
import {
  EventType,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";
import { RiveCanvasEvents } from "./enums/rive-events.enums";

// export const V3mail = () => {
//   // TODO: Load up Rive File

// };

let isInputFocused = false;

let inputValue = "";

export function Simple() {
  const { rive, RiveComponent } = useRive({
    src: "mailing_list_signup.riv",
    // stateMachines: "bumpy",
    artboard: "Mailing List",
    stateMachines: ["MainSM"],
    autoplay: true,
  });

  const setValueToEmailInput = (value) => {
    if (!isInputFocused) return;
    rive.setTextRunValue("txtMailInput", value);
  };

  const handleRiveEvent = (event) => {
    // debugger;
    const key = event.key;

    console.log("key", key, "inputValue", inputValue);

    let eventname = event?.data?.name;

    if (eventname === RiveCanvasEvents.txtFiedMouseDown) {
      isInputFocused = true;
      inputValue = rive.getTextRunValue("txtMailInput");
      // rive.setTextRunValue("txtMailInput", "|");
    }
  };

  const handleKeyChange = (event) => {
    console.log("event", event);
    const type = event?.type;

    const key = event.key;

    console.log("key", key, "inputValue", inputValue);

    if (key.length == 1) {
      inputValue = inputValue + "" + key;
    }

    const keyCode = event.keyCode || event.charCode;

    if (keyCode == 8 || keyCode == 46) {
      inputValue = inputValue?.slice(0, -1);
    }

    setValueToEmailInput(inputValue);
  };

  useEffect(() => {
    if (!rive) return;
    // rive?.load((params) => {
    //   console.log("params", params);
    // });

    // const textValue = rive.getTextRunValue("txtMailInput");

    // rive.setTextRunValue("txtMailInputEntry", "Hi");
    // rive.stateMachineInputs();

    // console.log("txtMailInputEntry", textValue);

    const inputs = rive.stateMachineInputs("MainSM");
    const names = rive.stateMachineNames;
    console.log("inputs", inputs);
    console.log("names", names);
    // console.log("rive.stateMachineInputs();", rive.stateMachineInputs());

    rive.on(EventType.RiveEvent, handleRiveEvent);

    // window.addEventListener("keypress", handleKeyChange);
    window.addEventListener("keydown", handleKeyChange);
  }, [rive]);

  // const riveStateInput = useStateMachineInput(rive);

  // console.log("riveStateInput", riveStateInput?.value());

  // console.log("rive", rive);

  return (
    <RiveComponent
      // onMouseEnter={() => rivfdfde && rive.play()}
      // onMouseLeave={() => rive && rive.pause()}
      // onKeyDown={() => rive && rive.startRendering(true)}
      // onKeyDown={handleKeyChange}
      // onMouseDown={(event) => {
      //   console.log("onMouseDown", event);
      // }}
      onChange={handleKeyChange}
    />
  );
}

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="RiveContainer">
        {/* <TwoAV3 /> */}
        <Simple />
      </div>
    </div>
  );
}
