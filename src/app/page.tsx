import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-white">
          Bill Note
        </h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
          Expense sharing made easy for groups and friends
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Learn More
          </Link>
        </div>
      </main>
    </div>
  )
}
