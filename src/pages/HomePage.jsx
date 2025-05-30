import { Link } from 'react-router-dom'
import { Play, TrendingUp, Users, Star } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export default function HomePage() {
  const featuredCategories = [
    { name: "Dharm Yudh", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop", color: "from-red-500 to-red-700" },
    { name: "Karm Yudh", image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop", color: "from-orange-500 to-red-600" },
    { name: "Youtube Class", image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop", color: "from-green-500 to-blue-600" },
    { name: "Shunye Dhristi", image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=300&h=200&fit=crop", color: "from-purple-500 to-pink-600" },
  ]

  const businessCategories = [
    { name: "Mobile Repairing", icon: "📱" },
    { name: "Cab Driving", icon: "🚗" },
    { name: "Carpenter Business", icon: "🔨" },
    { name: "Plumber Business", icon: "🔧" },
    { name: "Electrician Business", icon: "⚡" },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-2xl">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold ml-4">
                <span className="text-orange-500">SHUNYE</span> OTT
              </h1>
            </div>

            <h2 className="text-2xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              चलो <span className="text-orange-500">BUSINESS</span> सीखें
            </h2>

            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Start implementing your <span className="text-yellow-400 font-semibold">ideas</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg rounded-full"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Latest Video
              </Button>
              <Link to="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 text-lg rounded-full"
                >
                  Explore Categories
                </Button>
              </Link>
            </div>

            <div className="mt-12 text-center">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 px-4 py-2 text-sm">
                Every Saturday 11pm - Latest Video
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Business Categories */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Popular <span className="text-orange-500">Business</span> Categories
          </h3>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {businessCategories.map((category, index) => (
              <Link key={index} to="/business">
                <Card className="bg-gray-800/50 border-orange-500/30 hover:border-orange-500 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3">{category.icon}</div>
                    <h4 className="text-white font-medium">{category.name}</h4>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Featured <span className="text-orange-500">Categories</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((category, index) => (
              <Link key={index} to="/categories">
                <Card className="group bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`h-48 bg-gradient-to-br ${category.color} relative overflow-hidden`}>
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute bottom-4 left-4">
                        <h4 className="text-white font-bold text-lg">{category.name}</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <TrendingUp className="w-12 h-12 text-orange-500" />
              </div>
              <h4 className="text-3xl font-bold text-white">1000+</h4>
              <p className="text-gray-300">Business Ideas</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="w-12 h-12 text-orange-500" />
              </div>
              <h4 className="text-3xl font-bold text-white">50K+</h4>
              <p className="text-gray-300">Active Learners</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Star className="w-12 h-12 text-orange-500" />
              </div>
              <h4 className="text-3xl font-bold text-white">4.8</h4>
              <p className="text-gray-300">Average Rating</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
