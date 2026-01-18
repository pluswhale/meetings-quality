/**
 * Example: How to use the Sidebar component with Framer Motion animations
 * 
 * This file shows different ways to use the animated Sidebar component
 * in your application.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar, SidebarToggleButton, useSidebar } from './Sidebar';

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

// Example 1: Basic Usage with Animations
export const BasicSidebarExample: React.FC = () => {
  const { isOpen, close, toggle } = useSidebar();

  return (
    <div>
      {/* Animated Toggle button */}
      <SidebarToggleButton onClick={toggle} />

      {/* Sidebar component with animated content */}
      <Sidebar isOpen={isOpen} onClose={close}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-2xl font-bold mb-4"
          >
            Menu
          </motion.h2>
          <nav className="space-y-2">
            {['Home', 'About', 'Services', 'Contact'].map((item, index) => (
              <motion.a
                key={item}
                variants={itemVariants}
                whileHover={{ scale: 1.03, x: 5 }}
                whileTap={{ scale: 0.98 }}
                href="#"
                className="block px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </nav>
        </motion.div>
      </Sidebar>
    </div>
  );
};

// Example 2: Rich animated sidebar with interactive elements
export const RichSidebarExample: React.FC = () => {
  const { isOpen, close, toggle } = useSidebar();

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '#' },
    { icon: '📊', label: 'Analytics', path: '#' },
    { icon: '📁', label: 'Projects', path: '#' },
    { icon: '⚙️', label: 'Settings', path: '#' }
  ];

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggle}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg"
      >
        Open Animated Menu
      </motion.button>

      <Sidebar isOpen={isOpen} onClose={close}>
        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl"
            >
              JD
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold text-lg">John Doe</h3>
              <p className="text-sm text-slate-500">john@example.com</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation with stagger animation */}
        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-1 mb-6"
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <a
                href={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <motion.span
                  className="text-2xl"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                >
                  {item.icon}
                </motion.span>
                <span className="font-medium">{item.label}</span>
              </a>
            </motion.div>
          ))}
        </motion.nav>

        {/* Animated notification badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
        >
          <div className="flex items-start space-x-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="text-2xl"
            >
              🔔
            </motion.div>
            <div>
              <p className="font-semibold text-sm">New Update!</p>
              <p className="text-xs text-slate-600">Check out our latest features</p>
            </div>
          </div>
        </motion.div>

        {/* Settings at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-6 left-6 right-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
          >
            Settings
          </motion.button>
        </motion.div>
      </Sidebar>
    </div>
  );
};

// Example 3: Card-based animated menu
export const CardMenuExample: React.FC = () => {
  const { isOpen, close, toggle } = useSidebar();

  const cards = [
    { title: 'Tasks', count: 12, color: 'from-blue-500 to-cyan-500', icon: '✓' },
    { title: 'Messages', count: 5, color: 'from-purple-500 to-pink-500', icon: '💬' },
    { title: 'Projects', count: 8, color: 'from-orange-500 to-red-500', icon: '📁' }
  ];

  return (
    <div>
      <SidebarToggleButton onClick={toggle} />

      <Sidebar isOpen={isOpen} onClose={close}>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          Quick Access
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    className="text-sm font-medium"
                  >
                    {card.title}
                  </motion.p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
                    className="text-3xl font-bold"
                  >
                    {card.count}
                  </motion.p>
                </div>
                <motion.span
                  className="text-4xl"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {card.icon}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Sidebar>
    </div>
  );
};

// Example 4: Programmatic control with loading states
export const ProgrammaticSidebarExample: React.FC = () => {
  const sidebar = useSidebar();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAsyncAction = async () => {
    setIsLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    sidebar.open();
  };

  return (
    <div className="space-x-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAsyncAction}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isLoading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            ⏳
          </motion.span>
        ) : (
          'Load & Open'
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={sidebar.close}
        className="px-4 py-2 bg-slate-600 text-white rounded-lg"
      >
        Close Sidebar
      </motion.button>

      <Sidebar isOpen={sidebar.isOpen} onClose={sidebar.close}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h3 className="text-xl font-bold">Success!</h3>
          <p className="text-slate-600">Action completed</p>
        </motion.div>
      </Sidebar>
    </div>
  );
};
