import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import MeetingsList from "./pages/MeetingsList";
import MeetingPage from "./pages/MeetingPage";
import CreateMeeting from "./pages/CreateMeeting";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MeetingsList />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="meetings/:id" element={<MeetingPage />} />
          <Route path="create" element={<CreateMeeting />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;