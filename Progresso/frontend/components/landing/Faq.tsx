"use client"
import ContentContainer from "@/components/ContentContainer"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "What prerequisites do I need for this course?",
    answer:
      "No prior AI experience is required. Basic programming knowledge (any language) and a willingness to learn are all you need to get started.",
  },
  {
    question: "How long do I have access to the course material?",
    answer:
      "You get lifetime access to all course materials, including future updates and additions. Once you're enrolled, you'll never lose access.",
  },
  {
    question: "Can I get a job after completing this course?",
    answer:
      "Many of our students have successfully landed AI roles after completing the course. We provide real-world projects, portfolio building, and interview preparation to maximize your chances.",
  },
  {
    question: "Is there a community or support system?",
    answer:
      "Yes! You'll get access to our private community where you can interact with fellow students, mentors, and instructors. We also provide weekly live sessions for doubt clearing.",
  },
  {
    question: "What if I'm not satisfied with the course?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not completely satisfied with the course, we'll refund your investment, no questions asked.",
  },
]

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="w-full py-16">
      <ContentContainer>
        <h2 className="text-3xl md:text-5xl font-neue-ultraBold dark:text-white text-black font-neue-machina mb-16">
          FAQs
        </h2>

        <div className="w-full max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="dark:bg-[#171717] shadow-xl border hover:border-azure-radiance-600 dark:hover:border-azure-radiance-50/50 rounded-xl overflow-hidden transition-all"
            >
              <button
                className="w-full p-6 flex justify-between items-center text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="dark:text-white text-black font-bold">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 dark:text-white text-black transition-transform  ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6">
                    <p className="text-[#A7A7A7] font-libre">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContentContainer>
    </div>
  )
}