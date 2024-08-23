import "./styles/MailingList.scss";

import React, { useEffect, useRef, useState } from "react";
import InputTypingCursor from "./InputTypingCursor";
import { RiveEventType } from "@rive-app/react-canvas";
import { RiveServices } from "../../services/rive.services";

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
};

const MailingList = () => {
  const canvas = useRef(null);
  const container = useRef(null);

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

  useEffect(() => {
    const setCanvas = async (canvas) => {
      if (!canvas) {
        return;
      }

      const { rive, file_buffer } = await RiveServices.loadRive(
        "mailing_list_signup.riv"
      );

      let file = await rive.load(new Uint8Array(file_buffer));

      const { CanvasRenderer, LinearAnimationInstance, Alignment, Fit } = rive;
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

      alignFit = {
        alignment: Alignment.center,
        fit: Fit.cover,
      };

      instances = {};

      debugger

      RiveServices.setupRiveListeners({}, rive, [stateMachine]);

      ctx = canvas.getContext("2d", { alpha: true });
      renderer = rive.makeRenderer(canvas);
      artboard.advance(0);
      artboard.draw(renderer);
      let lastTime = 0;

      function renderLoop(time) {
        if (!lastTime) {
          lastTime = time;
        }
        const elapsedTimeMs = time - lastTime;
        const elapsedTimeSec = elapsedTimeMs / 1000;
        // const elapsedTimeSec = (time - lastTime) / 1000;

        lastTime = time;

        const numFiredEvents = stateMachine.reportedEventCount();

        renderer.clear();
        if (artboard) {
          if (animation) {
            animation.advance(elapsedTimeSec);
            animation.apply(1);
          }

          if (stateMachine) {
            const numFiredEvents = stateMachine.reportedEventCount();
            const inputs = stateMachine.inputCount();

            const stateChangeCount = stateMachine.stateChangedCount();

            console.log("numFiredEvents", numFiredEvents);

            for (let i = 0; i < numFiredEvents; i++) {
              const event = stateMachine.reportedEventAt(i);
              console.log("rive event", event);

              debugger;
              // Run any Event-based logic now
              let eventType = event.type;
              // if (event.type === RiveEventType.OpenUrl) {
              //   const a = document.createElement("a");
              //   a.setAttribute("href", event.url);
              //   a.setAttribute("target", event.target);
              //   a.click();
              // }
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

    return () => {
      cancelAnimationFrame(requestId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", (e) => focus(e));
    };
  }, []);

  return (
    <div>
      <div ref={container} className="email-form-container">
        <canvas ref={canvas} id="email-form-canvas" />
      </div>
      <InputTypingCursor />
    </div>
  );
};

export default MailingList;
