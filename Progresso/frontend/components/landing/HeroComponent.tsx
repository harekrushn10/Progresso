import Image from "next/image";
import trophy from './assets/gold-trophy-with-name-plate-winner-competition_68708-545-removebg-preview (1).png'
import { Button } from "../ui/button";

const HeroComponent = () => {
  return (
    <div className="w-full h-auto min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] lg:min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 z-30 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="w-full h-auto max-w-7xl justify-center flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
        {/* Text Content */}
        <div className="flex flex-col w-full lg:w-3/5 xl:w-4/5 text-center lg:text-left gap-4 sm:gap-6 lg:gap-8">
          <div className="flex flex-col w-full justify-center gap-3 sm:gap-4 lg:gap-6">
            <h1 className="w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-8xl font-neue-ultraBold leading-tight">
              Test Your Knowledge, Win Big!
            </h1>
            <h3 className="w-full max-w-3xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-neue-regular text-gray-600 lg:mx-0">
              Join thousands of quiz enthusiasts and compete for cash prizes in various academic domains.
            </h3>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <Button className="w-auto p-6 text-lg">
              Join Now
            </Button>
            <Button className="w-auto bg-transparent border-gray-600 border-[1px] p-6 text-lg">
              Explore More
            </Button>
          </div>
        </div>

        {/* Trophy Image - Hidden on small devices */}
        <div className="hidden lg:flex justify-end w-full lg:w-2/5 xl:w-1/5">
          <div className="relative">
            <Image 
              src={trophy} 
              alt="Golden trophy for quiz competition winners" 
              className="h-64 w-64 lg:h-72 lg:w-72 xl:h-80 xl:w-80 object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroComponent;