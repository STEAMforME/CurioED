// src/layout/Navbar.tsx
interface NavbarProps {
  title: string;
}

const Navbar = ({ title }: NavbarProps) => {
  return (
    <div className="bg-white shadow-md py-4 px-6 text-xl font-semibold text-primary sticky top-0 z-10 transition-colors">
      {title}
    </div>
  );
};

export default Navbar;
