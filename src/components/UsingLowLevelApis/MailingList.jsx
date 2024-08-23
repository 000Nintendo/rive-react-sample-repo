import "./styles/MailingList.scss";

import React, { useEffect, useRef, useState } from "react";
import InputTypingCursor from "./InputTypingCursor";
import { Layout, RiveEventType } from "@rive-app/react-canvas";
import { RiveServices } from "../../services/rive.services";
import { RiveCanvasEnums } from "../../enums/rive-events.enums";
import { Toast } from "primereact/toast";

let isInputFocused = false;
let inputValue = "";
let animtionStateInput = null;
let ctx,
  renderer,
  alignFit,
  requestId,
  artboard,
  lastTime = 0,
  stateMachine;
let instances = {
  emailInput: null,
  animState: 0,
};

const MailingList = () => {
  const canvas = useRef(null);
  const container = useRef(null);
  const toast = useRef(null);

  const [cursorState, setCursorState] = useState({
    textWidth: 0,
    text: "",
    showCursor: false,
  });

  const showInputCursor = () => {
    if (inputValue.length === 0) {
      instances.emailInput.text = "";
    }

    inputValue = instances.emailInput.text;

    setCursorState({
      ...cursorState,
      showCursor: true,
      text: inputValue,
    });
  };

  const setValueToEmailInput = (value) => {
    if (!isInputFocused) return;
    instances.emailInput.text = value;

    setCursorState({
      ...cursorState,
      showCursor: true,
      text: value,
    });
  };

  const resize = () => {
    if (container.current && canvas.current) {
      const { width, height } = container.current.getBoundingClientRect();
      canvas.current.width = width;
      canvas.current.height = height;
    }
  };

  const handleRiveEvent = (event) => {
    let eventname = event?.name;

    console.log("eventname", eventname);

    const animState = instances.animState?.g?.count?.value;

    if (eventname === RiveCanvasEnums.listeners.txtFiedMouseDown) {
      isInputFocused = true;
      showInputCursor();
      return;
    }

    if (eventname === RiveCanvasEnums.listeners.btnSubmitClick) {
      isInputFocused = false;
      // submitForm();
      return;
    }

    // Event triggers on resend email button as well
    if (eventname === RiveCanvasEnums.listeners.btnYesClick) {
      isInputFocused = false;

      // handleRemoveEmail({
      //   remove: true,
      // });

      return;
    }

    if (eventname === RiveCanvasEnums.listeners.btnNoClick) {
      isInputFocused = false;

      if (animState == 2) {
        // resendVerificationEmail({
        //   remove: true,
        // });

        return;
      }

      // showEmailForm();

      return;
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
    const setCanvas = async (canvas) => {
      if (!canvas) {
        return;
      }

      const { rive, file_buffer } = await RiveServices.loadRive(
        "mailing_list_signup.riv"
      );

      let file = await rive.load(new Uint8Array(file_buffer));

      const { Alignment, Fit } = rive;
      artboard = file.artboardByName("Mailing List");
      stateMachine = new rive.StateMachineInstance(
        artboard.stateMachineByName("MainSM"),
        artboard
      );
      const animation = new rive.LinearAnimationInstance(
        artboard.animationByName("MainSM"),
        artboard
      );

      instances.emailInput = artboard.textRun("txtMailInput");

      const inputsCount = stateMachine.inputCount();

      for (let i = 0; i < inputsCount; i++) {
        const input = stateMachine.input(i);
        if (input.name === RiveCanvasEnums.inputs.animState) {
          instances.animState = input;
        }
      }

      alignFit = {
        alignment: Alignment.center,
        fit: Fit.cover,
      };

      let layout = new Layout();

      ctx = canvas.getContext("2d", { alpha: true });
      renderer = rive.makeRenderer(canvas);
      artboard.advance(0);
      artboard.draw(renderer);

      let lastTime = 0;

      RiveServices.setupRiveListeners({
        riveListenerOptions: {},
        artboard: artboard,
        canvas,
        layout,
        renderer,
        rive,
        stateMachines: [stateMachine],
      });

      function renderLoop(time) {
        if (!lastTime) {
          lastTime = time;
        }
        const elapsedTimeMs = time - lastTime;
        const elapsedTimeSec = elapsedTimeMs / 1000;
        // const elapsedTimeSec = (time - lastTime) / 1000;

        lastTime = time;

        renderer.clear();
        if (artboard) {
          if (animation) {
            animation.advance(elapsedTimeSec);
            animation.apply(1);
          }

          if (stateMachine) {
            const numFiredEvents = stateMachine.reportedEventCount();

            console.log("numFiredEvents", numFiredEvents);

            for (let i = 0; i < numFiredEvents; i++) {
              const event = stateMachine.reportedEventAt(i);
              handleRiveEvent(event);
            }
          }

          if (animation) {
            animation.advance(elapsedTimeSec);
            animation.apply(1);
          }

          stateMachine.advance(elapsedTimeSec);
          artboard.advance(elapsedTimeSec);
          renderer.save();
          renderer.align(
            rive.Fit.contain,
            rive.Alignment.center,
            {
              minX: 0,
              minY: 0,
              maxX: canvas.width,
              maxY: canvas.height,
            },
            artboard.bounds
          );
          artboard.draw(renderer);
          renderer.restore();
        }
        rive.requestAnimationFrame(renderLoop);
      }
      rive.requestAnimationFrame(renderLoop);

      //   requestId = requestAnimationFrame(drawFrame);
    };

    setCanvas(canvas.current);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => focus(e));
    // canvas.current?.addEventListener("mousedown", blink);
    window.addEventListener("keydown", handleKeyChange);

    return () => {
      cancelAnimationFrame(requestId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", (e) => focus(e));
      window.removeEventListener("keydown", handleKeyChange);
    };
  }, []);

  useEffect(() => {
    var textContainer = document.getElementById("hidden-text-container");
    var width = textContainer.clientWidth + 1;

    setCursorState({
      ...cursorState,
      textWidth: width,
    });
  }, [cursorState.text]);

  return (
    <div>
      <div ref={container} className="email-form-container">
        <canvas ref={canvas} id="email-form-canvas" />
      </div>

      <div id="hidden-text-container">{cursorState.text}</div>

      <InputTypingCursor
        showCursor={cursorState.showCursor}
        textWidth={cursorState.textWidth}
      />

      <Toast ref={toast} />
    </div>
  );
};

export default MailingList;
