import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('contact_messages').insert({
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setSubmitted(true);

      setTimeout(() => {
        setFormData({ name: '', email: user?.email || '', phone: '', subject: '', message: '' });
        setSubmitted(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-64 bg-gradient-to-r from-neutral-900 to-neutral-700">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-display text-5xl text-white mb-4">Contact Us</h1>
            <p className="text-xl text-white/90">We'd love to hear from you</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div data-aos="fade-right">
            <h2 className="font-display text-3xl text-neutral-900 mb-6">Get in Touch</h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Have a question about our products? Need help with an order? Or just want to say hello?
              Fill out the form and we'll get back to you as soon as possible.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Visit Us</h3>
                  <p className="text-neutral-600">
                    123 Furniture Street
                    <br />
                    Design District, NY 10001
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Call Us</h3>
                  <p className="text-neutral-600">
                    +1 (555) 123-4567
                    <br />
                    Mon-Fri, 9am-6pm EST
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Email Us</h3>
                  <p className="text-neutral-600">
                    support@zombieshop.com
                    <br />
                    We'll respond within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Showroom Hours</h3>
                  <p className="text-neutral-600">
                    Monday - Friday: 9am - 7pm
                    <br />
                    Saturday: 10am - 6pm
                    <br />
                    Sunday: 11am - 5pm
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-100 rounded-xl p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">Need Quick Answers?</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Check out our FAQ page for answers to common questions about shipping, returns, and more.
              </p>
              <a href="/faq" className="text-brand-600 font-semibold hover:underline">
                Visit FAQ
              </a>
            </div>
          </div>

          <div data-aos="fade-left">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="font-display text-2xl text-neutral-900 mb-6">Send us a Message</h3>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg text-neutral-900 mb-2">Message Sent!</h4>
                  <p className="text-neutral-600">
                    Thank you for contacting us. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value="">Select a subject</option>
                      <option value="product">Product Inquiry</option>
                      <option value="order">Order Status</option>
                      <option value="shipping">Shipping Question</option>
                      <option value="return">Returns & Exchanges</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Send Message</span>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20" data-aos="fade-up">
          <h2 className="font-display text-3xl text-neutral-900 mb-8 text-center">Find Our Showroom</h2>
          <div className="bg-neutral-200 rounded-xl h-96 flex items-center justify-center">
            <p className="text-neutral-600">Map integration would go here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
