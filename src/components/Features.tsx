export function Features() {
  const features = [
    {
      title: "TypeScript Ready",
      description: "Fully typed development experience with TypeScript",
      icon: "⚡"
    },
    {
      title: "Tailwind CSS",
      description: "Beautiful, responsive design with Tailwind CSS",
      icon: "🎨"
    },
    {
      title: "API Routes",
      description: "Built-in API routes for backend functionality",
      icon: "🚀"
    },
    {
      title: "Modern Stack",
      description: "Next.js 15 with App Router for optimal performance",
      icon: "⚡"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
