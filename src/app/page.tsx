import Link from "next/link"
// import { ArrowRight, Upload, Zap, Eye, Download, FileText, Image, Archive } from "lucide-react"

// Simple icon components
const ArrowRight: React.FC<{ className?: string }> = ({ className }) => <span className={className}>→</span>
const Upload: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⬆</span>
const Zap: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⚡</span>
const Eye: React.FC<{ className?: string }> = ({ className }) => <span className={className}>👁</span>
const Download: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⬇</span>
const FileText: React.FC<{ className?: string }> = ({ className }) => <span className={className}>📄</span>
const IconImage: React.FC<{ className?: string }> = ({ className }) => <span className={className}>🖼</span>
const Archive: React.FC<{ className?: string }> = ({ className }) => <span className={className}>📦</span>

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            AI-Powered Game Modding
            <span className="block text-purple-400">Made Simple</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 md:text-2xl">
            Upload your game files, describe your changes with natural language,
            and let AI transform your mods instantly.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-purple-700"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-transparent px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Supported Files Section */}
      <section className="bg-white/5 px-4 py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-white mb-12">
            Supported File Types
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white/10 p-6 text-center text-white">
              <FileText className="h-8 w-8 text-blue-400" />
              <span className="font-semibold">JSON</span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white/10 p-6 text-center text-white">
              <FileText className="h-8 w-8 text-orange-400" />
              <span className="font-semibold">XML</span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white/10 p-6 text-center text-white">
              <FileText className="h-8 w-8 text-green-400" />
              <span className="font-semibold">YAML</span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white/10 p-6 text-center text-white">
              <FileText className="h-8 w-8 text-purple-400" />
              <span className="font-semibold">LUA</span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white/10 p-6 text-center text-white">
              <FileText className="h-8 w-8 text-gray-400" />
              <span className="font-semibold">TXT</span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white/10 p-6 text-center text-white">
              <IconImage className="h-8 w-8 text-pink-400" />
              <span className="font-semibold">PNG/JPG</span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white">
              <Archive className="h-5 w-5" />
              <span>ZIP archives supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-white mb-16">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">1. Upload Files</h3>
              <p className="text-gray-300">
                Drag and drop your game files or ZIP archives directly into the workspace.
              </p>
            </div>
            <div className="text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">2. AI Prompt</h3>
              <p className="text-gray-300">
                Describe your desired changes in natural language. AI understands your intent.
              </p>
            </div>
            <div className="text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
                <Eye className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">3. Preview & Edit</h3>
              <p className="text-gray-300">
                Review AI-generated changes, make manual adjustments, and validate modifications.
              </p>
            </div>
            <div className="text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">4. Export Mod</h3>
              <p className="text-gray-300">
                Download your completed mod package ready for installation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white/5 px-4 py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Game Modding?
          </h2>
          <p className="mb-8 text-xl text-gray-300">
            Join thousands of modders using AI to create amazing game modifications.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Start Modding with AI
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
