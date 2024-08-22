import React, { useEffect, useRef } from "react";
import loadRive from "../../services/rive.services";

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
    let instances, ctx, renderer, alignFit, requestId, artboard, stateMachine;

    const setCanvas = async (canvas) => {
      if (!canvas) {
        return;
      }

      const { rive, file_buffer } = await loadRive("mailing_list_signup.riv");

      let file = await rive.load(new Uint8Array(file_buffer));

      const { CanvasRenderer, LinearAnimationInstance, Alignment, Fit } = rive;
      artboard = file.artboardByName("Typing Cursor");
      stateMachine = new rive.StateMachineInstance(
        artboard.stateMachineByName("State Machine 1"),
        artboard
      );
      let animation = null;

      alignFit = {
        alignment: Alignment.center,
        fit: Fit.cover,
      };

      instances = {
        // levitate: getInstance("levitate"),
        // blink: getInstance("blink"),
        // lookY: getInstance("look_vertical"),
        // lookX: getInstance("look_horiztonal"),
        // pupil: getInstance("pupil_shrink"),
        // rotate: getInstance("rotate_1"),
      };

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

  useEffect(() => {
    const typingCursorContainer = document.querySelector(
      ".input-typing-cursor-container"
    );

    console.log("TypingCursor>textWidth", 25 + textWidth);

    typingCursorContainer.style.left = `${25 + textWidth}px`;
  }, [textWidth]);

  return (
    <>
      <div ref={container} className="input-typing-cursor-container">
        <canvas ref={canvas} id="input-typing-cursor-canvas" />
      </div>
    </>
  );
};

export default InputTypingCursor;
