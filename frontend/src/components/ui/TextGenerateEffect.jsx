import React, { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "../../utils/cn.js";

export const TextGenerateEffect = ({
  words,
  className,
  highlightWords = ["Autonomous", "AI"],
  highlightClassName = "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent inline-block",
  filter = true,
  duration = 0.5,
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = typeof words === "string" ? words.split(" ") : words;

  useEffect(() => {
    if (scope.current) {
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration ? duration : 1,
          delay: stagger(0.12),
        }
      );
    }
  }, [scope, animate, filter, duration]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline-block w-full">
        {wordsArray.map((word, idx) => {
          const isHighlight = highlightWords.some(
            (hw) => word.toLowerCase().includes(hw.toLowerCase())
          );
          
          // Force line break before the first highlight word ("Autonomous") for clean 2-line title hierarchy
          const isFirstHighlight = word.toLowerCase() === "autonomous";

          return (
            <React.Fragment key={word + idx}>
              {isFirstHighlight && <br className="hidden sm:inline" />}
              <motion.span
                className={cn(
                  "opacity-0 inline-block mr-2.5 sm:mr-4 mb-1",
                  isHighlight ? highlightClassName : "text-white"
                )}
                style={{
                  filter: filter ? "blur(10px)" : "none",
                }}
              >
                {word}
              </motion.span>
            </React.Fragment>
          );
        })}
      </motion.div>
    );
  };

  return (
    <h1 className={cn("font-black tracking-tight leading-[1.15] font-outfit max-w-4xl mx-auto text-center", className)}>
      {renderWords()}
    </h1>
  );
};

export default TextGenerateEffect;
