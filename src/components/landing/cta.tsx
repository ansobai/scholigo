'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CtaSection() {
    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }}
            />
            <div className="max-w-4xl mx-auto text-center text-white relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-4xl font-bold mb-6"
                >
                    Ready to supercharge your studies?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-xl mb-8"
                >
                    Join Scholigo today and experience the future of student collaboration and productivity.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <Link href="/dashboard">
                        <Button size="lg" className="transition-all duration-300 transform hover:scale-105">
                            Sign Up Now
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}