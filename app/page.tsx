'use client'

import Link from 'next/link'
import { ArrowRight, Zap, BarChart3, Shield, Users, FileText, MessageSquare } from 'lucide-react'
import Layout from '@/components/layout/Layout'

export default function HomePage() {
  return (
    <Layout currentPage="home">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Board Document Analysis
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your board meetings with intelligent document analysis, automated insights, 
            and data-driven decision making. BoardBravo makes complex board materials simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Document Processing</h3>
            <p className="text-gray-600">
              Upload PDFs, Excel files, and presentations. Our AI extracts key insights automatically.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Interactive Analytics</h3>
            <p className="text-gray-600">
              Generate charts, track KPIs, and visualize trends with intelligent data analysis.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Assistant</h3>
            <p className="text-gray-600">
              Ask questions about your documents and get instant, intelligent responses.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Risk Assessment</h3>
            <p className="text-gray-600">
              Identify potential risks and opportunities in your board materials automatically.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Collaboration</h3>
            <p className="text-gray-600">
              Share insights and collaborate on board decisions with your team members.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quick Insights</h3>
            <p className="text-gray-600">
              Get instant summaries and key takeaways from complex board documents.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Board Meetings?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join forward-thinking organizations using AI to make better board decisions.
          </p>
          <Link 
            href="/dashboard"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </Layout>
  )
} 