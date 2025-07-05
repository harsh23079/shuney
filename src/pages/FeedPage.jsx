import StoriesFeature from "./feed/StoriesFeature";
import PostFeed from "./feed/PostFeed";

export default function FeedPage() {

    return (
        <div className="min-h-screen bg-black text-white">
            <StoriesFeature />
            <section className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
                <PostFeed />
            </section>

          

          
        </div>
    );
}
