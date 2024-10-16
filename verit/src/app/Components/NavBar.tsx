import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import logo from "../Assets/excel.png"

type Props = {}

const NavBar = (props: Props) => {
  return (
    <div className='px-8 py-2 border-b-[1px]'>
        <div className='flex items-center space-x-3'>
            <Link href="/">
                <Image src={logo} width={40} height={40} priority alt='Verit-Icon'/>
            </Link>
            <UserButton signInUrl='/sign-in'/>
        </div>
    </div>
  )
}

export default NavBar