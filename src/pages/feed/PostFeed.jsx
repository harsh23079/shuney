import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Clock
} from 'lucide-react';
import { getFirestore, collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from '../../firebase/firebase-config';

// Replace with your actual Cloudflare account hash
const accountHash =import.meta.env.VITE_ACCOUNT_HASH;;

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Query to get visible posts ordered by creation timestamp
        const q = query(
          collection(db, "feed-posts"),
          orderBy("_createdBy.timestamp", "desc")
        );

        const snapshot = await getDocs(q);
        const postsData = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Filter visible posts in memory to avoid needing composite index
          if (data.isVisible === true) {
            postsData.push({
              id: doc.id,
              ...data
            });
          }
        });

        setPosts(postsData);
        
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center bg-gray-900/50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 mb-2 text-2xl">⚠️</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Latest <span className="text-orange-500">Business</span> Posts
          </h2>
          <p className="text-gray-400">Stay updated with our latest business insights and tips</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4 text-4xl">📭</div>
            <p className="text-gray-400 text-lg">No posts available at the moment</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for new content!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount || Math.floor(Math.random() * 100) + 10);
  const [views, setViews] = useState(post.viewsCount || Math.floor(Math.random() * 1000) + 50);
  const [comments] = useState(post.commentsCount || Math.floor(Math.random() * 20) + 5);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInMs = now - date;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Just now';
    }
  };

  const getBusinessInfo = () => {
    if (post.businessInfo && post.businessInfo.length > 0) {
      return post.businessInfo[0];
    }
    return null;
  };

  const getUserAvatar = () => {
    // Use iconId if available, otherwise use first image from imageIds
    if (post.iconId) {
      return `https://imagedelivery.net/${accountHash}/${post.iconId}`;
    } else if (post.imageIds && post.imageIds.length > 0) {
      return `https://imagedelivery.net/${accountHash}/${post.imageIds[0]}`;
    }
    return null;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Check out this business post',
          text: post.description || 'Interesting business content',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-orange-500/10">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center overflow-hidden">
            {getUserAvatar() ? (
              <img 
                src={getUserAvatar()}
                alt={post._createdBy?.displayName || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span 
              className="text-white text-sm font-bold" 
              style={{display: getUserAvatar() ? 'none' : 'flex'}}
            >
              {(post._createdBy?.displayName || 'S')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">
              {post._createdBy?.displayName || 'Shunye OTT'}
            </p>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(post._createdBy?.timestamp)}</span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="relative">
        <PostMedia post={post} />
        
        {/* Post Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            {post.postType ? post.postType.replace('_', ' ').toUpperCase() : 'POST'}
          </span>
        </div>
      </div>

      {/* Post Footer */}
      <div className="p-4">
        {/* Title and Description */}
        {post.title && (
          <h3 className="text-white font-semibold mb-2 line-clamp-2">
            {post.title}
          </h3>
        )}
        
        {post.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {post.description}
          </p>
        )}
        
        {getBusinessInfo() && (
          <div className="mb-3">
            <span className="inline-block bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs">
              {getBusinessInfo().creatorTopicName}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                liked ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likes}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{comments}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Share className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-400 text-sm">
            <Eye className="w-4 h-4" />
            <span>{views.toLocaleString()}</span>
          </div>
        </div>

        {/* CTA Button */}
        <PostActionButton post={post} />
      </div>
    </div>
  );
};

const PostMedia = ({ post }) => {
  const [imageError, setImageError] = useState(false);
  
  const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';

  const getImageUrl = (imageId) => {
    if (!imageId) return fallbackImage;
    return `https://imagedelivery.net/${accountHash}/${imageId}`;
  };

  const getFirstImageUrl = () => {
    // Priority: imageIds[0] > imgId > fallback
    if (post.imageIds && post.imageIds.length > 0 && post.imageIds[0]) {
      return getImageUrl(post.imageIds[0]);
    } else if (post.imgId) {
      return getImageUrl(post.imgId);
    }
    return fallbackImage;
  };

  switch (post.postType) {
    case 'image':
      return (
        <div className="aspect-square">
          <img
            src={imageError ? fallbackImage : getFirstImageUrl()}
            alt={post.title || 'Post image'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      );
    
    case 'multi_image':
      return <MultiImageCarousel images={post.imageIds || [post.imgId]} />;
    
    case 'video':
      return (
        <div className="aspect-video bg-black flex items-center justify-center relative group cursor-pointer">
          {(post.imageIds && post.imageIds[0]) ? (
            <img 
              src={getImageUrl(post.imageIds[0])}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : post.thumbnailUrl ? (
            <img 
              src={post.thumbnailUrl} 
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <p className="text-white/80 text-sm font-medium">Click to play video</p>
            {post.duration && (
              <p className="text-white/60 text-xs mt-1">{post.duration}</p>
            )}
          </div>
        </div>
      );
    
    case 'reels_carousel':
      return (
        <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="grid grid-cols-3 gap-1 mb-4 mx-auto w-24">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/20 rounded-sm" />
              ))}
            </div>
            <p className="font-semibold">{post.reelsCount || 'Multiple'} Reels</p>
            <p className="text-white/80 text-sm">Swipe to explore</p>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="aspect-square bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-gray-400">Content Preview</p>
          </div>
        </div>
      );
  }
};

const MultiImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const validImages = images?.filter(img => img) || [];
  const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';

  const getImageUrl = (imageId) => {
    if (!imageId) return fallbackImage;
    return `https://imagedelivery.net/${accountHash}/${imageId}`;
  };

  if (validImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-gray-400">No images available</p>
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
    <div className="relative aspect-square">
      <img
        src={imageErrors[currentIndex] ? fallbackImage : getImageUrl(validImages[currentIndex])}
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
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
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

          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            {currentIndex + 1}/{validImages.length}
          </div>
        </>
      )}
    </div>
  );
};

const PostActionButton = ({ post }) => {
  if (post.postType === 'reels_carousel') {
    return (
      <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-full font-medium transition-all duration-300 hover:scale-105">
        <Play className="w-4 h-4 inline mr-2" />
        Watch Reels
      </button>
    );
  }

  const businessInfo = post.businessInfo && post.businessInfo.length > 0 
    ? post.businessInfo[0] 
    : null;
  
  const buttonStyle = {
    backgroundColor: post.buttonBgColor || '#F57C00',
    color: post.buttonTextColor || '#FFFFFF',
  };

  if (businessInfo) {
    return (
      <Link to={`/business/${businessInfo.creatorTopicId}`}>
        <button 
          className="w-full py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={buttonStyle}
        >
          Learn {businessInfo.creatorTopicName}
        </button>
      </Link>
    );
  }

  return (
    <button 
      className="w-full py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
      style={buttonStyle}
    >
      {post.ctaText || 'Learn More'}
    </button>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-700 rounded w-16 animate-pulse"></div>
                </div>
              </div>
              <div className="aspect-square bg-gray-700 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3 mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostFeed;