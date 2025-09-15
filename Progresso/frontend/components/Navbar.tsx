"use client"
import Image from "next/image";
import mainLogo from "@/public/mainLogo.png"
import { Button } from "./ui/button";
import Link from "next/link";
import { ModeToggle } from "./ModeToogle";
import { useRouter } from 'next/navigation'


type NavItem = {
  name: string;
  href: string;
};

const navigationItems: NavItem[] = [
  { name: "My Contest", href: "/quiz" },
  { name: "Live Contests", href: "/contests" },
  { name: "About", href: "/about" },
  { name: "FAQs", href: "/faqs" },
  { name: "Contact Us", href: "/contact" }
];

const Navbar = () => {
  const router = useRouter();

  const handleRegisterclick = () => {
    router.push('/signup')
  }

  const handleSubmitClick = () => {
    router.push('/signin')
  }

  return <div className="w-full flex justify-center sticky top-0 py-1 z-30">
    <nav className="w-full max-w-7xl flex flex-row items-center px-4 md:px-8">
      <div className="w-full flex flex-row items-center ">
        <div className="w-full flex flex-row items-center py-2">
          <Image src={mainLogo} alt="logo" height={500} width={500} style={{ height: "60px", width: "50px" }} />
          <h1 className="font-neue-bold md:text-2xl">Progresso</h1>
        </div>
        <div className="w-full hidden lg:flex">
          <ul className="w-full flex justify-between gap-8 text-nowrap">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-martelsans-bold relative transition-colors duration-200 ease-in-out hover:text-primary after:absolute after:left-0 after:bottom-0  after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-primary  after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.name}
              </Link>
            ))}
          </ul>
        </div>
        <div className="flex gap-1 md:gap-4 w-full justify-end">
          <Button variant={"outline"} className="font-neue-bold hidden md:flex" onClick={handleSubmitClick}>Login</Button>
          <Button size={"sm"} variant={"outline"} className="font-neue-bold md:hidden" onClick={handleSubmitClick}>Login</Button>
          <Button className="font-neue-bold hidden md:flex" onClick={handleRegisterclick}>Register</Button>
          <Button size={'sm'} className="font-neue-bold md:hidden" onClick={handleRegisterclick}>Register</Button>
          <ModeToggle />
        </div>
      </div>
    </nav>
  </div>
}

export default Navbar;