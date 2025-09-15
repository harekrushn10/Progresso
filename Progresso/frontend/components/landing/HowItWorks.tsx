import Image from 'next/image'
import money from './assets/fund.png'
import join from './assets/join.png'
import quiz from './assets/quiz.png'


const HowItWorks = () => {
  const cardItems = [{
    image: join,
    title: "Join contest",
    description: "Browse through the available contests, Choose the one that interests you."
  },
  {
    image: quiz,
    title: "Pay & Play The contest",
    description: "Answer the questions in the quiz and earn points."
  },
  {
    image: money,
    title: "Receive your Prize",
    description: "Once you win, follow the instructions to claim your prize and enjoy!"
  }]

  return <div className="flex flex-col w-full h-full justify-center items-center overflow-hidden my-20 py-12">
    <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center">
      <div className="flex flex-col w-full justify-center items-center">
        <h1 className="text-4xl font-neue-ultraBold text-center">Here&apos;s How It Works</h1>
        <h3 className="text-neutral-400 text-lg font-neue-medium text-center">Follow these simple steps to get started with Progresso :</h3>
      </div>
      <div className="flex flex-col lg:flex-row h-full w-full gap-6 justify-center items-center my-12 md:px-8 px-4 lg:px-2 ">
        {cardItems.map((item, index) => {
          return (
            <div key={index} className="flex flex-col w-full lg:w-1/3 bg-azure-radiance-100 dark:bg-white shadow-xl justify-center items-stretch text-black rounded-xl h-full">
              <div className='flex w-full justify-center items -center py-6'>
                <Image src={item.image} alt='' className='md:h-20 md:w-20 h-16 w-16 object-contain' />
              </div>
              <div className='flex flex-col w-full justify-center items-center text-center px-4 flex-grow'>
                <h1 className='text-black flex text-2xl font-martelsans-extraBold py-2'>
                  {item.title}
                </h1>
                <h4 className='text-black flex text-lg font-martelsans-bold py-1'>
                  {item.description}
                </h4>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </div>
}

export default HowItWorks;