// services/firebaseService.js
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    getDocs,
} from "firebase/firestore";

class CreatorService {
    constructor() {
        this.db = getFirestore();
    }

    // Get all creators
    async getCreators() {
        try {
            const q = query(
                collection(this.db, "playlist-creators-new"),
                orderBy("createdAt", "asc")
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error("Error fetching creators:", error);
            throw error;
        }
    }

    // Get topics for a specific creator
    async getTopicsByCreator(creatorId) {
        try {
            const q = query(
                collection(this.db, "playlist-topics-new"),
                where("playlistCreatorId", "==", creatorId),
                orderBy("createdAt", "asc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error("Error fetching topics:", error);
            throw error;
        }
    }

    // Get playlists for a specific topic
    async getPlaylistsByTopic(topicId) {
        try {
            const q = query(
                collection(this.db, "playlists-new"),
                where("playlistTopicId", "==", topicId),
                orderBy("createdAt", "asc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error("Error fetching playlists:", error);
            throw error;
        }
    }

    // Get videos for a specific playlist
    async getVideosByPlaylist(playlistId) {
        try {
            const q = query(
                collection(this.db, "playlist-videos-new"),
                where("playlistId", "==", playlistId),
                orderBy("createdAt", "asc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error("Error fetching videos:", error);
            throw error;
        }
    }
}

export default new CreatorService();
