import { useRive } from "@rive-app/react-canvas";
import React, { useEffect } from "react";

const TypingCursor = ({ textWidth = 0, showCursor = false }) => {
  const { rive, RiveComponent } = useRive({
    src: "typing_cursor.riv",
    artboard: "Artboard",
    stateMachines: ["State Machine 1"],
    autoplay: true,
    useDevicePixelRatio: true,
  });

  useEffect(() => {
    const typingCursorContainer = document.querySelector(
      ".typing-cursor-container"
    );

    console.log("TypingCursor>textWidth", 25 + textWidth);

    typingCursorContainer.style.left = `${25 + textWidth}px`;
  }, [textWidth]);

  return (
    <div className="typing-cursor-container">
      {showCursor ? <RiveComponent /> : null}
    </div>
  );
};

export default TypingCursor;
