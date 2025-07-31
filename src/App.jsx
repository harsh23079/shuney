import {
    BrowserRouter as Router,
    Routes,
    Route,
    Outlet,
    useLocation,
    Navigate,
} from "react-router-dom";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import HomePage from "./pages/HomePage";
import BusinessPage from "./pages/Business/BusinessPage";
import CategoriesPage from "./pages/HomeLevels/CategoriesPage";
import ServicesPage from "./pages/ServicesPage";
import LoginPage from "./pages/LoginPage";
import ReelPage from "./pages/ReelPage";
import "./App.css";
import LevelsPage from "./components/LevelsPage";
import LevelVideosPage from "./components/levelVideosPage";
import SubcategoriesPage from "./pages/HomeLevels/SubCategoriesPage";
import AllTopicsPage from "./pages/HomeLevels/AllTopics";
import CreatorPlaylist from "./pages/Creators/CreatorPlaylist";
import TopicGrid from "./pages/Creators/TopicGrid";
import PlaylistGrid from "./pages/Creators/PlaylistGrid";
import VideoPlayer from "./pages/Creators/VideoPlayer";
import FeedPage from "./pages/FeedPage";
import AboutPage from "./pages/AboutPage";
import { ScrollToTop } from "./components/ScrollToTop";
import CreatorsPage from "./pages/HomeLevels/CreatorsPage";

function LevelLayout() {
    return <Outlet />;
}

function FooterWrapper() {
    const location = useLocation();
    const showFooterOn = ["/home", "/services", "/login"];
    const showFooter = showFooterOn.includes(location.pathname);
    return showFooter ? <Footer /> : null;
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Header />
                <main className="flex-1 pb-20">
                    <Routes>
                        <Route
                            path="/"
                            element={<Navigate to="/home" replace />}
                        />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/feed" element={<FeedPage />} />
                        <Route path="/business" element={<LevelLayout />}>
                            <Route index element={<BusinessPage />} />
                            <Route
                                path="levels/:creatorTopicId"
                                element={<LevelsPage />}
                            />
                        </Route>

                        <Route
                            path="/level/categories"
                            element={<LevelLayout />}
                        >
                            <Route index element={<CategoriesPage />} />
                            <Route
                                path=":categoryId"
                                element={<SubcategoriesPage />}
                            />
                            <Route
                                path=":categoryId/subcategories/:subCategoryId"
                                element={<AllTopicsPage />}
                            />
                            <Route
                                path=":categoryId/subcategories/:subCategoryId/creators/:creatorTopicId"
                                element={<CreatorsPage />}
                            />
                            <Route
                                path=":categoryId/subcategories/:subCategoryId/creators/:creatorTopicId/levels/:creatorTopicId"
                                element={<LevelsPage />}
                            />
                        </Route>
                        <Route path="/creators" element={<LevelLayout />}>
                            <Route index element={<CreatorPlaylist />} />
                            <Route
                                path=":creatorId/topics"
                                element={<TopicGrid />}
                            />
                            <Route
                                path=":creatorId/topics/:topicId/playlists"
                                element={<PlaylistGrid />}
                            />
                            <Route
                                path=":creatorId/topics/:topicId/playlists/:playlistId/videos"
                                element={<VideoPlayer />}
                            />
                        </Route>
                        <Route
                            path="levels/:creatorTopicId/videos/:levelId?"
                            element={<LevelVideosPage />}
                        />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/reel" element={<ReelPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/about" element={<AboutPage />} />
                    </Routes>
                </main>
                <FooterWrapper />
                <Navigation />
            </div>
        </Router>
    );
}

export default App;
