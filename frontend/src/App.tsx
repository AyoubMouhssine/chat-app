import Chat from "./components/Chat";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Landing from "./components/Landing";
import Navigation from "./components/Navigation";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/">
          <Route index element={<Landing />} />
          <Route
            path="register"
            element={<Register />}
          />

          <Route
            path="login"
            element={<Login  />}
          />
        </Route>

        <Route path="/chat" element={<Chat />} />
      </Routes>
    </>
  );
}

export default App;
