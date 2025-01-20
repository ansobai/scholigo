'use client'

import Link from 'next/link'
import { Twitter, Instagram, GitlabIcon as GitHub } from 'lucide-react'
import { motion } from 'framer-motion'

const socials = [
    { name: 'X', icon: Twitter, link: 'https://x.com/scholigo_2024' },
    { name: 'Instagram', icon: Instagram, link: 'https://www.instagram.com/scholigo2024/' },
    { name: 'GitHub', icon: GitHub, link: 'https://github.com/Scholigo' },
]

const links = [
    { name: 'Todo', link: '/dashboard/todo' },
    { name: 'Whiteboard', link: '/dashboard/whiteboard' },
    { name: 'Pomodoro', link: '/dashboard/pomodoro' },
    { name: 'Leaderboard', link: '/dashboard/leaderboard' },
    { name: 'Communities', link: '/dashboard/communities' },
]

export default function Footer() {
    return (
      <footer className="bg-gradient-to-br from-darkBlue to-purple-900 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-8 md:mb-0"
          >
            <h3 className="text-3xl font-bold">Scholigo</h3>
            <p className="text-gray-300">Your ultimate student hub</p>
          </motion.div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-6">
              {links.map((link, index) => (
                  <motion.div
                      key={link.name}
                      initial={{opacity: 0, y: 20}}
                      whileInView={{opacity: 1, y: 0}}
                      transition={{delay: index * 0.1, duration: 0.5}}
                      viewport={{once: true}}
                  >
                      <Link
                          href={link.link}
                          className="text-gray-300 hover:text-lightYellow transition-colors"
                      >
                          {link.name}
                      </Link>
                  </motion.div>
              ))}
          </nav>
        </div>
          <motion.div
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{delay: 0.5, duration: 0.5}}
              viewport={{once: true}}
              className="max-w-6xl mx-auto mt-8 flex flex-col md:flex-row justify-between items-center"
          >
              <p className="text-gray-400 mb-4 md:mb-0">
                  &copy; 2025 Scholigo. All rights reserved.
              </p>
              <div className="flex gap-6">
              {socials.map((social) => (
              <motion.a
                key={social.name}
                href={social.link}
                className="text-gray-400 hover:text-lightYellow transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <social.icon size={24} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </footer>
    );
}