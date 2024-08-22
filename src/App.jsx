import "./index.css";

import { MailingListForm } from "./components/MailingListForm";
import MailingList from "./components/UsingLowLevelApis/MailingList";

// export const V3mail = () => {
//   // TODO: Load up Rive File
// };

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center form-container">
      <div className="RiveContainer">
        {/* <TwoAV3 /> */}
        {/* <MailingListForm /> */}
        <MailingList />
      </div>
    </div>
  );
}
