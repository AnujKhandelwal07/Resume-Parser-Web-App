import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Header from "./components/Header";
import Home from "./pages/Home";
import MyProfile from "./pages/MyProfile";
import BasicInformation from "./pages/BasicInformation";
import Education from "./pages/Education";
import Experience from "./pages/Experience";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<MyProfile />}>
            <Route path="basic-info" element={<BasicInformation />} />
            <Route path="education" element={<Education />} />
            <Route path="experience" element={<Experience />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
