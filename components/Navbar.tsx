import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <span className="text-2xl font-bold text-blue-400">Homra</span>
        </Link>
        <div className="flex space-x-4 items-center">
          <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            List your property
          </Link>
        </div>
      </div>
    </nav>
  )
}