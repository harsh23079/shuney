import { Link }  from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Badge }  from '../components/ui/Badge'
import {
	ArrowLeft,
	Play,
	Star,
	TrendingUp
}                 from 'lucide-react'
import {
	Card,
	CardContent
}                 from '../components/ui/Card'

export default function BusinessPage() {
  const businesses = [
    {
      id: 1,
      title: "OLA-UBER BUSINESS",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
      description: "Learn how to start and scale your ride-sharing business",
      rating: 4.8,
      students: "12K+",
      color: "from-green-500 to-yellow-500",
    },
    {
      id: 2,
      title: "RAPIDO BUSINESS",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      description: "Master the bike taxi and delivery business model",
      rating: 4.7,
      students: "8K+",
      color: "from-blue-500 to-yellow-500",
    },
    {
      id: 3,
      title: "PLUMBER BUSINESS",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
      description: "Build a successful plumbing service business",
      rating: 4.9,
      students: "15K+",
      color: "from-blue-600 to-purple-600",
    },
    {
      id: 4,
      title: "ELECTRICIAN BUSINESS",
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
      description: "Start your electrical services company",
      rating: 4.6,
      students: "10K+",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 5,
      title: "COMPUTER BUSINESS",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
      description: "Launch your computer repair and services business",
      rating: 4.8,
      students: "18K+",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 6,
      title: "MOBILE REPAIRING BUSINESS",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
      description: "Build a profitable mobile repair business",
      rating: 4.7,
      students: "22K+",
      color: "from-gray-600 to-gray-800",
    },
    {
      id: 7,
      title: "SALOON BUSINESS",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
      description: "Create a successful salon and beauty business",
      rating: 4.5,
      students: "9K+",
      color: "from-yellow-600 to-orange-600",
    },
    {
      id: 8,
      title: "CARPENTER BUSINESS",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
      description: "Start your carpentry and furniture business",
      rating: 4.8,
      students: "11K+",
      color: "from-amber-600 to-brown-600",
    },
  ]

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
              <span className="text-orange-500">Business</span> Categories
            </h1>
          </div>
        </div>
      </div>

      {/* Business Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {businesses.map((business, index) => (
            <Card
              key={business.id}
              className="group bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden hover:scale-105"
            >
              <CardContent className="p-0">
                <div className={`relative h-48 bg-gradient-to-br ${business.color}`}>
                  <img
                    src={business.image || "/placeholder.svg"}
                    alt={business.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-orange-500 text-white font-bold text-lg px-3 py-1">{index + 1}</Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 rounded-full">
                      <Play className="w-5 h-5 mr-2" />
                      Learn Now
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-white group-hover:text-orange-400 transition-colors">
                    {business.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{business.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{business.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{business.students}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
