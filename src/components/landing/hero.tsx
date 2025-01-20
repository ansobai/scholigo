'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const words = ['Productive', 'Connected', 'Organized', 'Successful']

export default function HeroSection() {
    const [currentWord, setCurrentWord] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % words.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative text-white">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8 relative z-10"
            >
                <h1 className="text-6xl font-bold mb-4">Welcome to Scholigo</h1>
                <p className="text-2xl mb-8">
                    Become{' '}
                    <motion.span
                        key={currentWord}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block font-bold text-lightYellow"
                    >
                        {words[currentWord]}
                    </motion.span>
                </p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="relative z-10"
            >
                <Link href="/dashboard">
                    <Button size="lg" variant="default" className="transition-all duration-300 transform hover:scale-105">
                        Get Started
                    </Button>
                </Link>
            </motion.div>
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-lightYellow"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 10 + 5}px`,
                            height: `${Math.random() * 10 + 5}px`,
                        }}
                        animate={{
                            y: [0, Math.random() * 100 - 50],
                            opacity: [0.7, 0.2],
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            repeatType: 'reverse',
                        }}
                    />
                ))}
            </motion.div>
        </section>
    )
}