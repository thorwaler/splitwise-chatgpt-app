'use client';

import { useEffect, useState } from 'react';

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 15, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Splitwise Synch ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our ChatGPT application that integrates with Splitwise ("Service").
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Email Address:</strong> Used for account identification and authentication</li>
              <li><strong>Splitwise Account Data:</strong> Access to your Splitwise groups, expenses, and user information through OAuth authorization</li>
              <li><strong>Expense Information:</strong> Data you provide when creating or managing expenses through our Service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Usage Data:</strong> Information about how you interact with our Service, including tool usage and message counts</li>
              <li><strong>Session Data:</strong> Session tokens to maintain your authenticated state</li>
              <li><strong>Log Data:</strong> Technical information including IP addresses, browser type, and timestamps for security and debugging purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To authenticate your Splitwise account via OAuth</li>
              <li>To create, modify, and manage expenses on your behalf</li>
              <li>To track usage limits and payment status</li>
              <li>To improve and optimize our Service</li>
              <li>To communicate with you about Service updates</li>
              <li>To detect, prevent, and address technical issues or security vulnerabilities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Storage</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data is stored securely using Upstash Redis database with encryption at rest. Splitwise OAuth tokens are encrypted before storage. Session data is maintained for the duration of your active session.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Security Measures</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>HTTPS encryption for all data in transit</li>
              <li>Encrypted storage of OAuth access tokens</li>
              <li>Secure session token generation and validation</li>
              <li>Regular security audits and updates</li>
              <li>Limited data retention policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Splitwise</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service integrates with Splitwise via OAuth 2.0. We access your Splitwise account with your explicit permission to manage expenses on your behalf. Your use of Splitwise is also governed by Splitwise's own Privacy Policy and Terms of Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 OpenAI/ChatGPT</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service is accessed through ChatGPT. Your interactions with ChatGPT are governed by OpenAI's Privacy Policy and Terms of Use.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Hosting and Infrastructure</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service is hosted on Vercel and uses Upstash Redis for data storage. These providers may have access to your data as necessary to provide their services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-3">We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
              <li><strong>Service Providers:</strong> With trusted third-party service providers (Splitwise, Vercel, Upstash) necessary to operate our Service</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property, and that of our users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Specifically:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>OAuth Tokens:</strong> Stored until you revoke access or tokens expire (90 days)</li>
              <li><strong>Usage Logs:</strong> Retained for up to 30 days for debugging and security purposes</li>
              <li><strong>Payment Records:</strong> Retained for tax and accounting purposes as required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 mb-3">Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request access to your personal information we hold</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Objection:</strong> Object to processing of your personal information</li>
              <li><strong>Revoke Consent:</strong> Withdraw consent for data processing at any time</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at the email address provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and maintained on servers located outside of your jurisdiction where data protection laws may differ. By using our Service, you consent to the transfer of your information to these locations. We take appropriate measures to ensure your data is treated securely and in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is not intended for use by children under the age of 13 (or 16 in certain jurisdictions). We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes are effective when posted on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> andreas@ammp.io</p>
              <p className="text-gray-700"><strong>Service Name:</strong> Splitwise Synch</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. GDPR Compliance (EU Users)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are located in the European Economic Area (EEA), you have certain rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. California Privacy Rights (CCPA)</h2>
            <p className="text-gray-700 leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your personal information, and the right to opt-out of the sale of your personal information (note: we do not sell personal information).
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center">
          <a 
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            ← Back to Home
          </a>
          <a 
            href="/terms"
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Terms of Service →
          </a>
        </div>
      </div>
    </div>
  );
}
