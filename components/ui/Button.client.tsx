export default function Button({ children, className = '', ...props }: any) {
  return (
    <button
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-[#6b21a8] px-4 py-2 text-white hover:bg-[#7c3aed] touch-target ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

