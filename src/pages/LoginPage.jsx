import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Play, ArrowLeft, User, Phone, Briefcase } from "lucide-react"

import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/Select"
import { Button } from "../components/ui/Button"

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    occupation: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOccupationChange = (value) => {
    setFormData((prev) => ({ ...prev, occupation: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login data:", formData)
    navigate("/") // redirect to home or dashboard
  }

  const handleBackClick = () => {
    navigate(-1) // go back to the previous page
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
          filter: "blur(8px)",
          transform: "scale(1.1)",
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-20 text-white hover:text-orange-500"
        onClick={handleBackClick}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
            <div className="text-3xl font-bold">
              <span className="text-orange-500">Shunye</span> <span className="text-white">OTT</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-300 mt-2">Sign in to continue learning business</p>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="pl-10 py-3"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                Phone Number
              </Label>
              <div className="relative">
                {/* <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> */}
                <div className="flex">
                  <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 text-sm">
                    +91
                  </div>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Enter phone number"
                    className="pl-3 py-3 rounded-l-none"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <Label htmlFor="occupation" className="text-gray-700 font-medium">
                Occupation
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Select onValueChange={handleOccupationChange} value={formData.occupation}>
                  <SelectTrigger className="pl-10 py-3">
                    <SelectValue placeholder="Select your occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                    <SelectItem value="business-owner">Business Owner</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="job-seeker">Job Seeker</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full py-3 text-white font-semibold text-lg">
              Sign In
            </Button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {"Don't have an account? "}
              <button className="text-orange-500 hover:text-orange-600 font-medium">Sign up here</button>
            </p>
          </div>
        </div>

        {/* Extra Text */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">Join thousands learning business with Shunye OTT</p>
        </div>
      </div>
    </div>
  )
}