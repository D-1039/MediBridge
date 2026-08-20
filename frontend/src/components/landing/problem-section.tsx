"use client";

import { motion } from "framer-motion";
import { PackageX, Users, Trash2 } from "lucide-react";

const problems = [
  {
    icon: PackageX,
    title: "Unused Medicines",
    description:
      "Millions of unexpired medicines are discarded annually while patients struggle to afford treatment.",
    color: "from-blue-600 to-blue-700",
  },
  {
    icon: Users,
    title: "Poor Patients",
    description:
      "Low-income families cannot access essential medicines, leading to preventable health complications.",
    color: "from-green-600 to-blue-600",
  },
  {
    icon: Trash2,
    title: "Healthcare Waste",
    description:
      "Improper disposal of medicines harms the environment and wastes valuable healthcare resources.",
    color: "from-green-600 to-green-700",
  },
];

export function ProblemSection() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Problem We Solve</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bridging the gap between medicine surplus and healthcare scarcity
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group glass-card p-8 cursor-default transition-shadow hover:shadow-2xl"
            >
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${problem.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <problem.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
