import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Clock,
  Bookmark,
  Send
} from 'lucide-react';

// You'll need to import your Firebase config
 import { db } from '../../firebase/firebase-config';
 import { getFirestore, collection, query, orderBy, getDocs } from "firebase/firestore";

// Replace with your actual Cloudflare account hash
const CLOUDFLARE_ACCOUNT_HASH = import.meta.env.VITE_ACCOUNT_HASH;

const InstagramFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch posts from Firestore
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Uncomment when you have Firebase setup
    
      const q = query(
        collection(db, "feed-posts"),
        orderBy("_createdBy.timestamp", "desc")
      );

      const snapshot = await getDocs(q);
      const postsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter visible posts
        if (data.isVisible === true) {
          postsData.push({
            id: doc.id,
            ...data
          });
        }
      });

      setPosts(postsData);
    

      // Temporary mock data structure matching your Firestore schema
      // const mockPosts = [
      //   {
      //     id: "post1",
      //     postType: "image",
      //     title: "Digital Marketing Masterclass",
      //     description: "Learn the fundamentals of digital marketing and grow your business online with proven strategies",
      //     iconId: "icon123",
      //     imgId: "img456",
      //     buttonBgColor: "#F57C00",
      //     buttonTextColor: "#FFFFFF",
      //     ctaText: "Learn More",
      //     businessInfo: [{
      //       creatorTopicId: "topic1",
      //       creatorTopicName: "Digital Marketing"
      //     }],
      //     isVisible: true,
      //     likesCount: 234,
      //     commentsCount: 45,
      //     viewsCount: 1200,
      //     _createdBy: {
      //       displayName: "Sarah Johnson",
      //       email: "sarah@example.com",
      //       photoUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      //       timestamp: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) }
      //     }
      //   },
      //   {
      //     id: "post2",
      //     postType: "multi_image",
      //     title: "Web Development Bootcamp",
      //     description: "From HTML to React - Complete web development journey with hands-on projects",
      //     iconId: "icon789",
      //     imageIds: ["img1", "img2", "img3"],
      //     buttonBgColor: "#4F46E5",
      //     buttonTextColor: "#FFFFFF",
      //     ctaText: "Start Learning",
      //     businessInfo: [{
      //       creatorTopicId: "topic2",
      //       creatorTopicName: "Web Development"
      //     }],
      //     isVisible: true,
      //     likesCount: 567,
      //     commentsCount: 89,
      //     viewsCount: 2400,
      //     _createdBy: {
      //       displayName: "Mike Chen",
      //       email: "mike@example.com",
      //       photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      //       timestamp: { toDate: () => new Date(Date.now() - 5 * 60 * 60 * 1000) }
      //     }
      //   },
      //   {
      //     id: "post3",
      //     postType: "video",
      //     title: "AI & Machine Learning Basics",
      //     description: "Understand the fundamentals of AI and how it's transforming industries worldwide",
      //     iconId: "icon101",
      //     videoStreamId: "stream123",
      //     thumbnailUrl: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop",
      //     duration: "15:30",
      //     buttonBgColor: "#10B981",
      //     buttonTextColor: "#FFFFFF",
      //     ctaText: "Watch Course",
      //     businessInfo: [{
      //       creatorTopicId: "topic3",
      //       creatorTopicName: "Artificial Intelligence"
      //     }],
      //     isVisible: true,
      //     likesCount: 892,
      //     commentsCount: 156,
      //     viewsCount: 4500,
      //     _createdBy: {
      //       displayName: "Dr. Emily Rodriguez",
      //       email: "emily@example.com",
      //       photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      //       timestamp: { toDate: () => new Date(Date.now() - 8 * 60 * 60 * 1000) }
      //     }
      //   },
      //   {
      //     id: "post4",
      //     postType: "reels_carousel",
      //     title: "Quick Business Tips",
      //     description: "Swipe through our latest business tips and strategies for success",
      //     reelsCount: 8,
      //     reelIds: ["reel1", "reel2", "reel3"],
      //     isVisible: true,
      //     likesCount: 445,
      //     commentsCount: 78,
      //     viewsCount: 3200,
      //     _createdBy: {
      //       displayName: "Business Pro",
      //       email: "business@example.com",
      //       photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      //       timestamp: { toDate: () => new Date(Date.now() - 12 * 60 * 60 * 1000) }
      //     }
      //   }
      // ];

      // setPosts(mockPosts);
      
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
  

      

      {/* Posts Feed */}
      <div className="max-w-md mx-auto">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="max-w-md mx-auto text-center py-20">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-400 mb-6">Start following accounts to see posts here</p>
          <button 
            onClick={handleRefresh}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [views, setViews] = useState(post.viewsCount || 0);
  const [comments] = useState(post.commentsCount || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Check out this post',
          text: post.description || 'Interesting content',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'now';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInMs = now - date;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInMinutes < 1) return 'now';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInHours < 24) return `${diffInHours}h`;
      if (diffInDays < 7) return `${diffInDays}d`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'now';
    }
  };

  const getBusinessInfo = () => {
    if (post.businessInfo && post.businessInfo.length > 0) {
      return post.businessInfo[0];
    }
    return null;
  };

  return (
    <div className="mb-6 bg-black">
      
      {/* Post Media */}
      <div className="relative">
        <PostMedia post={post} />
      </div>

    

     
     

     

      {/* CTA Button */}
      <div className="px-4 pb-4">
        <PostActionButton post={post} />
      </div>
    </div>
  );
};

