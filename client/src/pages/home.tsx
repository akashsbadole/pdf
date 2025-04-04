import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getToolsByCategory } from '@/lib/tools-config';

export default function Home() {
  const categories = [
    { id: "organize", name: "Organize PDF", description: "Merge, split or manage PDF documents" },
    { id: "optimize", name: "Optimize PDF", description: "Compress and improve your PDF files" },
    { id: "convert-to", name: "Convert To PDF", description: "Turn images and documents into PDFs" },
    { id: "convert-from", name: "Convert From PDF", description: "Extract content from PDF files" },
    { id: "edit", name: "Edit PDF", description: "Modify and enhance your PDF files" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">PDF Toolkit</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The all-in-one platform for working with PDF files. 
          Convert, compress, merge, and edit your documents with ease.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const categoryTools = getToolsByCategory(category.id);
          
          return (
            <Card key={category.id} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-4">{category.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {categoryTools.slice(0, 4).map(tool => (
                    <Link key={tool.id} href={`/tool/${tool.id}`}>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-3"
                      >
                        {tool.icon}
                        <span className="ml-2 truncate">{tool.name}</span>
                      </Button>
                    </Link>
                  ))}
                  
                  {categoryTools.length > 4 && (
                    <Button variant="ghost" className="w-full justify-start text-left text-primary mt-2">
                      +{categoryTools.length - 4} more
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Why Choose PDF Toolkit?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 border rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
            <p className="text-gray-600">Our intuitive interface makes it simple to handle any PDF task in just a few clicks.</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Secure Processing</h3>
            <p className="text-gray-600">We process files locally on your device whenever possible for enhanced privacy.</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Fast Performance</h3>
            <p className="text-gray-600">Get your tasks done quickly with our optimized processing engine.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
