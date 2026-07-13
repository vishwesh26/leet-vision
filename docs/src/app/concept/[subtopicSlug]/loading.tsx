export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="skeleton h-8 w-40 mb-4 rounded-full"></div>
      <div className="skeleton h-12 w-3/4 mb-6"></div>
      
      <div className="flex gap-4 mb-10">
        <div className="skeleton h-8 w-24 rounded-md"></div>
        <div className="skeleton h-8 w-32 rounded-md"></div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-11/12"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-5/6"></div>
      </div>

      <div className="skeleton h-64 w-full rounded-xl mb-10"></div>
      
      <div className="space-y-4">
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-4/5"></div>
      </div>
    </div>
  );
}
