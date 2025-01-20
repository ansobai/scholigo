'use client'

import { motion } from 'framer-motion'
import {Clock, Award, BarChart2, Users, Edit3, CheckSquare, User2} from 'lucide-react'

const features = [
    { icon: Clock, title: 'Pomodoro Timer', description: 'Boost your productivity with our customizable Pomodoro timer.' },
    { icon: Award, title: 'Leaderboards', description: 'Compete with friends and track your progress on our leaderboards.' },
    { icon: User2, title: 'Profiles', description: 'Showcase your achievements, track your activity, and personalize your experience with your profile.' },
    { icon: Users, title: 'Communities', description: 'Connect with like-minded students in our vibrant communities.' },
    { icon: Edit3, title: 'Whiteboards', description: 'Collaborate in real-time with our interactive whiteboards.' },
    { icon: CheckSquare, title: 'Todo Lists', description: 'Stay organized with our powerful and flexible todo lists.' },
]

export default function FeaturesSection() {
    return (
      <section className="py-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12"
        >
          Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-darkBlue to-purple-900 p-6 rounded-lg shadow-lg hover:shadow-lightYellow/20 transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 mb-4 text-lightYellow" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    );
}