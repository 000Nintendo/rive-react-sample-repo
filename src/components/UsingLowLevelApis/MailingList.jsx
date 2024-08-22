import "./styles/MailingList.scss";

import React, { useEffect, useRef } from "react";
import loadRive from "../../services/rive.services";
import InputTypingCursor from "./InputTypingCursor";

const MailingList = () => {
  const canvas = useRef(null);
  const container = useRef(null);

  const resize = () => {
    if (container.current && canvas.current) {
      const { width, height } = container.current.getBoundingClientRect();
      canvas.current.width = width;
      canvas.current.height = height;
    }
  };

  useEffect(() => {
    let instances,
      ctx,
      renderer,
      alignFit,
      requestId,
      artboard,
      lastTime = 0,
      stateMachine;

    const setCanvas = async (canvas) => {
      if (!canvas) {
        return;
      }

      const { rive, file_buffer } = await loadRive("mailing_list_signup.riv");

      let file = await rive.load(new Uint8Array(file_buffer));

      const { CanvasRenderer, LinearAnimationInstance, Alignment, Fit } = rive;
      artboard = file.artboardByName("Mailing List");
      stateMachine = new rive.StateMachineInstance(
        artboard.stateMachineByName("MainSM"),
        artboard
      );
      let animation = null;

      alignFit = {
        alignment: Alignment.center,
        fit: Fit.cover,
      };

      instances = {};

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
        lastTime = time;

        renderer.clear();
        if (artboard) {
          if (animation) {
            animation.advance(elapsedTimeSec);
            animation.apply(1);
          }
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
