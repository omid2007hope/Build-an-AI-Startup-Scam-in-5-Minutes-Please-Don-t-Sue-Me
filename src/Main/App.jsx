import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatBox from "../Pages/ChatBox";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatBox />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
