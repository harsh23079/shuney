import {
    BrowserRouter as Router,
    Routes,
    Route,
    Outlet,
    useLocation,
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
import LevelsPage from "./pages/Business/LevelsPage";
import SubcategoriesPage from "./pages/HomeLevels/SubCategoriesPage";
import LevelVideosPage from "./pages/Business/levelVideosPage";
import AllTopicsPage from "./pages/HomeLevels/AllTopics";
import CreatorPlaylist from "./pages/Creators/CreatorPlaylist";
import TopicGrid from "./pages/Creators/TopicGrid";
import PlaylistGrid from "./pages/Creators/PlaylistGrid";
import VideoPlayer from "./pages/Creators/VideoPlayer";
import FeedPage from "./pages/FeedPage";

function LevelLayout() {
    return <Outlet />;
}

function FooterWrapper() {
    const location = useLocation();
    const showFooterOn = ["/", "/services", "/login"];
    const showFooter = showFooterOn.includes(location.pathname);
    return showFooter ? <Footer /> : null;
}

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Header />
                <main className="flex-1 pb-20">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/feed" element={<FeedPage />} />
                        <Route path="/business" element={<LevelLayout />}>
                            <Route index element={<BusinessPage />} />
                            <Route
                                path="levels/:creatorTopicId"
                                element={<LevelsPage />}
                            />
                            <Route
                                path="level-videos/:levelId?"
                                element={<LevelVideosPage />}
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
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/reel" element={<ReelPage />} />
                        <Route path="/login" element={<LoginPage />} />
                    </Routes>
                </main>
                <FooterWrapper />
                <Navigation />
            </div>
        </Router>
    );
}

export default App;