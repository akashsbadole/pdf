import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { getAllTools, getToolsByCategory } from "@/lib/tools-config";

export function Sidebar() {
  const [location] = useLocation();
  const allTools = getAllTools();
  const categories = [
    { id: "organize", name: "Organize PDF" },
    { id: "optimize", name: "Optimize PDF" },
    { id: "convert-to", name: "Convert To PDF" },
    { id: "convert-from", name: "Convert From PDF" },
    { id: "edit", name: "Edit PDF" }
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <Link href="/">
          <h1 className="text-xl font-bold text-primary cursor-pointer">PDFToolKit</h1>
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {categories.map(category => {
          const categoryTools = getToolsByCategory(category.id);
          
          return (
            <div key={category.id} className="mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category.name}
              </h2>
              <ul className="space-y-1">
                {categoryTools.map(tool => {
                  const isActive = location === `/tool/${tool.id}`;
                  return (
                    <li key={tool.id}>
                      <Link href={`/tool/${tool.id}`}>
                        <a 
                          className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                            isActive 
                              ? "text-primary bg-blue-50" 
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          {tool.icon}
                          {tool.name}
                        </a>
                      </Link>
                    </li>
                  );
                })}
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
    </aside>
  );
}
