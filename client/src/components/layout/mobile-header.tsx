import { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getAllTools, getToolsByCategory } from '@/lib/tools-config';

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const categories = [
    { id: "organize", name: "Organize PDF" },
    { id: "optimize", name: "Optimize PDF" },
    { id: "convert-to", name: "Convert To PDF" },
    { id: "convert-from", name: "Convert From PDF" },
    { id: "edit", name: "Edit PDF" }
  ];

  return (
    <div className="md:hidden flex items-center p-4 border-b border-gray-200 bg-white">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Link href="/" onClick={() => setOpen(false)}>
              <h1 className="text-xl font-bold text-primary cursor-pointer">PDFToolKit</h1>
            </Link>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-4">
            {categories.map(category => {
              const categoryTools = getToolsByCategory(category.id);
              
              return (
                <div key={category.id} className="mb-4">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {category.name}
                  </h2>
                  <ul className="space-y-1">
                    {categoryTools.map(tool => (
                      <li key={tool.id}>
                        <Link href={`/tool/${tool.id}`}>
                          <a 
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                            onClick={() => setOpen(false)}
                          >
                            {tool.icon}
                            <span className="ml-2">{tool.name}</span>
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <a href="#" className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upgrade to Pro
            </a>
          </div>
        </SheetContent>
      </Sheet>
      
      <Link href="/">
        <h1 className="text-xl font-bold text-primary mx-auto cursor-pointer">PDFToolKit</h1>
      </Link>
    </div>
  );
}
