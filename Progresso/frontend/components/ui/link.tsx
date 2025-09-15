
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export function Link({ children, className = '', ...props }: LinkProps) {
  return (
    <a className={`text-gray-300 hover:text-white ${className}`} {...props}>
      {children}
    </a>
  );
}