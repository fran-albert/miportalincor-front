import { motion } from "framer-motion";

interface LoadingAnimationProps {
  message?: string;
}

export default function LoadingAnimation({ message }: LoadingAnimationProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Logo Container */}
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Spinning Circle */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              width: "120px",
              height: "120px",
              border: "4px solid transparent",
              borderTopColor: "#00a859",
              borderRightColor: "#14b8a6",
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Logo */}
          <div className="relative w-[120px] h-[120px] flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center p-2">
              <img
                src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1748058948/bligwub9dzzcxzm4ovgv.png"
                alt="Incor"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white text-lg font-semibold">
            {message || "Cargando..."}
          </p>
          <motion.div
            className="flex justify-center gap-1 mt-2"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="w-2 h-2 bg-greenPrimary rounded-full"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.15,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}