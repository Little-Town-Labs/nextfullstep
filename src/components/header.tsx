import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { SignInButton, SignedIn, SignedOut, UserButton, auth } from '@clerk/nextjs/server'
import { checkIsAdmin } from '@/lib/admin-guard'
import { MobileNav } from '@/components/navigation/MobileNav'
import { QuickLinksDropdown } from '@/components/navigation/QuickLinksDropdown'

export async function Header() {
  // Check if current user is admin
  const adminUser = await checkIsAdmin()
  const { userId } = await auth()
  const isSignedIn = !!userId

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-white backdrop-blur-sm bg-white/90">
      <div className="flex items-center gap-4">
        <Link href="/" rel="nofollow" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
          NextFullStep
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        <Link
          href="/careers"
          className={cn(buttonVariants({ variant: 'ghost' }), "font-normal")}
        >
          Careers
        </Link>

        <SignedIn>
          <QuickLinksDropdown />
        </SignedIn>

        {adminUser && (
          <Link
            href="/admin"
            className={cn(buttonVariants({ variant: 'ghost' }), "font-normal text-purple-600")}
          >
            Admin
          </Link>
        )}

        <Link
          href="/pricing"
          className={cn(buttonVariants({ variant: 'ghost' }), "font-normal")}
        >
          Pricing
        </Link>

        <SignedOut>
          <SignInButton mode="modal">
            <button className={cn(buttonVariants({ variant: 'ghost' }))}>
              Sign In
            </button>
          </SignInButton>
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ variant: 'default' }), "ml-2")}
          >
            Get Started
          </Link>
        </SignedOut>

        <SignedIn>
          <div className="ml-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </div>
        </SignedIn>
      </nav>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center gap-2">
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9"
              }
            }}
          />
        </SignedIn>
        <MobileNav isAdmin={!!adminUser} isSignedIn={isSignedIn} />
      </div>
    </header>
  )
}
