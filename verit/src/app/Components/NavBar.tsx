import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import logo from "../Assets/excel.png"
import { Search } from 'lucide-react'

type Props = {}

const NavBar = (props: Props) => {
  return (
    <div className='px-8 py-2 border-b-[1px]'>
        <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
                <Link href="/">
                    <Image src={logo} width={40} height={40} priority alt='Verit-Icon'/>
                </Link>
                <div className='flex items-center bg-gray-50 rounded-full px-2'>
                    <Search size={20} className='opacity-50'/>
                    <input //Try adding the ... dynamic text feature later for unique UI
                        type='text' placeholder='Search...' 
                        className='focus:outline-none px-1 py-2 placeholder:text-sm text-sm bg-gray-50'
                    /> 
                </div>
            </div>
            <div className='flex items-center space-x-7'>
                <span className='flex items-center space-x-2 opacity-70 hover:opacity-100 duration-100 ease-in cursor-pointer'>
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        height="2rem"
                        width="2rem"
                        {...props}
                    >
                        <path d="M20 13h-4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2H4l-2 5v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2M6 20c-.89 0-1.34-1.08-.71-1.71.63-.63 1.71-.18 1.71.71 0 .55-.45 1-1 1m4 0c-.89 0-1.34-1.08-.71-1.71.63-.63 1.71-.18 1.71.71 0 .55-.45 1-1 1m4 0c-.89 0-1.34-1.08-.71-1.71.63-.63 1.71-.18 1.71.71 0 .55-.45 1-1 1m4 0c-.89 0-1.34-1.08-.71-1.71.63-.63 1.71-.18 1.71.71 0 .55-.45 1-1 1m0-10V3H6v7H3v2h18v-2M8 5h8v1H8m0 1h6v1H8" stroke='currentColor' />
                    </svg>
                    <p className='font-light text-sm'>Post</p>
                </span>
                <UserButton signInUrl='/'/>
            </div>
            
        </div>
    </div>
  )
}

export default NavBar