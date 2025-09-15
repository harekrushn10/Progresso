import Image from 'next/image';
import lines from './assets/Line.svg'

const Foreground = () => {
  return (
    <div className="flex absolute z-20 h-full w-full overflow-hidden">
      {/* Lines SVG - Hidden on mobile, visible on larger screens */}
      <div className='hidden lg:block absolute w-full h-full top-0 left-44 justify-center items-center z-30'>
        <Image src={lines} alt='' />
      </div>
      
      {/* First blur element - Responsive positioning and sizing */}
      <div className="absolute w-full h-full top-20 left-4 sm:top-32 sm:left-12 md:top-40 md:left-24 lg:top-44 lg:left-48">
        <div className="flex h-32 w-40 sm:h-40 sm:w-52 md:h-52 md:w-64 lg:h-64 lg:w-72 bg-azure-radiance-500 blur-[80px] sm:blur-[100px] md:blur-[120px] lg:blur-[150px]">
        </div>
      </div>
      
      {/* Second blur element - Responsive positioning and sizing */}
      <div className="absolute w-full h-full top-40 left-1/2 transform -translate-x-1/2 sm:top-64 md:top-80 lg:top-96 lg:left-2/4 lg:transform-none">
        <div className="flex h-24 w-48 sm:h-32 sm:w-64 md:h-40 md:w-80 lg:h-48 lg:w-96 bg-azure-radiance-500 blur-[100px] sm:blur-[120px] md:blur-[160px] lg:blur-[200px]">
        </div>
      </div>
      
      {/* Additional mobile-optimized blur for better visual balance */}
      <div className="block sm:hidden absolute w-full h-full top-60 left-8">
        <div className="flex h-24 w-32 bg-azure-radiance-500 blur-[60px] opacity-70">
        </div>
      </div>
      
      {/* Subtle background blur for small devices only */}
      <div className="block md:hidden absolute w-full h-full top-10 right-4">
        <div className="flex h-20 w-28 bg-azure-radiance-500 blur-[40px] opacity-50">
        </div>
      </div>
    </div>
  )
}

export default Foreground;