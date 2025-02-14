import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { HiOutlineLightBulb } from "react-icons/hi";
import Typed from "typed.js";
import Navbar from "../../components/Navbar/Navbar";

const Welcome = () => {
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        "Your Notes, Organized",
        "Capture Ideas",
        "Pin Important Notes",
        "Search Through Your Notes",
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1500,
      startDelay: 500,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-zinc-200 dark:bg-gray-600 shadow-lg rounded-lg p-12 flex flex-col md:flex-row 
            items-center transition-transform duration-300"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.5 }}
          >
            <div className="flex-1 text-left md:pr-8">
              <h1 className="text-4xl font-bold text-black dark:text-white">
                <span ref={el} />
              </h1>
              <p className="mt-4 text-black dark:text-white max-w-3xl mx-auto text-justify">
              Welcome to your ultimate digital space for organization and planning. 
              Here, you can effortlessly capture thoughts, ideas, and key details, 
              ensuring your notes are always organized and easy to access. Whether 
              you are jotting down quick thoughts or brainstorming new ideas, our 
              platform keeps everything right at your fingertips. Prioritize important notes, 
              search through past entries with ease, and enjoy a user-friendly interface that 
              seamlessly adapts to your workflow. Step into a space where productivity meets 
              simplicity, helping you turn ideas into action with clarity. Start now to experience 
              seamless organization and elevate your productivity journey.
              </p>
              <p className="mt-4 font-bold text-2xl text-black dark:text-white">
                Start organizing today!
              </p>

              <a
                href="/login"
                className="mt-6 inline-block font-semibold rounded-full px-10 py-4 text-center shadow-lg
             bg-gradient-to-r from-blue-500 to-green-500 dark:from-yellow-400 dark:to-orange-500
             text-white dark:text-gray-900 transform transition-all duration-300
             hover:scale-105 hover:shadow-[0_0_20px_#34d399] dark:hover:shadow-[0_0_20px_#f59e0b]"
              >
                Get Started
              </a>
            </div>

            <div className="flex-1 mt-6 md:mt-0 flex gap-8 justify-center md:justify-end">
              <motion.div
                className="text-blue-500 dark:text-yellow-400 p-8 rounded-full bg-white 
                dark:bg-gray-700 shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.2, rotate: -10 }}
              >
                <HiOutlineLightBulb className="text-6xl" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
