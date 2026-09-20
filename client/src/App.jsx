import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import Health from "./pages/Health";
import Detroit from "./pages/Detroit";
import Testing from "./pages/Testing";
import Practitioner from "./pages/Practitioner";
import Progress from "./pages/Progress";
import AskRooted from "./pages/AskRooted";
import HerbalGuide from "./pages/HerbalGuide";
import FoodRecipes from "./pages/FoodRecipes";
import Community from "./pages/Community";


import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/health" element={<Health />} />
          <Route path="/detroit" element={<Detroit />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/practitioner" element={<Practitioner />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/ask" element={<AskRooted />} />
          <Route path="/herbal" element={<HerbalGuide />} />
          <Route path="/food" element={<FoodRecipes />} />
          <Route path="/community" element={<Community />} />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
