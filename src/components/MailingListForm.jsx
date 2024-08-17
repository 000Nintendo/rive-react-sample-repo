import { useEffect } from "react";
import { EventType, useRive } from "@rive-app/react-canvas";
import { RiveCanvasEvents } from "../enums/rive-events.enums";

let isInputFocused = false;
let inputValue = "";

export function MailingListForm() {
  const { rive, RiveComponent } = useRive({
    src: "mailing_list_signup.riv",
    artboard: "Mailing List",
    stateMachines: ["MainSM"],
    autoplay: true,
  });

  const setValueToEmailInput = (value) => {
    if (!isInputFocused) return;
    rive.setTextRunValue("txtMailInput", value);
  };

  const handleRiveEvent = (event) => {
    let eventname = event?.data?.name;

    if (eventname === RiveCanvasEvents.txtFiedMouseDown) {
      isInputFocused = true;
      inputValue = rive.getTextRunValue("txtMailInput");
    }
  };

  const handleKeyChange = (event) => {
    const key = event.key;

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

    // const inputs = rive.stateMachineInputs("MainSM");
    // const names = rive.stateMachineNames;
    // console.log("inputs", inputs);
    // console.log("names", names);

    rive.on(EventType.RiveEvent, handleRiveEvent);

    window.addEventListener("keydown", handleKeyChange);
  }, [rive]);

  return (
    <RiveComponent
    // onMouseEnter={() => rivfdfde && rive.play()}
    // onMouseLeave={() => rive && rive.pause()}
    // onKeyDown={() => rive && rive.startRendering(true)}
    // onKeyDown={handleKeyChange}
    // onMouseDown={(event) => {
    //   console.log("onMouseDown", event);
    // }}
    />
  );
}
