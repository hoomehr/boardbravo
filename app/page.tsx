'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, Shield, Brain, Workflow, CheckCircle, TrendingUp, Clock, Users, Eye } from 'lucide-react'
import Layout from '@/components/layout/Layout'

export default function HomePage() {
  return (
    <Layout currentPage="home">
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 py-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Subtle Badge */}
              <div className="inline-flex items-center bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-blue-700 text-sm font-medium">Enterprise Agentic AI</span>
            </div>
              
              {/* Main Heading */}
              <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Autonomous Board
                <br />
                <span className="text-blue-600">Intelligence</span>
          </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Deploy AI agents that independently analyze board documents, monitor governance metrics, 
                and provide strategic insights—enabling executives to focus on decision-making.
              </p>
              
              {/* Simple CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center space-x-2"
            >
                  <span>Deploy AI Agents</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
                
                <button className="bg-white border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  View Capabilities
            </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits - Clean Grid */}
        <div className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Executive Efficiency</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Autonomous agents handle complex analysis while you focus on strategic decisions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Autonomous Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI agents independently process board materials, extract key insights, and identify critical patterns without manual oversight.
            </p>
          </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-green-600" />
            </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Risk Monitoring</h3>
                <p className="text-gray-600 leading-relaxed">
                  Continuous surveillance of governance metrics with intelligent alerts for compliance gaps and strategic risks.
            </p>
          </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Workflow className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Executive Workflows</h3>
                <p className="text-gray-600 leading-relaxed">
                  Streamlined processes that deliver actionable insights and recommendations directly to decision-makers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition - Two Column */}
        <div className="bg-gray-50 py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Governance Intelligence That Never Sleeps
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Our AI agents work continuously to ensure your board has the most current, 
                  accurate, and actionable intelligence for every decision.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">24/7 Document Monitoring</h4>
                      <p className="text-gray-600">Agents continuously analyze new board materials and regulatory updates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Predictive Risk Assessment</h4>
                      <p className="text-gray-600">Early warning systems for governance, financial, and operational risks</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Executive Summaries</h4>
                      <p className="text-gray-600">Concise, action-oriented reports tailored for board-level decision making</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Real-Time Board Dashboard</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Governance Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-14 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-green-600 font-semibold">94%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Risk Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-4 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-yellow-600 font-semibold">Low</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Compliance Status</span>
                    <span className="text-green-600 font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Current
                    </span>
          </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last Agent Analysis</span>
                      <span className="text-gray-700">2 minutes ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Stats */}
        <div className="bg-white py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Executive Teams</h2>
              <p className="text-lg text-gray-600">Leading organizations rely on our autonomous intelligence</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.7%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                <div className="text-sm text-gray-600">Time Saved</div>
          </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">SOC 2</div>
                <div className="text-sm text-gray-600">Compliant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Process */}
        <div className="bg-gray-50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Three Steps to Autonomous Intelligence</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Data Sources</h3>
                <p className="text-gray-600">Upload documents or connect to your existing board management systems</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Deploy AI Agents</h3>
                <p className="text-gray-600">Agents begin autonomous analysis and monitoring of your governance data</p>
          </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Receive Insights</h3>
                <p className="text-gray-600">Get executive summaries and alerts delivered when you need them</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA - Professional */}
        <div className="bg-white py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Deploy Autonomous Intelligence?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join executives who have already enhanced their governance with AI agents.
          </p>
              
          <Link 
            href="/dashboard"
                className="bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
                <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
              
              <p className="text-sm text-gray-500 mt-4">
                Enterprise-grade security • SOC 2 Type II certified • 24/7 support
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 