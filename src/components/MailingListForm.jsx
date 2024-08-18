import { useEffect, useState } from "react";
import { EventType, useRive } from "@rive-app/react-canvas";
import { RiveCanvasEnums } from "../enums/rive-events.enums";
import TypingCursor from "./TypingCursor";

let isInputFocused = false;
let inputValue = "";

export function MailingListForm() {
  const { rive, RiveComponent } = useRive({
    src: "mailing_list_signup_updates_for_email_input.riv",
    artboard: "Mailing List",
    stateMachines: ["MainSM"],
    autoplay: true,
    useDevicePixelRatio: true,
  });

  const [cursorState, setCursorState] = useState({
    textWidth: 0,
    text: "",
    showCursor: false,
  });

  // let showInputCursorInput = useStateMachineInput(
  //   rive,
  //   "MainSM",
  //   RiveCanvasEnums.inputs.showTypingCursor
  // );
  // let hideInputCursorInput = useStateMachineInput(
  //   rive,
  //   "MainSM",
  //   RiveCanvasEnums.inputs.hideTypingCursor
  // );

  const showInputCursor = () => {
    if (inputValue.length === 0) {
      rive.setTextRunValue("txtMailInput", "");
    }

    inputValue = rive.getTextRunValue("txtMailInput");

    setCursorState({
      ...cursorState,
      showCursor: true,
      text: inputValue,
    });
  };

  // const hideInputCursor = () => {
  //   // hideInputCursorInput.fire();

  //   setCursorState({
  //     ...cursorState,
  //     showCursor: false,
  //   });
  // };

  const setValueToEmailInput = (value) => {
    if (!isInputFocused) return;
    rive.setTextRunValue("txtMailInput", value);

    setCursorState({
      ...cursorState,
      showCursor: true,
      text: value,
    });
  };

  const handleRiveEvent = (event) => {
    let eventname = event?.data?.name;

    if (eventname === RiveCanvasEnums.txtFiedMouseDown) {
      isInputFocused = true;
      showInputCursor();
    }
  };

  const handleKeyChange = (event) => {
    let key = event.key;

    let code = event.code;

    if (code?.includes("Key")) {
      key = code?.[code.length - 1];
    }

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

    const inputs = rive.stateMachineInputs("MainSM");
    // const names = rive.stateMachineNames;
    console.log("inputs", inputs);
    // console.log("names", names);

    // inputs.forEach((input) => {
    //   if (input.name === RiveCanvasEnums.inputs.showTypingCursor) {
    //     showInputCursorInput = input;
    //   }

    //   if (input.name === RiveCanvasEnums.inputs.hideTypingCursor) {
    //     hideInputCursorInput = input;
    //   }
    // });

    // inputValue = rive.getTextRunValue("txtMailInput");

    console.log("inputValue", inputValue);
    // showInputCursorInput =

    // hideInputCursorInput =

    // console.log("showInputCursorInput", showInputCursorInput);
    // console.log("hideInputCursorInput", hideInputCursorInput);

    rive.on(EventType.RiveEvent, handleRiveEvent);

    window.addEventListener("keydown", handleKeyChange);
  }, [rive]);

  useEffect(() => {
    var test = document.getElementById("hiddle-text-container");
    // var height = test.clientHeight + 1;
    var width = test.clientWidth + 1;

    setCursorState({
      ...cursorState,
      textWidth: width,
    });

    // console.log("text-width", width);
  }, [cursorState.text]);

  return (
    <>
      <div className="rive-component-container">
        <RiveComponent />

        <div id="hiddle-text-container">{cursorState.text}</div>
      </div>

      <TypingCursor
        textWidth={cursorState?.textWidth ?? 0}
        showCursor={cursorState.showCursor}
      />
    </>
  );
}
