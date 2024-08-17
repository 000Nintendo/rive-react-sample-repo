import "./index.css";

import { MailingListForm } from "./components/MailingListForm";

// export const V3mail = () => {
//   // TODO: Load up Rive File
// };

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="RiveContainer">
        {/* <TwoAV3 /> */}
        <MailingListForm />
      </div>
    </div>
  );
}
