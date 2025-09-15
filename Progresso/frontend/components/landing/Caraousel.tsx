

const Caraousel = () => {
  const colors = [
    'bg-azure-radiance-100',
    'bg-azure-radiance-100',
    'bg-azure-radiance-100',
    'bg-azure-radiance-100',
    'bg-azure-radiance-100',
    'bg-azure-radiance-100',
    'bg-azure-radiance-100'
  ];

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <div className="carousel-wrapper relative w-full max-w-xl h-[61.2vh]">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`absolute w-full h-full max-w-md opacity-0 transform scale-70 translate-x-[200%]carousel-item ${color}`}
            style={{
              animationName: 'carousel-animate',
              animationDuration: '27s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'cubic-bezier(0.37, 0, 0.63, 1)',
              animationDelay: `calc(${index - 2} * 3.857s)`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Caraousel;