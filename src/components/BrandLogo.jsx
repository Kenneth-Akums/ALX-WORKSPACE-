import logo from "../assets/3_1762577967051.png"; // Updated path

export default function BrandLogo({ className = "" }) {
  // Use the 'className' prop for styling, default to empty
  return (
    <img 
      src={logo} 
      alt="ALX Logo" 
      className={className}
    />
  );
}