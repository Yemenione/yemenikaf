import React from 'react';
import { motion } from 'framer-motion';

const ScrollReveal = ({ children, width = "100%", delay = 0 }) => {
    return (
        <div style={{ position: "relative", width, overflow: "hidden" }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: delay, ease: [0.25, 0.1, 0.25, 1.0] }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;
