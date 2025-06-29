import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Loader2 } from 'lucide-react';
import { query, orderBy, getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

const StoriesFeature = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const progressInterval = useRef(null);
  const fetchedRef = useRef(false);
  const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

  // Fetch stories function - plain function, not wrapped in useCallback
  const fetchStories = async () => {
    if (fetchedRef.current) return; // Prevent multiple fetches
    
    try {
      fetchedRef.current = true;
      console.log('Fetching stories...');
      setLoading(true);
      setError(null);

      if (!db) {
        throw new Error('Firebase database not initialized');
      }

      const storiesQuery = query(
        collection(db, 'stories'),
        orderBy('_createdBy.timestamp', 'desc')
      );

      const snapshot = await getDocs(storiesQuery);
      
      const storiesData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data && data.imageIds && Array.isArray(data.imageIds) && data.imageIds.length > 0) {
          storiesData.push({
            id: doc.id,
            title: data.title || '',
            imageIds: data.imageIds,
            iconId: data.iconId || '',
            _createdBy: data._createdBy || {},
            _updatedBy: data._updatedBy || {}
          });
        }
      });
      
      console.log('Stories loaded:', storiesData.length);
      setStories(storiesData);
      
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(`Failed to load stories: ${err.message}`);
      fetchedRef.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    fetchedRef.current = false;
    fetchStories();
  };

  // Initial fetch only - runs once
  useEffect(() => {
    fetchStories();
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []); // Empty dependency array

  // Progress interval effect - separate from stories
  useEffect(() => {
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    // Don't start interval if no story is selected or not playing
    if (!selectedStory || !isPlaying || !selectedStory.imageIds?.length) {
      return;
    }

    // Start progress interval
    progressInterval.current = setInterval(() => {
      setProgress(currentProgress => {
        if (currentProgress >= 100) {
          // Move to next image or story
          setCurrentImageIndex(currentIdx => {
            const nextIdx = currentIdx + 1;
            if (nextIdx < selectedStory.imageIds.length) {
              return nextIdx;
            } else {
              // Move to next story
              setStories(currentStories => {
                const currentStoryIndex = currentStories.findIndex(s => s.id === selectedStory.id);
                const nextStoryIndex = currentStoryIndex + 1;
                
                if (nextStoryIndex < currentStories.length) {
                  setSelectedStory(currentStories[nextStoryIndex]);
                  return currentStories; // Don't change stories array
                } else {
                  setSelectedStory(null);
                  return currentStories; // Don't change stories array
                }
              });
              return 0;
            }
          });
          return 0;
        }
        return currentProgress + 2;
      });
    }, 100);

    // Cleanup function
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [selectedStory?.id, isPlaying]); // Only depend on story ID and playing state

  // Reset progress when image index changes
  useEffect(() => {
    setProgress(0);
  }, [currentImageIndex]);

  const openStory = (story) => {
    if (story.imageIds && story.imageIds.length > 0) {
      setSelectedStory(story);
      setCurrentImageIndex(0);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const closeStory = () => {
    setSelectedStory(null);
    setCurrentImageIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      const currentStoryIndex = stories.findIndex(s => s.id === selectedStory?.id);
      if (currentStoryIndex > 0) {
        const prevStory = stories[currentStoryIndex - 1];
        setSelectedStory(prevStory);
        setCurrentImageIndex(prevStory.imageIds.length - 1);
      }
    }
  };

  const goToNext = () => {
    if (selectedStory && currentImageIndex < selectedStory.imageIds.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      const currentStoryIndex = stories.findIndex(s => s.id === selectedStory?.id);
      if (currentStoryIndex < stories.length - 1) {
        setSelectedStory(stories[currentStoryIndex + 1]);
        setCurrentImageIndex(0);
      } else {
        closeStory();
      }
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    let storyTime;
    
    if (timestamp.seconds) {
      storyTime = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      storyTime = timestamp;
    } else {
      storyTime = new Date(timestamp);
    }
    
    const diff = now - storyTime;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getCloudflareImageUrl = (imageId, width = 400, height = 600) => {
    if (!imageId || !accountHash) return '/placeholder.svg';
    return `https://imagedelivery.net/${accountHash}/${imageId}/w=${width},h=${height},fit=crop`;
  };

  const isRecentStory = (timestamp) => {
    if (!timestamp) return false;
    
    const storyTime = timestamp.seconds ? 
      new Date(timestamp.seconds * 1000) : 
      new Date(timestamp);
    
    return new Date() - storyTime < 2 * 60 * 60 * 1000;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/30 py-4 px-4 border-b border-gray-800">
        <div className="flex items-center justify-center space-x-2 py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span className="text-gray-300">Loading stories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/30 py-4 px-4 border-b border-gray-800">
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">{error}</p>
          <button 
            onClick={retryFetch} 
            className="text-orange-500 hover:text-orange-400 underline transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gray-900/30 py-4 px-4 border-b border-gray-800">
        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
          {/* Your Story */}
          <div className="flex-shrink-0 text-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-0.5">
                <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
                  <span className="text-2xl text-white">+</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-300 mt-1 w-16 truncate">Your Story</p>
          </div>

          {/* Stories */}
          {stories.length > 0 ? (
            stories.map((story) => (
              <div 
                key={story.id} 
                className="flex-shrink-0 text-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() => openStory(story)}
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-0.5">
                    <img
                      src={story._createdBy?.photoUrl || '/placeholder.svg'}
                      alt={story._createdBy?.displayName || 'User'}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  {story._createdBy?.timestamp && isRecentStory(story._createdBy.timestamp) && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-1 w-16 truncate">
                  {story._createdBy?.displayName || 'Unknown'}
                </p>
              </div>
            ))
          ) : (
            <div className="flex-1 text-center py-4">
              <p className="text-gray-400">No stories available</p>
              <button 
                onClick={retryFetch}
                className="text-orange-500 hover:text-orange-400 underline text-sm mt-1 transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && selectedStory.imageIds.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
            {selectedStory.imageIds.map((_, index) => (
              <div 
                key={index} 
                className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden"
              >
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                  style={{
                    width: index === currentImageIndex ? `${progress}%` : 
                           index < currentImageIndex ? '100%' : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <img
                src={selectedStory._createdBy?.photoUrl || '/placeholder.svg'}
                alt={selectedStory._createdBy?.displayName || 'User'}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.svg';
                }}
              />
              <div>
                <p className="text-white font-medium text-sm">
                  {selectedStory._createdBy?.displayName || 'Unknown User'}
                </p>
                <p className="text-gray-300 text-xs">
                  {formatTimeAgo(selectedStory._createdBy?.timestamp)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={closeStory}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Story Content */}
          <div className="relative w-full h-full max-w-md mx-auto">
            <img
              src={getCloudflareImageUrl(selectedStory.imageIds[currentImageIndex])}
              alt={selectedStory.title || 'Story'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder.svg';
              }}
            />

            {/* Navigation areas */}
            <div 
              className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10"
              onClick={goToPrevious}
            />
            <div 
              className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-10"
              onClick={goToNext}
            />
            <div 
              className="absolute left-1/3 top-0 w-1/3 h-full cursor-pointer z-10"
              onClick={togglePlayPause}
            />

            {/* Navigation arrows */}
            <div className="hidden md:block">
              {(stories.findIndex(s => s.id === selectedStory.id) > 0 || currentImageIndex > 0) && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              
              {(stories.findIndex(s => s.id === selectedStory.id) < stories.length - 1 || currentImageIndex < selectedStory.imageIds.length - 1) && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Story title overlay */}
          {selectedStory.title && (
            <div className="absolute bottom-8 left-4 right-4 z-10">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-white font-semibold text-lg">
                  {selectedStory.title}
                </h3>
                <p className="text-gray-300 text-sm mt-1">
                  Tap left or right to navigate • Tap center to pause
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StoriesFeature;