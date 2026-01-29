export default function Button({ children, className = '', ...props }: any) {
  return (
    <button
      className={`px-4 py-2 rounded bg-[#6b21a8] hover:bg-[#7c3aed] text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

