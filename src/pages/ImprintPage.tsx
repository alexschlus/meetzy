
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ImprintPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-playfair">
      <header className="p-4">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-2 text-blue-200 hover:text-blue-100">
            <ArrowLeft size={20} />
            Back to meetzy
          </Button>
        </Link>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-glass rounded-2xl p-8 shadow-glass">
          <h1 className="text-3xl font-bold text-blue-200 mb-8 text-center">Legal Information</h1>
          
          <div className="space-y-8 text-gray-200">
            <section>
              <h2 className="text-2xl font-semibold text-blue-300 mb-4">Imprint</h2>
              <div className="space-y-3">
                <p><strong>Service Provider:</strong> meetzy</p>
                <p><strong>Address:</strong><br />
                  meetzy<br />
                  Cologne, 51109<br />
                  Germany
                </p>
                <p><strong>Contact:</strong><br />
                  Email: mail@alexschlus.de<br />
                  Phone: +49 1633839274
                </p>
                <p><strong>Responsible for content:</strong> [Name of responsible person]</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-300 mb-4">Data Protection Declaration</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-blue-200 mb-2">1. Data Protection Overview</h3>
                  <p>We take the protection of your personal data very seriously. This privacy policy explains what information we collect, how we use it, and what rights you have regarding your data.</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-blue-200 mb-2">2. Data Collection</h3>
                  <p>We collect data when you:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                    <li>Create an account</li>
                    <li>Create or join events</li>
                    <li>Add friends to your network</li>
                    <li>Use our messaging features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-blue-200 mb-2">3. Data Usage</h3>
                  <p>Your data is used to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                    <li>Provide and improve our services</li>
                    <li>Enable communication between users</li>
                    <li>Send notifications about events and activities</li>
                    <li>Ensure security and prevent abuse</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-blue-200 mb-2">4. Data Storage</h3>
                  <p>Your data is stored securely using industry-standard encryption and security measures. We use Supabase as our database provider, which complies with GDPR and other data protection regulations.</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-blue-200 mb-2">5. Your Rights</h3>
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Delete your account and data</li>
                    <li>Withdraw consent at any time</li>
                    <li>Data portability</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-blue-200 mb-2">6. Cookies</h3>
                  <p>We use essential cookies to ensure the proper functioning of our application. These cookies are necessary for authentication and maintaining your session.</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-blue-200 mb-2">7. Contact</h3>
                  <p>If you have any questions about this privacy policy or your data, please contact us at:</p>
                  <p className="mt-2">Email: privacy@meetzy.app</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-blue-200 mb-2">8. Updates</h3>
                  <p>This privacy policy may be updated from time to time. We will notify users of any significant changes.</p>
                  <p className="mt-2"><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImprintPage;
