import React, { useEffect, useRef } from "react";
import { RiveServices } from "../../services/rive.services";

const InputTypingCursor = ({ textWidth = 0, showCursor = false }) => {
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
    let ctx, renderer, requestId, artboard, stateMachine;

    const setCanvas = async (canvas) => {
      if (!canvas) {
        return;
      }

      const { rive, file_buffer } = await RiveServices.loadRive(
        "mailing_list_signup.riv"
      );

      let file = await rive.load(new Uint8Array(file_buffer));

      artboard = file.artboardByName("Typing Cursor");
      stateMachine = new rive.StateMachineInstance(
        artboard.stateMachineByName("State Machine 1"),
        artboard
      );
      let animation = null;

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
        requestId = rive.requestAnimationFrame(renderLoop);
      }
      requestId = rive.requestAnimationFrame(renderLoop);
    };

    setCanvas(canvas.current);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => focus(e));

    return () => {
      cancelAnimationFrame(requestId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", (e) => focus(e));
    };
  }, []);

  useEffect(() => {
    if (!showCursor) return;
    const typingCursorContainer = document.querySelector(
      ".input-typing-cursor-container"
    );

    console.log("TypingCursor>textWidth", 25 + textWidth);

    typingCursorContainer.style.left = `${25 + textWidth}px`;
  }, [textWidth]);

  return (
    <>
      <div
        ref={container}
        className={`input-typing-cursor-container ${
          showCursor ? "" : "hide-input-cursor"
        }`}
      >
        <canvas ref={canvas} id="input-typing-cursor-canvas" />
      </div>
    </>
  );
};

export default InputTypingCursor;