const PostMedia = ({ post }) => {
  const [imageError, setImageError] = useState(false);
  
  const getImageUrl = (imageId) => {
    if (!imageId) return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop`;
    return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}`;
  };

  const getFirstImageUrl = () => {
    if (post.imageIds && post.imageIds.length > 0) {
      return getImageUrl(post.imageIds[0]);
    } else if (post.imgId) {
      return getImageUrl(post.imgId);
    }
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop`;
  };

  switch (post.postType) {
    case 'image':
      return (
        <div className="aspect-square bg-gray-900">
          <img
            src={imageError ? `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop` : getFirstImageUrl()}
            alt={post.title || 'Post image'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      );
    
    case 'multi_image':
      return <MultiImageCarousel images={post.imageIds || []} />;
    
    case 'video':
      return (
        <div className="aspect-square bg-black flex items-center justify-center relative group cursor-pointer">
          <img 
            src={post.thumbnailUrl || `https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=800&fit=crop`}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-black ml-1" />
            </div>
          </div>
          {post.duration && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              {post.duration}
            </div>
          )}
        </div>
      );
    
    case 'reels_carousel':
      return (
        <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative">
          <div className="text-center text-white">
            <div className="grid grid-cols-3 gap-2 mb-4 mx-auto w-20">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/20 rounded-sm animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
              ))}
            </div>
            <p className="font-bold text-lg">{post.reelsCount || 'Multiple'} Reels</p>
            <p className="text-white/80 text-sm">Tap to explore</p>
          </div>
          <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
            Reels
          </div>
        </div>
      );
    
    default:
      return (
        <div className="aspect-square bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-gray-400">Content</p>
          </div>
        </div>
      );
  }
};

const MultiImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const validImages = images?.filter(img => img) || [];
  
  const getImageUrl = (imageId) => {
    if (!imageId) return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop`;
    return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}`;
  };

  if (validImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-gray-400">No images</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="relative aspect-square bg-black">
      <img
        src={imageErrors[currentIndex] ? `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop` : getImageUrl(validImages[currentIndex])}
        alt={`Image ${currentIndex + 1} of ${validImages.length}`}
        className="w-full h-full object-cover"
        onError={() => handleImageError(currentIndex)}
      />
      
      {validImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
            {currentIndex + 1}/{validImages.length}
          </div>

          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PostActionButton = ({ post }) => {
  const businessInfo = getBusinessInfo(post);
  
  const buttonStyle = {
    backgroundColor: post.buttonBgColor || '#F57C00',
    color: post.buttonTextColor || '#FFFFFF',
  };

  function getBusinessInfo(post) {
    return post.businessInfo && post.businessInfo.length > 0 
      ? post.businessInfo[0] 
      : null;
  }

  if (post.postType === 'reels_carousel') {
    return (
      <button 
        className="w-full py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
      >
        <Play className="w-4 h-4 inline mr-2" />
        Watch Reels
      </button>
    );
  }

  return (
    <button 
      className="w-full py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
      style={buttonStyle}
    >
      {businessInfo 
        ? `Learn ${businessInfo.creatorTopicName}` 
        : post.ctaText || 'Learn More'
      }
    </button>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-gray-800">
          <div className="h-8 bg-gray-800 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Stories Skeleton */}
        <div className="p-4 flex space-x-4 overflow-x-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full animate-pulse"></div>
              <div className="h-3 bg-gray-800 rounded w-12 mt-2 animate-pulse"></div>
            </div>
          ))}
        </div>
        
        {/* Posts Skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-6">
            <div className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-800 rounded w-24 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="aspect-square bg-gray-800 animate-pulse"></div>
            <div className="p-4">
              <div className="flex space-x-4 mb-3">
                <div className="w-6 h-6 bg-gray-800 rounded animate-pulse"></div>
                <div className="w-6 h-6 bg-gray-800 rounded animate-pulse"></div>
                <div className="w-6 h-6 bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-800 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-full mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-2/3 mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <button 
          onClick={onRetry}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default InstagramFeed;