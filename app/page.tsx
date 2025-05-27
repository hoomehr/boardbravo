'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, MessageSquare, Upload, Zap, ArrowRight, Brain, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Upload,
      title: "Smart Document Upload",
      description: "Drag & drop PDFs, Excel files, and presentations. Supports Google Drive integration for seamless access to your board materials.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced AI understands context, extracts key insights, and identifies trends across multiple documents and meetings.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MessageSquare,
      title: "Intelligent Q&A",
      description: "Ask natural language questions about your documents. Get instant summaries, risk assessments, and strategic insights.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and privacy controls ensure your sensitive board materials remain completely secure.",
      color: "from-orange-500 to-red-500"
    }
  ]

  const sampleQueries = [
    "Summarize the latest board deck",
    "What are the top 3 risks mentioned in this quarter's report?",
    "Give me financial trend highlights from the last 3 board meetings",
    "Prepare a summary of this investment pitch with pros and cons"
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BoardBravo
            </span>
          </div>
          <Link 
            href="/dashboard"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-gray-900">Board Meetings</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered document analysis that turns your board materials into actionable insights. 
              Ask questions, get summaries, and make better decisions faster.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link 
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex items-center justify-center"
            >
              Start Analyzing <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-gray-300 transition-colors">
              Watch Demo
            </button>
          </motion.div>

          {/* Sample Queries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Try asking:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleQueries.map((query, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 text-left text-gray-700 text-sm hover:bg-gray-100 transition-colors cursor-pointer">
                  &ldquo;{query}&rdquo;
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for smarter board meetings
            </h2>
            <p className="text-xl text-gray-600">
              Powerful AI capabilities designed specifically for board governance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                90%
              </div>
              <div className="text-gray-600">Faster Decision Making</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                50+
              </div>
              <div className="text-gray-600">Document Types Supported</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-600">AI Assistant Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to revolutionize your board meetings?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join forward-thinking organizations already using BoardBravo
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">BoardBravo</span>
            </div>
            <div className="text-gray-400">
              © 2024 BoardBravo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 