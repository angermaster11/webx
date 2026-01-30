import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Facebook, Twitter, Instagram, Youtube,
  Mail, Phone, MapPin 
} from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog' },
      { name: 'Press', path: '/press' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Safety', path: '/safety' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
    ],
    partners: [
      { name: 'Partner With Us', path: '/partner' },
      { name: 'Restaurant Portal', path: '/admin' },
      { name: 'Delivery Partners', path: '/delivery' },
      { name: 'API Access', path: '/api' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, url: '#', name: 'Facebook' },
    { icon: Twitter, url: '#', name: 'Twitter' },
    { icon: Instagram, url: '#', name: 'Instagram' },
    { icon: Youtube, url: '#', name: 'Youtube' },
  ];

  return (
    <footer className="bg-dark-card border-t border-dark-border">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-serif font-bold text-gradient">
                DineFlow
              </span>
            </Link>
            <p className="mt-4 text-white/60 max-w-sm">
              Order Smart. Dine Better. Manage Seamlessly. Your complete restaurant 
              ordering and table management platform.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a href="tel:+911234567890" className="flex items-center space-x-3 text-white/60 hover:text-luxury-gold transition-colors">
                <Phone className="w-5 h-5" />
                <span>+91 123 456 7890</span>
              </a>
              <a href="mailto:hello@dineflow.com" className="flex items-center space-x-3 text-white/60 hover:text-luxury-gold transition-colors">
                <Mail className="w-5 h-5" />
                <span>hello@dineflow.com</span>
              </a>
              <div className="flex items-center space-x-3 text-white/60">
                <MapPin className="w-5 h-5" />
                <span>Mumbai, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/5 hover:bg-luxury-gold/20 rounded-full transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 text-white/60 hover:text-luxury-gold" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-luxury-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-luxury-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Partners</h3>
            <ul className="space-y-3">
              {footerLinks.partners.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-luxury-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} DineFlow. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link to="/terms" className="text-white/40 hover:text-white/60 text-sm transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="text-white/40 hover:text-white/60 text-sm transition-colors">
                Privacy
              </Link>
              <Link to="/cookies" className="text-white/40 hover:text-white/60 text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
