'use client';

import { useEffect, useState } from 'react';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 15, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using Splitwise Synch ("Service," "we," "our," or "us"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms apply to all users of the Service, including but not limited to users who access the Service through ChatGPT or any other interface we may provide.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Splitwise Synch is a ChatGPT application that integrates with Splitwise to help you manage shared expenses. The Service allows you to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Connect your Splitwise account via OAuth authentication</li>
              <li>Create and manage expenses in your Splitwise groups</li>
              <li>Apply custom split configurations (percentages, amounts, per-user)</li>
              <li>View analytics and reports of your expenses</li>
              <li>Set default preferences for expense splitting</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use the Service, you must provide a valid email address and authorize access to your Splitwise account. You agree to provide accurate, current, and complete information during registration.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Security</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Splitwise Account Required</h3>
            <p className="text-gray-700 leading-relaxed">
              Use of this Service requires a valid Splitwise account. You must comply with Splitwise's Terms of Service and Privacy Policy in addition to these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Usage Limits and Pricing</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Free Tier</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              New users receive 10 free messages to try the Service. Free tier includes access to basic features such as expense creation and group management.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Paid Access</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              After exhausting free messages, continued use requires payment. Pricing details are provided within the application. Payment is processed securely, and you will receive confirmation of your payment status.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Refund Policy</h3>
            <p className="text-gray-700 leading-relaxed">
              All payments are final and non-refundable, except as required by law or at our sole discretion in cases of service malfunction or billing errors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
            
            <p className="text-gray-700 mb-3">You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful, offensive, or illegal content</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) without authorization</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Create fake or fraudulent expenses</li>
              <li>Abuse or exploit the free tier or payment systems</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Service Ownership</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service, including all content, features, and functionality, is owned by us and is protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Your Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain ownership of any content you create or submit through the Service (such as expense descriptions). By using the Service, you grant us a limited license to process and store this content solely to provide the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Third-Party Rights</h3>
            <p className="text-gray-700 leading-relaxed">
              Splitwise and related trademarks are the property of Splitwise, Inc. ChatGPT and OpenAI are trademarks of OpenAI. We are not affiliated with, endorsed by, or sponsored by Splitwise or OpenAI.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data and Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Splitwise Integration</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service integrates with Splitwise via their API. We are not responsible for Splitwise's availability, functionality, or any issues that arise from their service. Your use of Splitwise is subject to their Terms of Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 ChatGPT Platform</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service is accessed through ChatGPT. We are not responsible for ChatGPT's availability or functionality. Your use of ChatGPT is subject to OpenAI's Terms of Use.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 No Endorsement</h3>
            <p className="text-gray-700 leading-relaxed">
              Integration with third-party services does not constitute endorsement by those services. We are an independent service provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Service Availability and Modifications</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Service Availability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strive to provide reliable service but do not guarantee that the Service will be available at all times or without interruption. The Service may be unavailable due to maintenance, updates, or circumstances beyond our control.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Modifications</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time with or without notice. We may also modify these Terms at any time. Continued use of the Service after modifications constitutes acceptance of the modified Terms.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.3 Updates</h3>
            <p className="text-gray-700 leading-relaxed">
              We may release updates, bug fixes, and new features periodically. Some updates may be required to continue using the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 "AS IS" Basis</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 No Warranty</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not warrant that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>The Service will meet your requirements</li>
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>The results obtained from using the Service will be accurate or reliable</li>
              <li>Any errors in the Service will be corrected</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.3 Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-gray-700 leading-relaxed">
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Splitwise Synch, its affiliates, and their respective officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your violation of any rights of another party.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">12.1 Termination by You</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may stop using the Service at any time. You may also revoke the Service's access to your Splitwise account through Splitwise's settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">12.2 Termination by Us</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate your access to the Service at any time, with or without notice, for any reason, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Abuse of the Service</li>
              <li>Non-payment of fees</li>
              <li>At our sole discretion</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">12.3 Effect of Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              Upon termination, your right to use the Service will immediately cease. We may delete your account data, although some information may be retained as required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">13.1 Informal Resolution</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any dispute with us, you agree to first contact us and attempt to resolve the dispute informally before pursuing any formal legal action.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">13.2 Governing Law</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of Argentina, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">13.3 Jurisdiction</h3>
            <p className="text-gray-700 leading-relaxed">
              Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in Argentina, and you consent to personal jurisdiction in such courts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. General Provisions</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">14.1 Entire Agreement</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">14.2 Severability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">14.3 Waiver</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our failure to enforce any right or provision of these Terms will not constitute a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">14.4 Assignment</h3>
            <p className="text-gray-700 leading-relaxed">
              You may not assign or transfer these Terms or your rights under these Terms without our prior written consent. We may assign these Terms without restriction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> andreas@ammp.io</p>
              <p className="text-gray-700"><strong>Service Name:</strong> Splitwise Synch</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes your acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Acknowledgment</h2>
            <p className="text-gray-700 leading-relaxed">
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center">
          <a 
            href="/privacy"
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            ← Privacy Policy
          </a>
          <a 
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Back to Home →
          </a>
        </div>
      </div>
    </div>
  );
}
