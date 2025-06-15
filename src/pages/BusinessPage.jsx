import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import {
  ArrowLeft,
  Play,
  Star,
  TrendingUp,
  Loader2,
  RefreshCw
} from 'lucide-react'
import {
  Card,
  CardContent
} from '../components/ui/Card'
import { useEffect, useState, useCallback, useRef } from "react";
import {
    collection,
    getDocs,
    orderBy,
    limit,
    query,
    where
} from "firebase/firestore";
import { db } from "../firebase/firebase-config";

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  
  // Use ref to prevent infinite loops
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

  // ✅ Updated to fetch from creatortopics-new collection
  const fetchBusinessTopics = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting to fetch business topics...');
      
      const q = query(
        collection(db, "creatortopics-new"),
        where("subCategoryId", "==", "default"),
        orderBy("createdAt", "asc"),
        limit(20)
      );

      const snapshot = await getDocs(q);
      console.log('Fetched snapshot:', snapshot.size, 'documents');

      if (!mountedRef.current) {
        console.log('Component unmounted, aborting fetch');
        return;
      }

      const fetched = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id: doc.id,
          categoryId: data.categoryId || "default",
          subCategoryId: data.subCategoryId || "default",
          creatorTopicId: data.creatorTopicId || `topic_${index}`,
          creatorTopicName: data.creatorTopicName || `Business ${index + 1}`,
          thumbnailId: data.bigImageId || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          rating: (Math.random() * 2 + 3).toFixed(1),
          students: `${Math.floor(Math.random() * 20 + 1)}K+`,
        };
      });

      console.log('Processed business topics:', fetched);
      setBusinesses(fetched);
      setImageErrors(new Set()); // Reset image errors

      if (fetched.length === 0) {
        setError("No business topics found in database");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (mountedRef.current) {
        setError(`Error fetching data: ${err.message}`);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, []); // Empty dependency array is fine here since we don't depend on external values

  // ✅ useEffect with cleanup
  useEffect(() => {
    mountedRef.current = true;
    fetchBusinessTopics();
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
      isFetchingRef.current = false;
    };
  }, []); // Run only once on mount

  // ✅ Improved image URL generation with fallback
  const getImageUrl = useCallback((imageId, type = 'public') => {
    if (!imageId) {
      return "/placeholder.svg";
    }
    
    // Different possible URL formats for Cloudflare Images
    const formats = [
      `https://imagedelivery.net/${accountHash}/${imageId}/${type}`,
      `https://imagedelivery.net/${accountHash}/${imageId}/w=400,h=300,fit=cover`,
      `https://imagedelivery.net/${accountHash}/${imageId}/public`
    ];
    
    return formats[2]; // Start with the public format
  }, [accountHash]);

  // ✅ Handle image errors
  const handleImageError = useCallback((imageId, event) => {
    console.log('Image error for:', imageId);
    setImageErrors(prev => new Set([...prev, imageId]));
    
    // Try different fallbacks
    const img = event.target;
    const currentSrc = img.src;
    
    if (currentSrc.includes('/public')) {
      // Try without the type parameter
      img.src = `https://imagedelivery.net/${accountHash}/${imageId}`;
    } else if (!currentSrc.includes('placeholder')) {
      // Final fallback to placeholder
      img.src = "/placeholder.svg";
    }
  }, [accountHash]);

  // ✅ Improved refresh handler
  const handleRefresh = useCallback(() => {
    if (!isFetchingRef.current) {
      console.log('Manual refresh triggered');
      fetchBusinessTopics();
    }
  }, [fetchBusinessTopics]);

  // ✅ Handle card click
  const handleCardClick = useCallback((business) => {
    console.log('Clicked business:', {
      id: business.id,
      creatorTopicId: business.creatorTopicId,
      creatorTopicName: business.creatorTopicName,
      categoryId: business.categoryId,
      subCategoryId: business.subCategoryId
    });
    // Add your navigation logic here
    // For example: navigate(`/business/${business.creatorTopicId}`);
  }, []);

  // Loading state
  if (isLoading && businesses.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading business topics...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && businesses.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
            <p className="text-red-400 mb-4">{error}</p>
            <div className="text-gray-400 text-sm">
              <p>Possible issues:</p>
              <ul className="mt-2 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Verify Firebase configuration</li>
                <li>• Check if the "creatortopics-new" collection exists</li>
                <li>• Ensure documents have subCategoryId = "default"</li>
              </ul>
            </div>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-orange-500 hover:bg-orange-500/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">
              <span className="text-orange-500">Business</span> Topics
            </h1>
            <Button 
              onClick={handleRefresh}
              variant="ghost" 
              className="ml-auto text-gray-400 hover:text-white disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-400">
              {businesses.length} business topics available
            </p>
            {error && businesses.length > 0 && (
              <p className="text-yellow-400 text-sm">
                ⚠️ Some data may be outdated
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Business Grid */}
      <div className="container mx-auto px-4 py-12">
        {businesses.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
              <p className="text-gray-400 text-lg mb-4">No business topics found.</p>
              <p className="text-gray-500 text-sm mb-6">
                Make sure you have documents in your "creatortopics-new" collection with subCategoryId = "default".
              </p>
              <Button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {businesses.map((business, index) => (
              <Card
                key={business.id}
                className="group bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
                onClick={() => handleCardClick(business)}
              >
                <CardContent className="p-0">
                  <div className="relative h-fit bg-gradient-to-br from-blue-500 to-purple-500">
                    <img
                      src={getImageUrl(business.thumbnailId)}
                      alt={business.creatorTopicName || `Business ${index + 1}`}
                      className="w-fit h-fit object-fit opacity-90 group-hover:opacity-90 transition-opacity"
                      onError={(e) => handleImageError(business.thumbnailId, e)}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute top-4 left-4">
                      {/* <Badge className="bg-orange-500 text-white font-bold text-lg px-3 py-1">
                        {index + 1}
                      </Badge> */}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="lg" className="bg-orange-500 hover:bg-orange-600 rounded-full">
                        <Play className="w-5 h-5 mr-2" />
                        Learn Now
                      </Button>
                    </div>
                    
                    {/* Image error indicator */}
                    {imageErrors.has(business.thumbnailId) && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                          Image Error
                        </Badge>
                      </div>
                    )}
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Loading overlay for refresh */}
        {isLoading && businesses.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span className="text-gray-300 text-sm">Refreshing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}