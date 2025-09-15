import Image from 'next/image'
import thinking from './assets/Questions-cuate.svg'
import money from './assets/Finance-cuate.svg'
import reading from './assets/Notebook-cuate.svg'

const PITCH_ITEMS = [
  {
    image: thinking,
    title: 'Test IQ',
  },
  {
    image: money,
    title: 'Learn & Earn',
  },
  {
    image: reading,
    title: 'Gain Knowledge',
  }
]

const PitchCard = ({ image, title }: { image: string, title: string }) => (
  <div className="flex flex-col bg-azure-radiance-100 dark:bg-white shadow-xl rounded-3xl p-4 py-10 md:py-20">
    <Image src={image} alt={title} className='p-8'/>
    <h1 className='text-black font-extrabold px-8 text-2xl'>{title}</h1>
  </div>
)

const Pitch = () => {
  return (
    <div className="flex flex-col relative justify-center items-center overflow-hidden w-full h-full my-10">
      <div className="flex flex-col w-full max-w-7xl">
        <div className="flex flex-col gap-4 px-8">
          <h1 className="text-6xl font-martelsans-extraBold text-center">Play, Learn and Earn Bonus</h1>
          <h3 className="text-xl text-neutral-700 dark:text-neutral-300 pb-4 text-center">Check Yourself and Earn yourself!</h3>
        </div>
        <div className="flex flex-col lg:flex-row gap-12 justify-center items-center w-full py-8 px-8">
          {PITCH_ITEMS.map((item, index) => (
            <PitchCard 
              key={index} 
              image={item.image} 
              title={item.title} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Pitch