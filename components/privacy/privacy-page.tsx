"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Lock, Users, Download, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ForestLayout } from "../layout/forest-layout"


export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
      {/* Math Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl font-light text-green-600 dark:text-green-400 rotate-12">
          ∑
        </div>
        <div className="absolute top-32 right-20 text-4xl font-light text-green-500 dark:text-green-300 -rotate-12">
          π
        </div>
        <div className="absolute top-64 left-1/4 text-5xl font-light text-green-600 dark:text-green-400 rotate-45">
          ∫
        </div>
        <div className="absolute top-96 right-1/3 text-3xl font-light text-green-500 dark:text-green-300 -rotate-6">
          √
        </div>
        <div className="absolute bottom-96 left-16 text-4xl font-light text-green-600 dark:text-green-400 rotate-12">
          α
        </div>
        <div className="absolute bottom-64 right-16 text-5xl font-light text-green-500 dark:text-green-300 -rotate-12">
          ∆
        </div>
        <div className="absolute bottom-32 left-1/3 text-3xl font-light text-green-600 dark:text-green-400 rotate-6">
          ∞
        </div>
        <div className="absolute top-1/2 left-8 text-4xl font-light text-green-500 dark:text-green-300 -rotate-45">
          θ
        </div>
        <div className="absolute top-1/3 right-8 text-3xl font-light text-green-600 dark:text-green-400 rotate-30">
          λ
        </div>
        <div className="absolute bottom-1/3 right-1/4 text-4xl font-light text-green-500 dark:text-green-300 -rotate-30">
          Ω
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-1/4 w-16 h-16 border-2 border-green-300 dark:border-green-600 rounded-full opacity-20 animate-float"></div>
        <div
          className="absolute top-1/2 left-20 w-12 h-12 border-2 border-green-400 dark:border-green-500 rotate-45 opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-20 w-20 h-20 border-2 border-green-300 dark:border-green-600 rounded-full opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/3 w-14 h-14 border-2 border-green-400 dark:border-green-500 rotate-12 opacity-20 animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
      {/* Header */}
      <ForestLayout>

        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-6 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700">
              🔒 Privacy Policy
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Your{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Privacy</span>{" "}
              Matters
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              We're committed to protecting your privacy and being transparent about how we collect, use, and protect your
              data.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: March 15, 2025</p>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="py-16 bg-white/50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Privacy at a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Protection</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Your data is encrypted and securely stored</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Eye className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Transparency</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Clear information about data usage</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Lock className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Control</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">You control your data and privacy settings</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Selling</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">We never sell your personal data</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">1. Information We Collect</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Account information (name, email, password)</li>
                  <li>• Profile details (school, major, graduation year)</li>
                  <li>• Payment information (processed securely by our payment partners)</li>
                  <li>• Communication preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 mt-6">Study Data</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Documents you upload for AI processing</li>
                  <li>• Generated summaries, flashcards, and study materials</li>
                  <li>• Study session data and progress tracking</li>
                  <li>• Voice recordings for AI tutor interactions (processed and deleted)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 mt-6">Usage Information</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• How you interact with our platform</li>
                  <li>• Feature usage patterns and preferences</li>
                  <li>• Device information and browser type</li>
                  <li>• IP address and general location data</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">2. How We Use Your Information</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li>
                    • <strong>Provide our services:</strong> Process your documents, generate AI summaries, create
                    flashcards, and deliver personalized learning experiences
                  </li>
                  <li>
                    • <strong>Improve our platform:</strong> Analyze usage patterns to enhance features and develop new
                    tools
                  </li>
                  <li>
                    • <strong>Customer support:</strong> Respond to your questions and provide technical assistance
                  </li>
                  <li>
                    • <strong>Communication:</strong> Send important updates, feature announcements, and educational
                    content (you can opt out)
                  </li>
                  <li>
                    • <strong>Security:</strong> Protect against fraud, abuse, and unauthorized access
                  </li>
                  <li>
                    • <strong>Legal compliance:</strong> Meet our legal obligations and protect our rights
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">3. Information Sharing</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      We never sell your personal data to third parties.
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We only share your information in these limited circumstances:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>
                    • <strong>Service providers:</strong> Trusted partners who help us operate our platform (cloud
                    hosting, payment processing, analytics)
                  </li>
                  <li>
                    • <strong>AI processing:</strong> Secure, encrypted data sent to AI model providers for generating
                    summaries and responses
                  </li>
                  <li>
                    • <strong>Legal requirements:</strong> When required by law or to protect our rights and users' safety
                  </li>
                  <li>
                    • <strong>Business transfers:</strong> In the event of a merger or acquisition (with continued privacy
                    protection)
                  </li>
                  <li>
                    • <strong>With your consent:</strong> Any other sharing requires your explicit permission
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">4. Data Security</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>
                    • <strong>Encryption:</strong> All data is encrypted in transit and at rest
                  </li>
                  <li>
                    • <strong>Access controls:</strong> Strict limits on who can access your information
                  </li>
                  <li>
                    • <strong>Regular audits:</strong> Ongoing security assessments and improvements
                  </li>
                  <li>
                    • <strong>Secure infrastructure:</strong> Hosted on enterprise-grade cloud platforms
                  </li>
                  <li>
                    • <strong>Data minimization:</strong> We only collect and retain data necessary for our services
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">5. Your Rights and Choices</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You have the following rights regarding your personal data:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Eye className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Access</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">View what data we have about you</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Download className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Export</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Download your data in a portable format</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Correct</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Update or correct your information</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Trash2 className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Delete</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Request deletion of your account and data
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  To exercise these rights, contact us at{" "}
                  <a href="mailto:info@duoheads.com" className="text-green-600 dark:text-green-400 hover:underline">
                    info@duoheads.com
                  </a>{" "}
                  or through your account settings.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">6. Data Retention</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>
                    • <strong>Account data:</strong> Retained while your account is active and for 30 days after deletion
                  </li>
                  <li>
                    • <strong>Study materials:</strong> Kept as long as you maintain your account, deleted upon account
                    closure
                  </li>
                  <li>
                    • <strong>Usage analytics:</strong> Aggregated, anonymized data may be retained for product
                    improvement
                  </li>
                  <li>
                    • <strong>Voice recordings:</strong> Processed immediately for AI responses and then deleted
                  </li>
                  <li>
                    • <strong>Support communications:</strong> Retained for 2 years for quality assurance
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">7. International Data Transfers</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  Duoheads operates globally, and your data may be processed in countries other than your own. We ensure
                  appropriate safeguards are in place for international transfers, including:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                  <li>• Standard contractual clauses approved by data protection authorities</li>
                  <li>• Adequacy decisions for transfers to countries with equivalent protection</li>
                  <li>• Certification schemes and codes of conduct</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">8. Children's Privacy</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  Duoheads is designed for users 13 years and older. We do not knowingly collect personal information
                  from children under 13. If we become aware that we have collected such information, we will take steps
                  to delete it promptly. Parents who believe their child has provided us with personal information should
                  contact us immediately.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">9. Changes to This Policy</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                  requirements. We will notify you of significant changes by email or through our platform. The "Last
                  updated" date at the top of this policy indicates when it was last revised.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">10. Contact Us</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>
                    • Email:{" "}
                    <a href="mailto:info@duoheads.com" className="text-green-600 dark:text-green-400 hover:underline">
                      info@duoheads.com
                    </a>
                  </li>
                  <li>
                    • Support:{" "}
                    <a href="/contact" className="text-green-600 dark:text-green-400 hover:underline">
                      Contact Form
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white/50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Questions About Your Privacy?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              We're here to help you understand how we protect your data and respect your privacy.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                Contact Privacy Team
              </Button>
            </Link>
          </div>
        </section>
      </ForestLayout>
    </div>
  )
}
