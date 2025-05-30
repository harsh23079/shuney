import { Link }   from 'react-router-dom'
import {
	ArrowLeft,
	BookOpen,
	Heart,
	Laptop,
	Globe
}                 from 'lucide-react'
import { Button } from '../components/ui/Button'
import {
	Card,
	CardContent
}                 from '../components/ui/Card'

export default function CategoriesPage() {
  const categories = [
    {
      name: "Life",
      description: "Personal development and life skills",
      image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=400&h=300&fit=crop",
      icon: Heart,
      color: "from-teal-500 to-cyan-500",
      count: "150+ Videos",
    },
    {
      name: "Software",
      description: "Programming and technology courses",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      icon: Laptop,
      color: "from-gray-600 to-gray-800",
      count: "200+ Videos",
    },
    {
      name: "NCERT",
      description: "Educational content and exam preparation",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      icon: BookOpen,
      color: "from-green-500 to-blue-500",
      count: "300+ Videos",
    },
    {
      name: "Health",
      description: "Wellness and healthcare guidance",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      icon: Heart,
      color: "from-purple-500 to-pink-500",
      count: "100+ Videos",
    },
    {
      name: "Languages",
      description: "Learn new languages and communication",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
      icon: Globe,
      color: "from-indigo-500 to-purple-500",
      count: "80+ Videos",
    },
  ]

  const subCategories = [
    {
      name: "Humans",
      description: "Human psychology and behavior",
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=200&fit=crop",
      color: "from-blue-600 to-purple-600",
    },
    {
      name: "Animals",
      description: "Animal kingdom and wildlife",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=200&fit=crop",
      color: "from-orange-500 to-red-500",
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
              <span className="text-orange-500">Categories</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Explore Our <span className="text-orange-500">Learning</span> Categories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card
                  key={index}
                  className="group bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden hover:scale-105"
                >
                  <CardContent className="p-0">
                    <div className={`relative h-48 bg-gradient-to-br ${category.color}`}>
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute top-4 right-4">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-white font-bold text-xl mb-1">{category.name}</h3>
                        <p className="text-gray-200 text-sm">{category.count}</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">Explore {category.name}</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Sub Categories */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">
            <span className="text-orange-500">Sub</span> Categories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {subCategories.map((category, index) => (
              <Card
                key={index}
                className="group bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden hover:scale-105"
              >
                <CardContent className="p-0">
                  <div className={`relative h-64 bg-gradient-to-br ${category.color}`}>
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-6 left-6">
                      <h3 className="text-white font-bold text-2xl mb-2">{category.name}</h3>
                      <p className="text-gray-200 text-sm">{category.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
