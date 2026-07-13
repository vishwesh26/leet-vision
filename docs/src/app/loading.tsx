export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Skeleton Title */}
      <div className="skeleton h-10 w-2/3 mb-6"></div>
      
      {/* Skeleton Metadata */}
      <div className="flex gap-3 mb-8">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton h-6 w-16 rounded-full"></div>
      </div>

      {/* Skeleton Paragraphs */}
      <div className="space-y-4 mb-10">
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-11/12"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-5/6"></div>
      </div>

      {/* Skeleton Code Block */}
      <div className="skeleton h-48 w-full rounded-xl mb-10"></div>
      
      {/* Skeleton Paragraphs */}
      <div className="space-y-4">
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-4/5"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    </div>
  );
}
