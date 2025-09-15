import Caraousel from './Caraousel';

const ChooseOptions = () => {

  return (
    <div className="w-full h-full flex flex-col relative justify-center items-center my-52">
      <div className='flex flex-col text-center text-5xl relative font-neue-ultraBold mt-20'>
        Participate And Join Contest Now!
      </div>
      <div className="flex flex-col w-full items-center justify-center relative">
        {/* <div className='inset-0 absolute bg-azure-radiance-300 dark:bg-[#154580] blur-md '></div>
        <div className="flex flex-row w-full rounded-3xl dark:bg-[#1c3149] bg-azure-radiance-50 relative border-2 border-azure-radiance-500 z-30">
          <div className="flex flex-col w-full max-w-sm rounded-tl-3xl rounded-bl-3xl bg-azure-radiance-100 dark:bg-[#111F2A] md:p-8 p-4 justify-center items-center">
            <h1 className=" dark:text-white font-neue-ultraBold text-4xl text-center">Choose Contests</h1>
            <h3 className=" dark:text-white font-neue-medium text-lg py-4 text-center">Be Wise Choose Wise!</h3>
          </div>
        </div> */}
      <Caraousel />
      </div>
    </div>
  )
}

export default ChooseOptions;