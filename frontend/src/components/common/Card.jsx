export default function Card({ children, title, subtitle, className = '', footer }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">{footer}</div>}
    </div>
  );
}