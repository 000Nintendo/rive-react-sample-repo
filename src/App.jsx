import { useEffect } from "react";
import "./index.css";
import { useRive } from "@rive-app/react-canvas";

// export const V3mail = () => {
//   // TODO: Load up Rive File

// };

export function Simple() {
  const { rive, RiveComponent } = useRive({
    src: "2a_v3_2024-0813.riv",
    stateMachines: "bumpy",
    autoplay: false,
  });

  return (
    <RiveComponent
      onMouseEnter={() => rive && rive.play()}
      onMouseLeave={() => rive && rive.pause()}
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
