import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import HomePage from "./pages/HomePage";
import BusinessPage from "./pages/Business/BusinessPage";
import CategoriesPage from "./pages/CategoriesPage";
import ServicesPage from "./pages/ServicesPage";
import LoginPage from "./pages/LoginPage";
import ReelPage from "./pages/ReelPage";
import "./App.css";
import LevelsPage from "./pages/Business/LevelsPage";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-black text-white">
                <Header />
                <main className="pb-20">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/business" element={<BusinessPage />} />
                        <Route path="/levels/:creatorTopicId" element={<LevelsPage />} />
                        <Route
                            path="/categories"
                            element={<CategoriesPage />}
                        />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/reel" element={<ReelPage />} />
                        <Route path="/login" element={<LoginPage />} />
                    </Routes>
                </main>
                <Navigation />
            </div>
        </Router>
    );
}

export default App;
