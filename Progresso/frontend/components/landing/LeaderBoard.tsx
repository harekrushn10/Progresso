import Image from 'next/image';
import winners from './assets/Winners-cuate.svg'
import appreaciation from './assets/Appreciation-cuate.svg'
import grauation from './assets/Graduation-cuate.svg'


const LeaderBoard = () => {
  return (
    <div className='flex justify-center items-center'>
      <div className="flex flex-col w-11/12 rounded-2xl h-full justify-center items-center overflow-hidden dark:bg-azure-radiance-50 shadow-2xl text-black py-12">
        <div className="flex flex-col w-full max-w-7xl px-4">
          <div className="flex flex-col text-center py-8">
            <h1 className="md:text-6xl text-4xl text-black text-center font-neue-ultraBold">Top The Leaderboard</h1>
            <h3 className="md:text-2xl text-lg text-neutral-700 font-neue-bold">Join the quiz, climb the ranks, and showcase your knowledge!</h3>
          </div>
          <div className='flex flex-col w-full justify-center items-center'>
            <div className='flex flex-row w-full justify-center items-center'>
              <Image src={appreaciation} alt='' className='hidden xl:flex h-[500px] w-[500px] shrink-0' />
              <Image src={winners} alt='' className='md:h-[600px] md:w-[600px]' />
              <Image src={grauation} alt='' className='h-[500px] w-[450px] hidden xl:flex' />
            </div>
            <div className='flex bg-black p-4 rounded-full text-lg md:text-3xl text-center text-white font-neue-bold justify-center items-center'>
              Achieve greatness and celebrate your victories!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderBoard;