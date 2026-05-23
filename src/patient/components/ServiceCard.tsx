import { Link } from 'react-router-dom';

interface ServiceCardProps {
  name: string;
  price: number;
  description?: string;
}

export default function ServiceCard({ name, price, description }: ServiceCardProps) {
  return (
    <Link
      to="/book"
      className="block text-right border border-gray-200 rounded-2xl p-5 transition-colors hover:border-primary-300 hover:bg-primary-50/50"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <span className="text-primary-600 font-bold whitespace-nowrap">{price} ج.م</span>
      </div>
      {description ? <p className="text-sm text-gray-600">{description}</p> : null}
    </Link>
  );
}
