import { useState } from "react";
import "./App.css";

import { Navigate, Route, Routes } from "react-router-dom";
import WebSocketComp from "./views/websockets";
import { RequireAuth } from "./AuthRedirect";
import { CreateUserPage } from "./views/user-registration";
import { LoginPage } from "./views/login";
import { UserProfilePage } from "./views/profile";
import { Header } from "./components/header";

function App() {
  return (
    <div className="app">
      <Header />

      <main className="app-content">
        <Routes>
          {/* Public routes */}
          <Route path="/create_user" element={<CreateUserPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/" element={<WebSocketComp />} />
          </Route>

          <Route path="*" element={<Navigate to="/create_user" replace />} />
        </Routes>
      </main>
    </div>
  );
}


export default App;
