"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, AlertTriangle, CreditCard } from "lucide-react"
import Link from "next/link"
import { ForestLayout } from "../layout/forest-layout"


export default function TermsPage() {
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
            📋 Terms of Service
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Terms of{" "}
            <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            These terms govern your use of Duoheads and outline the rights and responsibilities of both you and us.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: March 15, 2025 • Effective: March 1, 2025
          </p>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Key Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fair Use</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Use Duoheads for legitimate educational purposes
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Content</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  You retain ownership of your uploaded materials
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <CreditCard className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Billing</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Clear pricing with easy cancellation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">1. Acceptance of Terms</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                By accessing or using Duoheads ("the Service"), you agree to be bound by these Terms of Service
                ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                These Terms apply to all visitors, users, and others who access or use the Service. By using Duoheads,
                you represent that you are at least 13 years old.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">2. Description of Service</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Duoheads is an AI-powered learning platform that helps students study more effectively through:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• AI-generated summaries of uploaded documents</li>
                <li>• Automated flashcard creation</li>
                <li>• Voice-powered AI tutoring</li>
                <li>• Study planning and scheduling tools</li>
                <li>• Quiz and exam generation</li>
                <li>• Stress relief and wellness features</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">3. User Accounts</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Creation</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li>• You must provide accurate and complete information when creating an account</li>
                <li>• You are responsible for maintaining the security of your account and password</li>
                <li>• You must notify us immediately of any unauthorized use of your account</li>
                <li>• One person may not maintain more than one free account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Termination</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You may delete your account at any time through your account settings. We may suspend or terminate your
                account if you violate these Terms or engage in harmful behavior.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">4. Acceptable Use</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">You May:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li>• Use Duoheads for legitimate educational and learning purposes</li>
                <li>• Upload your own study materials and documents</li>
                <li>• Share generated study materials with classmates (where permitted)</li>
                <li>• Provide feedback and suggestions for improvement</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">You May Not:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Upload copyrighted materials without permission</li>
                <li>• Use the Service for commercial purposes without authorization</li>
                <li>• Attempt to reverse engineer or copy our AI models</li>
                <li>• Share your account credentials with others</li>
                <li>• Upload harmful, illegal, or inappropriate content</li>
                <li>• Attempt to overwhelm our systems or circumvent usage limits</li>
                <li>• Use the Service to cheat on exams or violate academic integrity policies</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              5. Content and Intellectual Property
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Content</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li>• You retain ownership of all materials you upload to Duoheads</li>
                <li>• You grant us a license to process your content to provide our services</li>
                <li>• You are responsible for ensuring you have the right to upload and process your content</li>
                <li>• We may remove content that violates these Terms or applicable laws</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Our Content</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Duoheads's software, AI models, and platform are our intellectual property</li>
                <li>• AI-generated summaries and flashcards are created for your personal use</li>
                <li>• You may not redistribute or commercialize AI-generated content</li>
                <li>• Our trademarks and branding remain our exclusive property</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">6. Subscription and Billing</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Free Plan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our Seedling plan is free forever with usage limits. No credit card required.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Paid Subscriptions</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li>• Subscriptions are billed monthly or per semester as selected</li>
                <li>• You may cancel your subscription at any time</li>
                <li>• Cancellation takes effect at the end of your current billing period</li>
                <li>• We may change pricing with 30 days' notice to existing subscribers</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Refunds</h3>
              <p className="text-gray-600 dark:text-gray-300">
                If you are not satisfied with our service, we will refund your payment—no questions asked.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">7. Privacy and Data</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                Your privacy is important to us. Our collection and use of your information is governed by our
                <Link href="/privacy" className="text-green-600 dark:text-green-400 hover:underline">
                  {" "}
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">8. Disclaimers and Limitations</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">Important Disclaimers</p>
                </div>
              </div>

              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>
                  • <strong>AI Accuracy:</strong> AI-generated content may contain errors. Always verify important
                  information.
                </li>
                <li>
                  • <strong>Educational Tool:</strong> Duoheads is a study aid, not a replacement for learning or
                  critical thinking.
                </li>
                <li>
                  • <strong>Academic Integrity:</strong> You are responsible for following your institution's academic
                  policies.
                </li>
                <li>
                  • <strong>Service Availability:</strong> We strive for 99.9% uptime but cannot guarantee uninterrupted
                  service.
                </li>
                <li>
                  • <strong>No Warranties:</strong> The service is provided "as is" without warranties of any kind.
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">9. Limitation of Liability</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                To the maximum extent permitted by law, Duoheads shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Loss of profits, data, or other intangible losses</li>
                <li>• Damages resulting from your use or inability to use the service</li>
                <li>• Damages resulting from any unauthorized access to your account</li>
                <li>• Damages resulting from AI-generated content inaccuracies</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                Our total liability to you for any claim shall not exceed the amount you paid us in the 12 months
                preceding the claim.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">10. Indemnification</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                You agree to indemnify and hold harmless Duoheads and its affiliates from any claims, damages, or
                expenses arising from your use of the service, violation of these Terms, or infringement of any
                third-party rights.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">11. Termination</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Either party may terminate these Terms at any time:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• You may stop using the service and delete your account</li>
                <li>• We may suspend or terminate your access for violations of these Terms</li>
                <li>• Upon termination, your right to use the service ceases immediately</li>
                <li>• We will retain your data for 30 days after termination for account recovery</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">12. Changes to Terms</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                We may modify these Terms from time to time. We will notify you of significant changes by email or
                  through the service. Your continued use of Duoheads after changes become effective constitutes
                acceptance of the new Terms.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">13. Governing Law</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                These Terms are governed by the laws of the State of California, United States, without regard to
                conflict of law principles. Any disputes will be resolved in the courts of San Francisco County,
                California.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">14. Contact Information</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you have questions about these Terms, please contact us:
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              By using Duoheads, you agree to these Terms of Service. Start your learning journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900 bg-transparent"
              >
                Have Questions?
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </ForestLayout>
    </div>
  )
}
